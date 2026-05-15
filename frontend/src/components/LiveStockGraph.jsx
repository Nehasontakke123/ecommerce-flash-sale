import { motion } from "framer-motion";
import { Activity, BarChart3, ShoppingBag, TrendingUp } from "lucide-react";

const MotionDiv = motion.div;
const MotionPath = motion.path;
const MotionCircle = motion.circle;

function buildPath(values, width, height, maxValue) {
  if (!values.length) return "";
  return values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
    const y = height - (value / maxValue) * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function lastDelta(values, key) {
  if (values.length < 2) return 0;
  return Number(values.at(-1)?.[key] || 0) - Number(values.at(-2)?.[key] || 0);
}

export function LiveStockGraph({ data, totals }) {
  const points = data.length ? data : [{
    id: "empty",
    label: "--",
    stock: totals?.stock || 0,
    sold: totals?.sold || 0,
    queue: totals?.queue || 0,
    spike: 0
  }];
  const width = 620;
  const height = 190;
  const maxValue = Math.max(...points.flatMap((point) => [point.stock, point.sold, point.queue]), totals?.total || 1, 1);
  const stockPath = buildPath(points.map((point) => point.stock), width, height, maxValue);
  const soldPath = buildPath(points.map((point) => point.sold), width, height, maxValue);
  const queuePath = buildPath(points.map((point) => point.queue), width, height, maxValue);
  const stockDelta = lastDelta(points, "stock");
  const soldDelta = lastDelta(points, "sold");

  return (
    <div className="premium-card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(127,90,240,.16),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(255,137,6,.12),transparent_28%)]" />
      <div className="relative mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <p className="text-sm font-black text-[var(--text)]">Live stock graph</p>
          </div>
          <p className="theme-muted mt-1 text-xs">Last {Math.min(points.length, 20)} realtime inventory updates</p>
        </div>
        <span className="status-badge flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary shadow-success" />
          Realtime
        </span>
      </div>

      <div className="relative grid gap-3 sm:grid-cols-3">
        <ChartStat icon={<ShoppingBag size={16} />} label="Available" value={totals?.stock ?? 0} delta={stockDelta} />
        <ChartStat icon={<TrendingUp size={16} />} label="Sold" value={totals?.sold ?? 0} delta={soldDelta} />
        <ChartStat icon={<Activity size={16} />} label="Queue" value={totals?.queue ?? 0} delta={lastDelta(points, "queue")} />
      </div>

      <div className="relative mt-5 min-h-[260px] rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
        <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[210px] w-full overflow-visible">
          <defs>
            <linearGradient id="stockLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#7F5AF0" />
              <stop offset="100%" stopColor="#FF8906" />
            </linearGradient>
            <linearGradient id="soldLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#2CB67D" />
              <stop offset="100%" stopColor="#FF8906" />
            </linearGradient>
            <filter id="chartGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0, 1, 2, 3].map((line) => (
            <line key={line} x1="0" x2={width} y1={(height / 3) * line} y2={(height / 3) * line} stroke="var(--border)" strokeDasharray="6 8" />
          ))}

          <MotionPath key={`queue-${points.at(-1)?.id}`} d={queuePath} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 8" initial={{ pathLength: 0, opacity: .25 }} animate={{ pathLength: 1, opacity: .55 }} transition={{ duration: .55 }} />
          <MotionPath key={`sold-${points.at(-1)?.id}`} d={soldPath} fill="none" stroke="url(#soldLine)" strokeWidth="4" strokeLinecap="round" filter="url(#chartGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .65 }} />
          <MotionPath key={`stock-${points.at(-1)?.id}`} d={stockPath} fill="none" stroke="url(#stockLine)" strokeWidth="5" strokeLinecap="round" filter="url(#chartGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .75 }} />

          {points.map((point, index) => {
            const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
            const y = height - (point.stock / maxValue) * height;
            return (
              <MotionCircle
                key={point.id}
                cx={x}
                cy={y}
                r={index === points.length - 1 ? 6 : 3.5}
                className="fill-primary"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: index === points.length - 1 ? 1 : .55 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              />
            );
          })}
        </svg>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <Legend color="bg-cyan-300" label="Available stock" />
          <Legend color="bg-secondary" label="Sold units" />
          <Legend color="bg-[var(--muted)]" label="Queue movement" />
        </div>
      </div>
    </div>
  );
}

function ChartStat({ icon, label, value, delta }) {
  const positive = delta > 0;
  const negative = delta < 0;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-primary">{icon}</span>
        <span className={`text-xs font-black ${positive ? "text-secondary" : negative ? "text-accent" : "theme-muted"}`}>
          {delta ? `${positive ? "+" : ""}${delta}` : "live"}
        </span>
      </div>
      <p className="theme-muted text-xs uppercase tracking-[0.18em]">{label}</p>
      <MotionDiv key={value} initial={{ y: 8, opacity: .4 }} animate={{ y: 0, opacity: 1 }} className="mt-1 text-2xl font-black">
        {value}
      </MotionDiv>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
