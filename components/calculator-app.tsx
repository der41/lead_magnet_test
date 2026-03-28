"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { OptionCard } from "@/components/option-card";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Field,
  SectionTitle,
  StatCard,
  TextInput
} from "@/components/ui";
import {
  buildComparisonRows,
  buildEstimateResult,
  buildLeadPayload,
  recommendPlan,
  scoreComplexity
} from "@/lib/calculator";
import { breezyPlans } from "@/lib/data";
import { categoryContent, categoryOrder, levelContent } from "@/lib/content";
import { defaultLeadSubmissionClient } from "@/lib/submission";
import { formatCurrency, formatCurrencyPerMonth, formatCurrencyPerYear } from "@/lib/utils";
import { validateLeadForm } from "@/lib/validation";
import type {
  CategoryCosts,
  CategoryKey,
  CategorySelections,
  LeadUserInfo,
  WizardStep
} from "@/types/calculator";
import type { LeadFormErrors } from "@/lib/validation";

const defaultSelections: CategorySelections = {
  answering: "none",
  scheduling: "none",
  messaging: "none",
  crm_ops: "none",
  website: "none"
};

const defaultLead: LeadUserInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: ""
};

const stepFlow: WizardStep[] = [
  "landing",
  "intro",
  ...categoryOrder,
  "summary",
  "teaser",
  "lead",
  "results"
];

const benchmarkBrands = ["ZENITH", "CLOUDHOST", "BOOKING.PRO", "FRONTFLOW", "GUESTLY"];
const teaserPricingRows = [
  {
    label: "Respond",
    values: {
      professional: "Phone + SMS",
      growth: "Phone + SMS + Web chat",
      accelerate: "All channels + automations",
      whiteGlove: "All channels"
    }
  },
  {
    label: "Engage",
    values: {
      professional: "Lead intake",
      growth: "Campaigns + responses",
      accelerate: "Lifecycle automation",
      whiteGlove: "Custom"
    }
  },
  {
    label: "Manage",
    values: {
      professional: "Basic CRM + scheduling",
      growth: "Full CRM + scheduling",
      accelerate: "CRM integrations + workflows",
      whiteGlove: "Full concierge"
    }
  },
  {
    label: "Team",
    values: {
      professional: "1 user",
      growth: "Up to 3 users",
      accelerate: "Up to 10 users",
      whiteGlove: "Unlimited"
    }
  },
  {
    label: "Support",
    values: {
      professional: "Standard",
      growth: "Priority",
      accelerate: "Done-for-you support",
      whiteGlove: "Custom"
    }
  }
] as const;
const levelBadges: Record<keyof typeof levelContent, string> = {
  none: "NO",
  low: "BA",
  mid: "ST",
  high: "AD"
};
const introCards: Array<{
  category: CategoryKey;
  badge: string;
  description: string;
  wide?: boolean;
}> = [
  {
    category: "answering",
    badge: "AR",
    description: "Live agents or automated phone systems."
  },
  {
    category: "scheduling",
    badge: "SC",
    description: "Booking tools and calendar management."
  },
  {
    category: "messaging",
    badge: "CM",
    description: "SMS, web chat, and client communication."
  },
  {
    category: "crm_ops",
    badge: "CO",
    description: "Client records and back-office tools."
  },
  {
    category: "website",
    badge: "WP",
    description: "Hosting, domains, and digital visibility platforms.",
    wide: true
  }
];

