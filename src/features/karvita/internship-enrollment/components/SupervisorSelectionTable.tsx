'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { Badge } from '@/components/ui/badge';
import type { InternshipSupervisor } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type SupervisorSelectionTableProps = {
  supervisors: InternshipSupervisor[];
  isLoading: boolean;
  submittingId: string | null;
  onEnroll: (supervisorId: string) => void;
};

function capacityLabel(capacity: InternshipSupervisor['capacity']): string {
  return capacity === null ? 'نامحدود' : `${toPersianDigits(capacity)} نفر`;
}

export function SupervisorSelectionTable({
  supervisors,
  isLoading,
  submittingId,
  onEnroll,
}: SupervisorSelectionTableProps) {
  return (
    <div className="hidden min-h-0 flex-1 lg:block">
      <KvTableViewport isBusy={isLoading}>
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead />
              <KvTableHead>نام کامل استاد</KvTableHead>
              <KvTableHead>پردیس محل استقرار</KvTableHead>
              <KvTableHead align="center">روز حضور مجاز</KvTableHead>
              <KvTableHead align="center">ظرفیت باقیمانده</KvTableHead>
              <KvTableHead align="center">انتخاب و ثبت‌نام</KvTableHead>
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {isLoading ? (
              <KvTableBusy colSpan={6} />
            ) : supervisors.length === 0 ? (
              <KvTableEmpty colSpan={6}>
                <KvEmptyState title="موردی یافت نشد" />
              </KvTableEmpty>
            ) : (
              supervisors.map((supervisor, index) => (
                <KvTableRow key={supervisor.id}>
                  <KvTableRowIndexCell index={index} />
                  <KvTableCell emphasis>{supervisor.name}</KvTableCell>
                  <KvTableCell>{supervisor.college}</KvTableCell>
                  <KvTableCell align="center">
                    <div className="flex flex-wrap items-center justify-center gap-kv-pair">
                      {supervisor.days.map((day) => (
                        <Badge key={day} variant="brand">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </KvTableCell>
                  <KvTableCell align="center" emphasis>
                    {capacityLabel(supervisor.capacity)}
                  </KvTableCell>
                  <KvTableCell align="center">
                    <KvButton
                      type="button"
                      color="cta"
                      appearance="solid"
                      size="sm"
                      loading={submittingId === supervisor.id}
                      disabled={submittingId !== null}
                      onClick={() => onEnroll(supervisor.id)}
                      icon={<FaIcon icon={faIcons.check} size="xs" />}
                      iconPosition="start"
                    >
                      ثبت‌نام و رزرو
                    </KvButton>
                  </KvTableCell>
                </KvTableRow>
              ))
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
