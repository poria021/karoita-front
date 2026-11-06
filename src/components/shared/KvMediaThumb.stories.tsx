import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvMediaThumb } from './KvMediaThumb';

const meta = {
  title: 'Design System/Data Display/KvMediaThumb',
  component: KvMediaThumb,
  tags: ['autodocs'],
  args: {
    size: 'md',
    variant: 'thumb',
    alt: 'نمونه تصویر',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'radio',
      options: ['thumb', 'preview'],
    },
    kind: {
      control: 'select',
      options: ['image', 'pdf', 'text', 'empty'],
    },
  },
} satisfies Meta<typeof KvMediaThumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    src: '/brand/karvita-mark.png',
  },
};

export const Empty: Story = {
  args: {
    kind: 'empty',
    src: null,
  },
};

export const PdfKind: Story = {
  args: {
    kind: 'pdf',
    src: 'https://example.com/doc.pdf',
  },
};

export const TextKind: Story = {
  args: {
    kind: 'text',
    src: 'https://example.com/notes.txt',
  },
};

export const PreviewVariant: Story = {
  args: {
    variant: 'preview',
    src: '/brand/main-logo.png',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
