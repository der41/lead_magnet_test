"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function OptionCard({
  title,
  description,
  selected,
  onClick,
  children
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[24px] p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
        selected
          ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white shadow-xl shadow-blue-950/15"
          : "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className={cn("mt-2 text-sm leading-6", selected ? "text-blue-50" : "text-[var(--muted)]")}>
            {description}
          </p>
        </div>
        <span
          className={cn(
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            selected ? "bg-white text-[var(--primary)]" : "bg-white/75 text-transparent"
          )}
        >
          •
        </span>
      </div>
      {children}
    </button>
  );
}
