import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvLabel } from './KvLabel';

const meta = {
  title: 'Design System/Fields/KvLabel',
  component: KvLabel,
  tags: ['autodocs'],
  args: {
    children: 'برچسب فیلد',
    htmlFor: 'demo-field',
  },
} satisfies Meta<typeof KvLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithControl: Story = {
  render: (args) => (
    <div className="space-y-2">
      <KvLabel {...args} />
      <input
        id="demo-field"
        className="h-11 w-full rounded-kv-control border border-kv-border px-3 text-xs"
        placeholder="ورودی نمونه"
      />
    </div>
  ),
};
