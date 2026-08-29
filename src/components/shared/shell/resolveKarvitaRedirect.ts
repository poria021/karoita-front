import { isAdminControlPlanePath } from '@/lib/live-nav-paths';
import { getPostLoginPath } from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import type { User } from '@/types/auth';
import {
  areKarvitaModulesUnlocked,
  canAccessAdminControlPlane,
  isStaffAdminRole,
} from '@/utils/RoleStrategyMap';

function isProfilePath(pathname: string, role: string): boolean {
  const profilePath = RouteService.karvita.profile(role);
  return pathname === profilePath || pathname.startsWith(`${profilePath}/`);
}

/**
 * مقصد replace برای گارد شل کارویتا. منطق نقش/قفل اینجا است تا بدون Next router تست شود.
 */
export function resolveKarvitaRedirect(
  user: User,
  pathname: string
): string | null {
  if (!areKarvitaModulesUnlocked(user) && !isProfilePath(pathname, user.role)) {
    return RouteService.karvita.profile(user.role);
  }

  const userDashboard = RouteService.karvita.dashboard();
  if (isStaffAdminRole(user.role) && pathname === userDashboard) {
    return getPostLoginPath(user);
  }
  if (
    isAdminControlPlanePath(pathname) &&
    !canAccessAdminControlPlane(user.role, pathname)
  ) {
    return getPostLoginPath(user);
  }

  return null;
}
