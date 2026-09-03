'use client';

import * as React from 'react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { kvScrollAreaHiddenClassName } from '@/components/shared/KvScrollArea';
import { cn } from '@/lib/utils';

export type AppTabsActiveTone = 'brand' | 'surface';
export type AppTabsGridCols = 2 | 3 | 4;

const LIST_BASE = [
  'flex h-auto max-w-full items-center gap-1',
  'overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface-subtle p-[3px]',
  'dark:bg-kv-surface',
  'font-sans text-kv-text-subtle',
].join(' ');

const LIST_ROW = [
  LIST_BASE,
  'overflow-x-auto whitespace-nowrap',
  kvScrollAreaHiddenClassName,
].join(' ');

const GRID_COLS_CLASS: Record<AppTabsGridCols, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/** Use a grid below lg and switch to a compact row at larger breakpoints. */
const LIST_RESPONSIVE_GRID = (cols: AppTabsGridCols) =>
  [
    LIST_BASE,
    'grid w-full gap-1',
    GRID_COLS_CLASS[cols],
    'lg:flex lg:w-fit lg:max-w-full lg:flex-nowrap lg:justify-start',
    'lg:overflow-x-auto lg:whitespace-nowrap',
    kvScrollAreaHiddenClassName,
  ].join(' ');

/** Full-width on smaller screens, compact hug layout from lg upward. */
const LIST_HUG = [
  'w-full self-stretch',
  'lg:inline-flex lg:w-fit lg:max-w-full lg:self-start lg:justify-start',
].join(' ');

const LIST_STRETCH = 'w-full self-stretch justify-stretch';

const TRIGGER_BASE = [
  'inline-flex min-w-0 shrink-0 items-center justify-center rounded-kv-control',
  'box-border border border-kv-border-muted bg-transparent',
  'dark:border-kv-border/25',
  // وزن همیشه bold تا فعال/غیرفعال عرض قرص را عوض نکند.
  'font-sans text-xs font-bold leading-none text-kv-text-subtle shadow-none outline-none',
  'transition-[color,background-color,border-color,box-shadow]',
  'hover:text-kv-text',
  'focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

/** Active tabs use a clean surface style, except for the brand-accented variation. */
const TRIGGER_ACTIVE_SURFACE = [
  'data-[state=active]:border-kv-border data-[state=active]:bg-kv-surface data-[state=active]:text-kv-text',
  'dark:data-[state=active]:border-kv-border-strong dark:data-[state=active]:bg-kv-surface-subtle dark:data-[state=active]:text-kv-text-bright',
  'data-[state=active]:shadow-kv-raised',
].join(' ');

/** @deprecated Prefer `surface`; only use this for brand emphasis in a few edge cases. */
const TRIGGER_ACTIVE_BRAND = [
  'data-[state=active]:border-kv-brand data-[state=active]:bg-kv-brand data-[state=active]:text-kv-brand-fg',
  'data-[state=active]:shadow-kv-raised data-[state=active]:shadow-kv-brand/15',
].join(' ');

const TRIGGER_ROW_SIZE = [
  'gap-1.5 px-2.5 py-2 min-h-10',
  'md:gap-2 md:px-3.5 md:py-2 md:min-h-10',
].join(' ');

/** Compact padding for full-width tabs while keeping the same text sizing. */
const TRIGGER_ROW_SIZE_COMPACT = [
  'flex-1 gap-1 px-1.5 py-1.5 min-h-9',
  'md:gap-1.5 md:px-2 md:py-1.5 md:min-h-9',
].join(' ');

const TRIGGER_HUG = 'lg:w-auto lg:flex-none lg:grow-0';
const TRIGGER_GRID = 'w-full min-w-0 lg:w-auto lg:flex-none lg:grow-0';


type AppTabsContextValue = {
  fullWidth: boolean;
  activeTone: AppTabsActiveTone;
  gridCols: AppTabsGridCols | null;
};

const AppTabsContext = React.createContext<AppTabsContextValue>({
  fullWidth: false,
  activeTone: 'surface',
  gridCols: null,
});

function useAppTabsContext() {
  return React.useContext(AppTabsContext);
}

export type AppTabsProps = React.ComponentProps<typeof Tabs> & {
  /** Stretch the tabs and match trigger widths for auth cards. */
  fullWidth?: boolean;
  activeTone?: AppTabsActiveTone;
  /** Use an N-column grid below lg and switch to a compact row above it. */
  gridCols?: AppTabsGridCols;
};

function AppTabs({
  className,
  children,
  orientation = 'horizontal',
  fullWidth = false,
  activeTone = 'surface',
  gridCols,
  ...props
}: AppTabsProps) {
  return (
    <AppTabsContext.Provider
      value={{ fullWidth, activeTone, gridCols: gridCols ?? null }}
    >
      <Tabs
        data-slot="app-tabs"
        data-full-width={fullWidth || undefined}
        data-active-tone={activeTone}
        data-grid-cols={gridCols || undefined}
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
  const { fullWidth, gridCols } = useAppTabsContext();

  if (gridCols) {
    return (
      <TabsList
        data-slot="app-tabs-list"
        data-grid-cols={gridCols}
        className={cn(LIST_RESPONSIVE_GRID(gridCols), className)}
        {...props}
      />
    );
  }

  return (
    <TabsList
      data-slot="app-tabs-list"
      className={cn(
        LIST_ROW,
        fullWidth ? LIST_STRETCH : LIST_HUG,
        className
      )}
      {...props}
    />
  );
}

function AppTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  const { fullWidth, activeTone, gridCols } = useAppTabsContext();

  return (
    <TabsTrigger
      data-slot="app-tabs-trigger"
      className={cn(
        TRIGGER_BASE,
        activeTone === 'surface'
          ? TRIGGER_ACTIVE_SURFACE
          : TRIGGER_ACTIVE_BRAND,
        fullWidth ? TRIGGER_ROW_SIZE_COMPACT : TRIGGER_ROW_SIZE,
        gridCols ? TRIGGER_GRID : !fullWidth && TRIGGER_HUG,
        !gridCols && fullWidth && 'flex-1',
        !gridCols && !fullWidth && 'flex-1 lg:flex-none',
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
