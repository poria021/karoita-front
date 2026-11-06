'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { KvSearchField } from './KvSearchField';

const meta = {
  title: 'Design System/Fields/KvSearchField',
  component: KvSearchField,
  tags: ['autodocs'],
  args: {
    placeholder: 'جستجو در لیست…',
    showIcon: true,
    clearable: true,
    onChange: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof KvSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function SearchPlayground(args) {
    const [value, setValue] = useState('');

    return (
      <KvSearchField
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          args.onChange?.(event);
        }}
        onClear={() => {
          setValue('');
          args.onClear?.();
        }}
      />
    );
  },
};

export const WithValue: Story = {
  render: function SearchWithValue(args) {
    const [value, setValue] = useState('کاربر نمونه');

    return (
      <KvSearchField
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onClear={() => setValue('')}
      />
    );
  },
};

export const WithLabel: Story = {
  args: {
    label: 'عبارت جستجو',
  },
  render: function SearchLabeled(args) {
    const [value, setValue] = useState('');

    return (
      <KvSearchField
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  },
};

export const Locked: Story = {
  args: {
    locked: true,
    value: 'فیلتر ثابت',
  },
};
