import type { Headline } from "./types";

const POSITIVE = [
  "laba",
  "untung",
  "dividen",
  "ekspansi",
  "kontrak",
  "kerja sama",
  "kerjasama",
  "menguat",
  "meroket",
  "rekor",
  "buyback",
  "upgrade",
  "rekomendasi beli",
  "pertumbuhan",
  "positif",
  "di atas ekspektasi",
  "kalahkan",
  "capex",
  "oversubscribe",
  "breakout",
  "sentimen positif",
  "naik signifikan",
  "raih",
];

const NEGATIVE = [
  "rugi",
  "merugi",
  "gagal bayar",
  "default",
  "suspensi",
  "suspend",
  "fraud",
  "penipuan",
  "denda",
  "phk",
  "melemah",
  "koreksi dalam",
  "restatement",
  "investigasi",
  "gorengan",
  "unusual market",
  "delisting",
  "pkpu",
  "pailit",
  "korupsi",
  "kpk",
  "gagal",
  "turun tajam",
  "diragukan",
  "banjir",
  "kecelakaan",
];

export function scoreHeadlines(headlines: Headline[]): {
  sentiment: number;
  tags: string[];
} {
  if (!headlines.length) return { sentiment: 50, tags: [] };
  let acc = 50;
  const tags: string[] = [];
  for (const h of headlines) {
    const t = h.title.toLowerCase();
    for (const w of POSITIVE) {
      if (t.includes(w)) {
        acc += 7;
        if (tags.length < 2) tags.push(w);
      }
    }
    for (const w of NEGATIVE) {
      if (t.includes(w)) {
        acc -= 11;
        if (tags.length < 3) tags.push(w);
      }
    }
  }
  return { sentiment: Math.max(12, Math.min(88, acc)), tags };
}

export function sentimentLabel(score: number): string {
  if (score >= 68) return "positif";
  if (score >= 55) return "agak positif";
  if (score <= 32) return "negatif";
  if (score <= 45) return "agak negatif";
  return "netral";
}
