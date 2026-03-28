import { describe, expect, it } from "vitest";
import { validateLeadForm } from "@/lib/validation";

describe("lead form validation", () => {
  it("requires an email", () => {
    const result = validateLeadForm({
      firstName: "Alex",
      lastName: "Taylor",
      email: "",
      phone: ""
    });

    expect(result.success).toBe(false);
    expect(result.errors.email).toBe("Email is required.");
  });

  it("allows an empty phone number", () => {
    const result = validateLeadForm({
      firstName: "Alex",
      lastName: "Taylor",
      email: "alex@example.com",
      phone: ""
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = validateLeadForm({
      firstName: "Alex",
      lastName: "Taylor",
      email: "alex-at-example.com",
      phone: ""
    });

    expect(result.success).toBe(false);
    expect(result.errors.email).toBe("Enter a valid email address.");
  });
});
