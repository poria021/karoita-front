'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { CourseMaterial } from '@/types/course-materials';
import { faIcons } from '@/utils/iconMap';

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
 * ردیف جزوه در باکس میز کار — کل ردیف لینک است و مستقیم می‌برد به صفحهٔ
 * جزوه‌های همان درس.
 */
export function DashboardCourseMaterialCard({
  material,
  courseHref,
  className,
}: DashboardCourseMaterialCardProps) {
  const rowContent = (
    <>
      <CourseLabelBadge label={material.courseLabel} />
      <KvTypography
        variant="caption"
        weight="bold"
        as="h4"
        className="m-0 block h-6 min-w-0 flex-1 truncate text-ellipsis whitespace-nowrap leading-6 text-kv-text-secondary"
      >
        {material.title}
      </KvTypography>
    </>
  );

  return (
    <article className={cn('w-full py-kv-micro text-start', className)}>
      {courseHref ? (
        <Link
          href={courseHref}
          prefetch
          className={cn(
            'flex min-h-10 w-full min-w-0 flex-nowrap items-center gap-kv-pair overflow-hidden rounded-kv-control px-1.5',
            'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60',
            'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20'
          )}
          aria-label={`رفتن به جزوه‌های ${material.courseLabel}: ${material.title}`}
        >
          {rowContent}
        </Link>
      ) : (
        <div className="flex min-h-10 w-full min-w-0 flex-nowrap items-center gap-kv-pair overflow-hidden px-1.5">
          {rowContent}
        </div>
      )}
    </article>
  );
}
