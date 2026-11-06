import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvBusySurface } from './KvBusySurface';

const meta = {
  title: 'Design System/Feedback/KvBusySurface',
  component: KvBusySurface,
  tags: ['autodocs'],
  args: {
    label: 'در حال دریافت اطلاعات',
    tableViewport: false,
  },
} satisfies Meta<typeof KvBusySurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TableViewport: Story = {
  args: {
    tableViewport: true,
    label: 'در حال بارگذاری جدول…',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'لطفاً چند لحظه صبر کنید',
  },
};
