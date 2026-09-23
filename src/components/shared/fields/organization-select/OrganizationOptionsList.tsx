import { Command } from 'cmdk';

import { KvTypography } from '@/components/shared/KvTypography';
import { kvOverlaySectionTopDividerClassName } from '@/components/shared/kvOverlayMenu';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { OrganizationOption } from '@/services/organization-options.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

import { blockedByParentMessage } from './dependency';

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-kv-pair px-3.5 py-3">
      <Spinner className="size-3.5" aria-hidden="true" />
      <KvTypography variant="caption" as="span">
        در حال بارگذاری...
      </KvTypography>
    </div>
  );
}

function ErrorRow() {
  return (
    <div className="px-3.5 py-2.5 text-center">
      <KvTypography variant="error" align="center">
        خطا در دریافت گزینه‌ها. دوباره تلاش کنید.
      </KvTypography>
    </div>
  );
}

function BlockedRow({ type }: { type: OrganizationField }) {
  return (
    <div className="px-3.5 py-2.5 text-center">
      <KvTypography variant="caption" align="center">
        {blockedByParentMessage(type)}
      </KvTypography>
    </div>
  );
}

function EmptyRow() {
  return (
    <Command.Empty className="px-3.5 py-2.5 text-center">
      <KvTypography variant="caption" align="center">
        نتیجه‌ای یافت نشد.
      </KvTypography>
    </Command.Empty>
  );
}

function LoadMoreFooter({
  isLoadingMore,
  hasMore,
  reachedLimit,
  onLoadMore,
}: {
  isLoadingMore: boolean;
  hasMore: boolean;
  reachedLimit: boolean;
  onLoadMore: () => void;
}) {
  if (isLoadingMore) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-kv-pair px-3.5 py-2.5',
          kvOverlaySectionTopDividerClassName
        )}
      >
        <Spinner className="size-3.5" aria-hidden="true" />
        <KvTypography variant="caption" as="span">
          در حال بارگذاری...
        </KvTypography>
      </div>
    );
  }

  if (hasMore) {
    return (
      <Command.Item
        value="__load-more__"
        onSelect={onLoadMore}
        className={cn(
          'cursor-pointer rounded-kv-control px-3.5 py-2.5 text-center text-xs font-bold outline-none data-[selected=true]:bg-kv-surface-muted',
          kvOverlaySectionTopDividerClassName
        )}
      >
        <KvTypography variant="label" tone="brand" as="span">
          نمایش ۱۰ مورد بعدی
        </KvTypography>
      </Command.Item>
    );
  }

  if (reachedLimit) {
    return (
      <div
        className={cn('px-3.5 py-2.5 text-center', kvOverlaySectionTopDividerClassName)}
      >
        <KvTypography variant="caption" align="center">
          نتایج زیاد است؛ جستجو را دقیق‌تر کنید.
        </KvTypography>
      </div>
    );
  }

  return null;
}

/**
 * بدنهٔ مشترک `Command.List` بین حالت تک‌انتخابی و چندانتخابی —
 * فقط رندر هر گزینه (`renderItem`) بین دو حالت فرق دارد.
 */
export function OrganizationOptionsList({
  type,
  isLoading,
  loadError,
  blockedByParent,
  items,
  renderItem,
  isLoadingMore,
  hasMore,
  reachedLimit,
  onLoadMore,
}: {
  type: OrganizationField;
  isLoading: boolean;
  loadError: unknown;
  blockedByParent: boolean;
  items: OrganizationOption[];
  renderItem: (option: OrganizationOption) => React.ReactNode;
  isLoadingMore: boolean;
  hasMore: boolean;
  reachedLimit: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading) return <LoadingRow />;
  if (loadError) return <ErrorRow />;
  if (blockedByParent) return <BlockedRow type={type} />;
  if (items.length === 0) return <EmptyRow />;

  return (
    <>
      {items.map(renderItem)}
      <LoadMoreFooter
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        reachedLimit={reachedLimit}
        onLoadMore={onLoadMore}
      />
    </>
  );
}
