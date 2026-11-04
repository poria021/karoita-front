'use client';

import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { BulletinsService } from '@/services/bulletins.service';
import { useUserStore } from '@/store/useUserStore';
import { faIcons } from '@/utils/iconMap';

import {
  isNearScrollEnd,
  useProgressiveListWindow,
} from '../hooks/useProgressiveListWindow';
import { BulletinCard } from './BulletinCard';
import { HubInboxBox } from './HubInboxBox';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'بارگذاری ناموفق بود.';
}

/** لیست فقط‌خواندنی — باکس با سقف ارتفاع؛ محتوا ۲۰تایی با اسکرول. */
export function BulletinsReceivedPanel() {
  const role = useUserStore((state) => state.activeUser?.role);
  const listRef = useRef<HTMLUListElement>(null);

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsDashboard, role],
    queryFn: () => BulletinsService.listDashboardBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: Boolean(role),
  });

  const rows = (query.data ?? []).filter(
    (row) => row.kind === 'announcement' && row.isActive
  );
  const { visible, hasMore, revealMore, total } = useProgressiveListWindow(rows);
  const error = query.error ? errorMessage(query.error) : null;

  function onListScroll() {
    const el = listRef.current;
    if (!el || !hasMore) return;
    if (isNearScrollEnd(el)) revealMore();
  }

  return (
    <HubInboxBox
      titleId="bulletins-received-title"
      title="اطلاعیه‌های دریافتی"
      count={total}
      defaultOpen
      icon={<FaIcon icon={faIcons.bell} size="sm" />}
    >
      {error ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <KvAlert
            variant="error"
            title="بارگذاری ناموفق بود"
            description={error}
            actions={
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={() => void query.refetch()}
              >
                تلاش مجدد
              </KvButton>
            }
          />
        </div>
      ) : query.isLoading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <KvTypography variant="caption" tone="muted" as="p">
            در حال بارگذاری دریافتی‌ها…
          </KvTypography>
        </div>
      ) : total === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <KvTypography variant="body" tone="muted" as="p" className="text-center">
            فعلاً اطلاعیه‌ای برای شما منتشر نشده است.
          </KvTypography>
        </div>
      ) : (
        <ul
          ref={listRef}
          onScroll={onListScroll}
          className="flex min-h-0 flex-1 list-none flex-col divide-y divide-kv-border/40 overflow-y-auto overscroll-contain"
        >
          {visible.map((item) => (
            <li key={item.id}>
              <BulletinCard bulletin={item} />
            </li>
          ))}
        </ul>
      )}
    </HubInboxBox>
  );
}
