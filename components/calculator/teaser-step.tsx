"use client";

import { Button, Card, SectionTitle, StatCard } from "@/components/ui";
import { brandConfig, teaserPricingRows } from "@/lib/app-config";
import { formatCurrencyPerMonth, formatCurrencyPerYear } from "@/lib/utils";
import type { EstimateResult, PlanRecommendation } from "@/types/calculator";
import type { TeaserPlanViewModel } from "@/components/calculator/use-calculator-flow";

export function TeaserStep({
  estimate,
  recommendation,
  teaserPlans,
  onUnlock,
  onBack
}: {
  estimate: EstimateResult;
  recommendation: PlanRecommendation;
  teaserPlans: TeaserPlanViewModel[];
  onUnlock: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-8 bg-slate-950 p-8 text-white md:p-10">
        <SectionTitle
          title="Your business may be paying for more overlap than you think"
          subtitle={`We’ve estimated your current stack cost and matched it against the ${brandConfig.name} plan that appears to fit best.`}
          invert
        />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Current stack estimate"
            value={formatCurrencyPerMonth(estimate.totals.monthly)}
            detail={formatCurrencyPerYear(estimate.totals.annual)}
          />
          <StatCard
            label={`Recommended ${brandConfig.name} plan`}
            value={recommendation.plan.label}
            detail={`${formatCurrencyPerMonth(
              recommendation.plan.priceMonthly
            )} based on your selections`}
            accent
          />
          <StatCard
            label="Potential monthly savings"
            value={`Up to ${formatCurrencyPerMonth(recommendation.savingsMonthly)}`}
            detail={formatCurrencyPerYear(recommendation.savingsAnnual)}
          />
        </div>
      </Card>

      <Card className="space-y-6 p-8 md:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">
              Your full report includes
            </h3>
            <ul className="space-y-3 text-sm leading-7 text-[var(--muted)]">
              <li>Your current monthly and annual spend</li>
              <li>A recommended {brandConfig.name} plan</li>
              <li>Estimated savings</li>
              <li>Features included in {brandConfig.name} that you may not be paying for today</li>
            </ul>
          </div>
          <div className="rounded-[28px] bg-[var(--surface-soft)] p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-[var(--primary)]">
              Unlock your report
            </p>
            <p className="mt-3 text-lg font-medium leading-8 text-[var(--foreground)]">
              Enter your information to unlock your full comparison report.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={onUnlock}>Unlock my report</Button>
              <Button variant="secondary" onClick={onBack}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-8 overflow-hidden p-0">
        <div className="px-8 pt-8 text-center md:px-10 md:pt-10">
          <h3 className="text-3xl font-black tracking-[-0.04em] text-[var(--foreground)]">
            Transparent Pricing Plans
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Choose the plan that fits your business stage. All plans include
            {brandConfig.name}&apos;s core front-desk coverage with no hidden fees.
          </p>
        </div>

        <div className="overflow-x-auto px-4 pb-4 md:px-8 md:pb-8">
          <div className="min-w-[980px] overflow-hidden rounded-[28px] border border-[color:rgba(194,198,216,0.3)] bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[color:rgba(239,244,255,0.6)] align-bottom">
                  <th className="w-[18%] p-8" />
                  {teaserPlans.map((plan) => {
                    const isRecommended = plan.key === recommendation.plan.key;

                    return (
                      <th
                        key={plan.key}
                        className={`relative w-[20.5%] border-l border-[color:rgba(194,198,216,0.2)] p-0 text-center ${
                          isRecommended ? "bg-[color:rgba(0,87,205,0.05)]" : ""
                        }`}
                      >
                        <a
                          href={plan.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block min-h-[12.5rem] px-8 pb-8 pt-10 transition hover:bg-[color:rgba(0,87,205,0.04)]"
                        >
                          {isRecommended ? (
                            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(0,87,205,0.18)]">
                              Recommended
                            </div>
                          ) : null}
                          <span
                            className={`block text-[10px] font-bold uppercase tracking-[0.22em] ${
                              isRecommended ? "text-[var(--primary)]" : "text-[var(--muted)]"
                            }`}
                          >
                            {plan.typeLabel}
                          </span>
                          <span className="mt-2 block text-xl font-black text-[var(--foreground)]">
                            {plan.label}
                          </span>
                          <div className="mt-3">
                            <span
                              className={`text-2xl font-black ${
                                isRecommended
                                  ? "text-[var(--primary)]"
                                  : "text-[var(--foreground)]"
                              }`}
                            >
                              {plan.priceLabel}
                            </span>
                            {plan.priceSuffix ? (
                              <span className="ml-1 text-sm font-medium text-[var(--muted)]">
                                {plan.priceSuffix}
                              </span>
                            ) : null}
                          </div>
                        </a>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="text-sm">
                {teaserPricingRows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-t border-[color:rgba(194,198,216,0.14)]"
                  >
                    <td className="p-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {row.label}
                    </td>
                    {teaserPlans.map((plan) => {
                      const isRecommended = plan.key === recommendation.plan.key;
                      const value = row.values[plan.key];

                      return (
                        <td
                          key={plan.key}
                          className={`border-l border-[color:rgba(194,198,216,0.14)] p-6 text-center ${
                            isRecommended
                              ? "bg-[color:rgba(0,87,205,0.05)] font-medium text-[var(--foreground)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="border-t border-[color:rgba(194,198,216,0.14)]">
                  <td className="p-8" />
                  {teaserPlans.map((plan) => {
                    const isRecommended = plan.key === recommendation.plan.key;

                    return (
                      <td
                        key={plan.key}
                        className={`border-l border-[color:rgba(194,198,216,0.14)] p-8 text-center ${
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
                          <p className="mt-2 text-[10px] text-slate-500">{plan.footnote}</p>
                        ) : null}
                        {plan.key === recommendation.plan.key ? (
                          <p className="mt-2 text-[10px] font-bold text-[var(--primary)]">
                            Matched to your current setup
                          </p>
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
    </div>
  );
}
