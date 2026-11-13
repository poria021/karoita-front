import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  KvAccordion,
  KvAccordionContent,
  KvAccordionItem,
  KvAccordionTrigger,
  KvAccordionTriggerMeta,
} from './KvAccordion';

const meta = {
  title: 'Design System/Layout/KvAccordion',
  component: KvAccordion,
  tags: ['autodocs'],
  args: {
    type: 'single',
    collapsible: true,
  },
} satisfies Meta<typeof KvAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <KvAccordion type="single" collapsible defaultValue="item-1">
      <KvAccordionItem value="item-1">
        <KvAccordionTrigger>
          <KvAccordionTriggerMeta
            title="اطلاعات عمومی"
            description="نام، کد ملی و وضعیت حساب"
          />
        </KvAccordionTrigger>
        <KvAccordionContent stacked>
          <p className="text-xs font-medium">محتوای بخش اول در اینجا قرار می‌گیرد.</p>
        </KvAccordionContent>
      </KvAccordionItem>
      <KvAccordionItem value="item-2">
        <KvAccordionTrigger>
          <KvAccordionTriggerMeta title="تنظیمات اعلان" />
        </KvAccordionTrigger>
        <KvAccordionContent>
          <p className="text-xs font-medium">محتوای بخش دوم.</p>
        </KvAccordionContent>
      </KvAccordionItem>
    </KvAccordion>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <KvAccordion type="multiple" defaultValue={['a', 'b']}>
      <KvAccordionItem value="a">
        <KvAccordionTrigger>
          <KvAccordionTriggerMeta title="بخش الف" />
        </KvAccordionTrigger>
        <KvAccordionContent>متن بخش الف</KvAccordionContent>
      </KvAccordionItem>
      <KvAccordionItem value="b">
        <KvAccordionTrigger>
          <KvAccordionTriggerMeta title="بخش ب" />
        </KvAccordionTrigger>
        <KvAccordionContent>متن بخش ب</KvAccordionContent>
      </KvAccordionItem>
    </KvAccordion>
  ),
};
