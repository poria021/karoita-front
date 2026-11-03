'use client';

import { useMemo, useState } from 'react';

import { UserPermissionsService } from '@/services/user-permissions.service';
import type { ReportAccessToggle } from '@/services/report-access-policy';

export function useUserPermissionsPolicy() {
  const initialRules = useMemo(() => UserPermissionsService.listRules(), []);
  const [rules, setRules] = useState<ReportAccessToggle[]>(initialRules);

  const totalRules = rules.length;
  const enabledViewRules = rules.filter((rule) => rule.canView).length;
  const disabledCompareRules = rules.filter((rule) => !rule.canCompare).length;

  const toggleView = (ruleKey: string, checked: boolean) => {
    setRules((current) => UserPermissionsService.toggleView(current, ruleKey, checked));
  };

  const toggleCompare = (ruleKey: string, checked: boolean) => {
    setRules((current) => UserPermissionsService.toggleCompare(current, ruleKey, checked));
  };

  return {
    rules,
    totalRules,
    enabledViewRules,
    disabledCompareRules,
    toggleView,
    toggleCompare,
  };
}
