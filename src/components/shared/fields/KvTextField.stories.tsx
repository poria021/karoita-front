import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

import { KvTextField } from './KvTextField';

const meta = {
  title: 'Design System/Fields/KvTextField',
  component: KvTextField,
  tags: ['autodocs'],
  args: {
    label: 'نام و نام خانوادگی',
    placeholder: 'مثال: علی رضایی',
    required: true,
    size: 'md',
    onChange: fn(),
    onBlur: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'tel', 'password', 'number'],
    },
    scriptGuard: {
      control: 'select',
      options: ['auto', 'none', 'no-latin'],
    },
  },
} satisfies Meta<typeof KvTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithHint: Story = {
  args: {
    hint: 'نام باید مطابق مدارک رسمی باشد.',
    optionalHint: true,
    required: false,
  },
};

export const WithError: Story = {
  args: {
    error: 'این فیلد الزامی است.',
    defaultValue: '',
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    defaultValue: 'مقدار ثبت‌شده',
  },
};

export const WithStartIcon: Story = {
  args: {
    label: 'جستجو در نام',
    startIcon: <FaIcon icon={faIcons.user} size="sm" />,
    scriptGuard: 'none',
    required: false,
  },
};
