'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';

import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
  KvDialogTrigger,
} from './KvDialog';

const meta = {
  title: 'Design System/Overlays/KvDialog',
  component: KvDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof KvDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <KvDialog>
      <KvDialogTrigger asChild>
        <KvButton>باز کردن دیالوگ</KvButton>
      </KvDialogTrigger>
      <KvDialogContent size="md">
        <KvDialogHeader>
          <KvDialogTitle>عنوان دیالوگ</KvDialogTitle>
          <KvDialogDescription>
            توضیح کوتاه درباره محتوای این پنجره.
          </KvDialogDescription>
        </KvDialogHeader>
        <p className="py-kv-group text-xs font-medium text-kv-text-secondary">
          بدنه دیالوگ — فرم یا جزئیات بیشتر.
        </p>
        <KvDialogFooter>
          <KvButton appearance="secondary" color="neutral">
            بستن
          </KvButton>
          <KvButton>تأیید</KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  ),
};

export const Controlled: Story = {
  render: function ControlledDialog() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <KvButton onClick={() => setOpen(true)}>دیالوگ کنترل‌شده</KvButton>
        <KvDialog open={open} onOpenChange={setOpen}>
          <KvDialogContent size="lg">
            <KvDialogHeader>
              <KvDialogTitle>ویرایش پروفایل</KvDialogTitle>
              <KvDialogDescription>
                تغییرات پس از ذخیره اعمال می‌شوند.
              </KvDialogDescription>
            </KvDialogHeader>
            <KvDialogFooter>
              <KvButton
                appearance="secondary"
                color="neutral"
                onClick={() => setOpen(false)}
              >
                انصراف
              </KvButton>
              <KvButton onClick={() => setOpen(false)}>ذخیره</KvButton>
            </KvDialogFooter>
          </KvDialogContent>
        </KvDialog>
      </>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => (
    <KvDialog>
      <KvDialogTrigger asChild>
        <KvButton appearance="secondary" color="neutral">
          بدون دکمه ×
        </KvButton>
      </KvDialogTrigger>
      <KvDialogContent size="sm" showCloseButton={false}>
        <KvDialogHeader>
          <KvDialogTitle>اقدام اجباری</KvDialogTitle>
          <KvDialogDescription>
            کاربر باید یکی از دکمه‌های پایین را انتخاب کند.
          </KvDialogDescription>
        </KvDialogHeader>
        <KvDialogFooter>
          <KvButton>متوجه شدم</KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  ),
};
