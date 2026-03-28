import { describe, expect, it } from "vitest";
import {
  annualizeMonthlyTotal,
  buildComparisonRows,
  buildEstimateResult,
  buildLeadPayload,
  calculateMonthlyTotal,
  getBenchmarkValue,
  recommendPlan,
  scoreComplexity
} from "@/lib/calculator";
import type { CategorySelections } from "@/types/calculator";

const moderateSelections: CategorySelections = {
  answering: "low",
  scheduling: "mid",
  messaging: "low",
  crm_ops: "low",
  website: "low"
};

describe("calculator utilities", () => {
  it("looks up benchmark values by category and level", () => {
    expect(getBenchmarkValue("answering", "mid")).toBe(500);
    expect(getBenchmarkValue("website", "low")).toBe(17);
  });

  it("calculates monthly and annual totals", () => {
    expect(calculateMonthlyTotal([250, 12, 29])).toBe(291);
    expect(annualizeMonthlyTotal(291)).toBe(3492);
  });

  it("scores complexity using count and intensity", () => {
    const complexity = scoreComplexity(moderateSelections);

    expect(complexity.score).toBe(6);
    expect(complexity.toolCount).toBe(5);
    expect(complexity.label).toBe("High");
  });

  it("recommends the expected plan and savings", () => {
    const estimate = buildEstimateResult(moderateSelections);
    const recommendation = recommendPlan(estimate, scoreComplexity(moderateSelections));

    expect(recommendation.plan.key).toBe("growth");
    expect(recommendation.savingsMonthly).toBe(293);
  });

  it("builds comparison rows for each category", () => {
    const estimate = buildEstimateResult(moderateSelections);
    const recommendation = recommendPlan(estimate, scoreComplexity(moderateSelections));
    const rows = buildComparisonRows(moderateSelections, recommendation);

    expect(rows).toHaveLength(5);
    expect(rows[0].difference).toBeTruthy();
  });

  it("builds an extensible lead payload", () => {
    const estimate = buildEstimateResult(moderateSelections, { website: 99 });
    const complexity = scoreComplexity(moderateSelections);
    const recommendation = recommendPlan(estimate, complexity);

    const payload = buildLeadPayload({
      user: {
        firstName: "Alex",
        lastName: "Taylor",
        email: "alex@example.com",
        phone: ""
      },
      selections: moderateSelections,
      overrides: { website: 99 },
      estimate,
      recommendation,
      complexity
    });

    expect(payload.user.email).toBe("alex@example.com");
    expect(payload.overrides.website).toBe(99);
    expect(payload.recommendation.planKey).toBe("growth");
  });
});
