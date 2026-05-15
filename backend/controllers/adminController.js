import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getQueueStats } from "../queues/paymentQueue.js";
import { ensureSaleProduct, getProductSnapshot } from "../services/productService.js";

export const stats = asyncHandler(async (req, res) => {
  const product = await ensureSaleProduct();
  const [totalUsers, totalOrders, successfulPayments, failedPayments, queue, liveOrders, snapshot] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: "success" }),
    Order.countDocuments({ paymentStatus: "failed" }),
    getQueueStats(),
    Order.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(20).lean(),
    getProductSnapshot(product._id)
  ]);

  res.json({
    totalUsers,
    totalOrders,
    successfulPayments,
    failedPayments,
    remainingStock: snapshot.remainingStock,
    soldCount: snapshot.soldCount,
    queue,
    liveOrders
  });
});
