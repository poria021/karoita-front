import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvButton } from '@/components/shared/KvButton';

import { KvFeatureIntro } from './KvFeatureIntro';

const meta = {
  title: 'Design System/Layout/KvFeatureIntro',
  component: KvFeatureIntro,
  tags: ['autodocs'],
  args: {
    title: 'مدیریت کاربران',
    description: 'افزودن، ویرایش و مشاهده دسترسی اعضای تیم.',
  },
} satisfies Meta<typeof KvFeatureIntro>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <KvButton appearance="secondary" color="neutral">
          خروجی Excel
        </KvButton>
        <KvButton>کاربر جدید</KvButton>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    description: undefined,
  },
};
