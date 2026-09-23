'use client';

import { useCallback } from 'react';

import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
} from '@/types/daily-approvals';

import { useDailyApprovalsActions } from './useDailyApprovalsActions';
import { useDailyApprovalsChrome } from './useDailyApprovalsChrome';
import { useDailyApprovalsList } from './useDailyApprovalsList';
import { useDailyApprovalsTerms } from './useDailyApprovalsTerms';

/**
 * ترکیب صفحه — chrome / ترم / لیست / اکشن در هوک‌های جدا می‌مانند.
 * شکل خروجی تخت می‌ماند تا مصرف‌کننده‌های workspace نشکنند.
 */
export function useDailyApprovalsPage() {
  const chrome = useDailyApprovalsChrome();
  const {
    kind,
    setKind,
    query,
    setQuery,
    readFilter,
    setReadFilter,
    course,
    setCourse,
    termId,
    setTermId,
    listQuery,
    resetKey,
    courseOptions,
  } = chrome;

  const terms = useDailyApprovalsTerms({
    kind,
    setTermId,
  });
  const list = useDailyApprovalsList({
    kind,
    listQuery,
    readFilter,
    course,
    termId,
    termsReady: terms.termsReady,
    resetKey,
  });
  const actions = useDailyApprovalsActions({
    list,
    kind,
    termId,
  });

  const { clearSelection } = actions;

  const changeKind = useCallback(
    (next: DailyApprovalCourseKind) => {
      setKind(next);
      setCourse('all');
      clearSelection();
    },
    [clearSelection, setCourse, setKind]
  );

  const changeReadFilter = useCallback(
    (next: DailyApprovalReadFilter) => {
      setReadFilter(next);
      clearSelection();
    },
    [clearSelection, setReadFilter]
  );

  const changeCourse = useCallback(
    (next: DailyApprovalCourseFilter) => {
      setCourse(next);
      clearSelection();
    },
    [clearSelection, setCourse]
  );

  const changeTerm = useCallback(
    (nextTermId: string) => {
      setTermId(nextTermId);
      clearSelection();
    },
    [clearSelection, setTermId]
  );

  return {
    kind,
    changeKind,
    query,
    setQuery,
    readFilter,
    changeReadFilter,
    course,
    changeCourse,
    courseOptions,
    termId,
    changeTerm,
    terms: terms.terms,
    resetKey,
    trainees: list.items,
    isLoading: !terms.termsReady || list.isLoading,
    isLoadingMore: list.isLoadingMore,
    hasMore: list.hasMore,
    error: terms.termsError ?? list.error,
    loadMoreError: list.loadMoreError,
    loadMore: () => void list.loadMore(),
    retryLoadMore: () => {
      list.clearLoadMoreError();
      void list.loadMore();
    },
    reload: () => Promise.all([list.reload(), terms.refetchTerms()]),
    selectedTrainee: actions.selectedTrainee,
    selectTrainee: actions.selectTrainee,
    actionBusy: actions.actionBusy,
    dropTrainee: actions.dropTrainee,
    gradingOpen: actions.gradingOpen,
    gradingTrainee: actions.gradingTrainee,
    gradingWeek: actions.gradingWeek,
    passingScoreThreshold: terms.passingScoreThreshold,
    openWeekGrading: actions.openWeekGrading,
    closeWeekGrading: actions.closeWeekGrading,
    saveSupervisorWeek: actions.saveSupervisorWeek,
    saveMentorWeek: actions.saveMentorWeek,
    savePrincipalWeek: actions.savePrincipalWeek,
    bulkExtendOpen: actions.bulkExtendOpen,
    openBulkExtend: actions.openBulkExtend,
    closeBulkExtend: actions.closeBulkExtend,
    bulkExtendWeeks: actions.bulkExtendWeeks,
  };
}

export type UseDailyApprovalsPageReturn = ReturnType<
  typeof useDailyApprovalsPage
>;
