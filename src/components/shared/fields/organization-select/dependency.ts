import type { OrganizationDependsOn } from '@/hooks/useOrganizationOptions';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

function isDependencyValue(value: string | string[] | undefined): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

/**
 * بدون والد لازم fetch نکن. اگر `dependsOn` پاس نشود فیلد مستقل است.
 */
export function isBlockedByMissingDependency(
  type: OrganizationField,
  dependsOn: OrganizationDependsOn | undefined
): boolean {
  if (!dependsOn) return false;

  switch (type) {
    case 'city':
      return !isDependencyValue(dependsOn.province);
    case 'district':
      return (
        !isDependencyValue(dependsOn.province) &&
        !isDependencyValue(dependsOn.city)
      );
    case 'school':
      return (
        !isDependencyValue(dependsOn.province) &&
        !isDependencyValue(dependsOn.city) &&
        !isDependencyValue(dependsOn.district)
      );
    case 'college':
      // بدون `province` هم fetch می‌شود (فیلتر فقط عنوان).
      return false;
    default:
      return false;
  }
}

export function blockedByParentMessage(type: OrganizationField): string {
  switch (type) {
    case 'city':
      return 'ابتدا استان را انتخاب کنید.';
    case 'district':
      return 'ابتدا استان یا شهر را انتخاب کنید.';
    case 'school':
      return 'ابتدا استان، شهر یا منطقه را انتخاب کنید.';
    default:
      return 'ابتدا فیلد والد را انتخاب کنید.';
  }
}
