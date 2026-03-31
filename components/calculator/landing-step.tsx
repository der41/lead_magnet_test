"use client";

import { Button, Eyebrow } from "@/components/ui";
import { brandConfig } from "@/lib/app-config";

export function LandingStep({ onStart }: { onStart: () => void }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-[color:rgba(248,249,255,0.85)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="text-2xl font-black tracking-[-0.04em] text-[var(--foreground)]">
            {brandConfig.name}
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#calculator-benefits"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
            >
              Back to Site
            </a>
            <Button className="min-h-10 px-6 py-2" onClick={onStart}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:px-8 md:pb-32">
        <div className="absolute right-0 top-0 h-[38rem] w-[38rem] translate-x-1/4 -translate-y-1/3 rounded-full bg-[color:rgba(211,228,254,0.66)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[26rem] w-[26rem] -translate-x-1/4 translate-y-1/4 rounded-full bg-[color:rgba(177,197,255,0.2)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow>COST OPTIMIZATION</Eyebrow>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-0.05em] text-[var(--foreground)] md:text-6xl lg:text-7xl">
              See how much your current front-desk setup may be costing you
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              Answer a few quick questions about the tools and services you use today.
              We&apos;ll estimate your monthly spend, compare it to {brandConfig.name}, and
              show where you may be overpaying or overlapping.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Button
                className="w-full max-w-sm rounded-[18px] px-10 py-5 text-base font-bold shadow-[0_28px_80px_rgba(13,110,253,0.22)] sm:w-auto"
                onClick={onStart}
              >
                Start estimate →
              </Button>
              <p className="text-sm italic text-[var(--muted)]">
                No spreadsheets. No prep work. Just a quick estimate.
              </p>
            </div>

            <div className="mx-auto mt-12 grid w-fit gap-4 text-left">
              {[
                "Takes less than 2 minutes",
                "Based on public pricing benchmarks",
                "Option to adjust with your real numbers"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-1.5 text-[var(--success)]">
                    <span className="block text-sm leading-none">✓</span>
                  </div>
                  <span className="font-medium text-[var(--muted)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="calculator-benefits"
        className="bg-[var(--surface-soft)] px-6 py-20 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">
              We benchmark against the tools you use
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Our engine analyzes the most common software in the hospitality and service
              industries.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-lg font-black italic tracking-[-0.04em] text-[color:rgba(84,95,115,0.55)] grayscale transition-all hover:grayscale-0 md:gap-x-14 md:text-xl">
            {brandConfig.benchmarkBrands.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[var(--background)] px-6 py-10 md:px-8 md:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <div className="text-lg font-bold text-[var(--foreground)]">{brandConfig.name}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              © 2026 {brandConfig.name}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]">
            <a href="#" className="transition-colors hover:text-[var(--primary)]">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-[var(--primary)]">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-[var(--primary)]">
              {brandConfig.name} Home
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
