import { default as YahooFinance } from "yahoo-finance2";
import type { StockMetrics } from "./types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const MODULES = [
  "price",
  "summaryDetail",
  "defaultKeyStatistics",
  "financialData",
  "summaryProfile",
] as const;

function frac(n: number | null | undefined): number | null {
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

async function fetchOne(symbol: string): Promise<StockMetrics | null> {
  try {
    const r = await yahooFinance.quoteSummary(symbol, { modules: [...MODULES] });

    const price = r.price?.regularMarketPrice ?? null;
    if (price == null || !r.price?.longName) return null;

    const fiftyTwoWeekLow = frac(r.summaryDetail?.fiftyTwoWeekLow);
    const fiftyTwoWeekHigh = frac(r.summaryDetail?.fiftyTwoWeekHigh);
    let rangePct: number | null = null;
    if (fiftyTwoWeekLow != null && fiftyTwoWeekHigh != null && fiftyTwoWeekHigh > fiftyTwoWeekLow) {
      rangePct = (price - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow);
    }

    const targetMeanPrice = frac(r.financialData?.targetMeanPrice);
    const upsideToTarget = targetMeanPrice != null && price > 0 ? (targetMeanPrice - price) / price : null;

    return {
      symbol,
      name: r.price?.longName ?? r.price?.shortName ?? symbol,
      sector: r.summaryProfile?.sector ?? null,
      price,
      currency: r.price?.currency ?? "USD",
      marketCap: frac(r.price?.marketCap),

      targetMeanPrice,
      targetHighPrice: frac(r.financialData?.targetHighPrice),
      targetLowPrice: frac(r.financialData?.targetLowPrice),
      numberOfAnalystOpinions: frac(r.financialData?.numberOfAnalystOpinions),
      recommendationKey: r.financialData?.recommendationKey ?? null,
      upsideToTarget,

      trailingPE: frac(r.summaryDetail?.trailingPE),
      forwardPE: frac(r.summaryDetail?.forwardPE),
      pegRatio: frac(r.defaultKeyStatistics?.pegRatio),
      priceToBook: frac(r.defaultKeyStatistics?.priceToBook),

      earningsGrowth: frac(r.financialData?.earningsGrowth),
      revenueGrowth: frac(r.financialData?.revenueGrowth),
      returnOnEquity: frac(r.financialData?.returnOnEquity),
      profitMargins: frac(r.financialData?.profitMargins),
      debtToEquity: frac(r.financialData?.debtToEquity),

      fiftyTwoWeekLow,
      fiftyTwoWeekHigh,
      fiftyTwoWeekRangePct: rangePct,

      beta: frac(r.defaultKeyStatistics?.beta ?? r.summaryDetail?.beta),
    };
  } catch {
    return null;
  }
}

/** Runs async fetchers with a bounded concurrency, ignoring individual failures. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function fetchUniverseMetrics(
  symbols: string[],
  concurrency = 12,
): Promise<StockMetrics[]> {
  const results = await mapWithConcurrency(symbols, concurrency, fetchOne);
  return results.filter((r): r is StockMetrics => r !== null);
}
