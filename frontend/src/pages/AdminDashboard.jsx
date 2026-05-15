import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, RefreshCcw } from "lucide-react";
import { api } from "../api/client";
import { GlassPanel } from "../components/GlassPanel";
import { LiveBuyersCard, OversellRiskCard, AtomicStockLockCard } from "../components/AnalyticsCard";
import { ThemeToggle } from "../components/ThemeToggle";

export function AdminDashboard({ socket, onHome }) {
  const [stats, setStats] = useState(null);

  const load = () => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => toast.error("Unable to load admin stats"));
  };

  useEffect(load, []);
  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("stockUpdated", refresh);
    socket.on("paymentSuccess", refresh);
    socket.on("paymentFailed", refresh);
    return () => {
      socket.off("stockUpdated", refresh);
      socket.off("paymentSuccess", refresh);
      socket.off("paymentFailed", refresh);
    };
  }, [socket]);

  return (
    <main className="app-surface min-h-screen px-4 py-6 text-[var(--text)]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondary">Admin realtime</p>
            <h1 className="mt-2 text-4xl font-black">Flash Sale Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <button title="Refresh" onClick={load} className="icon-button"><RefreshCcw size={20} /></button>
            <button onClick={onHome} className="neon-button">Sale view</button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <LiveBuyersCard value={stats?.liveBuyers ?? "9,842"} />
          <OversellRiskCard value={stats?.oversellRisk ?? "0%"} />
          <AtomicStockLockCard value={stats?.stockLock ?? "Redis DECR + Lua"} />
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <GlassPanel className="rounded-lg p-5">
            <div className="mb-5 flex items-center gap-3">
              <BarChart3 className="text-primary" />
              <h2 className="text-xl font-black">Realtime graph</h2>
            </div>
            <div className="flex h-64 items-end gap-4">
              {["successfulPayments", "failedPayments", "remainingStock", "queue"].map((key) => {
                const value = key === "queue" ? stats?.queue?.queued || 0 : stats?.[key] || 0;
                return <div key={key} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-gradient-to-t from-primary to-secondary" style={{ height: `${Math.min(100, value)}%` }} /><span className="theme-muted text-xs">{key.replace("Payments", "")}</span></div>;
              })}
            </div>
          </GlassPanel>

          <GlassPanel className="rounded-lg p-5">
            <h2 className="mb-4 text-xl font-black">Live orders</h2>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--soft)] text-[var(--muted)]">
                  <tr><th className="p-3">User</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Created</th></tr>
                </thead>
                <tbody>
                  {(stats?.liveOrders || []).map((order) => (
                    <tr key={order._id} className="border-t border-[var(--border)]">
                      <td className="p-3">{order.userId?.email || "unknown"}</td>
                      <td className="p-3">{order.paymentStatus}</td>
                      <td className="p-3">{order.orderStatus}</td>
                      <td className="p-3">{new Date(order.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}
