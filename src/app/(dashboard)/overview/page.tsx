// Placeholder entry point for the `(dashboard)` route group.
//
// NOTE: a route group's `page.tsx` maps to the group's base path, which here
// would be `/` - already owned by `src/app/page.tsx` (the marketing/landing
// page). To avoid a route collision, this placeholder lives at `/overview`
// instead. Role-based sub-routes should be added as siblings of this folder
// (e.g. `(dashboard)/admin`, `(dashboard)/student`) and can be freely
// reorganized once real pages are migrated into this group.
export default function DashboardOverviewPage() {
  return null;
}
