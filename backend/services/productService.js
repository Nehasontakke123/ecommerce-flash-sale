import { redis } from "../config/redis.js";
import { Product } from "../models/Product.js";
import { env } from "../config/env.js";

export const stockKey = (productId) => `sale:product:${productId}:stock`;
export const soldKey = (productId) => `sale:product:${productId}:sold`;
export const userReservationKey = (userId) => `sale:user:${userId}:reserved`;
export const queueKey = (productId) => `sale:product:${productId}:queue`;

export async function ensureSaleProduct() {
  let product = env.productId ? await Product.findById(env.productId) : null;

  if (!product) {
    product = await Product.findOne({ title: "Astra X1 Limited Edition Headphones" });
  }

  if (!product) {
    product = await Product.create({
      title: "Astra X1 Limited Edition Headphones",
      price: 24999,
      stock: env.saleInitialStock,
      soldCount: 0
    });
  }

  const key = stockKey(product._id);
  const exists = await redis.exists(key);
  if (!exists) {
    await redis.set(key, product.stock);
    await redis.set(soldKey(product._id), product.soldCount);
  }

  return product;
}

export async function getProductSnapshot(productId) {
  const product = await Product.findById(productId).lean();
  const remainingStock = Number(await redis.get(stockKey(productId)) ?? product?.stock ?? 0);
  const soldCount = Number(await redis.get(soldKey(productId)) ?? product?.soldCount ?? 0);
  return {
    ...product,
    remainingStock,
    soldCount,
    stock: remainingStock,
    sold: soldCount,
    timestamp: Date.now()
  };
}
