import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvEmptyState } from '@/components/shared/KvEmptyState';

import {
  KvTable,
  KvTableBody,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from './KvTable';
import { KvTableEmpty } from './KvTableEmpty';

const meta = {
  title: 'Design System/Data Display/KvTableEmpty',
  component: KvTableEmpty,
  tags: ['autodocs'],
  args: {
    colSpan: 3,
    children: null,
  },
} satisfies Meta<typeof KvTableEmpty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <KvTable scrollable={false}>
      <KvTableHeader>
        <KvTableRow>
          <KvTableHead>نام</KvTableHead>
          <KvTableHead>نقش</KvTableHead>
          <KvTableHead align="end">وضعیت</KvTableHead>
        </KvTableRow>
      </KvTableHeader>
      <KvTableBody>
        <KvTableEmpty {...args}>
          <KvEmptyState
            title="نتیجه‌ای نیست"
            description="فیلترها را تغییر دهید یا مورد جدید اضافه کنید."
          />
        </KvTableEmpty>
      </KvTableBody>
    </KvTable>
  ),
};
