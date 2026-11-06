'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useState, type ComponentProps } from 'react';

import { KvButton } from '@/components/shared/KvButton';

import { KvConfirmationDialog } from './KvConfirmationDialog';

const meta = {
  title: 'Design System/Overlays/KvConfirmationDialog',
  component: KvConfirmationDialog,
  tags: ['autodocs'],
  args: {
    isOpen: false,
    title: 'حذف این مورد؟',
    description:
      'این عمل قابل بازگشت نیست. مطمئن هستید که می‌خواهید ادامه دهید؟',
    confirmText: 'بله، حذف شود',
    cancelText: 'انصراف',
    confirmVariant: 'default',
    confirmDisabled: false,
    onConfirm: fn(),
    onClose: fn(),
  },
  argTypes: {
    confirmVariant: {
      control: 'radio',
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof KvConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function ConfirmationDialogDemo(
  props: ComponentProps<typeof KvConfirmationDialog>
) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <KvButton onClick={() => setOpen(true)}>نمایش دیالوگ تأیید</KvButton>
      <KvConfirmationDialog
        {...props}
        isOpen={open}
        onClose={() => {
          props.onClose();
          setOpen(false);
        }}
        onConfirm={async () => {
          await props.onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
}

export const Playground: Story = {
  render: (args) => <ConfirmationDialogDemo {...args} isOpen={false} />,
};

export const Destructive: Story = {
  args: {
    confirmVariant: 'destructive',
    title: 'حذف دائمی سازمان',
    description: 'تمام داده‌های وابسته پاک می‌شوند.',
    confirmText: 'حذف',
  },
  render: (args) => <ConfirmationDialogDemo {...args} isOpen={false} />,
};

export const SlowConfirm: Story = {
  args: {
    title: 'ارسال درخواست',
    description: 'چند ثانیه طول می‌کشد.',
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }),
  },
  render: (args) => <ConfirmationDialogDemo {...args} isOpen={false} />,
};
