import type { UserRole } from '@/types/auth';

export type ReportFilterType = 'select' | 'text';

export type ReportFilterDef = {
  key: string;
  label: string;
  type: ReportFilterType;
  options?: readonly string[];
};

export type ReportColumnDef = {
  key: string;
  label: string;
};

export type ReportRow = Record<string, string>;

export type ReportDefinition = {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  comparable: boolean;
  grain: string;
  filters: readonly string[];
  columns: ReportColumnDef[];
  roleLabels?: Partial<Record<UserRole, string>>;
  roleColumns?: Partial<Record<UserRole, readonly string[]>>;
  rows: ReportRow[];
};

export type ReportsModuleMode = 'standard' | 'comparative';
