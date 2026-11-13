import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvButton } from '@/components/shared/KvButton';

import {
  KvCard,
  KvCardAction,
  KvCardContent,
  KvCardDescription,
  KvCardFooter,
  KvCardHeader,
  KvCardTitle,
} from './KvCard';

const meta = {
  title: 'Design System/Layout/KvCard',
  component: KvCard,
  tags: ['autodocs'],
  args: {
    tone: 'surface',
    padding: 'md',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['surface', 'muted', 'danger'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof KvCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <KvCard {...args}>
      <KvCardHeader toolbar bordered>
        <KvCardTitle>کارت نمونه</KvCardTitle>
        <KvCardDescription>توضیح کوتاه درباره محتوای کارت</KvCardDescription>
        <KvCardAction>
          <KvButton size="sm" appearance="secondary" color="neutral">
            عملیات
          </KvButton>
        </KvCardAction>
      </KvCardHeader>
      <KvCardContent stacked>
        <p className="text-sm text-kv-text-secondary">
          بدنه کارت با فاصله‌گذاری استاندارد طراحی.
        </p>
      </KvCardContent>
      <KvCardFooter>
        <KvButton appearance="secondary" color="neutral">
          انصراف
        </KvButton>
        <KvButton>ذخیره</KvButton>
      </KvCardFooter>
    </KvCard>
  ),
};

export const MutedTone: Story = {
  args: { tone: 'muted' },
  render: (args) => (
    <KvCard {...args}>
      <KvCardContent>
        <KvCardTitle>پس‌زمینه ملایم</KvCardTitle>
        <KvCardDescription className="mt-2">
          برای بلوک‌های ثانویه و خلاصه وضعیت.
        </KvCardDescription>
      </KvCardContent>
    </KvCard>
  ),
};

export const DangerTone: Story = {
  args: { tone: 'danger', padding: 'md' },
  render: (args) => (
    <KvCard {...args}>
      <KvCardContent>
        <KvCardTitle>ناحیه خطا</KvCardTitle>
        <KvCardDescription className="mt-2">
          برای فرم‌های دارای خطای سراسری یا هشدار حذف.
        </KvCardDescription>
      </KvCardContent>
    </KvCard>
  ),
};
