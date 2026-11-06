import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvButton } from './KvButton';
import { KvButtonGroup } from './KvButtonGroup';

const meta = {
  title: 'Design System/Layout/KvButtonGroup',
  component: KvButtonGroup,
  tags: ['autodocs'],
  args: {
    align: 'start',
    fullWidth: false,
    children: null,
  },
  argTypes: {
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'],
    },
  },
} satisfies Meta<typeof KvButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <KvButtonGroup {...args}>
      <KvButton appearance="secondary" color="neutral">
        انصراف
      </KvButton>
      <KvButton>تأیید</KvButton>
    </KvButtonGroup>
  ),
};

export const EndAligned: Story = {
  args: { align: 'end' },
  render: (args) => (
    <KvButtonGroup {...args}>
      <KvButton appearance="secondary" color="neutral">
        بازگشت
      </KvButton>
      <KvButton>مرحله بعد</KvButton>
    </KvButtonGroup>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <KvButtonGroup {...args}>
      <KvButton appearance="secondary" color="neutral">
        رد کردن
      </KvButton>
      <KvButton>ادامه</KvButton>
    </KvButtonGroup>
  ),
};
