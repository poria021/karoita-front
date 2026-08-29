export type {
  RoleStrategyConfig,
  RoleStrategyMap,
  SidebarMenuEntry,
  SidebarMenuGroup,
  SidebarMenuItem,
} from '@/utils/role-strategy/types';
export { isSidebarMenuGroup } from '@/utils/role-strategy/types';

export { ROLE_STRATEGY_MAP } from '@/utils/role-strategy/strategies';

export {
  areKarvitaModulesUnlocked,
  canAccessAdminControlPlane,
  getRoleStrategy,
  getVisibleSidebarMenu,
  hasPermission,
  isStaffAdminRole,
  isSuperAdminRole,
} from '@/utils/role-strategy/helpers';
