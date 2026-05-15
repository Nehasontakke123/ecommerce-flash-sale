import { useEffect, useMemo, useState } from "react";

const HISTORY_LIMIT = 20;

function normalizeStockPoint(payload, fallbackProduct) {
  const stock = Number(payload?.stock ?? payload?.remainingStock ?? fallbackProduct?.remainingStock ?? fallbackProduct?.stock ?? 0);
  const sold = Number(payload?.sold ?? payload?.soldCount ?? fallbackProduct?.soldCount ?? 0);
  const queue = Number(payload?.queueLength ?? 0);
  const timestamp = payload?.timestamp || Date.now();

  return {
    id: `${timestamp}-${stock}-${sold}-${queue}`,
    timestamp,
    label: new Date(timestamp).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    stock,
    sold,
    queue,
    spike: Math.max(0, sold - Number(payload?.previousSold ?? sold))
  };
}

export function useRealtimeStock(socket, product) {
  const [history, setHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!socket) return undefined;

    const onStockUpdated = (payload) => {
      setHistory((current) => {
        const previous = current.at(-1);
        const point = normalizeStockPoint({ ...payload, previousSold: previous?.sold }, product);
        return [...current, point].slice(-HISTORY_LIMIT);
      });
      setLastUpdate(payload?.timestamp || Date.now());
    };

    socket.on("stockUpdated", onStockUpdated);
    return () => socket.off("stockUpdated", onStockUpdated);
  }, [socket, product]);

  const fallbackPoint = product ? normalizeStockPoint(product, product) : null;
  const latest = history.at(-1) || fallbackPoint;
  const totals = useMemo(() => ({
    stock: latest?.stock ?? product?.remainingStock ?? 0,
    sold: latest?.sold ?? product?.soldCount ?? 0,
    queue: latest?.queue ?? 0,
    total: Math.max((latest?.stock ?? 0) + (latest?.sold ?? 0), product?.stock || 0, 1),
    lastUpdate
  }), [latest?.queue, latest?.sold, latest?.stock, lastUpdate, product]);

  return { stockHistory: history.length ? history : fallbackPoint ? [fallbackPoint] : [], stockTotals: totals };
}
