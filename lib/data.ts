import benchmarkData from "@/data/benchmark.json";
import plansData from "@/data/plans.json";
import type {
  BenchmarkCategory,
  BenchmarkDataFile,
  BreezyPlan,
  PlansDataFile
} from "@/types/calculator";

export const benchmarkCategories = (
  benchmarkData as BenchmarkDataFile
).benchmarkCategories as BenchmarkCategory[];

export const breezyPlans = (plansData as PlansDataFile)
  .breezyPlans as BreezyPlan[];

export function getBenchmarkCategory(key: BenchmarkCategory["key"]) {
  return benchmarkCategories.find((category) => category.key === key);
}

export function getBreezyPlan(key: BreezyPlan["key"]) {
  return breezyPlans.find((plan) => plan.key === key);
}
