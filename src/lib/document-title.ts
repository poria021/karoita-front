/**
 * عنوان تب مرورگر — منبع واحد برای مسیرهای عمومی/احراز هویت.
 * عنوان ماژول‌های داشبورد از `getModuleMeta` می‌آید (نه از اینجا)
 * تا با سایدبار یکی بماند.
 */
import type { Metadata } from 'next';

import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import { getModuleMeta } from '@/utils/moduleMeta';

import { SITE_NAME } from '@/lib/site-seo';

export const DOCUMENT_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const DOCUMENT_TITLE = {
  home: SITE_NAME,
  signIn: 'صفحه ورود',
  systemsEntry: 'ورود به سامانه‌ها',
  forgotPassword: 'بازیابی رمز عبور',
  offline: 'آفلاین',
  notFound: 'صفحه یافت نشد',
  error: 'خطا',
} as const;

export function formatDocumentTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`;
}

function normalizeDocumentPath(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** عنوان تب برای مسیر جاری — همان منطق metadata سرور، قابل استفاده در کلاینت. */
export function resolveBrowserTabTitle(
  pathname: string,
  role?: UserRole | null
): string {
  const path = normalizeDocumentPath(pathname);

  if (path === RouteService.marketing.home()) {
    return DOCUMENT_TITLE.home;
  }

  if (path === RouteService.marketing.loginSelect()) {
    return formatDocumentTitle(DOCUMENT_TITLE.systemsEntry);
  }

  if (path === RouteService.marketing.offline()) {
    return formatDocumentTitle(DOCUMENT_TITLE.offline);
  }

  if (
    path === RouteService.auth.login() ||
    path === RouteService.auth.register() ||
    path === RouteService.auth.adminGate()
  ) {
    return formatDocumentTitle(DOCUMENT_TITLE.signIn);
  }

  if (path === RouteService.auth.forgot()) {
    return formatDocumentTitle(DOCUMENT_TITLE.forgotPassword);
  }

  const internshipMatch = /^\/karvita\/internships\/(\d+)$/.exec(path);
  if (internshipMatch) {
    const level = Number(internshipMatch[1]);
    if (level >= 1 && level <= 4) {
      return formatDocumentTitle(
        getModuleMeta(RouteService.karvita.internshipSelection(level), role)
          .title
      );
    }
  }

  if (RouteService.karvita.isAppShellPath(path)) {
    return formatDocumentTitle(getModuleMeta(path, role).title);
  }

  if (RouteService.auth.isAuthPath(path)) {
    return formatDocumentTitle(DOCUMENT_TITLE.signIn);
  }

  return formatDocumentTitle(SITE_NAME);
}

export function privatePageMetadata(
  title: string,
  extras?: Metadata
): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
    ...extras,
  };
}

export function homePageTitle(): Metadata['title'] {
  return { absolute: DOCUMENT_TITLE.home };
}
