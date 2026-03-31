"use client";

import { Button, Card, Field, TextInput } from "@/components/ui";
import { introCards } from "@/lib/app-config";
import { formatCurrency, formatCurrencyPerMonth } from "@/lib/utils";
import type { CategoryKey, EstimateResult, PlanRecommendation } from "@/types/calculator";

export function SummaryStep({
  estimate,
  overrideDrafts,
  summaryNotice,
  recommendation,
  onUpdateOverrideDraft,
  onApplyOverrides,
  onContinue,
  onBack
}: {
  estimate: EstimateResult;
  overrideDrafts: Partial<Record<CategoryKey, string>>;
  summaryNotice: string;
  recommendation: PlanRecommendation;
  onUpdateOverrideDraft: (category: CategoryKey, value: string) => void;
  onApplyOverrides: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
            Here&apos;s your estimated current stack cost
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Based on your selections, here&apos;s what your current front-desk stack may be
            costing you each month.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] p-8 text-white shadow-[0_40px_80px_rgba(13,110,253,0.24)] md:col-span-2">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-100">
                  Estimated monthly total
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-[-0.05em] md:text-6xl">
                    {formatCurrency(estimate.totals.monthly)}
                  </span>
                  <span className="pb-2 text-lg text-blue-100">/mo</span>
                </div>
              </div>
              <div className="border-white/20 pt-4 md:border-l md:pl-6 md:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-blue-100">
                  Estimated annual total
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-bold tracking-[-0.04em] md:text-4xl">
                    {formatCurrency(estimate.totals.annual)}
                  </span>
                  <span className="pb-1 text-base text-blue-100">/yr</span>
                </div>
              </div>
            </div>
          </div>

          {estimate.breakdown.map((item) => {
            const introCard = introCards.find((card) => card.category === item.categoryKey);

            return (
              <div
                key={item.categoryKey}
                className={`rounded-[24px] bg-[var(--surface-soft)] p-6 ${
                  item.categoryKey === "website" ? "md:col-span-2" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xs font-black tracking-[0.16em] text-[var(--primary)]">
                      {introCard?.badge ?? item.label.slice(0, 2)}
                    </div>
                    <span className="text-base font-bold text-[var(--foreground)]">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                    {formatCurrency(item.activeCost)}
                    <span className="ml-1 text-sm font-medium text-[var(--muted)]">/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="space-y-6 bg-white p-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              Want a more accurate estimate?
            </h3>
            <p className="text-base leading-7 text-[var(--muted)]">
              You can edit any category below using your real monthly costs.
            </p>
          </div>

          <div className="space-y-4">
            {estimate.breakdown.map((item) => (
              <Field key={item.categoryKey} label={item.label}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--muted)]">
                    $
                  </span>
                  <TextInput
                    type="number"
                    className="pl-8 font-semibold"
                    inputMode="numeric"
                    min="0"
                    step="0.01"
                    value={overrideDrafts[item.categoryKey] ?? ""}
                    onChange={(event) =>
                      onUpdateOverrideDraft(item.categoryKey, event.target.value)
                    }
                    aria-label={`${item.label} monthly cost`}
                  />
                </div>
              </Field>
            ))}
          </div>

          {summaryNotice ? (
            <p
              className={`text-sm ${
                summaryNotice.startsWith("Please")
                  ? "text-rose-600"
                  : "text-[var(--success)]"
              }`}
            >
              {summaryNotice}
            </p>
          ) : null}

          <div className="space-y-3 pt-2">
            <Button className="w-full" onClick={onApplyOverrides}>
              Update my estimate
            </Button>
            <Button className="w-full" variant="secondary" onClick={onContinue}>
              Skip and continue
            </Button>
            <Button className="w-full" variant="ghost" onClick={onBack}>
              Back
            </Button>
          </div>
        </Card>

        <div className="flex items-start gap-4 rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            ↓
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">
              Potential Savings Detected
            </p>
            <p className="mt-2 text-sm leading-7 text-emerald-900/80">
              Aerwyn could save up to{" "}
              <strong>{formatCurrencyPerMonth(recommendation.savingsMonthly)}</strong> based on
              this estimate before any manual adjustments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
