import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 100 },
  soldCount: { type: Number, required: true, default: 0 }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Product = mongoose.model("Product", productSchema);
