import { formatPrice } from "@/lib/screener/format";
import { cn } from "@/lib/utils";

export function RangeBar({
  low,
  high,
  value,
  className,
}: {
  low: number | null;
  high: number | null;
  value: number;
  className?: string;
}) {
  if (low == null || high == null || high <= low) return null;
  const pct = Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">{formatPrice(low)}</span>
        <span>52 minggu</span>
        <span className="font-mono tabular-nums">{formatPrice(high)}</span>
      </div>
      <div className="relative h-1 rounded-full bg-secondary">
        <div
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
