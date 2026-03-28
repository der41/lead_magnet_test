"use client";

import type { ComparisonRow } from "@/types/calculator";
import { Badge } from "@/components/ui";

export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[var(--surface-soft)] text-sm text-[var(--muted)]">
            <tr>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Estimated current setup</th>
              <th className="px-5 py-4 font-medium">Breezy coverage</th>
              <th className="px-5 py-4 font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.categoryKey} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                  {row.categoryLabel}
                </td>
                <td className="px-5 py-4 text-sm leading-6 text-[var(--muted)]">
                  {row.estimatedCurrentSetup}
                </td>
                <td className="px-5 py-4 text-sm leading-6 text-[var(--muted)]">
                  {row.breezyCoverage}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    tone={
                      row.difference === "Replaced" || row.difference === "Consolidated"
                        ? "positive"
                        : row.difference === "Partially covered"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {row.difference}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
