"use client";

import {
  CalculatorHeader,
  IntroStep,
  LandingStep,
  LeadStep,
  QuestionStep,
  ResultsStep,
  SummaryStep,
  TeaserStep
} from "@/components/calculator/calculator-steps";
import { useCalculatorFlow } from "@/components/calculator/use-calculator-flow";

export function CalculatorApp() {
  const flow = useCalculatorFlow();

  if (flow.step === "landing") {
    return (
      <main className="min-h-screen">
        <LandingStep onStart={flow.goToNextStep} />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <CalculatorHeader onRestart={flow.resetCalculator} />

          {flow.step === "intro" ? (
            <IntroStep onContinue={flow.goToNextStep} onBack={flow.goToPreviousStep} />
          ) : null}

          {flow.currentCategory ? (
            <QuestionStep
              categoryIndex={flow.categoryIndex}
              currentCategory={flow.currentCategory}
              selections={flow.selections}
              onSelectLevel={flow.selectCategoryLevel}
              onBack={flow.goToPreviousStep}
              onContinue={flow.goToNextStep}
            />
          ) : null}

          {flow.step === "summary" ? (
            <SummaryStep
              estimate={flow.estimate}
              overrideDrafts={flow.overrideDrafts}
              summaryNotice={flow.summaryNotice}
              recommendation={flow.recommendation}
              onUpdateOverrideDraft={flow.updateOverrideDraft}
              onApplyOverrides={flow.applyOverrides}
              onContinue={flow.goToNextStep}
              onBack={flow.goToPreviousStep}
            />
          ) : null}

          {flow.step === "teaser" ? (
            <TeaserStep
              estimate={flow.estimate}
              recommendation={flow.recommendation}
              teaserPlans={flow.teaserPlans}
              onUnlock={flow.goToNextStep}
              onBack={flow.goToPreviousStep}
            />
          ) : null}

          {flow.step === "lead" ? (
            <LeadStep
              lead={flow.lead}
              errors={flow.errors}
              submissionState={flow.submissionState}
              submissionMessage={flow.submissionMessage}
              onLeadChange={(field, value) =>
                flow.setLead((current) => ({
                  ...current,
                  [field]: value
                }))
              }
              onSubmit={flow.submitLeadForm}
              onBack={flow.goToPreviousStep}
            />
          ) : null}

          {flow.step === "results" ? (
            <ResultsStep
              estimate={flow.estimate}
              recommendation={flow.recommendation}
              recommendationShare={flow.recommendationShare}
              recommendationSavingsPercent={flow.recommendationSavingsPercent}
              bestFitFeatures={flow.bestFitFeatures}
              serviceComparisonRows={flow.serviceComparisonRows}
              planIncludesText={flow.planIncludesText}
              complexity={flow.complexity}
              teaserPlans={flow.teaserPlans}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
