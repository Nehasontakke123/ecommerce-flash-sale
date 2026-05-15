import mongoose from "mongoose";
import { redis } from "../config/redis.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { emitActivityUpdate, emitEvent, emitQueueUpdate, emitStockUpdate, emitToUser } from "../sockets/socketManager.js";
import { stockKey, soldKey, userReservationKey, queueKey } from "./productService.js";

const reservationScript = `
local userKey = KEYS[1]
local stockKey = KEYS[2]
local queueKey = KEYS[3]
local productId = ARGV[1]
local ttl = tonumber(ARGV[2])

if redis.call("EXISTS", userKey) == 1 then
  return {"DUPLICATE", redis.call("GET", stockKey) or "0", redis.call("LLEN", queueKey)}
end

local stock = tonumber(redis.call("GET", stockKey) or "0")
if stock <= 0 then
  return {"SOLD_OUT", tostring(stock), redis.call("LLEN", queueKey)}
end

local remaining = redis.call("DECR", stockKey)
redis.call("SET", userKey, productId, "EX", ttl, "NX")
redis.call("RPUSH", queueKey, userKey)
return {"RESERVED", tostring(remaining), redis.call("LLEN", queueKey)}
`;

export async function reserveStockForCheckout({ userId, productId }) {
  const user = await User.findById(userId).select("name purchasedProduct");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.purchasedProduct) {
    const error = new Error("You already purchased this flash-sale item");
    error.statusCode = 409;
    throw error;
  }

  const [status, remainingStockRaw, queueLengthRaw] = await redis.eval(
    reservationScript,
    3,
    userReservationKey(userId),
    stockKey(productId),
    queueKey(productId),
    productId,
    900
  );

  const remainingStock = Number(remainingStockRaw);
  const queueLength = Number(queueLengthRaw);

  if (status === "DUPLICATE") {
    const error = new Error("Purchase already reserved or processing for this user");
    error.statusCode = 409;
    throw error;
  }

  if (status === "SOLD_OUT") {
    emitEvent("saleEnded", { productId });
    emitActivityUpdate({ type: "warning", productId, message: "Sale ended. Inventory is sold out." });
    const error = new Error("Sold out");
    error.statusCode = 409;
    throw error;
  }

  const soldCount = Number(await redis.get(soldKey(productId)) || 0);
  emitStockUpdate({ productId, stock: remainingStock, sold: soldCount, queueLength });
  emitQueueUpdate({ productId, queueLength, userName: user.name });
  emitActivityUpdate({ type: "warning", productId, message: `Stock reduced to ${remainingStock}` });
  emitToUser(userId, "paymentProcessing", { productId, queuePosition: queueLength });

  return { remainingStock, queuePosition: queueLength };
}

export async function createSuccessfulOrder({ userId, productId, transaction }) {
  const session = await mongoose.startSession();
  let orderCreated = false;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user || user.purchasedProduct) return;

      await Order.create([{
        userId,
        productId,
        paymentStatus: "success",
        orderStatus: "confirmed",
        transaction: {
          provider: "razorpay",
          ...transaction,
          verifiedAt: new Date()
        }
      }], { session });

      user.purchasedProduct = true;
      await user.save({ session });

      await Product.updateOne(
        { _id: productId },
        { $inc: { soldCount: 1, stock: -1 } },
        { session }
      );
      orderCreated = true;
    });

    await redis.del(userReservationKey(userId));
    await redis.lrem(queueKey(productId), 1, userReservationKey(userId));
    if (!orderCreated) return;

    await redis.incr(soldKey(productId));
    const remainingStock = Number(await redis.get(stockKey(productId)) || 0);
    const soldCount = Number(await redis.get(soldKey(productId)) || 0);
    const queueLength = await redis.llen(queueKey(productId));
    const buyer = await User.findById(userId).select("name").lean();

    emitStockUpdate({ productId, stock: remainingStock, sold: soldCount, queueLength });
    emitQueueUpdate({ productId, queueLength });
    emitEvent("orderCreated", { productId, userId, soldCount, timestamp: Date.now() });
    emitEvent("livePurchase", { productId, soldCount });
    emitActivityUpdate({ type: "success", productId, message: `${buyer?.name || "A customer"} purchased Astra X1` });
    emitActivityUpdate({ type: "success", productId, message: "Payment verified" });
    if (remainingStock <= 0) {
      emitEvent("saleEnded", { productId, timestamp: Date.now() });
      emitActivityUpdate({ type: "warning", productId, message: "Sale ended. Inventory is sold out." });
    }
    emitToUser(userId, "paymentSuccess", { productId });
  } finally {
    await session.endSession();
  }
}

export async function releaseReservation({ userId, productId, reason = "Payment failed", transaction }) {
  const wasReserved = await redis.del(userReservationKey(userId));
  await redis.lrem(queueKey(productId), 1, userReservationKey(userId));
  let remainingStock = Number(await redis.get(stockKey(productId)) || 0);

  if (wasReserved) {
    remainingStock = await redis.incr(stockKey(productId));
  }

  await Order.create({
    userId,
    productId,
    paymentStatus: "failed",
    orderStatus: "cancelled",
    transaction: {
      provider: "razorpay",
      ...transaction,
      failureReason: reason
    }
  }).catch(() => null);

  const soldCount = Number(await redis.get(soldKey(productId)) || 0);
  const queueLength = await redis.llen(queueKey(productId));

  emitStockUpdate({ productId, stock: remainingStock, sold: soldCount, queueLength });
  emitQueueUpdate({ productId, queueLength });
  emitActivityUpdate({ type: "failure", productId, message: `${reason} - stock restored` });
  emitToUser(userId, "paymentFailed", { productId, reason });
}
