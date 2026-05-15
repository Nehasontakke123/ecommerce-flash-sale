import { Router } from "express";
import { buyProduct, failPayment, myOrders, verifyPayment } from "../controllers/orderController.js";
import { auth } from "../middlewares/auth.js";
import { buyLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/buy", auth, buyLimiter, buyProduct);
router.post("/payment/verify", auth, verifyPayment);
router.post("/payment/fail", auth, failPayment);
router.get("/my-orders", auth, myOrders);

export default router;
