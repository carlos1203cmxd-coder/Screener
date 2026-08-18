import { NextRequest, NextResponse } from "next/server";
import { STOCK_UNIVERSE } from "@/lib/universe";
import { fetchUniverseMetrics } from "@/lib/yahoo";
import { scoreUniverse } from "@/lib/scoring";
import type { ScreenerResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
// Return enough candidates per panel for client-side filters (sector, market
// cap, score) to have something to narrow down, not just the top ~25.
const RESULTS_PER_PANEL = 60;
const MIN_MARKET_CAP = 2_000_000_000; // filter out illiquid micro caps

let cache: { data: ScreenerResponse; expiresAt: number } | null = null;
let inFlight: Promise<ScreenerResponse> | null = null;

async function buildScreener(): Promise<ScreenerResponse> {
  const rawMetrics = await fetchUniverseMetrics(STOCK_UNIVERSE);
  const eligible = rawMetrics.filter((s) => s.marketCap == null || s.marketCap >= MIN_MARKET_CAP);
  const scored = scoreUniverse(eligible);

  const undervalued = scored
    .filter((s) => s.upsideToTarget != null && s.upsideToTarget > 0 && s.numberOfAnalystOpinions && s.numberOfAnalystOpinions >= 3)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, RESULTS_PER_PANEL);

  const overvalued = scored
    .filter((s) => s.upsideToTarget != null && s.numberOfAnalystOpinions && s.numberOfAnalystOpinions >= 3)
    .sort((a, b) => b.overvaluationScore - a.overvaluationScore)
    .slice(0, RESULTS_PER_PANEL);

  return {
    generatedAt: new Date().toISOString(),
    universeSize: STOCK_UNIVERSE.length,
    fetchedCount: rawMetrics.length,
    undervalued,
    overvalued,
  };
}

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "true";
  const now = Date.now();

  if (!forceRefresh && cache && cache.expiresAt > now) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    if (!inFlight) {
      inFlight = buildScreener().finally(() => {
        inFlight = null;
      });
    }
    const data = await inFlight;
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return NextResponse.json(data, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("Screener build failed:", err);
    if (cache) {
      return NextResponse.json(cache.data, { headers: { "X-Cache": "STALE" } });
    }
    return NextResponse.json(
      { error: "Failed to build screener results. Please try again shortly." },
      { status: 502 },
    );
  }
}
