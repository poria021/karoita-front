'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { REPORT_ACCESS_ROLES } from '@/features/karvita/report-access/constants';
import { ReportAccessDirtyDot } from '@/features/karvita/report-access/components/ReportAccessDirtyDot';
import type { ReportAccessRoleId } from '@/types/report-access';
import { getRoleStrategy } from '@/utils/role-strategy';

type ReportAccessRoleTabsProps = {
  roleId: ReportAccessRoleId;
  dirtyRoleIds: ReadonlySet<ReportAccessRoleId>;
  onChange: (roleId: ReportAccessRoleId) => void;
};

export function ReportAccessRoleTabs({
  roleId,
  dirtyRoleIds,
  onChange,
}: ReportAccessRoleTabsProps) {
  return (
    <AppTabs
      value={roleId}
      onValueChange={(value) => onChange(value as ReportAccessRoleId)}
    >
      <AppTabsList aria-label="نقش">
        {REPORT_ACCESS_ROLES.map((id) => (
          <AppTabsTrigger key={id} value={id} className="gap-kv-pair">
            <span className="truncate">{getRoleStrategy(id).label}</span>
            {dirtyRoleIds.has(id) ? <ReportAccessDirtyDot /> : null}
          </AppTabsTrigger>
        ))}
      </AppTabsList>
    </AppTabs>
  );
}
