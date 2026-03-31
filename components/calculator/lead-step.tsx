"use client";

import { Button, Card, Field, SectionTitle, TextInput } from "@/components/ui";
import { brandConfig } from "@/lib/app-config";
import type { LeadFormErrors } from "@/lib/validation";
import type { LeadUserInfo } from "@/types/calculator";

export function LeadStep({
  lead,
  errors,
  submissionState,
  submissionMessage,
  onLeadChange,
  onSubmit,
  onBack
}: {
  lead: LeadUserInfo;
  errors: LeadFormErrors;
  submissionState: "idle" | "loading" | "success" | "error";
  submissionMessage: string;
  onLeadChange: (field: keyof LeadUserInfo, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="space-y-8 p-8 md:p-10">
      <SectionTitle
        title="Get your full comparison report"
        subtitle="We’ll use your details to personalize your report and share the results with you."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name" error={errors.firstName}>
          <TextInput
            value={lead.firstName}
            error={Boolean(errors.firstName)}
            onChange={(event) => onLeadChange("firstName", event.target.value)}
          />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <TextInput
            value={lead.lastName}
            error={Boolean(errors.lastName)}
            onChange={(event) => onLeadChange("lastName", event.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            value={lead.email}
            error={Boolean(errors.email)}
            onChange={(event) => onLeadChange("email", event.target.value)}
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <TextInput
            type="tel"
            value={lead.phone ?? ""}
            error={Boolean(errors.phone)}
            onChange={(event) => onLeadChange("phone", event.target.value)}
          />
        </Field>
      </div>
      <p className="text-sm leading-7 text-[var(--muted)]">
        By continuing, you agree to receive your report and follow-up communication from{" "}
        {brandConfig.name}.
      </p>
      {submissionMessage ? (
        <p
          className={`text-sm ${
            submissionState === "error" ? "text-rose-600" : "text-[var(--success)]"
          }`}
        >
          {submissionMessage}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onSubmit} disabled={submissionState === "loading"}>
          {submissionState === "loading" ? "Preparing your report..." : "View my report"}
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </Card>
  );
}
