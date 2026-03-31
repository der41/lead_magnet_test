"use client";

import { Button, Eyebrow } from "@/components/ui";
import { brandConfig } from "@/lib/app-config";

export function CalculatorHeader({ onRestart }: { onRestart: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div className="space-y-2">
        <Eyebrow>{brandConfig.name} lead magnet</Eyebrow>
        <p className="text-sm text-[var(--muted)]">Front Desk Stack Cost Calculator</p>
      </div>
      <Button variant="ghost" onClick={onRestart}>
        Restart
      </Button>
    </header>
  );
}
