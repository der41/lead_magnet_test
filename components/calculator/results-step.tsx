"use client";

import { Badge, Card, Eyebrow, SectionTitle } from "@/components/ui";
import { brandConfig, teaserPricingRows } from "@/lib/app-config";
import { formatCurrency } from "@/lib/utils";
import type { ComplexityResult, EstimateResult, PlanRecommendation } from "@/types/calculator";
import type {
  ServiceComparisonRowViewModel,
  TeaserPlanViewModel
} from "@/components/calculator/use-calculator-flow";

export function ResultsStep({
  estimate,
  recommendation,
  recommendationShare,
  recommendationSavingsPercent,
  bestFitFeatures,
  serviceComparisonRows,
  planIncludesText,
  complexity,
  teaserPlans
}: {
  estimate: EstimateResult;
  recommendation: PlanRecommendation;
  recommendationShare: number;
  recommendationSavingsPercent: number;
  bestFitFeatures: string[];
  serviceComparisonRows: ServiceComparisonRowViewModel[];
  planIncludesText: string | null;
  complexity: ComplexityResult;
  teaserPlans: TeaserPlanViewModel[];
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-8 bg-slate-950 p-8 text-white md:p-10">
        <div className="space-y-4">
          <Eyebrow>Your report is ready</Eyebrow>
          <SectionTitle
            title={`Your front-desk stack is estimated at ${formatCurrency(
              estimate.totals.monthly
            )}/month`}
            subtitle={`Based on your selections, your current setup may be costing you about ${formatCurrency(
              estimate.totals.annual
            )} per year across separate tools and services.`}
            invert
          />
        </div>
      </Card>

      <section className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-12">
          <Card className="space-y-8 p-8 md:col-span-8 md:p-10">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                Monthly Spend Comparison
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                    <span>Current Setup</span>
                    <span>{formatCurrency(estimate.totals.monthly)}</span>
                  </div>
                  <div className="relative flex h-11 items-center overflow-hidden rounded-xl border border-[color:rgba(194,198,216,0.16)] bg-[var(--surface-soft)] px-4">
                    <div className="absolute inset-0 bg-[color:rgba(84,95,115,0.12)]" />
                    <span className="relative z-10 text-sm font-medium text-[var(--muted)]">
                      Market average tools
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                    <span>{`${brandConfig.name} ${recommendation.plan.label}`}</span>
                    <span>{formatCurrency(recommendation.plan.priceMonthly)}</span>
                  </div>
                  <div
                    className="flex h-11 items-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(13,110,253,0.2)]"
                    style={{ width: `${recommendationShare}%` }}
                  >
                    {`${recommendationSavingsPercent}% Less`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-[24px] bg-white p-6 shadow-[0_32px_60px_-20px_rgba(11,28,48,0.08)]">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
                ↓
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Potential Savings
                </div>
                <div className="mt-2 text-3xl font-black tracking-[-0.04em] text-emerald-700">
                  {formatCurrency(recommendation.savingsMonthly)}
                  <span className="ml-2 text-lg font-medium text-[var(--muted)]">
                    / month
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-6 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] p-8 text-white md:col-span-4 md:p-10">
            <div className="space-y-4">
              <div className="text-4xl">✓</div>
              <h3 className="text-2xl font-bold leading-snug tracking-[-0.03em]">
                {`Why ${brandConfig.name} ${recommendation.plan.label} looks like the best fit`}
              </h3>
              <p className="text-sm leading-7 text-blue-100">{recommendation.reason}</p>
            </div>
            <ul className="space-y-3">
              {bestFitFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-emerald-200">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="space-y-4 p-8 md:p-10">
          <SectionTitle title={`You get with ${brandConfig.name} - ${recommendation.plan.label} Plan`} />
          <div className="overflow-hidden rounded-[24px] bg-[var(--surface-soft)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[color:rgba(220,233,255,0.55)]">
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Service
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Current cost
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {brandConfig.name} Coverage
                  </th>
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]" />
                </tr>
              </thead>
              <tbody>
                {serviceComparisonRows.map((row) => (
                  <tr
                    key={row.categoryKey}
                    className="border-t border-[color:rgba(194,198,216,0.12)] bg-white"
                  >
                    <td className="px-6 py-5 font-bold text-[var(--foreground)]">{row.label}</td>
                    <td className="px-6 py-5 text-[var(--muted)]">
                      {formatCurrency(row.currentCost)}/mo
                    </td>
                    <td className="px-6 py-5 text-sm leading-6 text-[var(--muted)]">
                      {row.coverage}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 font-bold">
                        {row.differenceTone === "positive" ? (
                          <>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              ✓
                            </span>
                            <span className="text-emerald-700">{row.differenceLabel}</span>
                          </>
                        ) : (
                          <>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                              i
                            </span>
                            <span className="text-[var(--foreground)]">{row.differenceLabel}</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {planIncludesText ? (
          <Card className="space-y-4 p-8 md:p-10">
            <SectionTitle title={`${brandConfig.name} also includes:`} />
            <p className="text-base leading-8 text-[var(--muted)]">{planIncludesText}</p>
          </Card>
        ) : null}

        <Card className="space-y-6 p-8 md:p-10">
          <SectionTitle title="Your current Setup may be Faster:" />
          <p className="text-base leading-8 text-[var(--muted)]">
            This cost estimate does not fully account for the time spent switching between
            tools, manually following up with customers, and managing separate systems
            across your front desk workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge tone="neutral">{`Total count: ${complexity.toolCount} multiple services in use`}</Badge>
            <Badge tone="positive">Consolidation opportunity available</Badge>
          </div>
        </Card>

        <Card className="space-y-8 overflow-hidden p-0">
          <div className="px-8 pt-8 text-center md:px-10 md:pt-10">
            <h3 className="text-4xl font-black tracking-[-0.04em] text-[var(--foreground)]">
              Ready to get started?
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Choose the plan that fits your business needs perfectly.
            </p>
          </div>

          <div className="overflow-x-auto px-4 pb-4 md:px-8 md:pb-8">
            <div className="min-w-[980px] overflow-hidden rounded-[28px] border border-[color:rgba(194,198,216,0.3)] bg-white">
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="border-b border-[color:rgba(194,198,216,0.14)]">
                    <th className="w-[18%] px-6 py-12 text-left" />
                    {teaserPlans.map((plan) => {
                      const isRecommended = plan.key === recommendation.plan.key;

                      return (
                        <th
                          key={plan.key}
                          className={`relative w-[20.5%] px-6 py-12 ${
                            isRecommended ? "bg-[color:rgba(0,87,205,0.05)]" : ""
                          }`}
                        >
                          {isRecommended ? (
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg bg-[var(--primary)] px-4 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                              Recommended
                            </div>
                          ) : null}
                          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                            {plan.typeLabel}
                          </div>
                          <div className="mt-2 text-2xl font-black text-[var(--foreground)]">
                            {plan.label}
                          </div>
                          <div className="mt-2">
                            <span className="text-3xl font-black text-[var(--primary)]">
                              {plan.priceLabel}
                            </span>
                            {plan.priceSuffix ? (
                              <span className="text-sm font-medium text-[var(--muted)]">
                                {plan.priceSuffix}
                              </span>
                            ) : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="text-sm text-[var(--muted)]">
                  {teaserPricingRows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-[color:rgba(194,198,216,0.1)]"
                    >
                      <td className="px-8 py-6 text-left font-bold text-[var(--foreground)]">
                        {row.label}
                      </td>
                      {teaserPlans.map((plan) => {
                        const isRecommended = plan.key === recommendation.plan.key;

                        return (
                          <td
                            key={plan.key}
                            className={`px-6 py-6 ${
                              isRecommended
                                ? "bg-[color:rgba(0,87,205,0.05)] font-semibold text-[var(--foreground)]"
                                : ""
                            }`}
                          >
                            {row.values[plan.key]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="px-8 py-10" />
                    {teaserPlans.map((plan) => {
                      const isRecommended = plan.key === recommendation.plan.key;

                      return (
                        <td
                          key={plan.key}
                          className={`px-6 py-10 ${
                            isRecommended ? "bg-[color:rgba(0,87,205,0.05)]" : ""
                          }`}
                        >
                          <a
                            href={plan.href}
                            target="_blank"
                            rel="noreferrer"
                            className={`block w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
                              isRecommended
                                ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white shadow-[0_20px_40px_rgba(13,110,253,0.2)]"
                                : "bg-slate-900 text-white hover:bg-black"
                            }`}
                          >
                            {plan.ctaLabel}
                          </a>
                          {plan.footnote ? (
                            <p className="mt-3 text-[10px] text-slate-500">{plan.footnote}</p>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
