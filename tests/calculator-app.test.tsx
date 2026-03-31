import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CalculatorApp } from "@/components/calculator-app";

const { submitLeadReport } = vi.hoisted(() => ({
  submitLeadReport: vi.fn()
}));

vi.mock("@/lib/submission", () => ({
  defaultLeadSubmissionClient: {
    submitLeadReport
  }
}));

async function progressToLeadStep() {
  fireEvent.click(screen.getByRole("button", { name: /start estimate/i }));
  fireEvent.click(screen.getByRole("button", { name: /continue →/i }));

  for (let index = 0; index < 5; index += 1) {
    fireEvent.click(screen.getByRole("button", { name: /basic/i }));
    fireEvent.click(
      screen.getByRole("button", {
        name: index === 4 ? /see my estimate/i : /^continue$/i
      })
    );
  }

  fireEvent.click(screen.getByRole("button", { name: /skip and continue/i }));
  fireEvent.click(screen.getByRole("button", { name: /unlock my report/i }));

  await screen.findByRole("heading", { name: /get your full comparison report/i });
}

describe("CalculatorApp", () => {
  beforeEach(() => {
    submitLeadReport.mockReset();
    submitLeadReport.mockResolvedValue({
      success: true,
      message: "Your report is ready."
    });
  });

  it("walks through the main wizard flow into the lead gate", async () => {
    render(<CalculatorApp />);

    expect(
      screen.getByRole("heading", {
        name: /see how much your current front-desk setup may be costing you/i
      })
    ).toBeInTheDocument();

    await progressToLeadStep();

    expect(
      screen.getByRole("heading", { name: /get your full comparison report/i })
    ).toBeInTheDocument();
  });

  it("shows override validation errors on the summary step", () => {
    render(<CalculatorApp />);

    fireEvent.click(screen.getByRole("button", { name: /start estimate/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    for (let index = 0; index < 5; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /basic/i }));
      fireEvent.click(
        screen.getByRole("button", {
          name: index === 4 ? /see my estimate/i : /^continue$/i
        })
      );
    }

    fireEvent.change(screen.getByLabelText(/website \/ online presence monthly cost/i), {
      target: { value: "-1" }
    });
    fireEvent.click(screen.getByRole("button", { name: /update my estimate/i }));

    expect(
      screen.getByText(/please enter numeric values greater than or equal to 0\./i)
    ).toBeInTheDocument();
  });

  it("validates the lead form and renders the results screen after submit", async () => {
    render(<CalculatorApp />);
    await progressToLeadStep();

    fireEvent.click(screen.getByRole("button", { name: /view my report/i }));

    expect(screen.getByText(/first name is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/email is required\./i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Alex" }
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Taylor" }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alex@example.com" }
    });

    fireEvent.click(screen.getByRole("button", { name: /view my report/i }));

    await waitFor(() => {
      expect(submitLeadReport).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/your front-desk stack is estimated at/i)
    ).toBeInTheDocument();
  });
});
