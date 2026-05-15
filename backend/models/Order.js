import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  paymentStatus: { type: String, enum: ["processing", "success", "failed"], default: "processing" },
  orderStatus: { type: String, enum: ["queued", "confirmed", "cancelled"], default: "queued" },
  transaction: {
    provider: { type: String, default: "razorpay" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: Number,
    currency: { type: String, default: "INR" },
    failureReason: String,
    verifiedAt: Date
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

orderSchema.index(
  { userId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { paymentStatus: "success" } }
);

export const Order = mongoose.model("Order", orderSchema);
