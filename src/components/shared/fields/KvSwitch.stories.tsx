import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvSwitch } from './KvSwitch';

const meta = {
  title: 'Design System/Fields/KvSwitch',
  component: KvSwitch,
  tags: ['autodocs'],
  args: {
    label: 'دریافت اعلان پیامک',
    size: 'md',
    onCheckedChange: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof KvSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    'aria-label': 'فعال‌سازی حالت تاریک',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};
