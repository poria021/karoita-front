'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from './KvFilterBar';
import { KvSearchField } from './KvSearchField';
import { KvSelectField } from './KvSelectField';
import { KvSelectItem } from './KvSelect';

const meta = {
  title: 'Design System/Layout/KvFilterBar',
  component: KvFilterBar,
  tags: ['autodocs'],
  args: {
    children: null,
  },
} satisfies Meta<typeof KvFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function FilterBarDemo() {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<string | undefined>(undefined);

    return (
      <KvFilterBar>
        <KvFilterBarSearch>
          <KvSearchField
            placeholder="جستجو…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </KvFilterBarSearch>
        <KvFilterBarControl width="md">
          <KvSelectField
            label={false}
            placeholder="وضعیت"
            value={status}
            onValueChange={setStatus}
          >
            <KvSelectItem value="all">همه</KvSelectItem>
            <KvSelectItem value="active">فعال</KvSelectItem>
            <KvSelectItem value="inactive">غیرفعال</KvSelectItem>
          </KvSelectField>
        </KvFilterBarControl>
      </KvFilterBar>
    );
  },
};
