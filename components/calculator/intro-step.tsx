"use client";

import { Button, Card } from "@/components/ui";
import { introCards } from "@/lib/app-config";
import { categoryContent } from "@/lib/content";

export function IntroStep({
  onContinue,
  onBack
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="space-y-10 p-8 md:p-10 lg:p-12">
      <div className="flex items-center justify-between gap-6">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)]" />
        </div>
        <span className="shrink-0 text-xs font-bold uppercase tracking-[0.26em] text-[var(--primary)] md:text-sm">
          Step 1 of 5
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-5xl">
            First, let&apos;s estimate what you&apos;re currently paying for
          </h2>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
            We&apos;ll walk through five parts of your front-desk stack and estimate your
            current monthly spend based on the level of service you use.
          </p>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button className="rounded-[18px] px-8 py-4 text-base font-bold" onClick={onContinue}>
              Continue →
            </Button>
            <Button
              variant="secondary"
              className="rounded-[18px] px-8 py-4 text-base"
              onClick={onBack}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {introCards.map((item) => (
              <div
                key={item.category}
                className={`rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(11,28,48,0.06)] transition-transform hover:-translate-y-1 ${
                  item.wide ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-sm font-black tracking-[0.14em] text-[var(--primary)]">
                    {item.badge}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {categoryContent[item.category].title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-4 rounded-[24px] bg-[var(--surface-soft)] p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[var(--success)]">
              i
            </div>
            <p className="text-sm italic leading-7 text-[var(--muted)]">
              Don&apos;t worry if you&apos;re not sure about the exact amounts. We&apos;ll use
              industry averages to help you estimate.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
