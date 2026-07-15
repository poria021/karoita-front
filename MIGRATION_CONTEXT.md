# Karvita Migration Context

## Legacy Source of Truth
- The source logic is located in `index.html` (the Alpine.js prototype).
- **Rule:** Before writing any new logic, Cursor MUST cross-reference the logic from `index.html`.
- **Naming:** Maintain existing function names (e.g., `submitGrade`, `internship_loadFromDatabase`) but transform them into TypeScript modules.

## Data Structure Transition
- **Proxy Pattern:** Data is currently in `localStorage` (Key: `karvita_local_db`).
- **Middleware:** Any new service created in `src/services/` MUST implement a check: 
  - If `API_MODE === 'mock'`, read from `localStorage` (as defined in `index.html`).
  - If `API_MODE === 'real'`, use `fetch` to `NEXT_PUBLIC_API_URL`.

## Role Strategy Map
- When implementing dashboard layouts (Header, Sidebar), do not write `if (role === '...')`.
- Use the `RoleStrategyMap` (to be created in `src/utils/`).
- If you find a new role in `index.html`, add it to `RoleStrategyMap` before writing any UI logic.

## CSS Strategy
- Legacy: Tailwind classes (e.g., `ml-2`, `mr-4`).
- Migration: All migrated components must use Tailwind **Logical Properties** (e.g., `ms-2`, `me-4`).