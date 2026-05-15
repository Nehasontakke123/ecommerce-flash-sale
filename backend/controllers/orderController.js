import { Order } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureSaleProduct } from "../services/productService.js";
import { createSuccessfulOrder, releaseReservation, reserveStockForCheckout } from "../services/orderService.js";
import { createRazorpayOrder, getRazorpayPublicConfig, verifyRazorpaySignature } from "../services/razorpayService.js";

export const buyProduct = asyncHandler(async (req, res) => {
  const product = await ensureSaleProduct();
  const reservation = await reserveStockForCheckout({
    userId: req.user._id.toString(),
    productId: product._id.toString()
  });

  try {
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(product.price * 100),
      receipt: `flash_${req.user._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        productId: product._id.toString(),
        userId: req.user._id.toString()
      }
    });

    res.status(202).json({
      message: "Stock reserved. Complete Razorpay checkout.",
      ...reservation,
      payment: {
        ...getRazorpayPublicConfig(),
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        productName: product.title,
        user: {
          name: req.user.name,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    await releaseReservation({
      userId: req.user._id.toString(),
      productId: product._id.toString(),
      reason: "Payment gateway unavailable"
    });
    throw error;
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const product = await ensureSaleProduct();
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: "Razorpay payment details are required" });
  }

  const verified = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!verified) {
    await releaseReservation({
      userId: req.user._id.toString(),
      productId: product._id.toString(),
      reason: "Invalid Razorpay signature",
      transaction: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    });
    return res.status(400).json({ message: "Payment verification failed" });
  }

  await createSuccessfulOrder({
    userId: req.user._id.toString(),
    productId: product._id.toString(),
    transaction: {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: Math.round(product.price * 100),
      currency: "INR"
    }
  });

  res.json({ message: "Payment verified. Order confirmed." });
});

export const failPayment = asyncHandler(async (req, res) => {
  const product = await ensureSaleProduct();
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, reason = "Payment cancelled" } = req.body;

  await releaseReservation({
    userId: req.user._id.toString(),
    productId: product._id.toString(),
    reason,
    transaction: {
      razorpayOrderId,
      razorpayPaymentId
    }
  });

  res.status(202).json({
    message: "Reservation released"
  });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate("productId", "title price")
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
});
