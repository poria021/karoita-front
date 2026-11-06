import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from './KvTable';

const meta = {
  title: 'Design System/Data Display/KvTable',
  component: KvTable,
  tags: ['autodocs'],
  args: {
    scrollable: true,
  },
} satisfies Meta<typeof KvTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_ROWS = [
  { id: '۱', name: 'علی رضایی', role: 'مدیر', status: 'فعال' },
  { id: '۲', name: 'مریم احمدی', role: 'کارشناس', status: 'در انتظار' },
  { id: '۳', name: 'رضا کریمی', role: 'پشتیبان', status: 'فعال' },
];

export const Playground: Story = {
  render: (args) => (
    <KvTable {...args}>
      <KvTableHeader>
        <KvTableRow>
          <KvTableHead align="center">ردیف</KvTableHead>
          <KvTableHead>نام</KvTableHead>
          <KvTableHead>نقش</KvTableHead>
          <KvTableHead align="end">وضعیت</KvTableHead>
        </KvTableRow>
      </KvTableHeader>
      <KvTableBody>
        {SAMPLE_ROWS.map((row) => (
          <KvTableRow key={row.id}>
            <KvTableCell align="center" mono>
              {row.id}
            </KvTableCell>
            <KvTableCell emphasis>{row.name}</KvTableCell>
            <KvTableCell>{row.role}</KvTableCell>
            <KvTableCell align="end">{row.status}</KvTableCell>
          </KvTableRow>
        ))}
      </KvTableBody>
    </KvTable>
  ),
};

export const InteractiveRow: Story = {
  render: () => (
    <KvTable>
      <KvTableHeader>
        <KvTableRow>
          <KvTableHead>نام</KvTableHead>
          <KvTableHead align="end">عمل</KvTableHead>
        </KvTableRow>
      </KvTableHeader>
      <KvTableBody>
        <KvTableRow interactive selected onClick={fn()}>
          <KvTableCell emphasis>ردیف انتخاب‌شده</KvTableCell>
          <KvTableCell align="end">کلیک یا Enter</KvTableCell>
        </KvTableRow>
        <KvTableRow interactive onClick={fn()}>
          <KvTableCell>ردیف دوم</KvTableCell>
          <KvTableCell align="end">—</KvTableCell>
        </KvTableRow>
      </KvTableBody>
    </KvTable>
  ),
};
