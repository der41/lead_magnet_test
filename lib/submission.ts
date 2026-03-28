import type { LeadReportPayload, SubmissionResult } from "@/types/calculator";

export interface LeadSubmissionClient {
  submitLeadReport(payload: LeadReportPayload): Promise<SubmissionResult>;
}

export class MockLeadSubmissionClient implements LeadSubmissionClient {
  async submitLeadReport(payload: LeadReportPayload): Promise<SubmissionResult> {
    if (!payload.user.email || !payload.recommendation.planKey) {
      throw new Error("Payload is missing required lead data.");
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    return {
      success: true,
      message: "Your report is ready."
    };
  }
}

export const defaultLeadSubmissionClient = new MockLeadSubmissionClient();
