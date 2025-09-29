# Regnova Portal (MVP)

Regnova customer/admin portal front-end skeleton built with Next.js App Router, TypeScript, TailwindCSS, and shadcn/ui. UI copy is English; documentation and collaboration can be Turkish.

## Tech Stack

- Next.js 15 App Router (TypeScript)
- TailwindCSS v4, shadcn/ui (Radix primitives), lucide-react icons
- React Hook Form + Zod for forms and validation
- TanStack Query for data fetching (mock data), TanStack Table planned for admin extensions
- Sonner toasts, localStorage draft state

## Project Structure

- `src/app` – App Router routes (dashboard, report wizard, recalls, track complaint, resources, admin placeholders)
- `src/components` – shared UI components (buttons, cards, tables, layout)
- `src/data/mock.ts` – mock data sources (recalls, complaints, resources, admin tables)
- `src/hooks` – custom hooks (draft handling, resources, recalls)
- `src/context` – role selector, RBAC helpers, report draft provider
- `src/lib` – query client/keys, formatters, Zod validations

## Getting Started

```bash
npm install
npm run prisma:generate # (optional) generate Prisma client if backend is used locally
npm run dev
```

Visit `http://localhost:3000`.

### Environment Variables

Create a `.env.local` file with the following variables before running the backend-auth routes:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

AUTH_ACCESS_TOKEN_SECRET=change-me-to-32-characters-min
AUTH_REFRESH_TOKEN_SECRET=change-me-to-32-characters-min
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_REFRESH_TOKEN_TTL=30d

RATE_LIMIT_REDIS_URL=https://<UPSTASH_REDIS_URL>
```

If you do not have a Redis instance for rate limiting yet, omit `RATE_LIMIT_REDIS_URL`; rate limiting will be skipped in development.

> **Production note:** configure the same variables via your deployment provider's secret manager (e.g. Vercel Environment Variables). Generate 32+ character secrets for the token keys and align TTLs with compliance requirements. Rotate credentials before launch.

### Available Scripts

- `npm run dev` – start development server (Turbopack)
- `npm run build` – production build
- `npm run start` – serve production build
- `npm run lint` – run ESLint
- `npm run prisma:generate` – generate Prisma client (after changing schema)
- `npm run prisma:migrate:deploy` – apply pending Prisma migrations in the configured database

## Core Features

- **Role-aware layout:** Sidebar and admin menu visibility controlled by mock role selector
- **Dashboard:** Metric cards, recent complaints/recalls tabs, quick actions
- **Report Issue Wizard:** 7-step workflow, React Hook Form + Zod validation, attachments upload, draft save/resume (localStorage), success screen with tracking ID
- **Track Complaint:** Tracking ID lookup with mock timeline states and empty/error handling
- **Recalls & Alerts:** Filterable table, mobile drawer filters, CSV export, details panel with FSN links and corrective actions
- **Resources:** Category tabs, search filter, download cards for SOPs, guidelines, forms

## Mock Data & Persistence

- All data sourced from `src/data/mock.ts`
- Draft report state persisted in localStorage via `ReportDraftProvider`
- Role selector remembers last choice via localStorage

## Testing & QA

- Run `npm run lint` to ensure code quality
- Manual smoke test flows:
  - Submit report with attachments → verify toast and success screen tracking link
  - Filter recalls by manufacturer/region, export CSV
  - Switch role selector (Admin/Facility/Manufacturer) and confirm navigation visibility
  - Search resources and verify “No records found” state

## Next Steps / Ideas

- Flesh out admin pages (`/admin/users`, `/admin/devices`, `/admin/pms`, `/admin/audit`)
- Integrate TanStack Table sorting/pagination for admin tables
- Add automated tests (Playwright or Cypress) for critical flows
- Connect to real backend services when available

## Production Checklist

- [ ] Provision PostgreSQL instance and set `DATABASE_URL`
- [ ] Run `npm run prisma:generate` / `npm run prisma:migrate:deploy`
- [ ] Configure `AUTH_ACCESS_TOKEN_SECRET`, `AUTH_REFRESH_TOKEN_SECRET`, TTL values
- [ ] Set `RATE_LIMIT_REDIS_URL` (Upstash Redis or equivalent)
- [ ] Enable CI pipeline (`npm run lint`, `npm test`, build)
- [ ] Add smoke/E2E tests (Playwright/Cypress) for login + dashboard flows
- [ ] Verify environment variables on hosting provider before deploy

---

© 2025 Regnova. Post-Market Surveillance • Inventory • Compliance.
