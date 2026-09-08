import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type { AcademicTerm, CourseCatalogItem, SyllabusConfigSnapshot } from '@/types/syllabus-config';

import {
  cacheKeyFor,
  getSyllabusTermPaneEpoch,
  invalidateSyllabusTermPanes,
  patchCachedSyllabusTerms,
  publishSyllabusSnapshot,
  syllabusSnapshotQueryKey,
  syncSyllabusDashboardTerms,
  type PendingNavigation,
  type SyllabusPageCache,
} from './syllabusPageCache';

function term(id: string, title: string): AcademicTerm {
  return {
    id,
    title,
    type: 'semester',
    isEnrollOpen: false,
    isTermOpen: false,
    enrollStart: '',
    termStart: '',
  };
}

function emptyPage(terms: AcademicTerm[], selectedTermId: string): SyllabusPageCache {
  return {
    terms,
    selectedTermId,
    selectedCourse: null,
    courses: [],
    weeks: [],
    offeredCatalogIds: [],
    professorCapacity: '15',
    passingThreshold: '70',
  };
}

describe('cacheKeyFor', () => {
  it('scopes cache by syllabus section', () => {
    expect(cacheKeyFor('term_settings')).toBe('syllabus-config::term_settings');
    expect(cacheKeyFor('course_offerings')).toBe(
      'syllabus-config::course_offerings'
    );
  });
});

describe('syllabusSnapshotQueryKey', () => {
  it('is shared by term settings and course offerings', () => {
    expect(syllabusSnapshotQueryKey).toEqual(['syllabus-config', 'snapshot']);
  });
});

describe('PendingNavigation hydrate shape', () => {
  it('accepts term and course variants used by unsaved guard', () => {
    const termPending: PendingNavigation = {
      kind: 'term',
      termId: 'term-1',
    };
    const course: CourseCatalogItem = {
      id: 'c1',
      title: 'کارورزی',
      type: 'internship',
    };
    const coursePending: PendingNavigation = {
      kind: 'course',
      course,
    };
    expect(termPending.kind).toBe('term');
    expect(coursePending.kind).toBe('course');
  });
});

describe('syncSyllabusDashboardTerms', () => {
  beforeEach(() => {
    useDashboardModuleCache.setState({ data: {}, chrome: {} });
  });

  it('updates terms on every syllabus section cache and clears a deleted selection', () => {
    const keep = term('keep', 'نیم‌سال اول');
    const gone = term('gone', 'نیم‌سال دوم');
    const setData = useDashboardModuleCache.getState().setData;
    setData(cacheKeyFor('term_settings'), emptyPage([keep, gone], 'keep'));
    setData(cacheKeyFor('course_offerings'), emptyPage([keep, gone], 'gone'));

    syncSyllabusDashboardTerms([keep]);

    const getData = useDashboardModuleCache.getState().getData;
    expect(
      getData<SyllabusPageCache>(cacheKeyFor('term_settings'))?.terms
    ).toEqual([keep]);
    expect(
      getData<SyllabusPageCache>(cacheKeyFor('course_offerings'))?.selectedTermId
    ).toBe('');
    expect(
      getData<SyllabusPageCache>(cacheKeyFor('course_offerings'))?.terms
    ).toEqual([keep]);
  });
});

describe('publishSyllabusSnapshot', () => {
  beforeEach(() => {
    useDashboardModuleCache.setState({ data: {}, chrome: {} });
  });

  it('writes shared query cache and sibling dashboard terms together', () => {
    const keep = term('keep', 'نیم‌سال اول');
    const gone = term('gone', 'نیم‌سال دوم');
    useDashboardModuleCache
      .getState()
      .setData(cacheKeyFor('course_offerings'), emptyPage([keep, gone], 'gone'));

    const queryClient = new QueryClient();
    const snapshot: SyllabusConfigSnapshot = {
      terms: [keep],
      offerings: {},
      internships: [],
      globalProfessorCapacity: 12,
      passingScoreThreshold: 70,
    };
    publishSyllabusSnapshot(queryClient, snapshot);

    expect(
      queryClient.getQueryData<SyllabusConfigSnapshot>(syllabusSnapshotQueryKey)
        ?.terms
    ).toEqual([keep]);
    expect(
      useDashboardModuleCache
        .getState()
        .getData<SyllabusPageCache>(cacheKeyFor('course_offerings'))?.terms
    ).toEqual([keep]);
  });
});

describe('patchCachedSyllabusTerms', () => {
  it('patches terms on an existing query snapshot', () => {
    const keep = term('keep', 'نیم‌سال اول');
    const gone = term('gone', 'نیم‌سال دوم');
    const queryClient = new QueryClient();
    queryClient.setQueryData<SyllabusConfigSnapshot>(syllabusSnapshotQueryKey, {
      terms: [keep, gone],
      offerings: {},
      internships: [],
      globalProfessorCapacity: 12,
      passingScoreThreshold: 70,
    });

    patchCachedSyllabusTerms(queryClient, [keep]);

    expect(
      queryClient.getQueryData<SyllabusConfigSnapshot>(syllabusSnapshotQueryKey)
        ?.terms
    ).toEqual([keep]);
  });
});

describe('invalidateSyllabusTermPanes', () => {
  it('increments the pane generation so stale cached term panes are ignored', () => {
    const before = getSyllabusTermPaneEpoch();
    const next = invalidateSyllabusTermPanes();

    expect(next).toBe(before + 1);
    expect(getSyllabusTermPaneEpoch()).toBe(before + 1);
  });
});
