import benchmarkData from "@/data/benchmark.json";
import plansData from "@/data/plans.json";
import type {
  BenchmarkCategory,
  BenchmarkDataFile,
  ServicePlan,
  PlansDataFile
} from "@/types/calculator";

export const benchmarkCategories = (
  benchmarkData as BenchmarkDataFile
).benchmarkCategories as BenchmarkCategory[];

export const servicePlans = (plansData as PlansDataFile)
  .plans as ServicePlan[];

export function getBenchmarkCategory(key: BenchmarkCategory["key"]) {
  return benchmarkCategories.find((category) => category.key === key);
}

export function getServicePlan(key: ServicePlan["key"]) {
  return servicePlans.find((plan) => plan.key === key);
}
