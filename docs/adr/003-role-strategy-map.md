# ADR-003: RoleStrategyMap for role UX

## Status
Accepted

## Context
Eleven roles need different menus, widths, and permission labels. Inline `if (role === 'student')` scatters policy and breaks when roles change.

## Decision
1. All role → layout / menu / `permissions[]` mapping lives in `src/utils/RoleStrategyMap.ts`.
2. Features and shells call `getRoleStrategy(role)` / `hasPermission(user, permission)` — never ad-hoc role string branches for chrome.
3. `permissions[]` gates destructive UI; Facades in mock mode re-check via `mock-authz` (soft). Real mode must re-validate on Nest.

## Consequences
- One place to add a role or permission.
- UI gates remain UX only (see ADR-004).

## See also
- `src/utils/RoleStrategyMap.ts`
- `.cursor/rules/00-architecture-design-patterns.mdc` (§10)
