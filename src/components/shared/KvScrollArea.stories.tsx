import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvScrollArea } from './KvScrollArea';

const meta = {
  title: 'Design System/Layout/KvScrollArea',
  component: KvScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof KvScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const LONG_LIST = Array.from({ length: 24 }, (_, index) => (
  <p key={index} className="border-b border-kv-border-muted py-2 text-xs font-medium">
    آیتم لیست شماره {index + 1}
  </p>
));

export const Playground: Story = {
  render: () => (
    <KvScrollArea className="h-48 max-w-md rounded-kv-control border border-kv-border p-kv-group">
      {LONG_LIST}
    </KvScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <KvScrollArea className="max-w-md overflow-x-auto rounded-kv-control border border-kv-border p-kv-group">
      <div className="flex w-max gap-4">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="flex h-20 w-32 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface-muted text-xs font-bold"
          >
            ستون {index + 1}
          </div>
        ))}
      </div>
    </KvScrollArea>
  ),
};
