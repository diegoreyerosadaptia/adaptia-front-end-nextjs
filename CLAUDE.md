# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint via next lint
```

No test suite is configured.

## Architecture Overview

**Adaptia** is a Next.js 15 SaaS app (App Router, React 19) for ESG double-materiality analysis. Companies submit their data and receive a sustainability roadmap.

**Tech stack**: TypeScript, Tailwind CSS 4, shadcn/ui (57 components), React Hook Form + Zod, Supabase (auth + DB), Socket.io (real-time), pdf-lib + html2canvas (PDF export), Recharts (materiality charts), Mercado Pago (payments).

### Request Flow

```
Browser → Next.js App Router
  ├── Server Components: async data fetch via src/services/
  ├── Server Actions (src/actions/): mutations → src/services/ → REST API
  └── Client Components: React Hook Form + Zod → Server Actions
```

The backend REST API runs at `NEXT_PUBLIC_API_URL` (default `http://localhost:3030`). All service calls use Bearer token auth via `NEXT_PUBLIC_API_SECRET_TOKEN`.

### Key Directories

| Path | Purpose |
|---|---|
| `src/app/` | App Router pages and layouts |
| `src/actions/` | Server Actions grouped by domain (analysis, auth, organizations, payments, cupones) |
| `src/services/` | API client functions — one file per domain, called by server actions and server components |
| `src/components/form-org/` | Multi-step org creation/payment forms |
| `src/components/pdf/` | ESG report PDF generation components |
| `src/components/tracking/` | Google Analytics 4 event tracking wrappers |
| `src/components/ui/` | shadcn/ui primitives (do not edit directly) |
| `src/lib/supabase/` | Supabase client variants (browser, server, middleware, admin) |
| `src/lib/analysis-socket.ts` | Socket.io client for real-time analysis status updates |
| `src/lib/materiality/` | Materiality chart calculation logic |
| `src/schemas/` | Zod validation schemas shared between forms and server actions |
| `src/types/` | TypeScript types (organization, analysis, esg, etc.) |
| `src/routes.ts` | Public route list used by middleware for auth protection |
| `src/middleware.ts` | Supabase auth session refresh + route protection |

### Authentication

Supabase Auth (email/password + OAuth). The middleware (`src/middleware.ts`) refreshes sessions and redirects unauthenticated users. Public routes are declared in `src/routes.ts`; everything else requires a session. After login, users are redirected to `/admin/dashboard` (admins) or `/dashboard`.

### Server/Client Component Split

- Page files are async Server Components — they fetch data directly via `src/services/`.
- Forms use `"use client"` with React Hook Form + Zod, submitting via Server Actions.
- Mutations use `useTransition` for pending state; toasts (Sonner) signal success/error.

### Real-time Analysis Updates

`src/lib/analysis-socket.ts` connects to the Socket.io server at `NEXT_PUBLIC_API_URL` on namespace `/analysis-status`. Dashboard pages subscribe to analysis job progress and update UI when processing completes.

### PDF Generation

ESG reports are generated client-side using pdf-lib + html2canvas. Components in `src/components/pdf/` render report sections; `src/lib/pdf/` contains the assembly logic. Recharts materiality charts are rasterized via html2canvas before embedding.

### Cache Invalidation

Server Actions call `revalidateTag(tag)` after mutations. Tags follow the pattern `organization-${id}`, `organizations`, etc. — defined consistently across services and actions.

### Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL |
| `NEXT_PUBLIC_API_SECRET_TOKEN` | Bearer token for API requests |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 measurement ID |
| `API_SECRET_TOKEN` | Server-side API secret (server actions only) |

### Build Notes

`next.config.mjs` has `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` — the build will not fail on lint or type errors, so run `npm run lint` and `tsc --noEmit` manually when needed.
