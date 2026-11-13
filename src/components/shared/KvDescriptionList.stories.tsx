import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  KvDescriptionItem,
  KvDescriptionList,
} from './KvDescriptionList';

const meta = {
  title: 'Design System/Data Display/KvDescriptionList',
  component: KvDescriptionList,
  tags: ['autodocs'],
  args: {
    children: null,
  },
} satisfies Meta<typeof KvDescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <KvDescriptionList>
      <KvDescriptionItem label="نام سازمان" value="کارویتا نمونه" />
      <KvDescriptionItem label="شناسه ملی" value="۱۰۳۲۰۵۶۷۸۹۰" mono />
      <KvDescriptionItem label="وضعیت" value="فعال" />
    </KvDescriptionList>
  ),
};

export const LongValues: Story = {
  render: () => (
    <div className="max-w-sm">
      <KvDescriptionList>
        <KvDescriptionItem
          label="آدرس"
          value="تهران، خیابان ولیعصر، پلاک ۱۲۳۴، واحد ۵"
        />
        <KvDescriptionItem label="تلفن" value="۰۲۱-۱۲۳۴۵۶۷۸" mono />
      </KvDescriptionList>
    </div>
  ),
};
