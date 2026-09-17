import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const getOpenCourseSelection = vi.fn();
const listBySemester = vi.fn();

vi.mock('@/services/internship-enrollment/real/student-enrollments.api', () => ({
  studentEnrollmentsApi: {
    getOpenCourseSelection: (...args: unknown[]) =>
      getOpenCourseSelection(...args),
    listBySemester: (...args: unknown[]) => listBySemester(...args),
  },
}));

vi.mock('@/lib/api-mode', () => ({ isMockApiMode: () => false }));

import { useInternshipLockedPaths } from './useInternshipLockedPaths';
import { RouteService } from '@/services/route.service';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function internshipPath(level: number) {
  return RouteService.karvita.internshipSelection(level);
}

describe('useInternshipLockedPaths', () => {
  beforeEach(() => {
    getOpenCourseSelection.mockReset();
    listBySemester.mockReset().mockResolvedValue([]);
  });

  it('returns empty set when role is null', () => {
    const { result } = renderHook(() => useInternshipLockedPaths(null), {
      wrapper,
    });
    expect(result.current.size).toBe(0);
    expect(getOpenCourseSelection).not.toHaveBeenCalled();
    expect(listBySemester).not.toHaveBeenCalled();
  });

  it('locks levels whose lesson is missing from open-course-selection', async () => {
    // فقط کارورزی ۱ در ترم باز است — status=true
    getOpenCourseSelection.mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [{ id: 'l1', title: 'کارورزی ۱', status: true }],
    });

    const { result } = renderHook(
      () => useInternshipLockedPaths('student'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.size).toBeGreaterThan(0));

    expect(result.current.has(internshipPath(1))).toBe(false);
    expect(result.current.has(internshipPath(2))).toBe(true);
    expect(result.current.has(internshipPath(3))).toBe(true);
    expect(result.current.has(internshipPath(4))).toBe(true);
  });

  it('locks a level whose lesson has status=false', async () => {
    getOpenCourseSelection.mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [
        { id: 'l1', title: 'کارورزی ۱', status: true },
        { id: 'l2', title: 'کارورزی ۲', status: false },
      ],
    });

    const { result } = renderHook(
      () => useInternshipLockedPaths('student'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.size).toBeGreaterThan(0));

    expect(result.current.has(internshipPath(1))).toBe(false);
    expect(result.current.has(internshipPath(2))).toBe(true);
  });

  it('unlocks a level the student already took before, even though admin has not opened it this term (passed, failed, or cancelled all count)', async () => {
    getOpenCourseSelection.mockResolvedValue({
      id: 'sem-2',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [
        { id: 'l1', title: 'کارورزی ۱', status: true },
        { id: 'l2', title: 'کارورزی ۲', status: false },
        { id: 'l3', title: 'کارورزی ۳', status: false },
      ],
    });
    listBySemester.mockResolvedValue([
      {
        id: 'sem-1',
        season: 'one',
        structure: 'semester',
        lessons: [
          {
            id: 'old-l2',
            semesterId: 'sem-1',
            title: 'کارورزی ۲',
            status: true,
            // کنسل‌شده هم یعنی «قبلاً باهاش کار داشته» — باید باز بماند
            enrolment: { id: 'e1', semesterId: 'sem-1', lessonId: 'old-l2', status: 'cancelled' },
          },
        ],
      },
    ]);

    const { result } = renderHook(
      () => useInternshipLockedPaths('student'),
      { wrapper }
    );

    await waitFor(() => expect(listBySemester).toHaveBeenCalled());
    await waitFor(() => expect(result.current.has(internshipPath(3))).toBe(true));

    expect(result.current.has(internshipPath(1))).toBe(false); // status:true همین ترم
    expect(result.current.has(internshipPath(2))).toBe(false); // قبلاً گرفته بوده (کنسل‌شده)
    expect(result.current.has(internshipPath(3))).toBe(true); // نه باز شده، نه قبلاً گرفته
  });

  it('locks all 4 levels when open-course-selection returns null', async () => {
    getOpenCourseSelection.mockResolvedValue(null);

    const { result } = renderHook(
      () => useInternshipLockedPaths('student'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.size).toBe(4));

    for (let i = 1; i <= 4; i++) {
      expect(result.current.has(internshipPath(i))).toBe(true);
    }
  });

  it('skill_learner only checks 2 levels', async () => {
    getOpenCourseSelection.mockResolvedValue({
      id: 'sem-1',
      season: 'one',
      structure: 'semester',
      courseSelection: true,
      lessons: [
        { id: 'l1', title: 'کارآموزی ۱', status: true },
        { id: 'l2', title: 'کارآموزی ۲', status: false },
      ],
    });

    const { result } = renderHook(
      () => useInternshipLockedPaths('skill_learner'),
      { wrapper }
    );

    await waitFor(() => expect(result.current.size).toBe(1));

    expect(result.current.has(internshipPath(1))).toBe(false);
    expect(result.current.has(internshipPath(2))).toBe(true);
    // skill_learner سطح ۳ و ۴ ندارد
    expect(result.current.has(internshipPath(3))).toBe(false);
    expect(result.current.has(internshipPath(4))).toBe(false);
  });
});
