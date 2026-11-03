'use client';

import { useMemo, useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { useMentorTeacherReports } from '@/features/karvita/daily-approvals/hooks/useMentorTeacherReports';
import { useUserStore } from '@/store/useUserStore';

import { MentorReportsFeedbackPanel } from './MentorReportsFeedbackPanel';
import { MentorReportsSummaryGrid } from './MentorReportsSummaryGrid';
import { MentorReportsTable } from './MentorReportsTable';

const tabs = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'reports', label: 'گزارش‌ها' },
  { id: 'feedback', label: 'بازخوردها' },
] as const;

export function MentorReportsPageClient() {
  const activeRole = useUserStore((state) => state.activeUser?.role);
  const { summary, students, feedback, isLoading, isError, role } =
    useMentorTeacherReports(
      activeRole === 'supervisor_professor' ? 'supervisor_professor' : 'mentor_teacher'
    );
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('overview');

  const visibleStudents = useMemo(() => {
    if (activeTab === 'overview') return students.slice(0, 3);
    return students;
  }, [activeTab, students]);

  if (isLoading) {
    return (
      <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
        <KvTypography variant="subtitle" as="p">
          در حال آماده‌سازی گزارش‌های معلم راهنما...
        </KvTypography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-kv-panel border border-kv-danger-border bg-kv-danger-soft p-kv-section">
        <KvTypography variant="subtitle" as="p" tone="danger">
          بارگذاری گزارش‌های معلم راهنما انجام نشد.
        </KvTypography>
      </div>
    );
  }

  return (
    <div className="space-y-kv-group">
      <header className="flex flex-col gap-kv-group border-b border-kv-border pb-kv-group sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            {role === 'supervisor_professor'
              ? 'گزارش‌گیری استاد راهنما'
              : 'گزارش‌گیری معلم راهنما'}
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            پایش وضعیت گزارش‌های هفتگی، بازخوردها و امتیازها در یک نگاه.
          </KvTypography>
        </div>

        <div className="flex flex-wrap gap-kv-pair">
          {tabs.map((tab) => (
            <KvButton
              key={tab.id}
              type="button"
              size="sm"
              appearance={activeTab === tab.id ? 'solid' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </KvButton>
          ))}
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
          <MentorReportsSummaryGrid items={summary} />
          <div className="grid gap-kv-group xl:grid-cols-[1.7fr_1fr]">
            <MentorReportsTable students={visibleStudents} />
            <MentorReportsFeedbackPanel items={feedback.slice(0, 2)} />
          </div>
        </>
      ) : null}

      {activeTab === 'reports' ? (
        <MentorReportsTable students={visibleStudents} />
      ) : null}

      {activeTab === 'feedback' ? (
        <MentorReportsFeedbackPanel items={feedback} />
      ) : null}
    </div>
  );
}
