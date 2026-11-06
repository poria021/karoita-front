import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvMobileNumberField } from './KvMobileNumberField';

const meta = {
  title: 'Design System/Fields/KvMobileNumberField',
  component: KvMobileNumberField,
  tags: ['autodocs'],
  args: {
    label: 'شماره موبایل',
    required: true,
    onChange: fn(),
  },
} satisfies Meta<typeof KvMobileNumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: '9123456789',
  },
};

export const WithError: Story = {
  args: {
    error: 'شماره موبایل معتبر نیست.',
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    defaultValue: '9123456789',
  },
};
