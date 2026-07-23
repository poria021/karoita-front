'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

/**
 * سوییچ تم روشن/تاریک — هدر داشبورد.
 * موبایل: سگمنت خورشید|ماه (هر دو دیده می‌شوند تا سوییچ واضح باشد).
 * md+: سوییچ کلاسیک با آیکن‌های کناری.
 */
export function ThemeModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <span
          className="inline-flex h-9 w-[4.5rem] items-center justify-center md:hidden"
          aria-hidden
        />
        <span
          className="hidden h-11 w-[4.25rem] items-center justify-center md:inline-flex"
          aria-hidden
        />
      </>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <div
        role="group"
        aria-label="حالت نمایش"
        className="inline-flex h-9 items-center gap-0.5 md:hidden"
      >
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="icon-xs"
          aria-label="حالت روشن"
          aria-pressed={!isDark}
          onClick={() => setTheme('light')}
          className={cn(
            !isDark
              ? 'bg-kv-surface text-kv-brand-soft-fg shadow-kv-raised'
              : 'text-kv-text-faint'
          )}
          icon={<FaIcon icon={faIcons.sun} size="sm" />}
        />
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="icon-xs"
          aria-label="حالت تاریک"
          aria-pressed={isDark}
          onClick={() => setTheme('dark')}
          className={cn(
            isDark
              ? 'bg-kv-surface text-kv-brand-soft-fg shadow-kv-raised'
              : 'text-kv-text-faint'
          )}
          icon={<FaIcon icon={faIcons.moon} size="sm" />}
        />
      </div>

      <div className="hidden items-center gap-kv-pair md:flex">
        <FaIcon
          icon={faIcons.sun}
          size="sm"
          className={isDark ? 'text-kv-text-faint' : 'text-kv-brand-soft-fg'}
          aria-hidden
        />
        <KvSwitch
          size="sm"
          checked={isDark}
          onCheckedChange={(checked) => {
            setTheme(checked ? 'dark' : 'light');
          }}
          aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}
          className="data-[state=checked]:bg-kv-brand"
        />
        <FaIcon
          icon={faIcons.moon}
          size="sm"
          className={isDark ? 'text-kv-brand-soft-fg' : 'text-kv-text-faint'}
          aria-hidden
        />
      </div>
    </>
  );
}
