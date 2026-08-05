'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

type SupervisorSelectionStartProps = {
  wasDropped: boolean;
  droppedSupervisorName: string | null;
  onStart: () => void;
};

export function SupervisorSelectionStart({
  wasDropped,
  droppedSupervisorName,
  onStart,
}: SupervisorSelectionStartProps) {
  const previousSupervisor = droppedSupervisorName?.trim() || 'راهنما';

  return (
    <div
      className={
        wasDropped
          ? 'flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-danger-border bg-kv-danger-soft/30'
          : 'flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-border bg-kv-surface-subtle/50'
      }
    >
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-kv-group px-kv-inset py-kv-block text-center"
        role="status"
      >
        <div
          className={
            wasDropped
              ? 'flex shrink-0 items-center justify-center text-kv-danger'
              : 'flex shrink-0 items-center justify-center text-kv-brand'
          }
          aria-hidden
        >
          <FaIcon
            icon={wasDropped ? faIcons.circleXmark : faIcons.graduationCap}
            size="xl"
          />
        </div>
        <div className="max-w-md space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            {wasDropped ? 'لغو انتخاب واحد قبلی' : 'زمان شروع انتخاب واحد فرارسیده'}
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            {wasDropped
              ? `متأسفانه به علت مغایرت مشخصات با فهرست استاد «${previousSupervisor}»، انتخاب واحد قبلی لغو شد. می‌توانید فرآیند را دوباره آغاز کنید.`
              : 'درگاه رسمی انتخاب واحد و رزرو ظرفیت استادان راهنما برای نیم‌سال جاری فعال است.'}
          </KvTypography>
        </div>
        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          onClick={onStart}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
          iconPosition="start"
        >
          شروع فرآیند انتخاب واحد و تعیین ناظر
        </KvButton>
      </div>
    </div>
  );
}
