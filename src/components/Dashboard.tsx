"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScreenerResponse, ScoredStock } from "@/lib/types";
import { formatMarketCap, formatPercent, formatPrice, formatRatio } from "@/lib/format";
import { StockTable, type Column } from "@/components/StockTable";
import { FilterBar } from "@/components/FilterBar";
import { applyFilters, DEFAULT_FILTERS, uniqueSectors, type ScreenerFilters } from "@/lib/filters";

function SymbolCell({ stock }: { stock: ScoredStock }) {
  return (
    <div>
      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{stock.symbol}</div>
      <div className="max-w-[180px] truncate text-xs text-zinc-500 dark:text-zinc-400">{stock.name}</div>
    </div>
  );
}

function ScoreBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span className="w-9 text-right font-medium">{value.toFixed(0)}</span>
    </div>
  );
}

const undervaluedColumns: Column[] = [
  { key: "symbol", label: "Ticker", render: (s) => <SymbolCell stock={s} />, sortValue: (s) => s.symbol },
  { key: "sector", label: "Sector", render: (s) => s.sector ?? "—", sortValue: (s) => s.sector ?? "" },
  { key: "price", label: "Precio", align: "right", render: (s) => formatPrice(s.price, s.currency), sortValue: (s) => s.price },
  {
    key: "target",
    label: "Objetivo analistas",
    align: "right",
    render: (s) => formatPrice(s.targetMeanPrice, s.currency),
    sortValue: (s) => s.targetMeanPrice,
  },
  {
    key: "upside",
    label: "Potencial alza",
    align: "right",
    render: (s) => (
      <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatPercent(s.upsideToTarget)}</span>
    ),
    sortValue: (s) => s.upsideToTarget,
  },
  { key: "peg", label: "PEG", align: "right", render: (s) => formatRatio(s.pegRatio), sortValue: (s) => s.pegRatio },
  {
    key: "fwdpe",
    label: "P/E fwd",
    align: "right",
    render: (s) => formatRatio(s.forwardPE, 1),
    sortValue: (s) => s.forwardPE,
  },
  {
    key: "epsgrowth",
    label: "Crec. BPA",
    align: "right",
    render: (s) => formatPercent(s.earningsGrowth),
    sortValue: (s) => s.earningsGrowth,
  },
  {
    key: "revgrowth",
    label: "Crec. ingresos",
    align: "right",
    render: (s) => formatPercent(s.revenueGrowth),
    sortValue: (s) => s.revenueGrowth,
  },
  { key: "mcap", label: "Cap. mercado", align: "right", render: (s) => formatMarketCap(s.marketCap), sortValue: (s) => s.marketCap },
  {
    key: "score",
    label: "Score valor",
    align: "right",
    render: (s) => <ScoreBar value={s.valueScore} colorClass="bg-emerald-500" />,
    sortValue: (s) => s.valueScore,
  },
];

const overvaluedColumns: Column[] = [
  { key: "symbol", label: "Ticker", render: (s) => <SymbolCell stock={s} />, sortValue: (s) => s.symbol },
  { key: "sector", label: "Sector", render: (s) => s.sector ?? "—", sortValue: (s) => s.sector ?? "" },
  { key: "price", label: "Precio", align: "right", render: (s) => formatPrice(s.price, s.currency), sortValue: (s) => s.price },
  {
    key: "target",
    label: "Objetivo analistas",
    align: "right",
    render: (s) => formatPrice(s.targetMeanPrice, s.currency),
    sortValue: (s) => s.targetMeanPrice,
  },
  {
    key: "upside",
    label: "Vs. objetivo",
    align: "right",
    render: (s) => (
      <span
        className={`font-medium ${
          (s.upsideToTarget ?? 0) < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500"
        }`}
      >
        {formatPercent(s.upsideToTarget)}
      </span>
    ),
    sortValue: (s) => s.upsideToTarget,
  },
  { key: "peg", label: "PEG", align: "right", render: (s) => formatRatio(s.pegRatio), sortValue: (s) => s.pegRatio },
  {
    key: "pe",
    label: "P/E trailing",
    align: "right",
    render: (s) => formatRatio(s.trailingPE, 1),
    sortValue: (s) => s.trailingPE,
  },
  {
    key: "fwdpe",
    label: "P/E fwd",
    align: "right",
    render: (s) => formatRatio(s.forwardPE, 1),
    sortValue: (s) => s.forwardPE,
  },
  { key: "mcap", label: "Cap. mercado", align: "right", render: (s) => formatMarketCap(s.marketCap), sortValue: (s) => s.marketCap },
  {
    key: "score",
    label: "Score sobreval.",
    align: "right",
    render: (s) => <ScoreBar value={s.overvaluationScore} colorClass="bg-red-500" />,
    sortValue: (s) => s.overvaluationScore,
  },
];

