# About This App

## Overview

This app is a Next.js lead-magnet calculator for Aerwyn. It helps a user estimate what they currently spend across several front-desk service categories, compares that spend against a recommended Aerwyn plan, and then presents a gated report with a pricing comparison and service-level breakdown.

The current implementation is a guided multi-step flow with Stitch-inspired landing, intro, questionnaire, summary, teaser, lead-capture, and final report pages.

## Core User Flow

### 1. Landing Page

The landing page introduces the calculator and explains the value proposition:

- estimate current front-desk stack cost
- compare against Aerwyn
- identify overlap and possible savings

The primary CTA starts the questionnaire flow.

### 2. Intro to Questions

The intro step explains that the app will walk through five categories:

- Answering / Reception
- Scheduling
- Customer Messaging
- CRM / Operations
- Website / Online Presence

This page is informational and leads into the category questions.

### 3. Category Question Flow

Each category asks the user to select one of four levels:

- None
- Basic
- Standard
- Advanced

Those selections map to benchmark pricing data in `data/benchmark.json`.

### 4. Estimated Spend Summary

After all five category questions, the app:

- calculates monthly and annual totals from benchmark data
- shows a per-category breakdown
- allows the user to override each category with their actual monthly costs

Important behavior:

- inputs accept only numeric values greater than or equal to `0`
- when overrides are applied, the edited totals are used immediately
- the recommended plan is recalculated from the edited totals

### 5. Pre-Capture Teaser

Before the lead form, the app shows:

- current estimated spend
- recommended Aerwyn plan
- estimated monthly savings
- a pricing table with Aerwyn plan options

The teaser pricing table includes linked plan CTAs.

### 6. Lead Capture

The lead form collects:

- first name
- last name
- email
- phone

The current submission path uses a mock submission client in `lib/submission.ts`.

### 7. Final Report

After submission, the user sees a report page that includes:

- monthly spend comparison
- recommended plan explanation
- category-by-category service table using actual breakdown values
- optional `Aerwyn also includes:` section when one or more categories were entered as `$0`
- admin-work and consolidation framing
- pricing table with Aerwyn plans

## How Pricing and Recommendation Work

### Benchmarking

Benchmark values come from `data/benchmark.json`.

Each category has a benchmark value for:

- `none`
- `low`
- `mid`
- `high`

### Plan Data

Plan data comes from `data/plans.json`.

The app currently uses:

- Professional
- Growth
- Accelerate

The pricing teaser and final pricing table also include a presentation-only `White Glove` tier.

### Recommendation Logic

Recommendation logic lives in `lib/calculator.ts`.

Default behavior:

- use both estimated monthly total and complexity to recommend a plan

Override behavior:

- when a user applies manual overrides, recommendation uses the edited monthly total thresholds so the plan can move up or down based on the real values

## Main Files

- `app/page.tsx`
  App entrypoint.
- `components/calculator-app.tsx`
  Main flow and page rendering logic.
- `components/option-card.tsx`
  Shared selectable card used in the question flow.
- `components/ui.tsx`
  Shared UI primitives.
- `lib/calculator.ts`
  Pricing, recommendation, comparison, and payload logic.
- `lib/content.ts`
  Question copy and category metadata.
- `data/benchmark.json`
  Benchmark category pricing.
- `data/plans.json`
  Aerwyn plan pricing and features.

## Current State

The app has been refined to reflect Stitch-derived layouts across:

- landing page
- intro page
- question pages
- summary page
- teaser page with pricing
- final report page with pricing

It currently builds and tests cleanly with:

- `npm run test`
- `npm run build`
