// Route group shell for the authenticated dashboard area.
//
// Being a route group, `(dashboard)` does NOT add a `/dashboard` segment to
// the URL - it only groups routes so they can share this layout. Role-based
// sub-routes (e.g. admin, student, reviewer) are expected to dynamically load
// underneath this group once the actual dashboard logic is migrated here.
//
// Kept as a plain pass-through for now; shared chrome (sidebar, header, etc.)
// will be composed from `src/components/shared` in a later step.
export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
