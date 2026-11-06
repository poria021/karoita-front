import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvButton } from '@/components/shared/KvButton';

import { KvEmptyState } from './KvEmptyState';

const meta = {
  title: 'Design System/Feedback/KvEmptyState',
  component: KvEmptyState,
  tags: ['autodocs'],
  args: {
    title: 'موردی یافت نشد',
    description: 'هنوز رکوردی ثبت نشده یا فیلترها نتیجه‌ای ندارند.',
    tone: 'muted',
  },
  argTypes: {
    tone: {
      control: 'radio',
      options: ['muted', 'danger'],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-64 rounded-kv-control border border-kv-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KvEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    title: 'لیست خالی است',
    description: 'اولین مورد را اضافه کنید تا اینجا نمایش داده شود.',
    actions: (
      <>
        <KvButton appearance="secondary" color="neutral">
          وارد کردن از فایل
        </KvButton>
        <KvButton>افزودن مورد</KvButton>
      </>
    ),
  },
};

export const DangerTone: Story = {
  args: {
    tone: 'danger',
    title: 'بارگذاری ناموفق',
    description: 'داده‌ها در دسترس نیستند. اتصال را بررسی کنید.',
  },
};
