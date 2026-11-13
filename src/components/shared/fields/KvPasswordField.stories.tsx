import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvPasswordField } from './KvPasswordField';

const meta = {
  title: 'Design System/Fields/KvPasswordField',
  component: KvPasswordField,
  tags: ['autodocs'],
  args: {
    label: 'رمز عبور',
    placeholder: '********',
    required: true,
    onChange: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof KvPasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VisibleByDefault: Story = {
  args: {
    defaultVisible: true,
    defaultValue: 'SamplePass123',
    hint: 'فقط حروف لاتین مجاز است.',
  },
};

export const WithError: Story = {
  args: {
    error: 'رمز عبور باید حداقل ۸ کاراکتر باشد.',
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    defaultValue: '••••••••',
  },
};
