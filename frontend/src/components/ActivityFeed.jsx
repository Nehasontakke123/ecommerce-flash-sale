import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, Radio, XCircle, Zap } from "lucide-react";

const MotionDiv = motion.div;

const typeStyles = {
  success: {
    icon: CheckCircle2,
    label: "Success",
    className: "border-emerald-400/35 bg-emerald-500/10 text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,.16)]"
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className: "border-orange-400/35 bg-orange-500/10 text-orange-500 shadow-[0_0_24px_rgba(249,115,22,.16)]"
  },
  failure: {
    icon: XCircle,
    label: "Failure",
    className: "border-rose-400/35 bg-rose-500/10 text-rose-500 shadow-[0_0_24px_rgba(244,63,94,.16)]"
  },
  info: {
    icon: Zap,
    label: "Info",
    className: "border-violet-400/35 bg-violet-500/10 text-primary shadow-[0_0_24px_rgba(127,90,240,.16)]"
  }
};

export function ActivityFeed({ items }) {
  const activityItems = items.length ? items : [{
    id: "empty",
    type: "info",
    message: "Listening for realtime checkout, payment, queue, and stock events.",
    time: "live"
  }];

  return (
    <div className="premium-card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio size={17} className="animate-neonPulse text-secondary" />
          <h2 className="text-sm font-black text-[var(--text)]">Live activity</h2>
        </div>
        <span className="status-badge flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary shadow-success" />
          Streaming
        </span>
      </div>

      <div className="activity-scroll max-h-[315px] space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {activityItems.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityRow({ item }) {
  const style = typeStyles[item.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 18, scale: .98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: .98 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className={`group relative overflow-hidden rounded-lg border p-3 transition hover:-translate-y-0.5 ${style.className}`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-700 group-hover:translate-x-[320%]" />
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-current/20 bg-current/10">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.18em]">{style.label}</span>
            <span className="theme-muted inline-flex items-center gap-1 text-xs">
              <Clock3 size={12} />
              {item.time}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--text)]">{item.message}</p>
        </div>
      </div>
    </MotionDiv>
  );
}
