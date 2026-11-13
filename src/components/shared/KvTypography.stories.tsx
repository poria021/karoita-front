import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvTypography } from './KvTypography';

const meta = {
  title: 'Design System/Typography/KvTypography',
  component: KvTypography,
  tags: ['autodocs'],
  args: {
    variant: 'body',
    tone: 'default',
    children: 'متن نمونه برای نمایش تایپوگرافی کارویتا',
    truncate: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'display',
        'title',
        'subtitle',
        'nav',
        'body',
        'label',
        'caption',
        'overline',
        'error',
      ],
    },
    tone: {
      control: 'select',
      options: [
        'default',
        'muted',
        'disabled',
        'brand',
        'success',
        'warning',
        'danger',
        'info',
      ],
    },
    weight: {
      control: 'select',
      options: ['medium', 'bold', 'black'],
    },
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'],
    },
  },
} satisfies Meta<typeof KvTypography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DisplayTitle: Story = {
  render: () => (
    <div className="space-y-2">
      <KvTypography variant="display">عنوان صفحه</KvTypography>
      <KvTypography variant="subtitle" tone="muted">
        زیرعنوان توضیحی
      </KvTypography>
    </div>
  ),
};

export const SemanticTones: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <KvTypography variant="body" tone="success">
        عملیات موفق
      </KvTypography>
      <KvTypography variant="body" tone="warning">
        هشدار سیستم
      </KvTypography>
      <KvTypography variant="body" tone="danger">
        خطای اعتبارسنجی
      </KvTypography>
      <KvTypography variant="error">پیام خطای فیلد</KvTypography>
    </div>
  ),
};

export const Truncated: Story = {
  args: {
    variant: 'subtitle',
    truncate: true,
    children:
      'این متن بسیار طولانی است و در فضای محدود با ellipsis کوتاه می‌شود تا چیدمان نشکند.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
