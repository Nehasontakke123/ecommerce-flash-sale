import { Router } from "express";
import { getProduct } from "../controllers/productController.js";

const router = Router();

router.get("/", getProduct);

export default router;
