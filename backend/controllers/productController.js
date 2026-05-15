import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureSaleProduct, getProductSnapshot } from "../services/productService.js";

export const getProduct = asyncHandler(async (req, res) => {
  const product = await ensureSaleProduct();
  const snapshot = await getProductSnapshot(product._id);
  res.json(snapshot);
});
