"use client";

import { useEffect, useState } from "react";
import { ComparisonTable } from "@/components/comparison-table";
import { OptionCard } from "@/components/option-card";
import { ProgressBar } from "@/components/progress-bar";
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
  buildIncludedValueText,
  buildLeadPayload,
  recommendPlan,
  scoreComplexity
} from "@/lib/calculator";
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
  const includedValueText = buildIncludedValueText(selections, recommendation);

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

      if (!Number.isNaN(parsed) && parsed >= 0) {
        nextOverrides[category] = parsed;
      }
    }

    setOverrides(nextOverrides);
    setSummaryNotice("Your estimate has been updated with the values shown below.");
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
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4 px-1">
          <div className="space-y-2">
            <Eyebrow>Breezy lead magnet</Eyebrow>
            <p className="text-sm text-[var(--muted)]">
              Front Desk Stack Cost Calculator
            </p>
          </div>
          {step !== "landing" ? (
            <Button variant="ghost" onClick={resetCalculator}>
              Restart
            </Button>
          ) : null}
        </header>

        {step === "landing" ? (
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="overflow-hidden bg-white/88 p-8 md:p-10">
              <div className="space-y-8">
                <Eyebrow>Benchmark-based estimate</Eyebrow>
                <SectionTitle
                  title="See how much your current front-desk setup may be costing you"
                  subtitle="Answer a few quick questions about the tools and services you use today. We’ll estimate your monthly spend, compare it to Breezy, and show where you may be overpaying or overlapping."
                />
                <div className="grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    Takes less than 2 minutes
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    Based on public pricing benchmarks
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-soft)] p-4">
                    Option to adjust with your real numbers
                  </div>
                </div>
                <div className="space-y-3">
                  <Button className="w-full sm:w-auto" onClick={goToNextStep}>
                    Start estimate
                  </Button>
                  <p className="text-sm text-[var(--muted)]">
                    No spreadsheets. No prep work. Just a quick estimate.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-950 text-white">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.18em] text-blue-200">
                  What you’ll unlock
                </p>
                <div className="space-y-4">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                    A premium, practical report in a few fast steps
                  </h2>
                  <p className="text-sm leading-7 text-slate-300">
                    Designed for solo service professionals who want a credible estimate,
                    not a bloated calculator.
                  </p>
                </div>
                <div className="space-y-3 rounded-[24px] bg-white/8 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Current stack estimate</span>
                    <span className="text-lg font-semibold">$0-$1.2k/mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Recommended Breezy plan</span>
                    <span className="text-lg font-semibold">Matched to complexity</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Report output</span>
                    <span className="text-lg font-semibold">Category comparison</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        {step === "intro" ? (
          <Card className="space-y-8 p-8 md:p-10">
            <SectionTitle
              title="First, let’s estimate what you’re currently paying for"
              subtitle="We’ll walk through five parts of your front-desk stack and estimate your current monthly spend based on the level of service you use."
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {categoryOrder.map((category) => (
                <div
                  key={category}
                  className="rounded-[22px] bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]"
                >
                  {categoryContent[category].title}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={goToNextStep}>Continue</Button>
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back
              </Button>
            </div>
          </Card>
        ) : null}

        {currentCategory ? (
          <Card className="space-y-8 p-8 md:p-10">
            <ProgressBar current={categoryIndex + 1} total={categoryOrder.length} />
            <SectionTitle
              title={categoryContent[currentCategory].title}
              subtitle={categoryContent[currentCategory].question}
            />
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
              {categoryContent[currentCategory].helper}
            </p>
            <div className="grid gap-4">
              {(Object.keys(levelContent) as Array<keyof typeof levelContent>).map((level) => (
                <OptionCard
                  key={level}
                  title={levelContent[level].label}
                  description={levelContent[level].helperByCategory[currentCategory]}
                  selected={selections[currentCategory] === level}
                  onClick={() => selectCategoryLevel(currentCategory, level)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={goToNextStep}>
                {currentCategory === "website" ? "See my estimate" : "Continue"}
              </Button>
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back
              </Button>
            </div>
          </Card>
        ) : null}

        {step === "summary" ? (
          <div className="space-y-6">
            <Card className="space-y-8 p-8 md:p-10">
              <SectionTitle
                title="Here’s your estimated current stack cost"
                subtitle="Based on your selections, here’s what your current front-desk stack may be costing you each month."
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {estimate.breakdown.map((item) => (
                  <StatCard
                    key={item.categoryKey}
                    label={item.label}
                    value={formatCurrencyPerMonth(item.activeCost)}
                  />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  label="Estimated monthly total"
                  value={formatCurrencyPerMonth(estimate.totals.monthly)}
                  detail="Based on your selections and any edits you make below."
                  accent
                />
                <StatCard
                  label="Estimated annual total"
                  value={formatCurrencyPerYear(estimate.totals.annual)}
                  detail="A simple annualized view of your current stack estimate."
                />
              </div>
            </Card>

            <Card className="space-y-6 p-8 md:p-10">
              <SectionTitle
                title="Want a more accurate estimate?"
                subtitle="You can edit any category below using your real monthly costs."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {estimate.breakdown.map((item) => (
                  <Field key={item.categoryKey} label={item.label}>
                    <TextInput
                      inputMode="numeric"
                      value={overrideDrafts[item.categoryKey] ?? ""}
                      onChange={(event) =>
                        updateOverrideDraft(item.categoryKey, event.target.value)
                      }
                      aria-label={`${item.label} monthly cost`}
                    />
                  </Field>
                ))}
              </div>
              {summaryNotice ? (
                <p className="text-sm text-[var(--success)]">{summaryNotice}</p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={applyOverrides}>Update my estimate</Button>
                <Button variant="secondary" onClick={goToNextStep}>
                  Skip and continue
                </Button>
                <Button variant="ghost" onClick={goToPreviousStep}>
                  Back
                </Button>
              </div>
            </Card>
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
                    <li>A category-by-category comparison</li>
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
              <Card className="space-y-6 p-8 md:p-10">
                <SectionTitle title="Current cost vs. Breezy" />
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Your estimated current spend"
                    value={formatCurrencyPerMonth(estimate.totals.monthly)}
                    detail={formatCurrencyPerYear(estimate.totals.annual)}
                  />
                  <StatCard
                    label="Recommended Breezy plan"
                    value={recommendation.plan.label}
                    detail={formatCurrencyPerMonth(recommendation.plan.priceMonthly)}
                    accent
                  />
                  <StatCard
                    label="Potential savings"
                    value={formatCurrencyPerMonth(recommendation.savingsMonthly)}
                    detail={formatCurrencyPerYear(recommendation.savingsAnnual)}
                  />
                </div>
                <p className="text-sm leading-7 text-[var(--muted)]">
                  These estimates are based on public pricing benchmarks and the
                  inputs you provided. Actual costs vary by provider, usage, and
                  add-ons.
                </p>
              </Card>

              <Card className="space-y-4 p-8 md:p-10">
                <SectionTitle title="Why this plan looks like the best fit" />
                <p className="text-base leading-8 text-[var(--muted)]">
                  {recommendation.reason}
                </p>
              </Card>

              <Card className="space-y-4 p-8 md:p-10">
                <SectionTitle title="Category-by-category comparison" />
                <ComparisonTable rows={comparisonRows} />
              </Card>

              <Card className="space-y-4 p-8 md:p-10">
                <SectionTitle title="Included value you may not be accounting for" />
                <p className="text-base leading-8 text-[var(--muted)]">
                  {includedValueText}
                </p>
              </Card>

              <Card className="space-y-6 p-8 md:p-10">
                <SectionTitle title="Your current setup likely also creates extra admin work" />
                <p className="text-base leading-8 text-[var(--muted)]">
                  This cost estimate does not fully account for the time spent
                  switching between tools, manually following up with customers,
                  and managing separate systems across your front desk workflow.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge tone="neutral">{`Tool count: ${complexity.toolCount} categories in use`}</Badge>
                  <Badge tone="warning">{`Complexity: ${complexity.label}`}</Badge>
                  <Badge tone="positive">{`Consolidation opportunity: ${complexity.consolidationOpportunity}`}</Badge>
                </div>
              </Card>

              <Card className="space-y-5 p-8 md:p-10">
                <SectionTitle
                  title="Keep the estimate moving"
                  subtitle="You can run another scenario anytime to compare a lighter or more advanced setup."
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={resetCalculator}>Run another estimate</Button>
                  <Button variant="secondary" onClick={() => setStep("summary")}>
                    Adjust my estimate
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
