"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import {
  buildComparisonRows,
  buildEstimateResult,
  buildLeadPayload,
  recommendPlan,
  scoreComplexity
} from "@/lib/calculator";
import { brandConfig, defaultLead, defaultSelections, stepFlow } from "@/lib/app-config";
import { categoryOrder } from "@/lib/content";
import { servicePlans } from "@/lib/data";
import { defaultLeadSubmissionClient } from "@/lib/submission";
import { formatCurrency } from "@/lib/utils";
import { validateLeadForm } from "@/lib/validation";
import type { LeadFormErrors } from "@/lib/validation";
import type {
  CategoryCosts,
  CategoryKey,
  CategorySelections,
  LeadUserInfo,
  PlanKey,
  WizardStep
} from "@/types/calculator";

export interface ServiceComparisonRowViewModel {
  categoryKey: CategoryKey;
  label: string;
  currentCost: number;
  coverage: string;
  differenceLabel: string;
  differenceTone: "positive" | "neutral" | "muted";
}

export interface TeaserPlanViewModel {
  key: PlanKey | "whiteGlove";
  typeLabel: string;
  label: string;
  priceLabel: string;
  priceSuffix: string;
  ctaLabel: string;
  footnote: string;
  href: string;
}

function buildPlanCtaHref(planKey: TeaserPlanViewModel["key"]) {
  return `${brandConfig.ctaBasePath}?plan=${planKey}`;
}

export function useCalculatorFlow() {
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
  const categoryIndex = categoryOrder.indexOf(step as CategoryKey);
  const currentCategory = categoryOrder[categoryIndex] as CategoryKey | undefined;
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
  const serviceComparisonRows: ServiceComparisonRowViewModel[] = estimate.breakdown.map((item) => {
    const comparison = comparisonRows.find((row) => row.categoryKey === item.categoryKey);

    return {
      categoryKey: item.categoryKey,
      label: item.label,
      currentCost: item.activeCost,
      coverage: comparison?.planCoverage ?? `Included in ${brandConfig.name} plan`,
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
  const planIncludesText =
    zeroValueCategories.length > 0
      ? `You marked ${zeroValueCategories
          .map((item) => item.label.toLowerCase())
          .join(", ")} at $0 today. ${brandConfig.name} also includes ${
          zeroValueCategories.length === 1 ? "that workflow" : "those workflows"
        } inside ${recommendation.plan.label}, so this estimate may still understate the total operational value available in the plan.`
      : null;
  const teaserPlans: TeaserPlanViewModel[] = [
    ...servicePlans.map((plan) => ({
      key: plan.key,
      typeLabel: plan.key === "accelerate" ? "Done For You" : "Self-Serve",
      label: plan.label,
      priceLabel: formatCurrency(plan.priceMonthly),
      priceSuffix: "/mo",
      ctaLabel: plan.key === "accelerate" ? "Learn More" : "Free Trial",
      footnote:
        plan.key === "accelerate" ? "" : "7-day free trial, cancel anytime",
      href: buildPlanCtaHref(plan.key)
    })),
    {
      key: "whiteGlove",
      typeLabel: "Done For You",
      label: "White Glove",
      priceLabel: "Custom",
      priceSuffix: "",
      ctaLabel: "Learn More",
      footnote: "",
      href: buildPlanCtaHref("whiteGlove")
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

  return {
    step,
    selections,
    lead,
    errors,
    submissionState,
    submissionMessage,
    summaryNotice,
    estimate,
    complexity,
    recommendation,
    currentCategory,
    categoryIndex,
    comparisonRows,
    recommendationShare,
    recommendationSavingsPercent,
    bestFitFeatures,
    serviceComparisonRows,
    planIncludesText,
    teaserPlans,
    overrideDrafts,
    setLead,
    goToNextStep,
    goToPreviousStep,
    selectCategoryLevel,
    updateOverrideDraft,
    applyOverrides,
    submitLeadForm,
    resetCalculator
  };
}
