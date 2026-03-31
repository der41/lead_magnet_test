import Link from "next/link";
import { brandConfig } from "@/lib/app-config";

function formatPlanName(plan: string | undefined) {
  if (!plan) {
    return "selected plan";
  }

  return plan
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function ThankYouPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawPlan = resolvedSearchParams.plan;
  const plan = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
  const formattedPlan = formatPlanName(plan);

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[32px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] p-8 text-white shadow-[0_32px_90px_rgba(13,110,253,0.26)] md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
            Thank You
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-5xl">
            Thank you for choosing this product!
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50">
            You selected the {formattedPlan} option for {brandConfig.name}. This page is a
            placeholder while the final purchase and onboarding flow is being connected.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] bg-white/92 p-8 shadow-[var(--shadow)] backdrop-blur">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              Need help or have questions?
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Any inquiries about the system can be sent directly to Diego Rodriguez.
            </p>
            <div className="mt-8 rounded-[24px] bg-[var(--surface-soft)] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                Contact
              </p>
              <p className="mt-3 text-xl font-bold text-[var(--foreground)]">Diego Rodriguez</p>
              <a
                href="mailto:diego.elias94@gmail.com"
                className="mt-2 inline-block text-lg font-medium text-[var(--primary)] underline-offset-4 hover:underline"
              >
                diego.elias94@gmail.com
              </a>
            </div>
          </section>

          <aside className="rounded-[28px] bg-[var(--surface-soft)] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Next Step
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              If you want to keep exploring the estimator, you can head back to the calculator
              and review a different plan.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-strong)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/15"
            >
              Return to calculator
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
