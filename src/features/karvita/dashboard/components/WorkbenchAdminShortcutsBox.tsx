'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

export type WorkbenchAdminShortcutsBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type AdminShortcut = {
  id: string;
  label: string;
  href: string;
  icon: IconDefinition;
  /** ساخت حساب و تنظیمات ترم/کاتالوگ فقط مدیر ارشد؛ دستیار ندارد. */
  superAdminOnly?: boolean;
};

const SHORTCUTS: readonly AdminShortcut[] = [
  {
    id: 'user-creation',
    label: 'ساخت کاربر',
    href: RouteService.karvita.adminUserCreation(),
    icon: faIcons.userPlus,
    superAdminOnly: true,
  },
  {
    id: 'course-offerings',
    label: 'ارائهٔ دروس',
    href: RouteService.karvita.syllabusCourseOfferings(),
    icon: faIcons.bookOpen,
  },
  {
    id: 'term-settings',
    label: 'تنظیمات ترم',
    href: RouteService.karvita.syllabusTermSettings(),
    icon: faIcons.listCheck,
    superAdminOnly: true,
  },
  {
    id: 'course-catalog',
    label: 'کاتالوگ دروس',
    href: RouteService.karvita.syllabusCourseCatalog(),
    icon: faIcons.graduationCap,
    superAdminOnly: true,
  },
  {
    id: 'report-access',
    label: 'دسترسی گزارش‌ها',
    href: RouteService.karvita.reportAccess(),
    icon: faIcons.key,
  },
  {
    id: 'landing-cms',
    label: 'محتوای لندینگ',
    href: RouteService.karvita.landingCms(),
    icon: faIcons.image,
  },
];

/** میان‌برهای قابل‌نمایش برای نقش؛ دستیار مدیر ارشد موارد فقط‌مدیر را نمی‌بیند. */
export function adminShortcutsFor(role: UserRole): AdminShortcut[] {
  return SHORTCUTS.filter(
    (shortcut) => !shortcut.superAdminOnly || role === 'super_admin'
  );
}

/**
 * دکمه‌های مدیریتی میز کار ارشد: هر میان‌بر یک KvButton خنثی با آیکون و همان
 * سطح/بردر باکس‌های میز کار؛ نزدیک هم و از بالای سلول (هم‌ردیف دایره). بدون API.
 */
export function WorkbenchAdminShortcutsBox({
  role,
  className,
  style,
}: WorkbenchAdminShortcutsBoxProps) {
  const shortcuts = adminShortcutsFor(role);

  return (
    <ul
      aria-label="میان‌برهای مدیریتی"
      style={style}
      className={cn(
        'grid h-full min-h-0 min-w-0 list-none grid-cols-2 content-start gap-kv-pair',
        className
      )}
    >
      {shortcuts.map((shortcut) => (
        <li key={shortcut.id} className="min-w-0">
          <KvButton
            asChild
            color="neutral"
            appearance="solid"
            size="md"
            fullWidth
            className="border-kv-border/70 bg-kv-surface font-bold text-kv-text shadow-kv-soft can-hover:hover:bg-kv-surface-muted/40"
          >
            <Link href={shortcut.href} prefetch>
              <FaIcon icon={shortcut.icon} size="sm" aria-hidden />
              <span className="min-w-0 truncate">{shortcut.label}</span>
            </Link>
          </KvButton>
        </li>
      ))}
    </ul>
  );
}
