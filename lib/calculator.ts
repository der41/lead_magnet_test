import { benchmarkCategories, breezyPlans, getBenchmarkCategory } from "@/lib/data";
import { buildPlanFitNarrative } from "@/lib/content";
import type {
  BreezyPlan,
  CategoryCosts,
  CategoryKey,
  CategorySelections,
  ComparisonRow,
  ComplexityResult,
  CoverageStatus,
  EstimateBreakdownItem,
  EstimateResult,
  LevelKey,
  LeadReportPayload,
  PlanKey,
  PlanRecommendation
} from "@/types/calculator";
import { formatCurrencyPerMonth } from "@/lib/utils";

const levelWeights: Record<LevelKey, number> = {
  none: 0,
  low: 1,
  mid: 2,
  high: 3
};

const categoryCoverage: Record<
  PlanKey,
  Record<
    CategoryKey,
    {
      status: CoverageStatus;
      coverage: string;
    }
  >
> = {
  professional: {
    answering: {
      status: "Partially covered",
      coverage: "Phone, SMS, and lead intake cover core inbound response flows."
    },
    scheduling: {
      status: "Replaced",
      coverage: "Scheduling is included in the plan."
    },
    messaging: {
      status: "Partially covered",
      coverage: "SMS covers customer follow-up, but advanced inbox tools may still need review."
    },
    crm_ops: {
      status: "Partially covered",
      coverage: "Basic CRM replaces light customer tracking and follow-up."
    },
    website: {
      status: "Review manually",
      coverage: "Website tooling is not a direct one-for-one replacement in this plan."
    }
  },
  growth: {
    answering: {
      status: "Consolidated",
      coverage: "Phone, SMS, and web chat bring inbound lead handling into one workspace."
    },
    scheduling: {
      status: "Replaced",
      coverage: "Scheduling is included in the plan."
    },
    messaging: {
      status: "Replaced",
      coverage: "SMS, web chat, and campaigns cover customer messaging workflows."
    },
    crm_ops: {
      status: "Consolidated",
      coverage: "Full CRM consolidates customer records, follow-up, and response workflows."
    },
    website: {
      status: "Partially covered",
      coverage: "Web chat supports lead capture on your site, but your website platform may remain separate."
    }
  },
  accelerate: {
    answering: {
      status: "Consolidated",
      coverage: "Phone, SMS, automations, and done-for-you support support a higher-touch front desk."
    },
    scheduling: {
      status: "Replaced",
      coverage: "Scheduling is included in the plan."
    },
    messaging: {
      status: "Consolidated",
      coverage: "Web chat, SMS, and lifecycle automation cover high-volume customer communication."
    },
    crm_ops: {
      status: "Replaced",
      coverage: "Full CRM and integrations replace a robust operations stack."
    },
    website: {
      status: "Partially covered",
      coverage: "Website presence still needs review, but chat and conversion tooling are included."
    }
  }
};

export function getBenchmarkValue(categoryKey: CategoryKey, level: LevelKey) {
  const category = getBenchmarkCategory(categoryKey);

  if (!category) {
    throw new Error(`Unknown benchmark category: ${categoryKey}`);
  }

  return category.levels[level];
}

export function buildBenchmarkBreakdown(
  selections: CategorySelections,
  overrides: Partial<CategoryCosts> = {}
): EstimateBreakdownItem[] {
  return benchmarkCategories.map((category) => {
    const benchmarkCost = getBenchmarkValue(category.key, selections[category.key]);
    const override = overrides[category.key];
    const activeCost = typeof override === "number" ? override : benchmarkCost;

    return {
      categoryKey: category.key,
      label: category.label,
      benchmarkCost,
      activeCost,
      level: selections[category.key]
    };
  });
}

export function calculateMonthlyTotal(costs: number[]) {
  return costs.reduce((total, cost) => total + cost, 0);
}

export function annualizeMonthlyTotal(monthly: number) {
  return monthly * 12;
}

export function buildEstimateResult(
  selections: CategorySelections,
  overrides: Partial<CategoryCosts> = {}
): EstimateResult {
  const breakdown = buildBenchmarkBreakdown(selections, overrides);
  const monthly = calculateMonthlyTotal(
    breakdown.map((item) => item.activeCost)
  );

  return {
    breakdown,
    totals: {
      monthly,
      annual: annualizeMonthlyTotal(monthly)
    },
    overridesApplied: Object.keys(overrides).length > 0
  };
}

