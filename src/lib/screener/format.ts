export function formatIDR(n: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const digits = n >= 1000 ? 0 : n >= 100 ? 1 : 2;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatCompactIDR(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(abs >= 1e13 ? 1 : 2).replace(/\.0+$/, "")} T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(abs >= 1e10 ? 1 : 2).replace(/\.0+$/, "")} M`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1).replace(/\.0+$/, "")} jt`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1).replace(/\.0+$/, "")} rb`;
  return `${sign}${Math.round(abs)}`;
}

export function formatPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function formatVolume(n: number): string {
  return formatCompactIDR(n);
}

export function formatJakarta(ts: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(ts));
}

export function formatMultiple(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}×`;
}

export function formatRoe(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(n >= 10 ? 0 : 1)}%`;
}
