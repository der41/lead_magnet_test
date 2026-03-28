"use client";

export function ProgressBar({
  current,
  total
}: {
  current: number;
  total: number;
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>{`Step ${current} of ${total}`}</span>
        <span>{percentage}% complete</span>
      </div>
      <div className="h-2 rounded-full bg-white/70">
        <div
          aria-hidden
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-strong)] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
