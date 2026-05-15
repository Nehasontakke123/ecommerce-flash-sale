export function StatCard({ label, value, tone = "text-[var(--text)]" }) {
  return (
    <div className="premium-card p-4">
      <p className="theme-muted text-xs uppercase tracking-[0.24em]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}
