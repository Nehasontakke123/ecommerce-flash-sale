import { Router } from "express";
import { stats } from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", auth, stats);

export default router;