export function CalculatorApp() {
  const [step, setStep] = useState<WizardStep>("landing");
  const [selections, setSelections] = useState<CategorySelections>(defaultSelections);
  const [overrides, setOverrides] = useState<Partial<CategoryCosts>>({});
  const [overrideDrafts, setOverrideDrafts] = useState<Partial<Record<CategoryKey, string>>>({});
  const [lead, setLead] = useState<LeadUserInfo>(defaultLead);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submissionState, setSubmissionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [summaryNotice, setSummaryNotice] = useState("");

  const estimate = buildEstimateResult(selections, overrides);
  const complexity = scoreComplexity(selections);
  const recommendation = recommendPlan(estimate, complexity);
  const comparisonRows = buildComparisonRows(selections, recommendation);
  const recommendationShare =
    estimate.totals.monthly > 0
      ? Math.min(
          Math.max((recommendation.plan.priceMonthly / estimate.totals.monthly) * 100, 12),
          100
        )
      : 0;
  const recommendationSavingsPercent =
    estimate.totals.monthly > 0
      ? Math.max(
          0,
          Math.round(
            ((estimate.totals.monthly - recommendation.plan.priceMonthly) /
              estimate.totals.monthly) *
              100
          )
        )
      : 0;
  const bestFitFeatures = recommendation.plan.features.slice(0, 3);
  const serviceComparisonRows = estimate.breakdown.map((item) => {
    const comparison = comparisonRows.find((row) => row.categoryKey === item.categoryKey);

    return {
      categoryKey: item.categoryKey,
      label: item.label,
      currentCost: item.activeCost,
      coverage: comparison?.breezyCoverage ?? "Included in Breezy plan",
      differenceLabel:
        comparison?.difference === "Replaced" || comparison?.difference === "Consolidated"
          ? "Included"
          : comparison?.difference === "Partially covered"
            ? "Partially"
            : `Not in ${recommendation.plan.label}`,
      differenceTone:
        comparison?.difference === "Replaced" || comparison?.difference === "Consolidated"
          ? "positive"
          : comparison?.difference === "Partially covered"
            ? "neutral"
            : "muted"
    };
  });
  const zeroValueCategories = estimate.breakdown.filter((item) => item.activeCost === 0);
  const breezyAlsoIncludesText =
    zeroValueCategories.length > 0
      ? `You marked ${zeroValueCategories
          .map((item) => item.label.toLowerCase())
          .join(", ")} at $0 today. Breezy also includes ${
          zeroValueCategories.length === 1 ? "that workflow" : "those workflows"
        } inside ${recommendation.plan.label}, so this estimate may still understate the total operational value available in the plan.`
      : null;
  const teaserPlans = [
    ...breezyPlans.map((plan) => ({
      key: plan.key,
      typeLabel: plan.key === "accelerate" ? "Done For You" : "Self-Serve",
      label: plan.label,
      priceLabel: formatCurrency(plan.priceMonthly),
      priceSuffix: "/mo",
      ctaLabel: plan.key === "accelerate" ? "Learn More" : "Free Trial",
      footnote:
        plan.key === "accelerate" ? "" : "7-day free trial, cancel anytime",
      href:
        plan.key === "accelerate"
          ? "https://getbreezy.app/home/resources/done-for-you"
          : "https://getbreezy.app/fast_questions?pro_onboarding=true"
    })),
    {
      key: "whiteGlove" as const,
      typeLabel: "Done For You",
      label: "White Glove",
      priceLabel: "Custom",
      priceSuffix: "",
      ctaLabel: "Learn More",
      footnote: "",
      href: "https://getbreezy.app/home/resources/done-for-you"
    }
  ];

  useEffect(() => {
    if (step !== "summary") {
      return;
    }

    const nextDrafts: Partial<Record<CategoryKey, string>> = {};

    for (const item of estimate.breakdown) {
      nextDrafts[item.categoryKey] = String(item.activeCost);
    }

    setOverrideDrafts(nextDrafts);
  }, [step]);

  function goToNextStep() {
    const currentIndex = stepFlow.indexOf(step);
    const nextStep = stepFlow[currentIndex + 1];

    if (nextStep) {
      setStep(nextStep);
    }
  }

  function goToPreviousStep() {
    const currentIndex = stepFlow.indexOf(step);
    const previousStep = stepFlow[currentIndex - 1];

    if (previousStep) {
      setStep(previousStep);
    }
  }

  function selectCategoryLevel(category: CategoryKey, level: CategorySelections[CategoryKey]) {
    setSelections((current) => ({
      ...current,
      [category]: level
    }));
  }

  function updateOverrideDraft(category: CategoryKey, value: string) {
    setOverrideDrafts((current) => ({
      ...current,
      [category]: value
    }));
  }

  function applyOverrides() {
    const nextOverrides: Partial<CategoryCosts> = {};

    for (const category of categoryOrder) {
      const draft = overrideDrafts[category];

      if (draft === undefined || draft.trim() === "") {
        continue;
      }

      const parsed = Number(draft);

      if (Number.isNaN(parsed) || parsed < 0) {
        setSummaryNotice("Please enter numeric values greater than or equal to 0.");
        return;
      }

      nextOverrides[category] = parsed;
    }

    flushSync(() => {
      setOverrides(nextOverrides);
    });
    setSummaryNotice("Your estimate has been updated with the values shown below.");
    goToNextStep();
  }

  async function submitLeadForm() {
    const validation = validateLeadForm(lead);

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmissionState("loading");
    setSubmissionMessage("");

    try {
      const payload = buildLeadPayload({
        user: validation.data,
        selections,
        overrides,
        estimate,
        recommendation,
        complexity
      });

      const result = await defaultLeadSubmissionClient.submitLeadReport(payload);

      setSubmissionState(result.success ? "success" : "error");
      setSubmissionMessage(result.message);

      if (result.success) {
        setStep("results");
      }
    } catch (error) {
      setSubmissionState("error");
      setSubmissionMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  function resetCalculator() {
    setSelections(defaultSelections);
    setOverrides({});
    setOverrideDrafts({});
    setLead(defaultLead);
    setErrors({});
    setSubmissionState("idle");
    setSubmissionMessage("");
    setSummaryNotice("");
    setStep("landing");
  }

  const categoryIndex = categoryOrder.indexOf(step as CategoryKey);
  const currentCategory = categoryOrder[categoryIndex] as CategoryKey | undefined;

  return (
    <main className="min-h-screen">
      {step === "landing" ? (
        <>
          <header className="sticky top-0 z-50 bg-[color:rgba(248,249,255,0.85)] backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
              <div className="text-2xl font-black tracking-[-0.04em] text-[var(--foreground)]">
                Breezy
              </div>
              <div className="hidden items-center gap-8 md:flex">
                <a
                  href="#calculator-benefits"
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
                >
                  Back to Site
                </a>
                <Button className="min-h-10 px-6 py-2" onClick={goToNextStep}>
                  Get Started
                </Button>
              </div>
            </nav>
          </header>

          <section className="relative overflow-hidden px-6 pb-24 pt-20 md:px-8 md:pb-32">
            <div className="absolute right-0 top-0 h-[38rem] w-[38rem] translate-x-1/4 -translate-y-1/3 rounded-full bg-[color:rgba(211,228,254,0.66)] blur-3xl" />
            <div className="absolute bottom-0 left-0 h-[26rem] w-[26rem] -translate-x-1/4 translate-y-1/4 rounded-full bg-[color:rgba(177,197,255,0.2)] blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl">
              <div className="mx-auto max-w-4xl text-center">
                <Eyebrow>COST OPTIMIZATION</Eyebrow>
                <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-0.05em] text-[var(--foreground)] md:text-6xl lg:text-7xl">
                  See how much your current front-desk setup may be costing you
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
                  Answer a few quick questions about the tools and services you use
                  today. We&apos;ll estimate your monthly spend, compare it to Breezy,
                  and show where you may be overpaying or overlapping.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <Button
                    className="w-full max-w-sm rounded-[18px] px-10 py-5 text-base font-bold shadow-[0_28px_80px_rgba(13,110,253,0.22)] sm:w-auto"
                    onClick={goToNextStep}
                  >
                    Start estimate →
                  </Button>
                  <p className="text-sm italic text-[var(--muted)]">
                    No spreadsheets. No prep work. Just a quick estimate.
                  </p>
                </div>

                <div className="mx-auto mt-12 grid w-fit gap-4 text-left">
                  {[
                    "Takes less than 2 minutes",
                    "Based on public pricing benchmarks",
                    "Option to adjust with your real numbers"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="rounded-full bg-emerald-100 p-1.5 text-[var(--success)]">
                        <span className="block text-sm leading-none">✓</span>
                      </div>
                      <span className="font-medium text-[var(--muted)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="calculator-benefits"
            className="bg-[var(--surface-soft)] px-6 py-20 md:px-8 md:py-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">
                  We benchmark against the tools you use
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                  Our engine analyzes the most common software in the hospitality
                  and service industries.
                </p>
              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-black italic tracking-[-0.04em] text-[color:rgba(84,95,115,0.55)] grayscale transition-all hover:grayscale-0 md:gap-x-14 md:text-xl">
                {benchmarkBrands.map((brand) => (
                  <span key={brand}>{brand}</span>
                ))}
              </div>
            </div>
          </section>

          <footer className="bg-[var(--background)] px-6 py-10 md:px-8 md:py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
              <div className="text-center md:text-left">
                <div className="text-lg font-bold text-[var(--foreground)]">Breezy</div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  © 2026 Breezy. All rights reserved.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]">
                <a href="#" className="transition-colors hover:text-[var(--primary)]">
                  Privacy
                </a>
                <a href="#" className="transition-colors hover:text-[var(--primary)]">
                  Terms
                </a>
                <a href="#" className="transition-colors hover:text-[var(--primary)]">
                  Breezy Home
                </a>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <div className="px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex items-center justify-between gap-4 px-1">
              <div className="space-y-2">
                <Eyebrow>Breezy lead magnet</Eyebrow>
                <p className="text-sm text-[var(--muted)]">
                  Front Desk Stack Cost Calculator
                </p>
              </div>
              <Button variant="ghost" onClick={resetCalculator}>
                Restart
              </Button>
            </header>

            {step === "intro" ? (
              <Card className="space-y-10 p-8 md:p-10 lg:p-12">
                <div className="flex items-center justify-between gap-6">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                    <div className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)]" />
                  </div>
                  <span className="shrink-0 text-xs font-bold uppercase tracking-[0.26em] text-[var(--primary)] md:text-sm">
                    Step 1 of 5
                  </span>
                </div>

                <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
                      First, let&apos;s estimate what you&apos;re currently paying for
                    </h2>
                    <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
                      We&apos;ll walk through five parts of your front-desk stack and
                      estimate your current monthly spend based on the level of
                      service you use.
                    </p>
                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                      <Button
                        className="rounded-[18px] px-8 py-4 text-base font-bold"
                        onClick={goToNextStep}
                      >
                        Continue →
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-[18px] px-8 py-4 text-base"
                        onClick={goToPreviousStep}
                      >
                        Back
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {introCards.map((item) => (
                        <div
                          key={item.category}
                          className={`rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(11,28,48,0.06)] transition-transform hover:-translate-y-1 ${
                            item.wide ? "sm:col-span-2" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-sm font-black tracking-[0.14em] text-[var(--primary)]">
                              {item.badge}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[var(--foreground)]">
                                {categoryContent[item.category].title}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-4 rounded-[24px] bg-[var(--surface-soft)] p-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[var(--success)]">
                        i
                      </div>
                      <p className="text-sm italic leading-7 text-[var(--muted)]">
                        Don&apos;t worry if you&apos;re not sure about the exact
                        amounts. We&apos;ll use industry averages to help you estimate.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {currentCategory ? (
              <Card className="space-y-8 p-8 md:p-10">
                <div className="space-y-6 text-center md:text-left">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--primary)]">
                      {`Question ${categoryIndex + 1} of ${categoryOrder.length}`}
                    </span>
                    <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
                      {categoryContent[currentCategory].question}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-[var(--muted)] md:mx-0">
                      {categoryContent[currentCategory].helper}
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] transition-all duration-700"
                      style={{
                        width: `${((categoryIndex + 1) / categoryOrder.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(Object.keys(levelContent) as Array<keyof typeof levelContent>).map((level) => (
                    <OptionCard
                      key={level}
                      title={levelContent[level].label}
                      description={levelContent[level].helperByCategory[currentCategory]}
                      badge={levelBadges[level]}
                      selected={selections[currentCategory] === level}
                      onClick={() => selectCategoryLevel(currentCategory, level)}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" className="order-2 sm:order-1" onClick={goToPreviousStep}>
                    ← Back
                  </Button>
                  <Button className="order-1 sm:order-2" onClick={goToNextStep}>
                    {currentCategory === "website" ? "See my estimate" : "Continue"}
                  </Button>
                </div>
              </Card>
            ) : null}

            {step === "summary" ? (
              <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
                      Here&apos;s your estimated current stack cost
                    </h2>
                    <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
                      Based on your selections, here&apos;s what your current
                      front-desk stack may be costing you each month.
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
                      const introCard = introCards.find(
                        (card) => card.category === item.categoryKey
                      );

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
                              <span className="ml-1 text-sm font-medium text-[var(--muted)]">
                                /mo
                              </span>
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
                        You can edit any category below using your real monthly
                        costs.
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
                                updateOverrideDraft(item.categoryKey, event.target.value)
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
                      <Button className="w-full" onClick={applyOverrides}>
                        Update my estimate
                      </Button>
                      <Button className="w-full" variant="secondary" onClick={goToNextStep}>
                        Skip and continue
                      </Button>
                      <Button className="w-full" variant="ghost" onClick={goToPreviousStep}>
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
                        Breezy could save up to{" "}
                        <strong>{formatCurrencyPerMonth(recommendation.savingsMonthly)}</strong>
                        {" "}based on this estimate before any manual adjustments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === "teaser" ? (
          <div className="space-y-6">
            <Card className="space-y-8 bg-slate-950 p-8 text-white md:p-10">
                <SectionTitle
                  title="Your business may be paying for more overlap than you think"
                  subtitle="We’ve estimated your current stack cost and matched it against the Breezy plan that appears to fit best."
                  invert
                />
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Current stack estimate"
                  value={formatCurrencyPerMonth(estimate.totals.monthly)}
                  detail={formatCurrencyPerYear(estimate.totals.annual)}
                />
                <StatCard
                  label="Recommended Breezy plan"
                  value={recommendation.plan.label}
                  detail={`${formatCurrencyPerMonth(
                    recommendation.plan.priceMonthly
                  )} based on your selections`}
                  accent
                />
                <StatCard
                  label="Potential monthly savings"
                  value={`Up to ${formatCurrencyPerMonth(
                    recommendation.savingsMonthly
                  )}`}
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
                    <li>A recommended Breezy plan</li>
                    <li>Estimated savings</li>
                    <li></li>
                    <li>Features included in Breezy that you may not be paying for today</li>
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
                    <Button onClick={goToNextStep}>Unlock my report</Button>
                    <Button variant="secondary" onClick={goToPreviousStep}>
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
                  Breezy&apos;s core front-desk coverage with no hidden fees.
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
                                      isRecommended ? "text-[var(--primary)]" : "text-[var(--foreground)]"
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
                                  isRecommended ? "bg-[color:rgba(0,87,205,0.05)] font-medium text-[var(--foreground)]" : "text-[var(--muted)]"
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
                                <p className="mt-2 text-[10px] text-slate-500">
                                  {plan.footnote}
                                </p>
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
            ) : null}

            {step === "lead" ? (
          <Card className="space-y-8 p-8 md:p-10">
            <SectionTitle
              title="Get your full comparison report"
              subtitle="We’ll use your details to personalize your report and share the results with you."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name" error={errors.firstName}>
                <TextInput
                  value={lead.firstName}
                  error={Boolean(errors.firstName)}
                  onChange={(event) =>
                    setLead((current) => ({
                      ...current,
                      firstName: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Last name" error={errors.lastName}>
                <TextInput
                  value={lead.lastName}
                  error={Boolean(errors.lastName)}
                  onChange={(event) =>
                    setLead((current) => ({
                      ...current,
                      lastName: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <TextInput
                  type="email"
                  value={lead.email}
                  error={Boolean(errors.email)}
                  onChange={(event) =>
                    setLead((current) => ({
                      ...current,
                      email: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <TextInput
                  type="tel"
                  value={lead.phone ?? ""}
                  error={Boolean(errors.phone)}
                  onChange={(event) =>
                    setLead((current) => ({
                      ...current,
                      phone: event.target.value
                    }))
                  }
                />
              </Field>
            </div>
            <p className="text-sm leading-7 text-[var(--muted)]">
              By continuing, you agree to receive your report and follow-up
              communication from Breezy.
            </p>
            {submissionMessage ? (
              <p
                className={`text-sm ${
                  submissionState === "error" ? "text-rose-600" : "text-[var(--success)]"
                }`}
              >
                {submissionMessage}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={submitLeadForm}
                disabled={submissionState === "loading"}
              >
                {submissionState === "loading" ? "Preparing your report..." : "View my report"}
              </Button>
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back
              </Button>
            </div>
          </Card>
            ) : null}

            {step === "results" ? (
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
                          <span>{`Breezy ${recommendation.plan.label}`}</span>
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
                      {`Why Breezy ${recommendation.plan.label} looks like the best fit`}
                    </h3>
                    <p className="text-sm leading-7 text-blue-100">
                      {recommendation.reason}
                    </p>
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
                <SectionTitle title={`You get with Breezy - ${recommendation.plan.label} Plan`} />
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
                          Breezy Coverage
                        </th>
                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                          
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceComparisonRows.map((row) => (
                        <tr
                          key={row.categoryKey}
                          className="border-t border-[color:rgba(194,198,216,0.12)] bg-white"
                        >
                          <td className="px-6 py-5 font-bold text-[var(--foreground)]">
                            {row.label}
                          </td>
                          <td className="px-6 py-5 text-[var(--muted)]">
                            {formatCurrency(row.currentCost)}/mo
                          </td>
                          <td className="px-6 py-5 text-sm leading-6 text-[var(--muted)]">
                            {row.coverage}
                          </td>
                          <td
                            className="px-6 py-5"
                          >
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

              {breezyAlsoIncludesText ? (
                <Card className="space-y-4 p-8 md:p-10">
                  <SectionTitle title="Breezy also includes:" />
                  <p className="text-base leading-8 text-[var(--muted)]">
                    {breezyAlsoIncludesText}
                  </p>
                </Card>
              ) : null}

              <Card className="space-y-6 p-8 md:p-10">
                <SectionTitle title="Your current Setup may be Faster:" />
                <p className="text-base leading-8 text-[var(--muted)]">
                  This cost estimate does not fully account for the time spent
                  switching between tools, manually following up with customers,
                  and managing separate systems across your front desk workflow.
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
                                    isRecommended ? "bg-[color:rgba(0,87,205,0.05)] font-semibold text-[var(--foreground)]" : ""
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
                                  <p className="mt-3 text-[10px] text-slate-500">
                                    {plan.footnote}
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

            </section>
          </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
}
