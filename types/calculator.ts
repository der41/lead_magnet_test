export type CategoryKey =
  | "answering"
  | "scheduling"
  | "messaging"
  | "crm_ops"
  | "website";

export type LevelKey = "none" | "low" | "mid" | "high";

export type WizardStep =
  | "landing"
  | "intro"
  | "answering"
  | "scheduling"
  | "messaging"
  | "crm_ops"
  | "website"
  | "summary"
  | "teaser"
  | "lead"
  | "results";

export type PlanKey = "professional" | "growth" | "accelerate";

export interface BenchmarkCategory {
  key: CategoryKey;
  label: string;
  competitors: string[];
  levels: Record<LevelKey, number>;
  notes: string;
}

export interface BenchmarkDataFile {
  benchmarkCategories: BenchmarkCategory[];
}

export interface ServicePlan {
  key: PlanKey;
  label: string;
  priceMonthly: number;
  usersIncluded: number;
  features: string[];
}

export interface PlansDataFile {
  plans: ServicePlan[];
}

export interface CategorySelection {
  categoryKey: CategoryKey;
  level: LevelKey;
}

export type CategorySelections = Record<CategoryKey, LevelKey>;
export type CategoryCosts = Record<CategoryKey, number>;

export interface EstimateBreakdownItem {
  categoryKey: CategoryKey;
  label: string;
  benchmarkCost: number;
  activeCost: number;
  level: LevelKey;
}

export interface EstimateTotals {
  monthly: number;
  annual: number;
}

export interface EstimateResult {
  breakdown: EstimateBreakdownItem[];
  totals: EstimateTotals;
  overridesApplied: boolean;
}

export interface ComplexityResult {
  score: number;
  toolCount: number;
  label: "Low" | "Moderate" | "High";
  consolidationOpportunity: "Low" | "Moderate" | "High";
}

export interface PlanRecommendation {
  plan: ServicePlan;
  reason: string;
  savingsMonthly: number;
  savingsAnnual: number;
}

export type CoverageStatus =
  | "Replaced"
  | "Consolidated"
  | "Partially covered"
  | "Review manually";

export interface ComparisonRow {
  categoryKey: CategoryKey;
  categoryLabel: string;
  estimatedCurrentSetup: string;
  planCoverage: string;
  difference: CoverageStatus;
}

export interface LeadUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface LeadReportPayload {
  user: LeadUserInfo;
  selections: CategorySelections;
  overrides: Partial<CategoryCosts>;
  estimates: EstimateResult;
  recommendation: {
    planKey: PlanKey;
    planLabel: string;
    priceMonthly: number;
    reason: string;
  };
  savings: {
    monthly: number;
    annual: number;
  };
  metadata: {
    timestamp: string;
    toolCount: number;
    complexityLabel: ComplexityResult["label"];
    source: "front-desk-stack-cost-calculator";
  };
}

export interface SubmissionResult {
  success: boolean;
  message: string;
}
