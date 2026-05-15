import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
}
