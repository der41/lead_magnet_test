# Front Desk Stack Cost Calculator

A production-ready Next.js prototype for Breezy that estimates a service business's current front-desk stack cost, recommends a Breezy plan, and unlocks a premium comparison report.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest for focused domain and validation tests

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` starts the local development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run test` runs the unit tests

## Project structure

- `app/`
  App Router entrypoints and global styling.
- `components/`
  Reusable UI and calculator flow components.
- `lib/`
  Business logic, data access, validation, submission abstraction, and formatting helpers.
- `data/`
  Source benchmark and Breezy plan JSON files.
- `types/`
  Shared TypeScript models for the calculator.
- `tests/`
  Unit tests for calculator logic and validation.

## Where the source data is used

- [`data/benchmark.json`](./data/benchmark.json)
  Imported by `lib/data.ts` and used by the calculator utilities for:
  - benchmark lookup
  - category-level monthly estimates
  - editable benchmark prefills
  - total cost calculations

- [`data/plans.json`](./data/plans.json)
  Imported by `lib/data.ts` and used by the calculator utilities for:
  - Breezy plan pricing
  - recommendation output
  - comparison/report content

## Replacing the mocked lead submission later

The current implementation uses `MockLeadSubmissionClient` in `lib/submission.ts`.

To connect a real backend later:

1. Keep the existing `LeadReportPayload` shape as the UI contract.
2. Replace `defaultLeadSubmissionClient` with:
   - a `fetch` call to a Next.js route handler such as `app/api/leads/route.ts`, or
   - an external CRM, webhook, or server endpoint.
3. Return the same typed `{ success, message }` result so the UI stays unchanged.

Because the payload already includes user details, selections, overrides, totals, recommendation, savings, and metadata, it should be straightforward to store in a database or forward to a CRM.

## Deployment

This app is structured to deploy directly on Vercel:

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Build command: `npm run build`
4. Output: standard Next.js deployment

No runtime secrets are required for the current mocked prototype.
