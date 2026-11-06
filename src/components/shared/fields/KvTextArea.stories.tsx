import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvTextArea } from './KvTextArea';

const meta = {
  title: 'Design System/Fields/KvTextArea',
  component: KvTextArea,
  tags: ['autodocs'],
  args: {
    label: 'توضیحات',
    placeholder: 'جزئیات را بنویسید…',
    rows: 4,
    onChange: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof KvTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OptionalWithHint: Story = {
  args: {
    optionalHint: true,
    required: false,
    hint: 'حداکثر ۵۰۰ کاراکتر.',
    maxLength: 500,
  },
};

export const WithError: Story = {
  args: {
    error: 'متن وارد شده کوتاه است.',
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    defaultValue: 'متن ثبت‌شده قبلی که قابل ویرایش نیست.',
  },
};
