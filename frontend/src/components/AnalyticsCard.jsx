import { motion } from "framer-motion";
// import { cn } from "../utils"; // removed unused utility
import { Users, Shield, Lock } from "lucide-react";

/**
 * Premium Analytics Card
 * Props:
 *  - title: string – card heading (e.g., "LIVE BUYERS")
 *  - value: string | number – primary metric
 *  - subtitle: string – secondary text (e.g., "+128 active in last minute")
 *  - icon: ReactElement – Lucide icon component
 *  - gradient: string – Tailwind gradient classes for border (e.g., "from-purple-500 to-cyan-500")
 */
export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}) {
  return (
    <motion.div
      className="premium-card animated-border relative overflow-hidden p-5 hover:scale-[1.02]"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, duration: 0.3 }}
    >
      {/* Animated gradient border via pseudo‑element defined in CSS */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${gradient} opacity-30 pointer-events-none`} />

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex-shrink-0 p-2 bg-[rgba(255,255,255,0.08)] rounded-lg backdrop-blur-sm">
          {icon &&
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="text-white"
            >
              {icon}
            </motion.div>}
        </div>
        <div className="flex-1">
          <p className="theme-muted text-xs uppercase tracking-[0.24em]">{title}</p>
          <p className="mt-1 text-2xl font-black text-[var(--text)]">{value}</p>
          {subtitle && <p className="theme-muted text-sm mt-1">{subtitle}</p>}
        </div>
        {/* realtime pulse dot */}
        <span className="realtime-pulse absolute top-2 right-2" />
      </div>
    </motion.div>
  );
}

// Convenience presets for the three required cards
export const LiveBuyersCard = (props) => (
  <AnalyticsCard
    title="LIVE BUYERS"
    value={props.value ?? "9,842"}
    subtitle={props.subtitle ?? "+128 active in last minute"}
    icon={<Users size={24} />}
    gradient="from-purple-500 to-cyan-500"
    {...props}
  />
);

export const OversellRiskCard = (props) => (
  <AnalyticsCard
    title="OVERSELL RISK"
    value={props.value ?? "0%"}
    subtitle={props.subtitle ?? "Protected by Redis atomic locking"}
    icon={<Shield size={24} />}
    gradient="from-emerald-500 to-blue-500"
    {...props}
  />
);

export const AtomicStockLockCard = (props) => (
  <AnalyticsCard
    title="ATOMIC STOCK LOCK"
    value={props.value ?? "Redis DECR + Lua"}
    subtitle={props.subtitle ?? "Realtime reservation active"}
    icon={<Lock size={24} />}
    gradient="from-orange-500 to-purple-500"
    {...props}
  />
);
