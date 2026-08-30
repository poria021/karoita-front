import { describe, expect, it } from 'vitest';

import {
  DOCUMENT_TITLE,
  DOCUMENT_TITLE_TEMPLATE,
  formatDocumentTitle,
  homePageTitle,
  privatePageMetadata,
  resolveBrowserTabTitle,
} from '@/lib/document-title';
import { RouteService } from '@/services/route.service';
import { SITE_NAME } from '@/lib/site-seo';

describe('document-title', () => {
  it('keeps the home tab as the brand name only', () => {
    expect(homePageTitle()).toEqual({ absolute: SITE_NAME });
    expect(DOCUMENT_TITLE.home).toBe('کارویتا');
  });

  it('uses a single template so module tabs stay "name | کارویتا"', () => {
    expect(DOCUMENT_TITLE_TEMPLATE).toBe(`%s | ${SITE_NAME}`);
    expect(formatDocumentTitle(DOCUMENT_TITLE.signIn)).toBe(
      'صفحه ورود | کارویتا'
    );
    expect(DOCUMENT_TITLE.systemsEntry).toBe('ورود به سامانه‌ها');
  });

  it('marks private surfaces noindex', () => {
    expect(privatePageMetadata(DOCUMENT_TITLE.signIn)).toEqual({
      title: 'صفحه ورود',
      robots: { index: false, follow: false },
    });
  });

  it('resolves client tab titles from pathname without English segment names', () => {
    expect(resolveBrowserTabTitle('/')).toBe('کارویتا');
    expect(resolveBrowserTabTitle('/login-select')).toBe(
      'ورود به سامانه‌ها | کارویتا'
    );
    expect(resolveBrowserTabTitle('/auth/login')).toBe(
      'صفحه ورود | کارویتا'
    );
    expect(
      resolveBrowserTabTitle(RouteService.karvita.dailyApprovals(), 'mentor_teacher')
    ).toBe('ارزیابی گزارش‌های فراگیران | کارویتا');
    expect(
      resolveBrowserTabTitle(RouteService.karvita.dashboard(), 'student')
    ).toBe('میز کار دانشجو | کارویتا');
  });
});
