import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KvTypography } from '@/components/shared/KvTypography';

import { KvBrowsableMediaLink } from './KvBrowsableMediaLink';

const meta = {
  title: 'Design System/Actions/KvBrowsableMediaLink',
  component: KvBrowsableMediaLink,
  tags: ['autodocs'],
  args: {
    href: '/brand/karvita-mark.png',
    alt: 'لوگوی کارویتا',
    previewAsImage: true,
    children: null,
  },
} satisfies Meta<typeof KvBrowsableMediaLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <KvBrowsableMediaLink {...args} className="inline-block rounded-kv-control ring-1 ring-kv-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={args.href}
        alt={args.alt}
        className="h-24 w-24 rounded-kv-control object-contain p-2"
      />
    </KvBrowsableMediaLink>
  ),
};

export const ExternalPdf: Story = {
  args: {
    href: 'https://example.com/sample.pdf',
    previewAsImage: false,
    children: undefined,
  },
  render: (args) => (
    <KvBrowsableMediaLink {...args} className="text-kv-brand underline">
      <KvTypography variant="body" tone="brand" as="span">
        باز کردن PDF در تب جدید
      </KvTypography>
    </KvBrowsableMediaLink>
  ),
};
