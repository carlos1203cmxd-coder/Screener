import type { ScoredStock, StockMetrics } from "./types";

/**
 * Clamp then min-max normalize a metric across the universe to [0, 1].
 * Missing values are treated as the neutral midpoint (0.5) so a stock
 * missing one data point isn't unfairly zeroed out.
 */
function normalize(values: (number | null)[], value: number | null, invert = false): number {
  const present = values.filter((v): v is number => v != null);
  if (value == null || present.length < 2) return 0.5;

  const min = Math.min(...present);
  const max = Math.max(...present);
  if (max === min) return 0.5;

  let n = (value - min) / (max - min);
  n = Math.min(1, Math.max(0, n));
  return invert ? 1 - n : n;
}

/**
 * Scores every stock in the universe on two independent axes:
 *
 *  - valueScore: how undervalued the stock looks *and* how strong its
 *    growth outlook is. Built from: analyst upside to target price (35%),
 *    PEG ratio, i.e. P/E paid per unit of growth (25%), forward EPS growth
 *    estimate (20%), forward revenue growth estimate (15%), and return on
 *    equity as a quality screen (5%). All components are normalized
 *    cross-sectionally against the rest of the fetched universe, so the
 *    score is relative to today's scan, not an absolute fair-value model.
 *
 *  - overvaluationScore: mirrors the value score's valuation legs (target
 *    downside, high PEG, high trailing/forward P/E) without rewarding
 *    growth, since an expensive stock with strong growth is "priced for
 *    perfection" rather than a bargain.
 *
 * Clipping ratios (PEG, P/E) at reasonable bounds before normalizing keeps
 * one extreme outlier (e.g. a near-zero-earnings stock with PEG of 400)
 * from compressing every other stock's score toward the middle.
 */
export function scoreUniverse(stocks: StockMetrics[]): ScoredStock[] {
  const clippedPeg = stocks.map((s) => (s.pegRatio != null ? Math.min(Math.max(s.pegRatio, -2), 5) : null));
  const clippedForwardPE = stocks.map((s) => (s.forwardPE != null ? Math.min(Math.max(s.forwardPE, 0), 80) : null));
  const clippedTrailingPE = stocks.map((s) => (s.trailingPE != null ? Math.min(Math.max(s.trailingPE, 0), 100) : null));
  // YoY growth ratios can spike arbitrarily high off a near-zero prior-year
  // base (e.g. a stock swinging from breakeven to profitable), so clip
  // before normalizing to stop one such outlier from flattening the rest
  // of the universe's scores toward the middle.
  const clippedEarningsGrowth = stocks.map((s) => (s.earningsGrowth != null ? Math.min(Math.max(s.earningsGrowth, -1), 2) : null));
  const clippedRevenueGrowth = stocks.map((s) => (s.revenueGrowth != null ? Math.min(Math.max(s.revenueGrowth, -1), 2) : null));

  const upsideValues = stocks.map((s) => s.upsideToTarget);
  const roeValues = stocks.map((s) => s.returnOnEquity);

  return stocks.map((s, i) => {
    const upsideN = normalize(upsideValues, s.upsideToTarget);
    const pegLowN = normalize(clippedPeg, clippedPeg[i], true); // low PEG = good value
    const pegHighN = normalize(clippedPeg, clippedPeg[i], false); // high PEG = overvalued
    const earningsGrowthN = normalize(clippedEarningsGrowth, clippedEarningsGrowth[i]);
    const revenueGrowthN = normalize(clippedRevenueGrowth, clippedRevenueGrowth[i]);
    const roeN = normalize(roeValues, s.returnOnEquity);
    const forwardPEHighN = normalize(clippedForwardPE, clippedForwardPE[i], false);
    const trailingPEHighN = normalize(clippedTrailingPE, clippedTrailingPE[i], false);
    const downsideN = normalize(upsideValues, s.upsideToTarget, true); // low/negative upside = overvalued

    const valueScore =
      0.35 * upsideN + 0.25 * pegLowN + 0.2 * earningsGrowthN + 0.15 * revenueGrowthN + 0.05 * roeN;

    const overvaluationScore =
      0.4 * downsideN + 0.3 * pegHighN + 0.15 * forwardPEHighN + 0.15 * trailingPEHighN;

    return {
      ...s,
      valueScore: Math.round(valueScore * 1000) / 10, // 0-100 scale
      overvaluationScore: Math.round(overvaluationScore * 1000) / 10,
    };
  });
}
