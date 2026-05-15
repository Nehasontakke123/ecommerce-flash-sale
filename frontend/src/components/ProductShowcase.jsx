import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import premiumHeadphones from "../assets/premium-headphones.png";

const MotionDiv = motion.div;
const MotionImg = motion.img;

const variants = [
  { name: "Graphite", image: premiumHeadphones, tint: "from-primary/35 to-transparent" },
  { name: "Aurora", image: premiumHeadphones, tint: "from-secondary/25 to-transparent" },
  { name: "Solar", image: premiumHeadphones, tint: "from-accent/25 to-transparent" }
];

export function ProductShowcase({ userName, activeIndex, onSelect }) {
  const active = variants[activeIndex] || variants[0];

  return (
    <MotionDiv initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="product-stage">
      <div className="particle-orbit" />
      <div className={`absolute inset-0 bg-gradient-to-tr ${active.tint}`} />
      <MotionImg
        key={active.name}
        src={active.image}
        alt={`${active.name} premium headphones`}
        initial={{ opacity: 0, y: 18, scale: .94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.06, rotate: -1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="product-image"
      />
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-2 text-sm font-bold text-[var(--text)] backdrop-blur">
        <Sparkles size={16} className="text-accent" />
        Limited drop
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        <p className="text-sm text-[var(--muted)]">Hello, {userName}. One verified checkout per account.</p>
        <div className="mt-4 flex gap-3">
          {variants.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelect(index)}
              className={`thumbnail ${index === activeIndex ? "thumbnail-active" : ""}`}
              title={item.name}
            >
              <img src={item.image} alt="" />
            </button>
          ))}
        </div>
      </div>
    </MotionDiv>
  );
}
