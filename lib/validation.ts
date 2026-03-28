import { z } from "zod";
import type { LeadUserInfo } from "@/types/calculator";

export const leadSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  phone: z.string().trim().optional()
});

export type LeadFormErrors = Partial<Record<keyof LeadUserInfo, string>>;

export function validateLeadForm(values: LeadUserInfo) {
  const result = leadSchema.safeParse(values);

  if (result.success) {
    return {
      success: true as const,
      data: result.data,
      errors: {} as LeadFormErrors
    };
  }

  const errors: LeadFormErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof LeadUserInfo;

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }

  return {
    success: false as const,
    data: null,
    errors
  };
}
