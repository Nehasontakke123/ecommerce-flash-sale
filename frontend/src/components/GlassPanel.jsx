export function GlassPanel({ children, className = "" }) {
  return (
    <section className={`premium-card ${className}`}>
      {children}
    </section>
  );
}
