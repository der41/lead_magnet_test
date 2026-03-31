"use client";

import { OptionCard } from "@/components/option-card";
import { Button, Card } from "@/components/ui";
import { levelBadges } from "@/lib/app-config";
import { categoryContent, categoryOrder, levelContent } from "@/lib/content";
import type { CategoryKey, CategorySelections } from "@/types/calculator";

export function QuestionStep({
  categoryIndex,
  currentCategory,
  selections,
  onSelectLevel,
  onBack,
  onContinue
}: {
  categoryIndex: number;
  currentCategory: CategoryKey;
  selections: CategorySelections;
  onSelectLevel: (category: CategoryKey, level: CategorySelections[CategoryKey]) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <Card className="space-y-8 p-8 md:p-10">
      <div className="space-y-6 text-center md:text-left">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.26em] text-[var(--primary)]">
            {`Question ${categoryIndex + 1} of ${categoryOrder.length}`}
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
            {categoryContent[currentCategory].question}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-[var(--muted)] md:mx-0">
            {categoryContent[currentCategory].helper}
          </p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] transition-all duration-700"
            style={{
              width: `${((categoryIndex + 1) / categoryOrder.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(levelContent) as Array<keyof typeof levelContent>).map((level) => (
          <OptionCard
            key={level}
            title={levelContent[level].label}
            description={levelContent[level].helperByCategory[currentCategory]}
            badge={levelBadges[level]}
            selected={selections[currentCategory] === level}
            onClick={() => onSelectLevel(currentCategory, level)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="order-2 sm:order-1" onClick={onBack}>
          ← Back
        </Button>
        <Button className="order-1 sm:order-2" onClick={onContinue}>
          {currentCategory === "website" ? "See my estimate" : "Continue"}
        </Button>
      </div>
    </Card>
  );
}
