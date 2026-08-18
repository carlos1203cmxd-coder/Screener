import type { ScoredStock } from "./types";

export type MarketCapPreset = "all" | "mid" | "large" | "mega";

export const MARKET_CAP_PRESETS: { key: MarketCapPreset; label: string; min: number; max: number }[] = [
  { key: "all", label: "Todas", min: 0, max: Infinity },
  { key: "mid", label: "Mid cap ($2B–10B)", min: 2e9, max: 10e9 },
  { key: "large", label: "Large cap ($10B–200B)", min: 10e9, max: 200e9 },
  { key: "mega", label: "Mega cap (>$200B)", min: 200e9, max: Infinity },
];

export interface ScreenerFilters {
  search: string;
  sectors: string[]; // empty = all sectors
  marketCapPreset: MarketCapPreset;
  minScore: number; // 0-100
}

export const DEFAULT_FILTERS: ScreenerFilters = {
  search: "",
  sectors: [],
  marketCapPreset: "all",
  minScore: 0,
};

export function applyFilters(
  stocks: ScoredStock[],
  filters: ScreenerFilters,
  scoreField: "valueScore" | "overvaluationScore",
): ScoredStock[] {
  const preset = MARKET_CAP_PRESETS.find((p) => p.key === filters.marketCapPreset) ?? MARKET_CAP_PRESETS[0];
  const search = filters.search.trim().toLowerCase();

  return stocks.filter((s) => {
    if (search && !s.symbol.toLowerCase().includes(search) && !s.name.toLowerCase().includes(search)) {
      return false;
    }
    if (filters.sectors.length > 0 && (!s.sector || !filters.sectors.includes(s.sector))) {
      return false;
    }
    if (s.marketCap != null && (s.marketCap < preset.min || s.marketCap >= preset.max)) {
      return false;
    }
    if (s[scoreField] < filters.minScore) {
      return false;
    }
    return true;
  });
}

export function uniqueSectors(stocks: ScoredStock[]): string[] {
  const set = new Set<string>();
  for (const s of stocks) {
    if (s.sector) set.add(s.sector);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
