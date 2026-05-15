import { motion } from "framer-motion";
import { CheckCircle2, Clock, LoaderCircle, ShieldX, Sparkles } from "lucide-react";
import { GlassPanel } from "../components/GlassPanel";

const shell = "app-surface grid min-h-screen place-items-center px-4 text-[var(--text)]";
const MotionDiv = motion.div;

export function QueuePage({ queuePosition }) {
  return (
    <main className={shell}>
      <Status icon={<Clock size={48} />} title="You are in the queue" detail={`Live queue position: ${queuePosition || "calculating"}`} tone="text-primary" spin />
    </main>
  );
}

export function ProcessingPage() {
  return (
    <main className={shell}>
      <Status icon={<LoaderCircle size={48} className="animate-spin" />} title="Payment processing" detail="The dummy payment gateway takes exactly 10 seconds." tone="text-accent" />
    </main>
  );
}

export function SuccessPage({ onHome }) {
  return (
    <main className={shell}>
      <Status icon={<CheckCircle2 size={52} />} title="Order confirmed" detail="Your item is secured. Duplicate purchases are now blocked for this account." tone="text-secondary" action={onHome} actionText="View sale" />
    </main>
  );
}

export function SoldOutPage({ onHome }) {
  return (
    <main className={shell}>
      <Status icon={<ShieldX size={52} />} title="Sold out" detail="All 100 reserved units are gone or being processed." tone="text-accent" action={onHome} actionText="Back to sale" explode />
    </main>
  );
}

export function FailedPage({ onHome }) {
  return (
    <main className={shell}>
      <Status icon={<Sparkles size={52} />} title="Payment failed" detail="The reservation was released and stock was restored." tone="text-accent" action={onHome} actionText="Try again" />
    </main>
  );
}

function Status({ icon, title, detail, tone, action, actionText, explode }) {
  return (
    <MotionDiv initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
      <GlassPanel className={`rounded-lg p-8 text-center ${explode ? "animate-explode" : "animate-float"}`}>
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full border border-[var(--border)] bg-[var(--soft)] ${tone}`}>{icon}</div>
        <h1 className="mt-6 text-3xl font-black">{title}</h1>
        <p className="theme-muted mt-3">{detail}</p>
        {action && <button className="neon-button mx-auto mt-7" onClick={action}>{actionText}</button>}
      </GlassPanel>
    </MotionDiv>
  );
}
