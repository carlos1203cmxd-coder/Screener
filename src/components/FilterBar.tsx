"use client";

import { DEFAULT_FILTERS, MARKET_CAP_PRESETS, type ScreenerFilters } from "@/lib/filters";

interface FilterBarProps {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
  availableSectors: string[];
  resultCount: number;
}

export function FilterBar({ filters, onChange, availableSectors, resultCount }: FilterBarProps) {
  function toggleSector(sector: string) {
    const has = filters.sectors.includes(sector);
    onChange({
      ...filters,
      sectors: has ? filters.sectors.filter((s) => s !== sector) : [...filters.sectors, sector],
    });
  }

  const isDefault =
    filters.search === "" &&
    filters.sectors.length === 0 &&
    filters.marketCapPreset === "all" &&
    filters.minScore === 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Buscar ticker o empresa…"
          className="w-48 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />

        <select
          value={filters.marketCapPreset}
          onChange={(e) => onChange({ ...filters, marketCapPreset: e.target.value as ScreenerFilters["marketCapPreset"] })}
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {MARKET_CAP_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          Score mínimo
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
            className="w-28 accent-zinc-700 dark:accent-zinc-300"
          />
          <span className="w-7 tabular-nums">{filters.minScore}</span>
        </label>

        <span className="ml-auto text-xs text-zinc-400">{resultCount} resultados</span>

        {!isDefault && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Restablecer
          </button>
        )}
      </div>

      {availableSectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSectors.map((sector) => {
            const active = filters.sectors.includes(sector);
            return (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
