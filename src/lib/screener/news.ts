import type { Headline } from "./types";

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/'/g, "'");
}

function parseRss(xml: string, limit = 4): Headline[] {
  const items = xml.split(/<item>/i).slice(1, limit + 1);
  const out: Headline[] = [];
  for (const item of items) {
    const title = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
    const source =
      item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] ??
      item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i)?.[1] ??
      "Berita";
    const date = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? "";
    if (!title) continue;
    const clean = decodeXml(title).replace(/\s+/g, " ").trim();
    if (!clean) continue;
    out.push({
      title: clean.replace(/\s+-\s+[^-]+$/, ""),
      source: decodeXml(source).trim(),
      date: decodeXml(date).trim(),
    });
  }
  return out;
}

const newsCache = new Map<string, { at: number; value: Headline[] }>();
const NEWS_TTL = 20 * 60 * 1000;

export async function fetchHeadlines(symbol: string, name: string): Promise<Headline[]> {
  const key = symbol;
  const hit = newsCache.get(key);
  if (hit && Date.now() - hit.at < NEWS_TTL) return hit.value;
  const q = encodeURIComponent(`${symbol} saham`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      newsCache.set(key, { at: Date.now(), value: [] });
      return [];
    }
    const xml = await res.text();
    const first = name.split(" ")[0]!.toUpperCase();
    const headlines = parseRss(xml, 4).filter((h) => {
      const t = h.title.toUpperCase();
      return (
        t.includes(symbol) ||
        t.includes(first) ||
        t.includes("SAHAM") ||
        t.includes("IHSG") ||
        t.includes("BEI")
      );
    });
    const value = headlines.length ? headlines : parseRss(xml, 3);
    newsCache.set(key, { at: Date.now(), value });
    return value;
  } catch {
    newsCache.set(key, { at: Date.now(), value: [] });
    return [];
  }
}

export async function fetchHeadlinesFor(stocks: { symbol: string; name: string }[]) {
  const rows = await mapPool(stocks, 6, (s) => fetchHeadlines(s.symbol, s.name));
  const map = new Map<string, Headline[]>();
  stocks.forEach((s, i) => map.set(s.symbol, rows[i] ?? []));
  return map;
}
