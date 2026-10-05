import type { Sector, Size } from "./types";

export function mapSector(tvSector: string, industry: string): Sector {
  const ind = (industry || "").toLowerCase();
  const sec = (tvSector || "").toLowerCase();

  if (/bank/.test(ind)) return "Perbankan";
  if (/real estate|reit/.test(ind)) return "Properti";
  if (/engineering & construction|construction materials|building products/.test(ind)) {
    return "Konstruksi";
  }
  if (/wireless|telecommunication|cable\/satellite/.test(ind)) return "Telekomunikasi";
  if (/coal|integrated oil|oil & gas|oilfield|oil refining/.test(ind)) return "Energi";
  if (/precious metals|other metals|steel|aluminum|metal fabrication/.test(ind)) return "Tambang";
  if (/agricultural commodities|farming/.test(ind)) return "Perkebunan";
  if (/motor vehicle|auto parts|trucks\/construction\/farm/.test(ind)) return "Otomotif";
  if (/hospital|pharmaceutical|biotech|medical|nursing/.test(ind)) return "Kesehatan";
  if (
    /packaged software|information technology|internet software|data processing|computer communications|semiconductor|electronics\/appliances/.test(
      ind,
    )
  ) {
    return "Teknologi";
  }
  if (
    /specialty stores|food retail|department stores|apparel\/footwear retail|electronics\/appliance stores|home improvement/.test(
      ind,
    )
  ) {
    return "Ritel";
  }
  if (/wholesale distributors/.test(ind)) return "Ritel";
  if (/marine shipping|airlines|trucking|railroads|other transportation|air freight/.test(ind)) {
    return "Transportasi";
  }
  if (/electric utilities|alternative power|water utilities|gas distributors/.test(ind)) {
    return "Infrastruktur";
  }
  if (/movies|broadcasting|publishing|entertainment/.test(ind)) return "Media";
  if (/insurance|finance\/rental|investment banks|financial conglomerate|savings banks/.test(ind)) {
    return "Keuangan";
  }
  if (
    /food:|beverages:|household\/personal|tobacco|consumer sundries/.test(ind) ||
    /hotels\/resorts|restaurants/.test(ind)
  ) {
    return "Konsumer";
  }

  if (sec.includes("finance")) return "Keuangan";
  if (sec.includes("energy minerals")) return "Energi";
  if (sec.includes("non-energy minerals")) return "Tambang";
  if (sec.includes("health")) return "Kesehatan";
  if (sec.includes("technology") || sec.includes("electronic")) return "Teknologi";
  if (sec.includes("communications")) return "Telekomunikasi";
  if (sec.includes("retail") || sec.includes("distribution")) return "Ritel";
  if (sec.includes("transport")) return "Transportasi";
  if (sec.includes("utilities")) return "Infrastruktur";
  if (sec.includes("consumer")) return "Konsumer";
  return "Industri";
}

export function sizeFromMcap(mcap: number | null): Size {
  if (mcap == null || mcap <= 0) return "small";
  if (mcap >= 100e12) return "mega";
  if (mcap >= 20e12) return "large";
  if (mcap >= 3e12) return "mid";
  return "small";
}

export function cleanName(raw: string): string {
  return raw
    .replace(/^PT\s+/i, "")
    .replace(/\s+Tbk\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const SECTORS: Sector[] = [
  "Perbankan",
  "Keuangan",
  "Telekomunikasi",
  "Konsumer",
  "Otomotif",
  "Tambang",
  "Energi",
  "Properti",
  "Konstruksi",
  "Industri",
  "Kesehatan",
  "Teknologi",
  "Ritel",
  "Perkebunan",
  "Transportasi",
  "Infrastruktur",
  "Media",
];
