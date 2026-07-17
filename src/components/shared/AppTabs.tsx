'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Visual models for the shared tab switcher.
 * - `underline`: page chrome line tabs (active text + bottom rule)
 * - `capsule`: auth-style segmented control (slate track + brand active chip)
 *
 * Built on Radix Tabs primitives directly so Shadcn default trigger styles
 * (active bg-background, fixed h-9, line after:) cannot fight our models.
 */
export type AppTabsModel = 'underline' | 'capsule';

/** Density scale — `sm` matches AuthCard login/register tabs. */
export type AppTabsSize = 'sm' | 'md' | 'lg';

const appTabsListVariants = cva(
  'inline-flex h-auto max-w-full items-center font-sans text-slate-500',
  {
    variants: {
      model: {
        underline:
          'w-full flex-wrap items-stretch justify-start gap-1 rounded-none border-b border-slate-200 bg-transparent p-0',
        capsule:
          'w-full justify-stretch gap-1 rounded-kv-control border border-slate-200 bg-slate-100 p-[3px]',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      model: 'underline',
      size: 'md',
    },
  }
);

const appTabsTriggerVariants = cva(
  [
    'inline-flex items-center justify-center gap-kv-inline bg-transparent font-sans font-bold',
    'text-slate-500 shadow-none outline-none transition-all',
    'hover:text-slate-900',
    'focus-visible:ring-[3px] focus-visible:ring-brand-500/20',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      model: {
        /** Active border sits on the list's bottom rule (no floating gap). */
        underline: [
          'relative -mb-px flex-none rounded-none border-b-2 border-transparent',
          'data-[state=active]:border-brand-700 data-[state=active]:bg-transparent',
          'data-[state=active]:text-brand-700 data-[state=active]:shadow-none',
        ].join(' '),
        capsule: [
          'flex-1 rounded-kv-control border-0',
          'data-[state=active]:bg-brand-500 data-[state=active]:text-white',
          'data-[state=active]:shadow-[0_4px_10px_rgba(16,78,198,0.15)]',
        ].join(' '),
      },
      size: {
        sm: "px-3 py-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        md: "px-4 py-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "px-5 py-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
      },
    },
    compoundVariants: [
      {
        model: 'underline',
        size: 'sm',
        class: 'px-3 py-2 font-black',
      },
      {
        model: 'underline',
        size: 'md',
        class: 'px-4 py-2.5 font-black',
      },
      {
        model: 'underline',
        size: 'lg',
        class: 'px-5 py-3 text-sm font-black',
      },
      {
        model: 'capsule',
        size: 'sm',
        class: 'px-3 py-1.5 text-xs',
      },
      {
        model: 'capsule',
        size: 'md',
        class: 'px-4 py-2.5 text-[13px]',
      },
      {
        model: 'capsule',
        size: 'lg',
        class: 'px-5 py-2.5 text-sm',
      },
    ],
    defaultVariants: {
      model: 'underline',
      size: 'md',
    },
  }
);

type AppTabsContextValue = {
  model: AppTabsModel;
  size: AppTabsSize;
};

const AppTabsContext = React.createContext<AppTabsContextValue>({
  model: 'underline',
  size: 'md',
});

function useAppTabsContext() {
  return React.useContext(AppTabsContext);
}

export interface AppTabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root>,
    VariantProps<typeof appTabsListVariants> {
  /** Visual model — `capsule` matches AuthCard login/register. */
  model?: AppTabsModel;
  /** Density — `sm` is the auth form default. */
  size?: AppTabsSize;
}

/** Shared Radix-based tabs with interchangeable visual models and sizes. */
function AppTabs({
  model = 'underline',
  size = 'md',
  className,
  children,
  orientation = 'horizontal',
  ...props
}: AppTabsProps) {
  return (
    <AppTabsContext.Provider value={{ model, size }}>
      <TabsPrimitive.Root
        data-slot="app-tabs"
        data-model={model}
        data-size={size}
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
          'flex w-full gap-kv-stack font-sans data-[orientation=horizontal]:flex-col',
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </AppTabsContext.Provider>
  );
}

function AppTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { model, size } = useAppTabsContext();

  return (
    <TabsPrimitive.List
      data-slot="app-tabs-list"
      data-model={model}
      data-size={size}
      className={cn(appTabsListVariants({ model, size }), className)}
      {...props}
    />
  );
}

function AppTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { model, size } = useAppTabsContext();

  return (
    <TabsPrimitive.Trigger
      data-slot="app-tabs-trigger"
      data-model={model}
      data-size={size}
      className={cn(appTabsTriggerVariants({ model, size }), className)}
      {...props}
    />
  );
}

function AppTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="app-tabs-content"
      className={cn('mt-1 flex-1 outline-none', className)}
      {...props}
    />
  );
}

export {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
  appTabsListVariants,
  appTabsTriggerVariants,
};
