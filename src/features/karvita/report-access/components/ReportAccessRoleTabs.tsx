'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import type { ReportAccessRoleId } from '@/types/report-access';
import { getRoleStrategy } from '@/utils/role-strategy';

type ReportAccessRoleTabsProps = {
  roleId: ReportAccessRoleId;
  /** نقش‌هایی که API در ماتریس برگردانده، به همان ترتیب. */
  roles: readonly ReportAccessRoleId[];
  onChange: (roleId: ReportAccessRoleId) => void;
};

export function ReportAccessRoleTabs({
  roleId,
  roles,
  onChange,
}: ReportAccessRoleTabsProps) {
  return (
    <AppTabs
      value={roleId}
      onValueChange={(value) => onChange(value as ReportAccessRoleId)}
    >
      <AppTabsList aria-label="نقش">
        {roles.map((id) => (
          <AppTabsTrigger key={id} value={id} className="gap-kv-pair">
            <span className="truncate">{getRoleStrategy(id).label}</span>
          </AppTabsTrigger>
        ))}
      </AppTabsList>
    </AppTabs>
  );
}
