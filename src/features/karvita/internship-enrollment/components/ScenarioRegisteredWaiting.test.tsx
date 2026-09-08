/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { InternshipEnrollmentSummary } from '@/types/internship-enrollment';

import { ScenarioRegisteredWaiting } from './ScenarioRegisteredWaiting';

afterEach(() => {
  cleanup();
});

const BASE_ENROLLMENT: InternshipEnrollmentSummary = {
  supervisorName: 'دکتر احمدی',
  attendanceDaysLabel: 'شنبه و یکشنبه',
  schoolId: 's1',
  schoolName: 'دبیرستان نمونه',
  mentorId: 'm1',
  mentorName: 'آقای رضایی',
  courseTitle: 'کارورزی ۱',
  termTitle: 'نیم‌سال اول ۱۴۰۳',
  status: 'active',
  removalPending: false,
  isTermArchived: false,
  weeks: [],
  progressiveGrade: { gradedCount: 0, final20: null },
};

describe('ScenarioRegisteredWaiting', () => {
  it('shows enrollment details in the card', () => {
    render(<ScenarioRegisteredWaiting enrollment={BASE_ENROLLMENT} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('دکتر احمدی')).toBeInTheDocument();
    expect(screen.getByText('شنبه و یکشنبه')).toBeInTheDocument();
    expect(screen.getByText('دبیرستان نمونه')).toBeInTheDocument();
    expect(screen.getByText('آقای رضایی')).toBeInTheDocument();
  });

  it('falls back to مشخص نشده when optional fields are null', () => {
    render(
      <ScenarioRegisteredWaiting
        enrollment={{ ...BASE_ENROLLMENT, schoolName: null, mentorName: null }}
      />
    );
    expect(screen.getAllByText('مشخص نشده').length).toBeGreaterThanOrEqual(2);
  });

  it('shows cancel button only when onCancel is provided', () => {
    const { rerender } = render(
      <ScenarioRegisteredWaiting enrollment={BASE_ENROLLMENT} />
    );
    expect(screen.queryByRole('button', { name: /لغو/ })).toBeNull();

    rerender(
      <ScenarioRegisteredWaiting
        enrollment={BASE_ENROLLMENT}
        onCancel={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByRole('button', { name: /لغو/ })).toBeInTheDocument();
  });

  it('calls onCancel and shows loading state while pending', async () => {
    let resolve!: () => void;
    const onCancel = vi.fn(
      () => new Promise<void>((r) => { resolve = r; })
    );

    render(
      <ScenarioRegisteredWaiting enrollment={BASE_ENROLLMENT} onCancel={onCancel} />
    );

    const btn = screen.getByRole('button', { name: /لغو/ });
    await userEvent.click(btn);

    expect(onCancel).toHaveBeenCalledOnce();
    expect(btn).toBeDisabled();

    resolve();
    await vi.waitFor(() => expect(btn).not.toBeDisabled());
  });
});
