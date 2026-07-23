'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { faIcons } from '@/utils/iconMap';

/**
 * سوییچ تم روشن/تاریک — هدر داشبورد.
 * موبایل: فقط آیکن قابل‌کلیک. دسکتاپ/تبلت: سوییچ + آیکن‌های خورشید/ماه.
 * تا mount شدن next-themes رندر نمی‌شود تا mismatch هیدریشن نداشته باشیم.
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
          className="inline-flex size-11 items-center justify-center md:hidden"
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
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <>
      <KvButton
        type="button"
        color="neutral"
        appearance="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}
        onClick={toggleTheme}
        icon={
          <FaIcon
            icon={isDark ? faIcons.sun : faIcons.moon}
            size="sm"
            className="text-kv-brand-soft-fg"
          />
        }
      />

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
