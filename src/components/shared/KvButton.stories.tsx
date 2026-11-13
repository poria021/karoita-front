import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { FaIcon } from '@/components/shared/FaIcon';
import { faIcons } from '@/utils/iconMap';

import { KvButton } from './KvButton';

const meta = {
  title: 'Design System/Actions/KvButton',
  component: KvButton,
  tags: ['autodocs'],
  args: {
    children: 'ذخیره تغییرات',
    color: 'cta',
    appearance: 'solid',
    size: 'md',
    fullWidth: false,
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['cta', 'success', 'warning', 'error', 'neutral', 'violet'],
    },
    appearance: {
      control: 'select',
      options: ['solid', 'secondary', 'ghost', 'text'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    iconPosition: {
      control: 'radio',
      options: ['start', 'end'],
    },
  },
} satisfies Meta<typeof KvButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'در حال ارسال…',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'افزودن مورد',
    icon: <FaIcon icon={faIcons.plus} size="sm" />,
    iconPosition: 'start',
  },
};

export const IconOnly: Story = {
  args: {
    children: undefined,
    color: 'neutral',
    appearance: 'secondary',
    icon: <FaIcon icon={faIcons.ellipsis} size="sm" />,
    'aria-label': 'گزینه‌های بیشتر',
  },
};

export const DestructiveSolid: Story = {
  args: {
    children: 'حذف دائمی',
    color: 'error',
    appearance: 'solid',
  },
};
