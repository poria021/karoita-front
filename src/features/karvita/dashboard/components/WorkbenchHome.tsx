'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import { faIcons, iconMap } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { getLiveWorkbenchShortcuts } from '@/utils/workbenchShortcuts';

type WorkbenchHomeProps = {
  /** Greeting line under the title (role-agnostic copy). */
  subtitle: string;
  emptyDescription: string;
};

/**
 * Quiet organizational workbench — welcome + live module shortcuts only.
 */
export function WorkbenchHome({
  subtitle,
  emptyDescription,
}: WorkbenchHomeProps) {
  const activeUser = useUserStore((state) => state.activeUser);
  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const shortcuts = getLiveWorkbenchShortcuts(activeUser.role);
  const displayName =
    [activeUser.firstName, activeUser.lastName].filter(Boolean).join(' ') ||
    strategy.label;

  return (
    <div className="flex w-full flex-col gap-kv-section">
      <header className="flex flex-col gap-kv-pair">
        <KvTypography variant="title" as="h2">
          خوش آمدید، {displayName}
        </KvTypography>
        <KvTypography variant="body" tone="muted" as="p">
          {subtitle}
        </KvTypography>
      </header>

      {shortcuts.length === 0 ? (
        <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
          <KvTypography variant="subtitle" as="p">
            میان‌بر فعالی نیست
          </KvTypography>
          <div className="mt-kv-pair">
            <KvTypography variant="body" tone="muted" as="p">
              {emptyDescription}
            </KvTypography>
          </div>
        </div>
      ) : (
        <nav aria-label="میان‌برهای میز کار">
          <ul className="grid list-none gap-kv-pair sm:grid-cols-2 lg:grid-cols-3">
            {shortcuts.map((item) => {
              const icon = iconMap[item.icon] ?? faIcons.folderOpen;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    prefetch={false}
                    className="flex min-h-11 items-center gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group text-start shadow-kv-raised transition-colors hover:border-kv-border-strong hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
                      <FaIcon icon={icon} size="sm" />
                    </span>
                    <KvTypography variant="subtitle" as="span" truncate>
                      {item.title}
                    </KvTypography>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
