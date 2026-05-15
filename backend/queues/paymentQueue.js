import { Queue, QueueEvents } from "bullmq";
import { redis } from "../config/redis.js";

export const paymentQueueName = "flash-sale-payments";

export const paymentQueue = new Queue(paymentQueueName, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 1000
  }
});

export const paymentQueueEvents = new QueueEvents(paymentQueueName, {
  connection: redis
});

export async function getQueueStats() {
  const [waiting, active, delayed, completed, failed] = await Promise.all([
    paymentQueue.getWaitingCount(),
    paymentQueue.getActiveCount(),
    paymentQueue.getDelayedCount(),
    paymentQueue.getCompletedCount(),
    paymentQueue.getFailedCount()
  ]);

  return { waiting, active, delayed, completed, failed, queued: waiting + active + delayed };
}
