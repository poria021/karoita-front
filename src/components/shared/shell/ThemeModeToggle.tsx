'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { faIcons } from '@/utils/iconMap';

/**
 * سوییچ تم روشن/تاریک — هدر داشبورد.
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
      <span
        className="inline-flex h-11 w-[4.25rem] items-center justify-center"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex items-center gap-kv-pair">
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
  );
}
