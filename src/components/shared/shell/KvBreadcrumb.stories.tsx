import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvBreadcrumb } from './KvBreadcrumb';

const meta = {
  title: 'Design System/Layout/KvBreadcrumb',
  component: KvBreadcrumb,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'داشبورد', href: '/dashboard' },
      { label: 'کاربران', href: '/dashboard/users' },
      { label: 'جزئیات کاربر' },
    ],
  },
} satisfies Meta<typeof KvBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SingleCrumb: Story = {
  args: {
    items: [{ label: 'تنها سطح' }],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: 'خانه', href: '/' },
      { label: 'مدیریت', href: '/admin' },
      { label: 'گزارش‌ها', href: '/admin/reports' },
      { label: 'فروش ماهانه', href: '/admin/reports/sales' },
      { label: 'آذر ۱۴۰۴' },
    ],
  },
};
