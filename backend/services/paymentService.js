import { env } from "../config/env.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processDummyPayment() {
  await wait(10000);
  return Math.random() < env.paymentSuccessRate;
}
