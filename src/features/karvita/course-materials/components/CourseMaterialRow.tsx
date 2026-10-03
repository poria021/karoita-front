'use client';

import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import type { CourseMaterial } from '@/types/course-materials';
import { formatFileSize } from '@/utils/compressor';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type CourseMaterialRowProps = {
  material: CourseMaterial;
  /** نام درس در زیرعنوان؛ در فهرست یک‌درسی لازم نیست. */
  showCourse?: boolean;
  /** عملیات اضافه (مثلاً حذف) کنار دکمهٔ دانلود. */
  actions?: ReactNode;
};

function isImage(material: CourseMaterial): boolean {
  return material.mimeType.startsWith('image/');
}

/** پیش‌نمایش کوچک: تصویر واقعی برای عکس، وگرنه آیکن فایل. */
function MaterialPreview({ material }: { material: CourseMaterial }) {
  if (isImage(material)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
      <img
        src={material.fileUrl}
        alt=""
        loading="lazy"
        className="size-10 shrink-0 rounded-kv-control border border-kv-border bg-kv-surface-muted object-cover"
      />
    );
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
      <FaIcon
        icon={material.mimeType === 'application/pdf' ? faIcons.filePdf : faIcons.fileLines}
        size="sm"
      />
    </span>
  );
}

/** ردیف خلاصه: پیش‌نمایش + عنوان + زیرعنوان کوچک، و عملیات در انتهای ردیف. */
export function CourseMaterialRow({
  material,
  showCourse = false,
  actions,
}: CourseMaterialRowProps) {
  const subtitle = [
    showCourse ? material.courseLabel : null,
    material.description || null,
    toPersianDigits(formatFileSize(material.sizeBytes)),
    formatNotificationTime(material.createdAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-kv-pair rounded-kv-control border border-kv-border bg-kv-surface p-kv-pair text-start">
      <MaterialPreview material={material} />
      <div className="min-w-0 flex-1">
        <KvTypography variant="body" as="p" className="truncate font-bold">
          {material.title}
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="p" className="truncate">
          {subtitle}
        </KvTypography>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={material.fileUrl}
          download={material.fileName}
          aria-label={`دانلود ${material.title}`}
          className="inline-flex size-9 items-center justify-center rounded-kv-control text-kv-brand hover:bg-kv-brand-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
        >
          <FaIcon icon={faIcons.download} size="sm" />
        </a>
        {actions}
      </div>
    </div>
  );
}
