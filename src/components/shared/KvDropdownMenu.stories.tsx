import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { KvButton } from '@/components/shared/KvButton';

import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuGroup,
  KvDropdownMenuItem,
  KvDropdownMenuLabel,
  KvDropdownMenuSeparator,
  KvDropdownMenuTrigger,
} from './KvDropdownMenu';

const meta = {
  title: 'Design System/Overlays/KvDropdownMenu',
  component: KvDropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof KvDropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <KvDropdownMenu>
      <KvDropdownMenuTrigger asChild>
        <KvButton appearance="secondary" color="neutral">
          منوی عملیات
        </KvButton>
      </KvDropdownMenuTrigger>
      <KvDropdownMenuContent align="end">
        <KvDropdownMenuLabel>گزینه‌ها</KvDropdownMenuLabel>
        <KvDropdownMenuSeparator />
        <KvDropdownMenuGroup>
          <KvDropdownMenuItem onSelect={fn()}>ویرایش</KvDropdownMenuItem>
          <KvDropdownMenuItem onSelect={fn()}>تکثیر</KvDropdownMenuItem>
          <KvDropdownMenuSeparator />
          <KvDropdownMenuItem variant="destructive" onSelect={fn()}>
            حذف
          </KvDropdownMenuItem>
        </KvDropdownMenuGroup>
      </KvDropdownMenuContent>
    </KvDropdownMenu>
  ),
};
