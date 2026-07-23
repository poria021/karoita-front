'use client';

import * as React from 'react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type AppTabsActiveTone = 'brand' | 'surface';
export type AppTabsListLayout = 'row' | 'grid';
export type AppTabsGridCols = 2 | 3 | 4;

/** Shared row track chrome — identical for dashboard + auth. Uses radius tokens. */
const LIST_BASE = [
  'flex h-auto max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap',
  'overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface-subtle p-[3px]',
  'font-sans text-kv-text-subtle',
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ');

/** Dashboard: hug content on md+. Auth (`fullWidth`): always stretch. */
const LIST_HUG = [
  LIST_BASE,
  'w-full self-stretch',
  'md:inline-flex md:w-fit md:max-w-full md:self-start md:justify-start',
].join(' ');

const LIST_STRETCH = [LIST_BASE, 'w-full self-stretch justify-stretch'].join(
  ' '
);

const LIST_GRID_BASE =
  'grid w-full gap-2 border-0 bg-transparent p-0 font-sans text-kv-text-subtle';

const GRID_COLS_CLASS: Record<AppTabsGridCols, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const TRIGGER_BASE = [
  'inline-flex min-w-0 items-center justify-center rounded-kv-control border-0',
  'bg-transparent font-sans font-bold text-kv-text-subtle shadow-none outline-none transition-all',
  'hover:text-kv-text',
  'focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

/** Only active fill differs: brand (dashboard) vs white/surface (auth). */
const TRIGGER_ACTIVE_BRAND = [
  'data-[state=active]:bg-kv-brand data-[state=active]:text-kv-brand-fg',
].join(' ');

const TRIGGER_ACTIVE_SURFACE = [
  'data-[state=active]:bg-kv-surface data-[state=active]:text-kv-text',
].join(' ');

/** One size recipe for all row tabs (auth + dashboard). */
const TRIGGER_ROW_SIZE = [
  'flex-1 gap-1.5 px-1.5 py-1.5 text-sm leading-none',
  'md:gap-2 md:px-4 md:py-2.5 md:text-sm',
].join(' ');

/** When list hugs content, triggers stop growing on md+. */
const TRIGGER_ROW_HUG = 'md:w-auto md:flex-none md:grow-0';

const TRIGGER_GRID_SIZE = [
  'w-full gap-1.5 rounded-kv-control border border-kv-border bg-kv-surface',
  'px-2 py-2 text-sm leading-none',
  'hover:bg-kv-surface-muted',
  'data-[state=active]:border-kv-brand',
].join(' ');

type AppTabsContextValue = {
  fullWidth: boolean;
  activeTone: AppTabsActiveTone;
  listLayout: AppTabsListLayout;
  gridCols: AppTabsGridCols;
};

const AppTabsContext = React.createContext<AppTabsContextValue>({
  fullWidth: false,
  activeTone: 'brand',
  listLayout: 'row',
  gridCols: 3,
});

function useAppTabsContext() {
  return React.useContext(AppTabsContext);
}

export type AppTabsProps = React.ComponentProps<typeof Tabs> & {
  /** Stretch track + equal-width triggers (auth card). Style tokens stay identical. */
  fullWidth?: boolean;
  /** `brand` = dashboard active; `surface` = auth active (white). */
  activeTone?: AppTabsActiveTone;
  listLayout?: AppTabsListLayout;
  gridCols?: AppTabsGridCols;
};

function AppTabs({
  className,
  children,
  orientation = 'horizontal',
  fullWidth = false,
  activeTone = 'brand',
  listLayout = 'row',
  gridCols = 3,
  ...props
}: AppTabsProps) {
  return (
    <AppTabsContext.Provider
      value={{ fullWidth, activeTone, listLayout, gridCols }}
    >
      <Tabs
        data-slot="app-tabs"
        data-full-width={fullWidth || undefined}
        data-active-tone={activeTone}
        data-list-layout={listLayout}
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
          'flex w-full flex-col gap-kv-stack font-sans data-[orientation=horizontal]:flex-col',
          className
        )}
        {...props}
      >
        {children}
      </Tabs>
    </AppTabsContext.Provider>
  );
}

function AppTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  const { fullWidth, listLayout, gridCols } = useAppTabsContext();

  if (listLayout === 'grid') {
    return (
      <TabsList
        data-slot="app-tabs-list"
        data-list-layout="grid"
        className={cn(LIST_GRID_BASE, GRID_COLS_CLASS[gridCols], className)}
        {...props}
      />
    );
  }

  return (
    <TabsList
      data-slot="app-tabs-list"
      data-list-layout="row"
      className={cn(fullWidth ? LIST_STRETCH : LIST_HUG, className)}
      {...props}
    />
  );
}

function AppTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  const { fullWidth, activeTone, listLayout } = useAppTabsContext();

  if (listLayout === 'grid') {
    return (
      <TabsTrigger
        data-slot="app-tabs-trigger"
        className={cn(
          TRIGGER_BASE,
          activeTone === 'surface'
            ? TRIGGER_ACTIVE_SURFACE
            : TRIGGER_ACTIVE_BRAND,
          TRIGGER_GRID_SIZE,
          className
        )}
        {...props}
      />
    );
  }

  return (
    <TabsTrigger
      data-slot="app-tabs-trigger"
      className={cn(
        TRIGGER_BASE,
        activeTone === 'surface'
          ? TRIGGER_ACTIVE_SURFACE
          : TRIGGER_ACTIVE_BRAND,
        TRIGGER_ROW_SIZE,
        !fullWidth && TRIGGER_ROW_HUG,
        className
      )}
      {...props}
    />
  );
}

function AppTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      data-slot="app-tabs-content"
      className={cn('mt-1 flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { AppTabs, AppTabsList, AppTabsTrigger, AppTabsContent };