export function scoreComplexity(selections: CategorySelections): ComplexityResult {
  const score = Object.values(selections).reduce(
    (total, level) => total + levelWeights[level],
    0
  );
  const toolCount = Object.values(selections).filter((level) => level !== "none")
    .length;

  const label: ComplexityResult["label"] =
    score >= 10 || toolCount >= 4 ? "High" : score >= 5 || toolCount >= 3 ? "Moderate" : "Low";

  const consolidationOpportunity: ComplexityResult["consolidationOpportunity"] =
    score >= 9 || toolCount >= 4
      ? "High"
      : score >= 4 || toolCount >= 2
        ? "Moderate"
        : "Low";

  return {
    score,
    toolCount,
    label,
    consolidationOpportunity
  };
}

export function recommendPlan(
  estimate: EstimateResult,
  complexity: ComplexityResult
): PlanRecommendation {
  let plan: BreezyPlan;

  if (estimate.overridesApplied) {
    if (estimate.totals.monthly >= 700) {
      plan = breezyPlans.find((item) => item.key === "accelerate")!;
    } else if (estimate.totals.monthly >= 180) {
      plan = breezyPlans.find((item) => item.key === "growth")!;
    } else {
      plan = breezyPlans.find((item) => item.key === "professional")!;
    }
  } else if (estimate.totals.monthly >= 700 || complexity.score >= 10) {
    plan = breezyPlans.find((item) => item.key === "accelerate")!;
  } else if (estimate.totals.monthly >= 180 || complexity.score >= 5) {
    plan = breezyPlans.find((item) => item.key === "growth")!;
  } else {
    plan = breezyPlans.find((item) => item.key === "professional")!;
  }

  const savingsMonthly = Math.max(estimate.totals.monthly - plan.priceMonthly, 0);
  const savingsAnnual = annualizeMonthlyTotal(savingsMonthly);

  const draftRecommendation: PlanRecommendation = {
    plan,
    reason: "",
    savingsMonthly,
    savingsAnnual
  };

  return {
    ...draftRecommendation,
    reason: buildPlanFitNarrative(draftRecommendation, Object.fromEntries(
      estimate.breakdown.map((item) => [item.categoryKey, item.level])
    ) as CategorySelections)
  };
}

export function buildComparisonRows(
  selections: CategorySelections,
  recommendation: PlanRecommendation
): ComparisonRow[] {
  return benchmarkCategories.map((category) => {
    const coverage = categoryCoverage[recommendation.plan.key][category.key];
    const currentLevel = selections[category.key];
    const currentDescription =
      currentLevel === "none"
        ? "No dedicated paid tool selected"
        : `${category.label} benchmark at ${formatCurrencyPerMonth(
            getBenchmarkValue(category.key, currentLevel)
          )}`;

    return {
      categoryKey: category.key,
      categoryLabel: category.label,
      estimatedCurrentSetup: currentDescription,
      breezyCoverage: coverage.coverage,
      difference: coverage.status
    };
  });
}

export function buildLeadPayload(args: {
  user: LeadReportPayload["user"];
  selections: CategorySelections;
  overrides: Partial<CategoryCosts>;
  estimate: EstimateResult;
  recommendation: PlanRecommendation;
  complexity: ComplexityResult;
}): LeadReportPayload {
  const { user, selections, overrides, estimate, recommendation, complexity } =
    args;

  return {
    user,
    selections,
    overrides,
    estimates: estimate,
    recommendation: {
      planKey: recommendation.plan.key,
      planLabel: recommendation.plan.label,
      priceMonthly: recommendation.plan.priceMonthly,
      reason: recommendation.reason
    },
    savings: {
      monthly: recommendation.savingsMonthly,
      annual: recommendation.savingsAnnual
    },
    metadata: {
      timestamp: new Date().toISOString(),
      toolCount: complexity.toolCount,
      complexityLabel: complexity.label,
      source: "front-desk-stack-cost-calculator"
    }
  };
}
