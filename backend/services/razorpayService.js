import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";

let razorpayClient;

function assertRazorpayConfig() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    const error = new Error("Razorpay credentials are not configured");
    error.statusCode = 500;
    throw error;
  }
}

function getClient() {
  assertRazorpayConfig();
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    });
  }
  return razorpayClient;
}

export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  try {
    return await getClient().orders.create({
      amount,
      currency: "INR",
      receipt,
      notes,
      payment_capture: 1
    });
  } catch (error) {
    error.message = error.error?.description || error.message || "Unable to create Razorpay order";
    error.statusCode = error.statusCode || 502;
    throw error;
  }
}

export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  assertRazorpayConfig();

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(payload)
    .digest("hex");

  const signature = Buffer.from(razorpaySignature || "", "hex");
  const digest = Buffer.from(expected, "hex");
  return signature.length === digest.length && crypto.timingSafeEqual(signature, digest);
}

export function getRazorpayPublicConfig() {
  assertRazorpayConfig();
  return { keyId: env.razorpayKeyId };
}
