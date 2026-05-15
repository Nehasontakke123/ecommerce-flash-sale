export function Skeleton({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded bg-[var(--soft)] ${className}`}>
      <span className="absolute inset-y-0 left-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
