'use client';

import { useTheme } from 'next-themes';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { faIcons } from '@/utils/iconMap';

/**
 * سوییچ تم روشن/تاریک — هدر داشبورد.
 * موبایل: سگمنت خورشید|ماه (هر دو دیده می‌شوند تا سوییچ واضح باشد).
 * md+: سوییچ کلاسیک با آیکن‌های کناری.
 */
export function ThemeModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <>
      <KvButton
        type="button"
        color="neutral"
        appearance="ghost"
        size="icon-xs"
        aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="bg-kv-surface-subtle text-kv-brand-soft-fg shadow-kv-raised md:hidden"
        icon={<FaIcon icon={isDark ? faIcons.moon : faIcons.sun} size="sm" />}
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
