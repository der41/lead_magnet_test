"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-white/92 p-6 shadow-[var(--shadow)] backdrop-blur md:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white shadow-lg shadow-blue-900/15",
        variant === "secondary" &&
          "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        variant === "ghost" && "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-strong)]">
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  subtitle,
  invert = false
}: {
  title: string;
  subtitle?: string;
  invert?: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2
        className={cn(
          "max-w-3xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl",
          invert ? "text-white" : "text-[var(--foreground)]"
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 md:text-lg",
            invert ? "text-slate-300" : "text-[var(--muted)]"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  accent = false
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] p-5",
        accent
          ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] text-white"
          : "bg-[var(--surface-soft)] text-[var(--foreground)]"
      )}
    >
      <p className={cn("text-sm", accent ? "text-blue-100" : "text-[var(--muted)]")}>
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{value}</p>
      {detail ? (
        <p className={cn("mt-2 text-sm leading-6", accent ? "text-blue-50" : "text-[var(--muted)]")}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      {children}
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
  }
) {
  const { className, error, ...rest } = props;

  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-2xl bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-200",
        error && "ring-2 ring-rose-200",
        className
      )}
      {...rest}
    />
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        tone === "neutral" && "bg-[var(--surface-soft)] text-[var(--foreground)]",
        tone === "positive" && "bg-emerald-100 text-emerald-900",
        tone === "warning" && "bg-amber-100 text-amber-900"
      )}
    >
      {children}
    </span>
  );
}
