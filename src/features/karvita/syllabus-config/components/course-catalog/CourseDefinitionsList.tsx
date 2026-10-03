'use client';

import { AppTabs, AppTabsList, AppTabsTrigger } from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { AcademicTermType, CourseDefinition } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { COURSE_AUDIENCE_OPTIONS } from '../../constants';
import type { UseCourseCatalogPageReturn } from '../../hooks/useCourseCatalogPage';

type CourseDefinitionsListProps = Pick<
  UseCourseCatalogPageReturn,
  | 'listAudience'
  | 'changeListAudience'
  | 'audienceCounts'
  | 'listCourses'
  | 'isLoading'
  | 'form'
  | 'startEdit'
  | 'requestDelete'
  | 'pendingActiveId'
  | 'toggleCourseActive'
>;

export function CourseDefinitionsList(props: CourseDefinitionsListProps) {
  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex flex-wrap items-center justify-between gap-kv-pair border-b border-kv-border pb-kv-pair">
          <div className="flex min-w-0 items-center gap-kv-pair">
            <KvCardTitleIcon icon={faIcons.bookOpen} />
            <KvTypography variant="subtitle" weight="black" as="h4">
              دروس تعریف‌شده
            </KvTypography>
          </div>
          <AppTabs
            value={props.listAudience}
            onValueChange={(value) =>
              props.changeListAudience(value as AcademicTermType)
            }
            gridCols={2}
          >
            <AppTabsList aria-label="فیلتر پنل دروس">
              {COURSE_AUDIENCE_OPTIONS.map((option) => (
                <AppTabsTrigger key={option.value} value={option.value}>
                  {option.label} ({toPersianDigits(String(props.audienceCounts[option.value]))})
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>
        </div>

        <div aria-busy={props.isLoading || undefined} className="space-y-kv-pair">
          {props.isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner className="size-5 text-kv-brand" aria-label="در حال بارگذاری دروس" />
            </div>
          ) : props.listCourses.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-kv-control border border-dashed border-kv-border p-kv-group text-center">
              <KvTypography variant="body" tone="muted">
                هنوز درسی برای این پنل تعریف نشده است.
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                از فرم «تعریف درس جدید» اولین درس را بسازید.
              </KvTypography>
            </div>
          ) : (
            props.listCourses.map((course) => (
              <CourseDefinitionRow
                key={course.id}
                course={course}
                isEditing={props.form.editId === course.id}
                pendingActive={props.pendingActiveId === course.id}
                hasPendingActive={Boolean(props.pendingActiveId)}
                onEdit={props.startEdit}
                onDelete={props.requestDelete}
                onToggleActive={props.toggleCourseActive}
              />
            ))
          )}
        </div>
      </KvCardContent>
    </KvCard>
  );
}

type CourseDefinitionRowProps = {
  course: CourseDefinition;
  isEditing: boolean;
  pendingActive: boolean;
  hasPendingActive: boolean;
  onEdit: (course: CourseDefinition) => void;
  onDelete: (course: CourseDefinition) => void;
  onToggleActive: (course: CourseDefinition, isActive: boolean) => unknown;
};

function CourseDefinitionRow({
  course,
  isEditing,
  pendingActive,
  hasPendingActive,
  onEdit,
  onDelete,
  onToggleActive,
}: CourseDefinitionRowProps) {
  const hasSubs = course.subModules.length > 0;

  return (
    <div
      className={cn(
        'space-y-kv-pair rounded-kv-control border bg-kv-surface p-kv-group',
        isEditing ? 'border-kv-brand-border' : 'border-kv-border',
        !course.isActive && 'opacity-70'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-kv-pair">
        <div className="min-w-0 space-y-1">
          <KvTypography variant="subtitle" weight="black" as="h4" truncate>
            {toPersianDigits(course.title)}
          </KvTypography>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={hasSubs ? 'brand' : 'info'}>
              {hasSubs
                ? `${toPersianDigits(String(course.subModules.length))} زیرمجموعه`
                : 'ماژول مستقل'}
            </Badge>
            <Badge variant={course.isActive ? 'success' : 'default'}>
              {course.isActive ? 'فعال' : 'غیرفعال'}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="flex items-center gap-1.5 pe-1">
            {pendingActive ? (
              <Spinner className="size-3.5 text-kv-brand" aria-hidden="true" />
            ) : null}
            <KvSwitch
              size="sm"
              checked={course.isActive}
              disabled={hasPendingActive}
              aria-label={`وضعیت درس ${course.title}`}
              onCheckedChange={(checked) => onToggleActive(course, checked)}
            />
          </div>
          <KvButton
            type="button"
            appearance="text"
            color="neutral"
            size="sm"
            aria-label={`ویرایش ${course.title}`}
            icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
            onClick={() => onEdit(course)}
          />
          <KvButton
            type="button"
            appearance="text"
            color="error"
            size="sm"
            aria-label={`حذف ${course.title}`}
            icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
            onClick={() => onDelete(course)}
          />
        </div>
      </div>

      {hasSubs ? (
        <ol className="flex flex-wrap gap-1.5">
          {course.subModules.map((sub, index) => (
            <li
              key={sub.id}
              className="inline-flex items-center gap-1 rounded-kv-control border border-kv-border-muted bg-kv-surface-subtle px-2 py-1 text-xs text-kv-text-secondary"
            >
              <span className="font-bold text-kv-brand-soft-fg">
                {toPersianDigits(String(index + 1))}.
              </span>
              {toPersianDigits(sub.title)}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
