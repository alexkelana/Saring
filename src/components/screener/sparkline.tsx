import { cn } from "@/lib/utils";

export function Sparkline({
  values,
  className,
  up,
}: {
  values: number[];
  className?: string;
  up?: boolean;
}) {
  if (values.length < 2) return <div className={cn("h-8", className)} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 120;
  const h = 36;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1]!;
  const first = values[0]!;
  const positive = up ?? last >= first;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-8 w-[7.5rem] overflow-visible", className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={positive ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}
