import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResultsStep } from "@/components/calculator/results-step";
import { SummaryStep } from "@/components/calculator/summary-step";
import { TeaserStep } from "@/components/calculator/teaser-step";
import type {
  ComplexityResult,
  EstimateResult,
  PlanRecommendation,
  ServicePlan
} from "@/types/calculator";
import type {
  ServiceComparisonRowViewModel,
  TeaserPlanViewModel
} from "@/components/calculator/use-calculator-flow";

const plan: ServicePlan = {
  key: "growth",
  label: "Growth",
  priceMonthly: 120,
  usersIncluded: 3,
  features: ["Phone", "SMS", "Web chat"]
};

const estimate: EstimateResult = {
  breakdown: [
    {
      categoryKey: "answering",
      label: "Answering / Reception",
      benchmarkCost: 250,
      activeCost: 250,
      level: "low"
    },
    {
      categoryKey: "scheduling",
      label: "Scheduling",
      benchmarkCost: 49,
      activeCost: 49,
      level: "mid"
    },
    {
      categoryKey: "messaging",
      label: "Customer Messaging",
      benchmarkCost: 29,
      activeCost: 29,
      level: "low"
    },
    {
      categoryKey: "crm_ops",
      label: "CRM / Operations",
      benchmarkCost: 89,
      activeCost: 89,
      level: "low"
    },
    {
      categoryKey: "website",
      label: "Website / Online Presence",
      benchmarkCost: 17,
      activeCost: 17,
      level: "low"
    }
  ],
  totals: {
    monthly: 434,
    annual: 5208
  },
  overridesApplied: false
};

const recommendation: PlanRecommendation = {
  plan,
  reason: "Growth is the best fit for this estimated stack.",
  savingsMonthly: 314,
  savingsAnnual: 3768
};

const complexity: ComplexityResult = {
  score: 6,
  toolCount: 5,
  label: "Moderate",
  consolidationOpportunity: "High"
};

const teaserPlans: TeaserPlanViewModel[] = [
  {
    key: "professional",
    typeLabel: "Self-Serve",
    label: "Professional",
    priceLabel: "$40",
    priceSuffix: "/mo",
    ctaLabel: "Free Trial",
    footnote: "7-day free trial, cancel anytime",
    href: "/thank-you?plan=professional"
  },
  {
    key: "growth",
    typeLabel: "Self-Serve",
    label: "Growth",
    priceLabel: "$120",
    priceSuffix: "/mo",
    ctaLabel: "Free Trial",
    footnote: "7-day free trial, cancel anytime",
    href: "/thank-you?plan=growth"
  },
  {
    key: "accelerate",
    typeLabel: "Done For You",
    label: "Accelerate",
    priceLabel: "$600",
    priceSuffix: "/mo",
    ctaLabel: "Learn More",
    footnote: "",
    href: "/thank-you?plan=accelerate"
  },
  {
    key: "whiteGlove",
    typeLabel: "Done For You",
    label: "White Glove",
    priceLabel: "Custom",
    priceSuffix: "",
    ctaLabel: "Learn More",
    footnote: "",
    href: "/thank-you?plan=whiteGlove"
  }
];

const serviceComparisonRows: ServiceComparisonRowViewModel[] = [
  {
    categoryKey: "answering",
    label: "Answering / Reception",
    currentCost: 250,
    coverage: "Phone, SMS, and web chat bring inbound lead handling into one workspace.",
    differenceLabel: "Included",
    differenceTone: "positive"
  },
  {
    categoryKey: "website",
    label: "Website / Online Presence",
    currentCost: 17,
    coverage: "Web chat supports lead capture on your site.",
    differenceLabel: "Partially",
    differenceTone: "neutral"
  }
];

describe("calculator step components", () => {
  it("renders SummaryStep totals and wires callbacks", () => {
    const onUpdateOverrideDraft = vi.fn();
    const onApplyOverrides = vi.fn();
    const onContinue = vi.fn();
    const onBack = vi.fn();

    render(
      <SummaryStep
        estimate={estimate}
        overrideDrafts={{ answering: "300" }}
        summaryNotice="Your estimate has been updated with the values shown below."
        recommendation={recommendation}
        onUpdateOverrideDraft={onUpdateOverrideDraft}
        onApplyOverrides={onApplyOverrides}
        onContinue={onContinue}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/estimated monthly total/i)).toBeInTheDocument();
    expect(screen.getByText("$434")).toBeInTheDocument();
    expect(screen.getByDisplayValue("300")).toBeInTheDocument();
    expect(screen.getByText(/aerwyn could save up to/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/answering \/ reception monthly cost/i), {
      target: { value: "325" }
    });
    fireEvent.click(screen.getByRole("button", { name: /update my estimate/i }));
    fireEvent.click(screen.getByRole("button", { name: /skip and continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));

    expect(onUpdateOverrideDraft).toHaveBeenCalledWith("answering", "325");
    expect(onApplyOverrides).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders TeaserStep recommendation content and CTA links", () => {
    const onUnlock = vi.fn();
    const onBack = vi.fn();

    render(
      <TeaserStep
        estimate={estimate}
        recommendation={recommendation}
        teaserPlans={teaserPlans}
        onUnlock={onUnlock}
        onBack={onBack}
      />
    );

    expect(
      screen.getByText(/your business may be paying for more overlap than you think/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/matched to your current setup/i)).toBeInTheDocument();
    const freeTrialLinks = screen.getAllByRole("link", { name: "Free Trial" });
    expect(freeTrialLinks[0]).toHaveAttribute("href", "/thank-you?plan=professional");
    expect(freeTrialLinks[1]).toHaveAttribute("href", "/thank-you?plan=growth");

    fireEvent.click(screen.getByRole("button", { name: /unlock my report/i }));
    fireEvent.click(screen.getByRole("button", { name: /^back$/i }));

    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders ResultsStep comparisons, reasoning, and plan includes copy", () => {
    render(
      <ResultsStep
        estimate={estimate}
        recommendation={recommendation}
        recommendationShare={28}
        recommendationSavingsPercent={72}
        bestFitFeatures={recommendation.plan.features}
        serviceComparisonRows={serviceComparisonRows}
        planIncludesText="Aerwyn also includes workflows you marked at $0."
        complexity={complexity}
        teaserPlans={teaserPlans}
      />
    );

    expect(screen.getByText(/your report is ready/i)).toBeInTheDocument();
    expect(screen.getByText(/growth is the best fit for this estimated stack\./i)).toBeInTheDocument();
    expect(screen.getByText(/aerwyn also includes workflows you marked at \$0\./i)).toBeInTheDocument();
    expect(screen.getByText(/total count: 5 multiple services in use/i)).toBeInTheDocument();
    expect(screen.getByText(/answering \/ reception/i)).toBeInTheDocument();
    expect(screen.getByText(/website \/ online presence/i)).toBeInTheDocument();
    expect(screen.getByText(/72% less/i)).toBeInTheDocument();
  });
});
