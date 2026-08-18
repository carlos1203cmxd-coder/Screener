export interface StockMetrics {
  symbol: string;
  name: string;
  sector: string | null;
  price: number;
  currency: string;
  marketCap: number | null;

  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  numberOfAnalystOpinions: number | null;
  recommendationKey: string | null;
  upsideToTarget: number | null; // fraction, e.g. 0.15 = +15%

  trailingPE: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null;

  earningsGrowth: number | null; // fraction, YoY EPS growth estimate
  revenueGrowth: number | null; // fraction, YoY revenue growth estimate
  returnOnEquity: number | null;
  profitMargins: number | null;
  debtToEquity: number | null;

  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekRangePct: number | null; // 0 = at low, 1 = at high

  beta: number | null;
}

export interface ScoredStock extends StockMetrics {
  valueScore: number; // higher = more undervalued with growth
  overvaluationScore: number; // higher = more overvalued
}

export interface ScreenerResponse {
  generatedAt: string;
  universeSize: number;
  fetchedCount: number;
  undervalued: ScoredStock[];
  overvalued: ScoredStock[];
}
