'use client';

import type { ReactNode } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
  type AppTabsModel,
  type AppTabsSize,
} from '@/components/shared/AppTabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

type PageChromeTab = {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type PageChromeTitleProps = {
  mode: 'title';
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

type PageChromeTabsProps = {
  mode: 'tabs';
  /** Optional eyebrow/page context above tabs */
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Renders between the tab list and tab panels (e.g. status alerts). */
  banner?: ReactNode;
  tabs: PageChromeTab[];
  value: string;
  onValueChange: (value: string) => void;
  /** Reuse AppTabs visual model */
  tabsModel?: AppTabsModel;
  /** Reuse AppTabs density scale */
  tabsSize?: AppTabsSize;
  className?: string;
};

export type PageChromeProps = PageChromeTitleProps | PageChromeTabsProps;

function PageChromeEyebrow({
  title,
  description,
  icon,
  actions,
}: Pick<PageChromeTabsProps, 'title' | 'description' | 'icon' | 'actions'>) {
  if (!title && !description && !icon && !actions) {
    return null;
  }

  return (
    <PageHeader
      title={title ?? ''}
      description={description}
      icon={icon}
      actions={actions}
      className="mb-kv-stack border-b-0 pb-0"
    />
  );
}

/**
 * Unified page chrome: a standalone title header OR a multi-tab underline switcher.
 * Non-tab pages use `mode: "title"` — never a fake single-tab shell.
 */
export function PageChrome(props: PageChromeProps) {
  if (props.mode === 'title') {
    const { title, description, icon, actions, className } = props;

    return (
      <div className={cn('w-full font-sans', className)}>
        <PageHeader
          title={title}
          description={description}
          icon={icon}
          actions={actions}
        />
      </div>
    );
  }

  const {
    title,
    description,
    icon,
    actions,
    banner,
    tabs,
    value,
    onValueChange,
    tabsModel = 'underline',
    tabsSize = 'md',
    className,
  } = props;

  const showEyebrow = Boolean(title ?? description ?? icon ?? actions);

  return (
    <div className={cn('w-full space-y-kv-stack font-sans', className)}>
      {showEyebrow ? (
        <PageChromeEyebrow
          title={title}
          description={description}
          icon={icon}
          actions={actions}
        />
      ) : null}

      <AppTabs
        model={tabsModel}
        size={tabsSize}
        value={value}
        onValueChange={onValueChange}
        className={cn(
          !showEyebrow && !banner && 'gap-0',
          banner && 'gap-kv-group'
        )}
      >
        <AppTabsList>
          {tabs.map((tab) => (
            <AppTabsTrigger key={tab.value} value={tab.value}>
              {tab.icon}
              {tab.label}
            </AppTabsTrigger>
          ))}
        </AppTabsList>

        {banner ? <div className="w-full">{banner}</div> : null}

        {tabs.map((tab) => (
          <AppTabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </AppTabsContent>
        ))}
      </AppTabs>
    </div>
  );
}