export function Dashboard() {
  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [undervaluedFilters, setUndervaluedFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [overvaluedFilters, setOvervaluedFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);

  const fetchData = useCallback(async (forceRefresh: boolean) => {
    setError(null);
    try {
      const res = await fetch(`/api/screener${forceRefresh ? "?refresh=true" : ""}`);
      if (!res.ok) throw new Error(`API respondió ${res.status}`);
      const json = (await res.json()) as ScreenerResponse;
      setData(json);
    } catch {
      setError("No se pudieron cargar los datos del mercado. Intenta de nuevo en unos segundos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    // Initial data fetch on mount; fetchData sets loading/data/error state
    // once the request settles, which this lint rule can't see past `await`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData(false);
  }, [fetchData]);

  const undervaluedSectors = useMemo(() => uniqueSectors(data?.undervalued ?? []), [data]);
  const overvaluedSectors = useMemo(() => uniqueSectors(data?.overvalued ?? []), [data]);

  const filteredUndervalued = useMemo(
    () => applyFilters(data?.undervalued ?? [], undervaluedFilters, "valueScore"),
    [data, undervaluedFilters],
  );
  const filteredOvervalued = useMemo(
    () => applyFilters(data?.overvalued ?? [], overvaluedFilters, "overvaluationScore"),
    [data, overvaluedFilters],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Screener de Acciones EE. UU.
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Acciones infravaloradas con fuertes proyecciones de crecimiento, y las más sobrevaloradas del mercado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs text-zinc-400">
              Actualizado: {new Date(data.generatedAt).toLocaleString("es-ES")}
              {" · "}
              {data.fetchedCount}/{data.universeSize} tickers
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex flex-col gap-4">
          <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
      ) : (
        data && (
          <>
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Infravaloradas con crecimiento
                </h2>
                <span className="text-xs text-zinc-400">
                  Alto potencial de alza según analistas + PEG bajo + crecimiento estimado
                </span>
              </div>
              <FilterBar
                filters={undervaluedFilters}
                onChange={setUndervaluedFilters}
                availableSectors={undervaluedSectors}
                resultCount={filteredUndervalued.length}
              />
              <StockTable
                stocks={filteredUndervalued}
                columns={undervaluedColumns}
                defaultSortKey="score"
                accentClass="bg-emerald-50/50 dark:bg-emerald-950/20"
              />
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Sobrevaloradas</h2>
                <span className="text-xs text-zinc-400">Cotizan por encima del objetivo de analistas + PEG/P-E elevados</span>
              </div>
              <FilterBar
                filters={overvaluedFilters}
                onChange={setOvervaluedFilters}
                availableSectors={overvaluedSectors}
                resultCount={filteredOvervalued.length}
              />
              <StockTable
                stocks={filteredOvervalued}
                columns={overvaluedColumns}
                defaultSortKey="score"
                accentClass="bg-red-50/50 dark:bg-red-950/20"
              />
            </section>
          </>
        )
      )}

      <footer className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-zinc-800">
        Datos de mercado vía Yahoo Finance, con retraso. Los scores son heurísticas relativas al universo escaneado
        (~{data?.universeSize ?? 150} large/mid caps de EE. UU.), no una valoración absoluta. Esto no constituye
        asesoramiento financiero.
      </footer>
    </div>
  );
}
