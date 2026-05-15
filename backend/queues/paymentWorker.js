import { Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { redis } from "../config/redis.js";
import { paymentQueueName } from "./paymentQueue.js";
import { processDummyPayment } from "../services/paymentService.js";
import { createSuccessfulOrder, releaseReservation } from "../services/orderService.js";
import { queueKey, userReservationKey } from "../services/productService.js";
import { emitEvent, emitToUser } from "../sockets/socketManager.js";

let dbReady = false;

async function ensureDB() {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
}

export const paymentWorker = new Worker(paymentQueueName, async (job) => {
  await ensureDB();
  await redis.lrem(queueKey(job.data.productId), 1, userReservationKey(job.data.userId));
  const queueLength = await redis.llen(queueKey(job.data.productId));
  emitEvent("queueUpdated", { productId: job.data.productId, queueLength });
  emitToUser(job.data.userId, "paymentProcessing", { productId: job.data.productId });

  const success = await processDummyPayment();
  if (!success) {
    throw new Error("Dummy payment provider declined the payment");
  }

  await createSuccessfulOrder(job.data);
  return { ok: true };
}, {
  connection: redis,
  concurrency: 50,
  limiter: {
    max: 250,
    duration: 1000
  }
});

paymentWorker.on("failed", async (job, error) => {
  if (!job) return;
  if (job.attemptsMade < (job.opts.attempts || 1)) return;

  await releaseReservation({
    userId: job.data.userId,
    productId: job.data.productId,
    reason: error.message
  });
});

paymentWorker.on("error", (error) => {
  console.error("Payment worker error", error);
});

if (process.argv[1]?.endsWith("paymentWorker.js")) {
  console.log("Payment worker running");
}
