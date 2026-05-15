import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({ show, label = "Preparing secure checkout" }) {
  if (!show) return null;

  return (
    <div className="theme-overlay fixed inset-0 z-50 grid place-items-center px-4 backdrop-blur-md">
      <div className="premium-card animate-fadeScale p-6 text-center">
        <LoaderCircle className="mx-auto animate-spin text-primary" size={36} />
        <p className="mt-4 font-bold text-[var(--text)]">{label}</p>
      </div>
    </div>
  );
}
