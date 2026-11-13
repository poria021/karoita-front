'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { KvSelectItem } from './KvSelect';
import { KvSelectField } from './KvSelectField';

const STATUS_OPTIONS = (
  <>
    <KvSelectItem value="active">فعال</KvSelectItem>
    <KvSelectItem value="pending">در انتظار</KvSelectItem>
    <KvSelectItem value="archived">بایگانی</KvSelectItem>
  </>
);

const meta = {
  title: 'Design System/Fields/KvSelectField',
  component: KvSelectField,
  tags: ['autodocs'],
  args: {
    label: 'وضعیت',
    placeholder: 'انتخاب کنید…',
    onValueChange: fn(),
    children: STATUS_OPTIONS,
  },
} satisfies Meta<typeof KvSelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function SelectPlayground(args) {
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
      <KvSelectField
        {...args}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange?.(next);
        }}
      >
        {STATUS_OPTIONS}
      </KvSelectField>
    );
  },
};

export const WithSelection: Story = {
  render: function SelectWithValue(args) {
    const [value, setValue] = useState('active');

    return (
      <KvSelectField
        {...args}
        value={value}
        onValueChange={setValue}
      >
        {STATUS_OPTIONS}
      </KvSelectField>
    );
  },
};

export const WithError: Story = {
  args: {
    error: 'انتخاب وضعیت الزامی است.',
  },
  render: (args) => (
    <KvSelectField {...args} value="">
      {STATUS_OPTIONS}
    </KvSelectField>
  ),
};

export const Locked: Story = {
  args: {
    locked: true,
    showLockIcon: true,
    value: 'pending',
  },
  render: (args) => (
    <KvSelectField {...args}>{STATUS_OPTIONS}</KvSelectField>
  ),
};
