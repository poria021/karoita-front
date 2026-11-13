'use client';

import { useId, useState, type ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type HubInboxBoxProps = {
  titleId: string;
  title: string;
  count?: number;
  icon: ReactNode;
  /** اکشن سمت چپ هدر (مثلاً «خواندن همه»). */
  headerAction?: ReactNode;
  /** در موبایل: پیش‌فرض باز یا بسته. دسکتاپ همیشه باز است. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * باکس دریافتی/اعلان هاب — ارتفاع ثابت تا با لود داده جابه‌جا نشود.
 * موبایل: هدر کشویی باز/بسته می‌شود؛ از `lg` به بالا همیشه باز می‌ماند.
 */
export function HubInboxBox({
  titleId,
  title,
  count,
  icon,
  headerAction,
  defaultOpen = true,
  children,
}: HubInboxBoxProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-kv-group overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft',
        'lg:h-[min(28rem,70dvh)]',
        open ? 'h-[min(28rem,70dvh)]' : 'h-auto min-h-0'
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline border-b border-kv-border-muted pb-kv-group">
        <button
          type="button"
          className={cn(
            'flex min-w-0 flex-1 items-center gap-kv-inline text-start',
            'rounded-kv-control focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
            // دسکتاپ: هدر فقط برچسب است؛ باز/بسته معنا ندارد.
            'lg:pointer-events-none lg:cursor-default'
          )}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg">
            {icon}
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-kv-pair">
            <KvTypography variant="subtitle" as="h3" id={titleId}>
              {title}
            </KvTypography>
            {count != null && count > 0 ? (
              <KvTypography
                variant="caption"
                tone="muted"
                as="span"
                className="font-medium"
              >
                ({toPersianDigits(String(count))})
              </KvTypography>
            ) : null}
          </div>
          <FaIcon
            icon={faIcons.chevronDown}
            size="sm"
            className={cn(
              'shrink-0 text-kv-text-faint transition-transform motion-reduce:transition-none lg:hidden',
              open && 'rotate-180 text-kv-brand'
            )}
          />
        </button>
        {headerAction ? (
          <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
            {headerAction}
          </div>
        ) : null}
      </header>

      <div
        id={panelId}
        role="region"
        aria-labelledby={titleId}
        className={cn(
          'flex min-h-0 flex-1 flex-col',
          open ? 'flex' : 'hidden lg:flex'
        )}
      >
        {children}
      </div>
    </section>
  );
}
