import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvFieldFrame } from './KvFieldFrame';

const meta = {
  title: 'Design System/Fields/KvFieldFrame',
  component: KvFieldFrame,
  tags: ['autodocs'],
  args: {
    id: 'frame-demo',
    label: 'برچسب فیلد',
    required: true,
    children: null,
  },
} satisfies Meta<typeof KvFieldFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const MockControl = () => (
  <div
    data-slot="mock-control"
    className="flex h-11 w-full items-center rounded-kv-control border border-kv-border bg-kv-field px-3.5 text-xs font-bold text-kv-text-placeholder"
  >
    کنترل فرزند (placeholder)
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <KvFieldFrame {...args}>
      <MockControl />
    </KvFieldFrame>
  ),
};

export const WithHint: Story = {
  args: {
    required: false,
    optionalHint: true,
    hint: 'راهنمای تکمیل فیلد.',
  },
  render: (args) => (
    <KvFieldFrame {...args}>
      <MockControl />
    </KvFieldFrame>
  ),
};

export const WithError: Story = {
  args: {
    error: 'مقدار وارد شده نامعتبر است.',
  },
  render: (args) => (
    <KvFieldFrame {...args}>
      <MockControl />
    </KvFieldFrame>
  ),
};

export const LockedLabel: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    required: false,
  },
  render: (args) => (
    <KvFieldFrame {...args}>
      <MockControl />
    </KvFieldFrame>
  ),
};
