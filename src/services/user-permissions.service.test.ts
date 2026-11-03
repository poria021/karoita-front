import { describe, expect, it } from 'vitest';

import { UserPermissionsService } from '@/services/user-permissions.service';

describe('user permissions service', () => {
  it('keeps report access and compare toggles separated', () => {
    const rules = UserPermissionsService.listRules();
    const target = rules[0]!;
    const key = `${target.role}:${target.province}:${target.reportKey}`;

    const afterViewOff = UserPermissionsService.toggleView(
      rules,
      key,
      false,
    );
    expect(afterViewOff.find((rule) => ruleKeyMatches(rule, key))?.canView).toBe(false);
    expect(afterViewOff.find((rule) => ruleKeyMatches(rule, key))?.canCompare).toBe(false);

    const afterCompareOn = UserPermissionsService.toggleCompare(
      afterViewOff,
      key,
      true,
    );
    expect(afterCompareOn.find((rule) => ruleKeyMatches(rule, key))?.canCompare).toBe(true);
  });
});

function ruleKeyMatches(rule: { role: string; province: string; reportKey: string }, key: string) {
  return `${rule.role}:${rule.province}:${rule.reportKey}` === key;
}
