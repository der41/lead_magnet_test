"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function OptionCard({
  title,
  description,
  selected,
  onClick,
  badge,
  children
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-[24px] p-6 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
        selected
          ? "bg-white text-[var(--foreground)] ring-2 ring-[var(--primary)] shadow-[0_32px_60px_-20px_rgba(11,28,48,0.18)]"
          : "bg-[var(--surface-soft)] text-[var(--foreground)] ring-1 ring-[color:rgba(194,198,216,0.16)] hover:bg-white hover:shadow-[0_32px_60px_-20px_rgba(11,28,48,0.08)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black tracking-[0.16em] transition-colors",
              selected
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-strong)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
            )}
          >
            {badge ?? title.slice(0, 1)}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          </div>
          {children}
        </div>
        <span
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
            selected
              ? "bg-[var(--surface-soft)] text-[var(--primary)]"
              : "bg-white/80 text-transparent ring-1 ring-[color:rgba(194,198,216,0.2)]"
          )}
          aria-hidden="true"
        >
          ✓
        </span>
      </div>
    </button>
  );
}
