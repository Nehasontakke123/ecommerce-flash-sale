import { useEffect, useState } from "react";

const FEED_LIMIT = 15;

function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min ago`;
}

function normalizeActivity(payload, fallbackType = "info") {
  const timestamp = payload?.timestamp || Date.now();
  return {
    id: payload?.id || `${timestamp}-${Math.random().toString(16).slice(2)}`,
    type: payload?.type || fallbackType,
    message: payload?.message || "Realtime activity updated",
    timestamp,
    time: payload?.time || relativeTime(timestamp)
  };
}

export function useActivityFeed(socket) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!socket) return undefined;

    const push = (payload, fallbackType) => {
      setActivities((current) => [normalizeActivity(payload, fallbackType), ...current].slice(0, FEED_LIMIT));
    };

    const onActivity = (payload) => push(payload, payload?.type);
    const onQueue = (payload) => push({ ...payload, message: `Queue position updated to ${payload.queueLength}` }, "info");
    const onPaymentSuccess = (payload) => push({ ...payload, message: "Payment verified" }, "success");
    const onPaymentFailed = (payload) => push({ ...payload, message: `${payload?.reason || "Payment failed"} - stock restored` }, "failure");
    const onSaleEnded = (payload) => push({ ...payload, message: "Sale ended. Inventory is sold out." }, "warning");
    const onOrderCreated = (payload) => push({ ...payload, message: "Order created successfully" }, "success");

    socket.on("activityUpdate", onActivity);
    socket.on("queueUpdated", onQueue);
    socket.on("paymentSuccess", onPaymentSuccess);
    socket.on("paymentFailed", onPaymentFailed);
    socket.on("saleEnded", onSaleEnded);
    socket.on("orderCreated", onOrderCreated);

    return () => {
      socket.off("activityUpdate", onActivity);
      socket.off("queueUpdated", onQueue);
      socket.off("paymentSuccess", onPaymentSuccess);
      socket.off("paymentFailed", onPaymentFailed);
      socket.off("saleEnded", onSaleEnded);
      socket.off("orderCreated", onOrderCreated);
    };
  }, [socket]);

  return activities;
}
