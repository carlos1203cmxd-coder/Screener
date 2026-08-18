"use client";

import { useMemo, useState } from "react";
import type { ScoredStock } from "@/lib/types";

export interface Column {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (stock: ScoredStock) => React.ReactNode;
  sortValue: (stock: ScoredStock) => number | string | null;
}

interface StockTableProps {
  stocks: ScoredStock[];
  columns: Column[];
  defaultSortKey: string;
  accentClass: string;
}

export function StockTable({ stocks, columns, defaultSortKey, accentClass }: StockTableProps) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return stocks;
    const withValue = stocks.map((s) => ({ s, v: col.sortValue(s) }));
    withValue.sort((a, b) => {
      if (a.v == null && b.v == null) return 0;
      if (a.v == null) return 1;
      if (b.v == null) return -1;
      const cmp = a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return withValue.map((w) => w.s);
  }, [stocks, columns, sortKey, sortDir]);

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
                {sortKey === col.key && <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((stock, i) => (
            <tr
              key={stock.symbol}
              className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-900/40 ${
                i === 0 ? accentClass : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2 ${col.align === "right" ? "text-right tabular-nums" : "text-left"}`}
                >
                  {col.render(stock)}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-zinc-400">
                Sin resultados que cumplan los criterios de este panel.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
