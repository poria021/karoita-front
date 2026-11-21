import { describe, expect, it } from 'vitest';

import type { ReportAccessRoleRow } from '@/types/report-access';

import {
  buildReportAccessColumns,
  buildReportAccessMatrix,
  cellStateOf,
  describeCell,
} from './report-access-matrix';

const ROWS: ReportAccessRoleRow[] = [
  {
    roleId: 'school_principal',
    reports: [
      { slug: 'learners', access: 'default', status: 'active', enabled: true },
      { slug: 'attendance', access: 'default', status: 'active', enabled: true },
      { slug: 'teachers', access: 'optional', status: 'inactive', enabled: false },
    ],
  },
  {
    roleId: 'mentor_teacher',
    reports: [
      { slug: 'learners', access: 'default', status: 'active', enabled: true },
      { slug: 'attendance', access: 'optional', status: 'active', enabled: true },
    ],
  },
  { roleId: 'assistant_admin', reports: [] },
];

describe('report access matrix', () => {
  it('ستون‌ها در سه گروه لیستی، حضور و عملکرد و جمعاً ۱۵ گزارش‌اند', () => {
    const { themes, columns } = buildReportAccessColumns();
    expect(themes.map((t) => t.id)).toEqual([
      'lists',
      'attendance',
      'performance',
    ]);
    expect(themes.reduce((sum, t) => sum + t.span, 0)).toBe(columns.length);
    expect(columns).toHaveLength(15);
    expect(columns.filter((c) => c.groupStart)).toHaveLength(3);
  });

  it('حالت خانه: پیش‌فرض، اعطاشده، قابل‌اعطا و ممنوع', () => {
    const principal = ROWS[0];
    const teacher = ROWS[1];
    expect(cellStateOf(principal, 'learners')).toBe('default');
    expect(cellStateOf(teacher, 'attendance')).toBe('granted');
    expect(cellStateOf(principal, 'teachers')).toBe('available');
    expect(cellStateOf(principal, 'provinces')).toBe('none');
    expect(cellStateOf(undefined, 'learners')).toBe('none');
  });

  it('شمارنده‌های هر نقش و جمع کل', () => {
    const view = buildReportAccessMatrix(ROWS);
    // ترتیب طبق کاتالوگ نقش‌ها، نه ترتیب پاسخ API.
    expect(view.rows.map((r) => r.roleId)).toEqual([
      'mentor_teacher',
      'school_principal',
      'assistant_admin',
    ]);
    const principal = view.rows.find((r) => r.roleId === 'school_principal')!;
    expect(principal).toMatchObject({ active: 2, pending: 1, total: 3 });
    expect(view.totals).toEqual({
      active: 4,
      total: 5,
      pending: 1,
      rolesWithoutReport: 1,
    });
  });

  it('نقش‌هایی که API نداده در ماتریس نمی‌آیند', () => {
    expect(buildReportAccessMatrix([]).rows).toEqual([]);
  });

  it('جملهٔ توصیفی خانه', () => {
    const { columns } = buildReportAccessColumns();
    expect(describeCell('مدیر مدرسه', columns[0]!, 'default')).toBe(
      'مدیر مدرسه ← لیست فراگیران: پیش‌فرض و فعال'
    );
  });
});
