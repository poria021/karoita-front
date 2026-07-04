# Karvita Project Rules

## Tech Stack
- Next.js 15 (App Router)
- TypeScript strict (no any)
- Tailwind CSS v4 + Shadcn/ui
- React Query (server state)
- Zustand (UI state only)
- React Hook Form + Zod
- Sonner + Lucide
- next-pwa

## Architecture Rules (Feature-Sliced Design)
- Server Components first where applicable
- React Query = server state (single source of truth for API data)
- Zustand = UI state only (modals, toggles, sidebar)
- NO direct API calls in UI components. All API calls MUST go through the `services/` folder.
- Complex business logic must be encapsulated inside the `features/` folder.
- NO strict DDD folders (Do NOT create `domain` or `infrastructure` folders).

## RBAC Roles
student, skill_learner, supervisor_professor, mentor_teacher, school_principal, super_admin

## Security Rules
- No sensitive data in localStorage (use Zustand/Cookies)
- Zod validation (client side)
- Generic error messages only
- CSP, CSRF required

## Performance Budget
- Lighthouse ≥ 90
- FCP < 1.5s
- LCP < 2.5s
- Bundle < 200kB

## PWA
- next-pwa (Cache First)
- Offline Queue
- Draft Persistence
- Isolated logic (handled via hooks and features, NOT in infrastructure)

## Git
Conventional Commits: feat, fix, refactor, chore, docs, perf
(lowercase, present tense, max 50 chars)

## API Communication (CRITICAL)
- ALL API calls MUST go through `src/services/`
- NEVER call Axios directly in components
- React Query hooks should call services, not Axios directly
- NestJS backend endpoints are defined in services

## Features (Business Logic)
- Complex logic lives in `src/features/`
- Each feature is a separate module (ad-engine, forms-wizard, reporting)
- Features can have their own components, hooks, and types