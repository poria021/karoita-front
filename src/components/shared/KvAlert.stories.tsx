import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvButton } from '@/components/shared/KvButton';

import { KvAlert } from './KvAlert';

const meta = {
  title: 'Design System/Feedback/KvAlert',
  component: KvAlert,
  tags: ['autodocs'],
  args: {
    variant: 'info',
    title: 'راهنمای تکمیل پروفایل',
    description: 'برای دسترسی کامل، اطلاعات تماس خود را تکمیل کنید.',
    dismissible: false,
    defaultVisible: true,
    onDismiss: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof KvAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'ذخیره شد',
    description: 'تغییرات با موفقیت ثبت شد.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'نیاز به بررسی',
    description: 'برخی فیلدها هنوز تأیید نشده‌اند.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'خطا در ارسال',
    description: 'اتصال برقرار نشد. دوباره تلاش کنید.',
  },
};

export const WithActions: Story = {
  args: {
    variant: 'info',
    title: 'نسخه جدید موجود است',
    description: 'برای دریافت آخرین بهبودها، صفحه را بازنشانی کنید.',
    actions: (
      <>
        <KvButton size="sm" appearance="secondary" color="neutral">
          بعداً
        </KvButton>
        <KvButton size="sm">بازنشانی</KvButton>
      </>
    ),
  },
};

export const Dismissible: Story = {
  args: {
    dismissible: true,
    variant: 'success',
    title: 'پیام قابل بستن',
    description: 'با کلیک روی × این پیام پنهان می‌شود.',
  },
};
