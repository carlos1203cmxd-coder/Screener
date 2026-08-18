export function formatPrice(value: number | null, currency = "USD"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value == null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

export function formatRatio(value: number | null, digits = 2): string {
  if (value == null) return "—";
  return value.toFixed(digits);
}

export function formatMarketCap(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value}`;
}
