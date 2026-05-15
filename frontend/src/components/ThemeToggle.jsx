import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const MotionButton = motion.button;
const MotionSpan = motion.span;

export function ThemeToggle() {
  const { currentTheme, toggleTheme } = useTheme();
  const light = currentTheme === "light";

  return (
    <MotionButton
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: .96 }}
    >
      <MotionSpan
        className="theme-toggle__thumb"
        animate={{ x: light ? 23 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentTheme}
            initial={{ rotate: -90, opacity: 0, scale: .55 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: .55 }}
            transition={{ duration: .2 }}
          >
            {light ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        </AnimatePresence>
      </MotionSpan>
    </MotionButton>
  );
}
