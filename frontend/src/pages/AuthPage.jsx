import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LogIn, Mail, User, UserPlus, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GlassPanel } from "../components/GlassPanel";

const MotionDiv = motion.div;

export function AuthPage({ initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await register(form);
      toast.success("Welcome to the flash drop");
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="premium-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-8 text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 particle-field opacity-30" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] h-28 w-28 animate-bounceSoft rounded-full border border-primary/30 bg-primary/10 blur-sm" />
      <div className="pointer-events-none absolute bottom-[14%] right-[10%] h-36 w-36 animate-float rounded-full border border-secondary/25 bg-secondary/10 blur-sm" />
      <MotionDiv initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md">
        {onBack && (
          <button onClick={onBack} className="theme-muted mb-4 inline-flex items-center gap-2 text-sm font-bold transition hover:text-[var(--text)]">
            <ArrowLeft size={16} /> Back to landing
          </button>
        )}
        <div className="animated-border">
          <GlassPanel className="rounded-lg p-8">
          <div className="mb-7 text-center">
            <button type="button" className="group relative mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-[var(--border)] bg-[var(--glass)] shadow-neon backdrop-blur">
              <span className="absolute inset-0 rounded-full opacity-0 transition group-hover:animate-pulseGlow group-hover:opacity-100" />
              <User className="relative z-10 animate-float text-primary" size={38} />
            </button>
            <div className="flex items-center justify-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary shadow-neon">
                <Zap />
              </span>
              <div className="text-left">
                <h1 className="text-2xl font-black">Flash Sale Control</h1>
                <p className="theme-muted text-sm">Secure entry for the live drop.</p>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--soft)] p-1">
            <button type="button" onClick={() => setMode("login")} className={`rounded-md px-3 py-2 text-sm font-bold transition ${mode === "login" ? "bg-[var(--text)] text-[var(--bg)] shadow-lg" : "theme-muted hover:text-[var(--text)]"}`}>Login</button>
            <button type="button" onClick={() => setMode("register")} className={`rounded-md px-3 py-2 text-sm font-bold transition ${mode === "register" ? "bg-[var(--text)] text-[var(--bg)] shadow-lg" : "theme-muted hover:text-[var(--text)]"}`}>Register</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <InputShell icon={<User size={18} />}>
                <input className="field border-0 bg-transparent pl-11 focus:ring-0" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </InputShell>
            )}
            <InputShell icon={<Mail size={18} />}>
              <input className="field border-0 bg-transparent pl-11 focus:ring-0" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </InputShell>
            <InputShell icon={<LogIn size={18} />}>
              <input className="field border-0 bg-transparent pl-11 pr-12 focus:ring-0" placeholder="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="theme-muted absolute right-4 top-1/2 -translate-y-1/2 transition hover:scale-110 hover:text-[var(--text)]" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </InputShell>
            <button disabled={loading} className="neon-button w-full">
              {loading ? <LoaderCircle className="animate-spin" size={18} /> : mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? "Processing..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
          </GlassPanel>
        </div>
      </MotionDiv>
    </main>
  );
}

function InputShell({ icon, children }) {
  return (
    <div className="theme-surface group relative rounded-lg border transition duration-300 focus-within:border-primary focus-within:shadow-neon">
      <span className="theme-muted pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition group-focus-within:text-primary">
        {icon}
      </span>
      {children}
    </div>
  );
}
