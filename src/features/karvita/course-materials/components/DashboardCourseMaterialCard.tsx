'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { toSameOriginMediaUrl } from '@/services/files/resolve-nest-file-url';
import type { CourseMaterial } from '@/types/course-materials';
import { formatFileSize } from '@/utils/compressor';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type DashboardCourseMaterialCardProps = {
  material: CourseMaterial;
  /** صفحهٔ جزوهٔ همان درس (`/karvita/internships/:level/materials`). */
  courseHref?: string;
  className?: string;
};

/** بج نام درس — هم‌سبک بج نقش در ردیف اطلاعیه. */
function CourseLabelBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-kv-control bg-kv-brand-soft px-2 text-xs font-bold leading-none text-kv-brand-soft-fg">
      <FaIcon icon={faIcons.bookOpen} size="xs" />
      {label}
    </span>
  );
}

/**
 * ردیف جزوه در باکس میز کار — کلیک عنوان/درس می‌برد به صفحهٔ جزوهٔ همان درس.
 */
export function DashboardCourseMaterialCard({
  material,
  courseHref,
  className,
}: DashboardCourseMaterialCardProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const fileHref = material.fileUrl
    ? toSameOriginMediaUrl(material.fileUrl)
    : '';
  const meta = [
    material.sizeBytes > 0
      ? toPersianDigits(formatFileSize(material.sizeBytes))
      : null,
    material.createdAt ? formatNotificationTime(material.createdAt) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const hasDetails = Boolean(material.description || fileHref || meta);

  const titleBlock = (
    <>
      <CourseLabelBadge label={material.courseLabel} />
      <KvTypography
        variant="caption"
        weight="bold"
        as="h4"
        className="m-0 inline-flex h-6 min-w-0 items-center truncate leading-none text-kv-text-secondary"
      >
        {material.title}
      </KvTypography>
    </>
  );

  return (
    <article
      className={cn(
        'flex w-full flex-col gap-kv-micro py-kv-group text-start',
        className
      )}
    >
      <div className="flex h-6 w-full flex-nowrap items-center gap-kv-inline">
        {courseHref ? (
          <Link
            href={courseHref}
            prefetch
            className="flex h-6 min-w-0 flex-1 flex-nowrap items-center gap-kv-pair overflow-hidden rounded-kv-control focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
            aria-label={`رفتن به جزوه‌های ${material.courseLabel}`}
          >
            {titleBlock}
          </Link>
        ) : (
          <div className="flex h-6 min-w-0 flex-1 flex-nowrap items-center gap-kv-pair overflow-hidden">
            {titleBlock}
          </div>
        )}

        {hasDetails ? (
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            size="xs"
            className="h-6 max-h-6 min-h-0 shrink-0 self-center px-2 py-0 leading-none"
            aria-expanded={open}
            aria-controls={bodyId}
            iconPosition="end"
            icon={
              <FaIcon
                icon={faIcons.chevronDown}
                size="xs"
                className={cn(
                  'transition-transform motion-reduce:transition-none',
                  open && 'rotate-180'
                )}
              />
            }
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? 'بستن' : 'توضیحات'}
          </KvButton>
        ) : null}
      </div>

      {hasDetails && open ? (
        <div id={bodyId} className="flex flex-col gap-kv-micro">
          {material.description ? (
            <KvTypography
              variant="caption"
              tone="muted"
              as="p"
              className="block leading-relaxed"
            >
              <span className="whitespace-pre-line">{material.description}</span>
            </KvTypography>
          ) : null}
          {meta ? (
            <KvTypography variant="overline" tone="disabled" as="p">
              {meta}
            </KvTypography>
          ) : null}
          <div className="flex flex-wrap items-center gap-kv-inline">
            {courseHref ? (
              <KvButton asChild color="neutral" appearance="text" size="xs">
                <Link href={courseHref} prefetch>
                  صفحه جزوات درس
                </Link>
              </KvButton>
            ) : null}
            {fileHref ? (
              <a
                href={fileHref}
                download={material.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1 text-xs font-bold text-kv-brand hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
              >
                دانلود فایل
                <FaIcon icon={faIcons.download} size="xs" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
