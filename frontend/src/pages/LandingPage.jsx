import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Clock3, LockKeyhole, Radio, ShieldCheck, ShoppingBag, Sparkles, Users, Zap } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import hero from "../assets/hero.png";

const MotionSection = motion.section;
const MotionDiv = motion.div;

export function LandingPage({ onLogin, onRegister }) {
  const [seconds, setSeconds] = useState(900);
  const [stock, setStock] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    const stockTimer = setInterval(() => setStock((value) => (value <= 18 ? 100 : value - Math.ceil(Math.random() * 4))), 1800);
    return () => {
      clearInterval(timer);
      clearInterval(stockTimer);
    };
  }, []);

  const countdown = useMemo(() => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  }, [seconds]);

  const sold = 100 - stock;

  return (
    <main className="premium-bg min-h-screen animate-backgroundMove text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 particle-field opacity-40" />
      <nav className="theme-nav sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button className="flex items-center gap-3 text-left" onClick={() => scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary shadow-neon"><Zap size={22} /></span>
            <span>
              <span className="block text-lg font-black">FlashCart</span>
              <span className="theme-muted block text-xs uppercase tracking-[0.22em]">Realtime drop</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="theme-muted hidden rounded-lg px-4 py-2 text-sm font-bold transition hover:text-[var(--text)] sm:inline-flex" onClick={onLogin}>Login</button>
            <button className="neon-button min-h-10 px-4 py-2 text-sm" onClick={onRegister}>Register</button>
          </div>
        </div>
      </nav>

      <MotionSection initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
        <div className="max-w-3xl">
          <div className="theme-surface mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur">
            <Radio size={16} className="text-secondary" />
            10,000 users competing live
          </div>
          <h1 className="text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
            Flash sale infrastructure that stays honest under pressure.
          </h1>
          <p className="theme-muted mt-6 max-w-2xl text-lg leading-8">
            Only 100 products available, guarded by Redis atomic reservations, BullMQ payment processing, and realtime Socket.IO stock updates.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroMetric label="Countdown" value={countdown} icon={<Clock3 />} />
            <HeroMetric label="Available" value={stock} icon={<ShoppingBag />} flash />
            <HeroMetric label="Sold" value={sold} icon={<BarChart3 />} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="neon-button animate-pulseGlow" onClick={onRegister}>
              Enter the drop <ArrowRight size={18} />
            </button>
            <button className="theme-surface rounded-lg border px-5 py-3 font-black backdrop-blur transition hover:border-secondary hover:text-secondary" onClick={onLogin}>
              Login
            </button>
          </div>
        </div>

        <MotionDiv initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="animated-border">
          <div className="glass-card overflow-hidden p-4">
            <div className="relative min-h-[460px] overflow-hidden rounded-lg bg-[var(--surface)]">
              <img src={hero} alt="Premium flash sale product" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <FloatingCard className="left-5 top-6" icon={<Users size={18} />} title="Live buyers" value="9,842" />
              <FloatingCard className="right-5 top-24 delay-200" icon={<ShieldCheck size={18} />} title="Oversell risk" value="0%" />
              <FloatingCard className="bottom-6 left-5 right-5" icon={<LockKeyhole size={18} />} title="Atomic stock lock" value="Redis DECR + Lua" wide />
            </div>
          </div>
        </MotionDiv>
      </MotionSection>

      <Section title="Flash Sale Features" kicker="Battle-tested UX">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Realtime stock", "Socket.IO pushes remaining stock instantly to every active shopper.", <Radio />],
            ["Queue visibility", "Buyers see payment and queue state instead of guessing after a click.", <Users />],
            ["Payment recovery", "Failed payments restore stock automatically without overselling.", <Sparkles />]
          ].map(([title, text, icon]) => <FeatureCard key={title} title={title} text={text} icon={icon} />)}
        </div>
      </Section>

      <Section title="Live Stats" kicker="Operational clarity">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="10k" label="Concurrent buyers" />
          <Stat value="100" label="Limited stock" />
          <Stat value="10s" label="Payment delay" />
          <Stat value="0" label="Oversold units" />
        </div>
      </Section>

      <Section title="Realtime Sale Demo" kicker="What users see">
        <div className="glass-card grid gap-6 p-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">Inventory stream</p>
            <h3 className="mt-3 text-3xl font-black">Stock changes move through the interface instantly.</h3>
            <p className="theme-muted mt-4">The demo mirrors the app flow: reservation, queue, payment, confirmation, and stock restoration on failure.</p>
          </div>
          <div className="space-y-3">
            {["User #1204 reserved stock", "Queue position recalculated", "Payment worker started", "Stock updated across clients"].map((item, index) => (
              <div key={item} className="theme-surface animate-slideUp rounded-lg border p-4" style={{ animationDelay: `${index * 120}ms` }}>
                <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-full bg-primary/25 text-primary">{index + 1}</span>{item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Why Our System" kicker="Backend-first trust">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard title="Redis atomic operations" text="Stock reservation happens in one server-side operation, so parallel clicks cannot race past inventory." icon={<Zap />} />
          <FeatureCard title="BullMQ isolation" text="Traffic spikes are absorbed by a queue instead of overwhelming payment and database writes." icon={<BarChart3 />} />
          <FeatureCard title="JWT protected buyers" text="Each account gets one reservation path, one order, and clear feedback throughout payment." icon={<ShieldCheck />} />
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card p-8 text-center sm:p-12">
          <h2 className="text-4xl font-black">Ready for the live drop?</h2>
          <p className="theme-muted mx-auto mt-4 max-w-2xl">Create your account, join the queue, and watch the stock move in realtime.</p>
          <button className="neon-button mx-auto mt-8 animate-neonPulse" onClick={onRegister}>Start now <ArrowRight size={18} /></button>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ label, value, icon, flash }) {
  return (
    <div className="glass-card p-4">
      <div className="text-primary">{icon}</div>
      <p className="theme-muted mt-3 text-xs uppercase tracking-[0.22em]">{label}</p>
      <p className={`mt-1 text-3xl font-black ${flash ? "animate-stock" : ""}`}>{value}</p>
    </div>
  );
}

function FloatingCard({ className, icon, title, value, wide }) {
  return (
    <div className={`premium-card absolute animate-float p-4 ${wide ? "flex items-center justify-between" : ""} ${className}`}>
      <div className="flex items-center gap-2 text-primary">{icon}<span className="theme-muted text-xs uppercase tracking-[0.18em]">{title}</span></div>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function Section({ kicker, title, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-secondary">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black sm:text-4xl">{title}</h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function FeatureCard({ title, text, icon }) {
  return (
    <div className="glass-card p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-neon">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-primary/20 text-primary">{icon}</div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="theme-muted mt-3 leading-7">{text}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="glass-card p-6 text-center">
      <p className="text-4xl font-black text-[var(--text)]">{value}</p>
      <p className="theme-muted mt-2 text-sm uppercase tracking-[0.22em]">{label}</p>
    </div>
  );
}
