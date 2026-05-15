import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Activity, Gauge, LogOut, ShoppingCart, Timer, Users, Wallet, Zap } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GlassPanel } from "../components/GlassPanel";
import { Skeleton } from "../components/Skeleton";
import { ProductShowcase } from "../components/ProductShowcase";
import { LiveStockGraph } from "../components/LiveStockGraph";
import { ActivityFeed } from "../components/ActivityFeed";
import { ThemeToggle } from "../components/ThemeToggle";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useRazorpayCheckout } from "../hooks/useRazorpayCheckout";
import { useRealtimeStock } from "../hooks/useRealtimeStock";
import { useActivityFeed } from "../hooks/useActivityFeed";

const MotionDiv = motion.div;

export function FlashSalePage({ socket, product, setProduct, queuePosition, setQueuePosition, setScreen }) {
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(!product);
  const [buying, setBuying] = useState(false);
  const [seconds, setSeconds] = useState(900);
  const [stockFlash, setStockFlash] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { stockHistory, stockTotals } = useRealtimeStock(socket, product);
  const activity = useActivityFeed(socket);

  const { openCheckout, paymentLoading } = useRazorpayCheckout({
    onSuccess: () => setScreen("success"),
    onFailure: (message) => {
      setScreen("failed");
      toast.error(message);
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get("/product")
      .then(({ data }) => setProduct(data))
      .catch(() => toast.error("Unable to load product"))
      .finally(() => setLoading(false));
  }, [setProduct]);

  useEffect(() => {
    if (!socket) return;

    const onStock = (payload) => {
      setProduct((current) => current ? {
        ...current,
        remainingStock: payload.stock ?? payload.remainingStock,
        soldCount: payload.sold ?? payload.soldCount ?? current.soldCount
      } : current);
      setStockFlash(true);
      setTimeout(() => setStockFlash(false), 500);
      if ((payload.stock ?? payload.remainingStock) <= 0) setScreen("soldout");
    };

    const onQueue = (payload) => setQueuePosition(payload.queueLength);
    socket.on("stockUpdated", onStock);
    socket.on("queueUpdated", onQueue);
    return () => {
      socket.off("stockUpdated", onStock);
      socket.off("queueUpdated", onQueue);
    };
  }, [socket, setProduct, setQueuePosition, setScreen]);

  const progress = useMemo(() => {
    if (!product) return 0;
    const totalStock = Math.max(product.stock || 0, (product.remainingStock || 0) + (product.soldCount || 0), 1);
    return Math.max(0, Math.min(100, (product.remainingStock / totalStock) * 100));
  }, [product]);

  const totalStock = product ? Math.max(product.stock || 0, (product.remainingStock || 0) + (product.soldCount || 0), 1) : 0;

  const buy = async () => {
    setBuying(true);
    try {
      const { data } = await api.post("/order/buy");
      setQueuePosition(data.queuePosition);
      setProduct((current) => current ? { ...current, remainingStock: data.remainingStock } : current);
      setScreen("processing");
      toast.success("Stock reserved. Complete secure checkout.");
      await openCheckout(data.payment);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to reserve stock";
      toast.error(message);
      if (message.toLowerCase().includes("sold")) setScreen("soldout");
    } finally {
      setBuying(false);
    }
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const soldOut = product?.remainingStock <= 0;

  return (
    <main className="app-surface min-h-screen text-[var(--text)]">
      <LoadingOverlay show={paymentLoading} />
      <div className="fixed inset-0 premium-backdrop" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="responsive-nav">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondary">Live flash drop</p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">Astra X1 Limited Edition</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={logout} className="icon-button" title="Logout"><LogOut size={20} /></button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[1.08fr_.92fr]">
          <ProductShowcase userName={user?.name} activeIndex={activeImage} onSelect={setActiveImage} />

          <GlassPanel className="rounded-lg p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-28" />
                <Skeleton className="h-14" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Metric icon={<Timer />} label="Ends in" value={`${minutes}:${secs}`} pulse />
                  <Metric icon={<Gauge />} label="Stock" value={product.remainingStock} flash={stockFlash} />
                  <Metric icon={<Wallet />} label="Price" value={`Rs. ${product.price?.toLocaleString("en-IN")}`} />
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex justify-between text-sm text-[var(--muted)]">
                    <span>Remaining inventory</span>
                    <span>{product.remainingStock}/{totalStock}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-[var(--soft)]">
                    <MotionDiv animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent shadow-neon" />
                  </div>
                </div>

                <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4">
                  <h2 className="text-xl font-black">{product.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Redis reserves stock first, Razorpay handles secure checkout, and verified payments confirm the final order in realtime.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Pill icon={<Users size={16} />} text={`${Math.max(9720, (product?.soldCount || 0) + 9720)} users active`} />
                    <Pill icon={<Activity size={16} />} text="Atomic stock lock" />
                    <Pill icon={<Zap size={16} />} text="Razorpay secure" />
                  </div>
                </div>

                <button disabled={buying || soldOut || paymentLoading} onClick={buy} className="neon-button mt-6 w-full text-base">
                  <ShoppingCart size={20} />
                  {soldOut ? "Sold out" : buying || paymentLoading ? "Preparing checkout..." : "Buy now"}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
                  <p className="rounded-lg bg-[var(--soft)] p-3">Queue position: <span className="font-bold text-[var(--text)]">{queuePosition || "-"}</span></p>
                  <p className="rounded-lg bg-[var(--soft)] p-3">Payment: <span className="font-bold text-[var(--text)]">Razorpay</span></p>
                </div>
              </>
            )}
          </GlassPanel>
        </section>
        <section className="grid gap-4 pb-8 lg:grid-cols-[.9fr_1.1fr]">
          <LiveStockGraph data={stockHistory} totals={stockTotals} />
          <ActivityFeed items={activity} />
        </section>
      </div>
    </main>
  );
}

function Pill({ icon, text }) {
  return <span className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-2 text-sm backdrop-blur">{icon}{text}</span>;
}

function Metric({ icon, label, value, pulse, flash }) {
  return (
    <div className={`premium-card p-3 ${pulse ? "animate-countdown" : ""}`}>
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${flash ? "animate-stock" : ""}`}>{value}</p>
    </div>
  );
}
