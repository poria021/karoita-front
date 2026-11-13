'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { KvPasswordField } from './KvPasswordField';
import { KvPasswordStrengthIndicator } from './KvPasswordStrengthIndicator';

const meta = {
  title: 'Design System/Fields/KvPasswordStrengthIndicator',
  component: KvPasswordStrengthIndicator,
  tags: ['autodocs'],
  args: {
    password: '',
  },
} satisfies Meta<typeof KvPasswordStrengthIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function StrengthPlayground() {
    const [password, setPassword] = useState('');

    return (
      <div className="max-w-sm">
        <KvPasswordField
          label="رمز جدید"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <KvPasswordStrengthIndicator password={password} />
      </div>
    );
  },
};

export const WeakPassword: Story = {
  args: { password: '123456' },
};

export const StrongPassword: Story = {
  args: { password: 'Karvita#Secure2026!' },
};
