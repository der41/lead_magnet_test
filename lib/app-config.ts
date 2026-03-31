import type { CategoryKey, CategorySelections, LeadUserInfo, WizardStep } from "@/types/calculator";
import { levelContent } from "@/lib/content";

export const brandConfig = {
  name: "Aerwyn",
  ctaBasePath: "/thank-you",
  benchmarkBrands: ["ZENITH", "CLOUDHOST", "BOOKING.PRO", "FRONTFLOW", "GUESTLY"]
} as const;

export const defaultSelections: CategorySelections = {
  answering: "none",
  scheduling: "none",
  messaging: "none",
  crm_ops: "none",
  website: "none"
};

export const defaultLead: LeadUserInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: ""
};

export const stepFlow: WizardStep[] = [
  "landing",
  "intro",
  "answering",
  "scheduling",
  "messaging",
  "crm_ops",
  "website",
  "summary",
  "teaser",
  "lead",
  "results"
];

export const teaserPricingRows = [
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

export const levelBadges: Record<keyof typeof levelContent, string> = {
  none: "NO",
  low: "BA",
  mid: "ST",
  high: "AD"
};

export const introCards: Array<{
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
