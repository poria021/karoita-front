import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';

import {
  getOnboardingProgress,
  shouldShowOnboardingChecklist,
} from './onboardingProgress';

describe('getOnboardingProgress', () => {
  it('maps not_submitted to complete_docs current with profile CTA', () => {
    const progress = getOnboardingProgress({
      role: 'student',
      approved: false,
      docStatus: 'not_submitted',
    });

    expect(progress.percent).toBe(0);
    expect(progress.steps.map((s) => s.state)).toEqual([
      'current',
      'pending',
      'pending',
      'pending',
    ]);
    expect(progress.ctaHref).toBe(RouteService.karvita.profile('student'));
    expect(progress.ctaLabel).toContain('مدارک');
  });

  it('maps pending_admin to await_approval without CTA', () => {
    const progress = getOnboardingProgress({
      role: 'student',
      approved: false,
      docStatus: 'pending_admin',
    });

    expect(progress.percent).toBe(50);
    expect(progress.steps.find((s) => s.id === 'await_approval')?.state).toBe(
      'current'
    );
    expect(progress.ctaHref).toBeNull();
    expect(progress.ctaLabel).toBeNull();
  });

  it('maps rejected to failed await + profile fix CTA', () => {
    const progress = getOnboardingProgress({
      role: 'teacher',
      approved: false,
      docStatus: 'rejected',
    });

    expect(progress.percent).toBe(0);
    expect(progress.steps.find((s) => s.id === 'await_approval')?.state).toBe(
      'failed'
    );
    expect(progress.ctaHref).toBe(RouteService.karvita.profile('teacher'));
    expect(progress.ctaLabel).toContain('اصلاح');
  });

  it('maps approved to all done with dashboard CTA', () => {
    const progress = getOnboardingProgress({
      role: 'student',
      approved: true,
      docStatus: 'approved',
    });

    expect(progress.percent).toBe(100);
    expect(progress.steps.every((s) => s.state === 'done')).toBe(true);
    expect(progress.ctaHref).toBe(RouteService.karvita.dashboard());
  });
});

describe('shouldShowOnboardingChecklist', () => {
  it('hides for approved gated roles', () => {
    expect(
      shouldShowOnboardingChecklist({ role: 'student', approved: true })
    ).toBe(false);
  });

  it('shows for unapproved gated roles', () => {
    expect(
      shouldShowOnboardingChecklist({ role: 'student', approved: false })
    ).toBe(true);
  });

  it('never shows for super_admin (ungated)', () => {
    expect(
      shouldShowOnboardingChecklist({
        role: 'super_admin',
        approved: false,
      })
    ).toBe(false);
  });

  it('never shows for assistant_admin (ungated staff panel)', () => {
    expect(
      shouldShowOnboardingChecklist({
        role: 'assistant_admin',
        approved: false,
      })
    ).toBe(false);
  });
});
