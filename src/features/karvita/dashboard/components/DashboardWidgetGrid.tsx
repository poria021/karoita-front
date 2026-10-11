'use client';

import type { ComponentType } from 'react';

import { DashboardBulletinsBoard } from '@/features/karvita/bulletins/components/DashboardBulletinsBoard';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';

import {
  getDashboardWidgets,
  type DashboardWidgetId,
  type DashboardWidgetSpan,
} from '../lib/dashboard-widgets';

const WIDGET_COMPONENTS: Record<
  DashboardWidgetId,
  ComponentType<{ role: UserRole }>
> = {
  bulletins: DashboardBulletinsBoard,
};

const SPAN_CLASS: Record<DashboardWidgetSpan, string> = {
  third: '',
  'two-thirds': 'lg:col-span-2',
  full: 'lg:col-span-3',
};

/** گرید ویجت‌های میز کار — فهرست هر نقش از `getDashboardWidgets`. */
export function DashboardWidgetGrid({ role }: { role: UserRole }) {
  return (
    <div className="grid gap-kv-section lg:grid-cols-3">
      {getDashboardWidgets(role).map((widget) => {
        const Widget = WIDGET_COMPONENTS[widget.id];
        return (
          <div key={widget.id} className={cn('min-w-0', SPAN_CLASS[widget.span])}>
            <Widget role={role} />
          </div>
        );
      })}
    </div>
  );
}
