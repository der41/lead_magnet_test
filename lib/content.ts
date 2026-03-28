import type { CategoryKey, CategorySelections, LevelKey, PlanRecommendation } from "@/types/calculator";

export const categoryOrder: CategoryKey[] = [
  "answering",
  "scheduling",
  "messaging",
  "crm_ops",
  "website"
];

export const categoryContent: Record<
  CategoryKey,
  {
    title: string;
    question: string;
    helper: string;
  }
> = {
  answering: {
    title: "Answering / Reception",
    question:
      "What best describes your current setup for answering calls or handling inbound leads?",
    helper:
      "We’ll use this to estimate what you may be spending on front-desk coverage today."
  },
  scheduling: {
    title: "Scheduling",
    question: "What best describes your current scheduling setup?",
    helper: "This helps us estimate your scheduling-related spend."
  },
  messaging: {
    title: "Customer Messaging",
    question: "What best describes your current customer messaging setup?",
    helper:
      "This includes things like web chat, messaging inboxes, and customer communication tools."
  },
  crm_ops: {
    title: "CRM / Operations",
    question: "What best describes your current CRM or operations setup?",
    helper:
      "This includes customer management, follow-up, workflow automation, and service operations tools."
  },
  website: {
    title: "Website / Online Presence",
    question:
      "What best describes your current website or online presence setup?",
    helper:
      "This helps estimate what you may be paying for your online presence today."
  }
};

export const levelContent: Record<
  LevelKey,
  { label: string; helperByCategory: Record<CategoryKey, string> }
> = {
  none: {
    label: "None",
    helperByCategory: {
      answering:
        "I do not use a dedicated answering service or receptionist tool",
      scheduling: "I schedule manually by phone, text, or email",
      messaging:
        "I do not use a dedicated messaging, chat, or inbox tool",
      crm_ops: "I do not use a dedicated CRM or operations platform",
      website:
        "I do not pay for a dedicated website or online presence tool"
    }
  },
  low: {
    label: "Basic",
    helperByCategory: {
      answering:
        "A lightweight setup for occasional missed calls or simple call coverage",
      scheduling:
        "A simple booking tool or lightweight scheduling setup",
      messaging:
        "A simple messaging or chat tool with limited features",
      crm_ops:
        "A lightweight tool for customer information or job tracking",
      website: "A simple website or lightweight online presence setup"
    }
  },
  mid: {
    label: "Standard",
    helperByCategory: {
      answering:
        "A typical paid answering or reception setup with regular usage",
      scheduling:
        "A regular paid scheduling workflow for appointments or job booking",
      messaging:
        "A regular paid messaging or chat workflow for customer communication",
      crm_ops: "A regular paid CRM or service operations setup",
      website: "A regular paid website platform for my business"
    }
  },
  high: {
    label: "Advanced",
    helperByCategory: {
      answering:
        "A higher-touch setup with more volume, more coverage, or more features",
      scheduling:
        "A more robust scheduling setup with reminders, automation, or team coordination",
      messaging:
        "A more advanced setup with automation, inbox management, or higher engagement volume",
      crm_ops:
        "A more robust setup with automation, pipelines, integrations, or team workflows",
      website:
        "A more complete setup with premium features, multiple tools, or extra add-ons"
    }
  }
};

export function buildPlanFitNarrative(
  recommendation: PlanRecommendation,
  selections: CategorySelections
) {
  const activeCategories = categoryOrder
    .filter((category) => selections[category] !== "none")
    .map((category) => categoryContent[category].title.toLowerCase());

  const categorySummary =
    activeCategories.length > 0
      ? activeCategories.slice(0, 3).join(", ")
      : "a lighter front-desk setup";

  return `${recommendation.plan.label} appears to be the strongest fit because it brings together ${categorySummary} in one plan, based on your selections and estimated operating complexity.`;
}
