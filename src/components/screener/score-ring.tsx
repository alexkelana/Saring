import { cn } from "@/lib/utils";

export function ScoreRing({
  value,
  size = 52,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * c;
  const tone = pct >= 72 ? "var(--color-up)" : pct >= 58 ? "var(--color-warn)" : "var(--color-muted-foreground)";
  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 44 44" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <span className="absolute font-mono text-[13px] font-medium tabular-nums text-foreground">
        {Math.round(pct)}
      </span>
    </div>
  );
}
