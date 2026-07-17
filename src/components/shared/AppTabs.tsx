'use client';

/**
 * Tabs chrome is owned by AppTabs. Do not override list/trigger visuals at call sites.
 *
 * Width modes (only intentional layout fork — inactive chrome stays identical):
 * - default: mobile full-width; md+ hugs content
 * - `fullWidth`: track + equal triggers stay full-width at every breakpoint (auth card)
 *
 * Active tone (intentional color fork):
 * - `brand` (default): active pill uses brand fill — profile and app chrome
 * - `surface`: active pill uses white/surface fill; track is one shade darker — auth only
 */

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

export type AppTabsActiveTone = 'brand' | 'surface';

const LIST_BASE = [
  'flex h-auto max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap',
  'rounded-kv-control border border-kv-border p-[3px]',
  'font-sans text-kv-text-subtle',
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ');

const LIST_TRACK_BRAND = 'bg-kv-surface-muted';
/** One shade darker than default track — pairs with white active pill on auth. */
const LIST_TRACK_SURFACE = 'bg-kv-surface-subtle';

const LIST_NORMAL = [
  LIST_BASE,
  'w-full self-stretch',
  'md:inline-flex md:w-fit md:max-w-full md:self-start md:justify-start',
].join(' ');

const LIST_FULL = [LIST_BASE, 'w-full self-stretch justify-stretch'].join(' ');

const TRIGGER_BASE = [
  'inline-flex min-w-0 items-center justify-center rounded-kv-control border-0',
  'bg-transparent font-sans font-bold text-kv-text-subtle shadow-none outline-none transition-all',
  'hover:text-kv-text',
  'focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

const TRIGGER_ACTIVE_BRAND = [
  'data-[state=active]:bg-kv-brand data-[state=active]:text-kv-brand-fg',
  'data-[state=active]:shadow-kv-raised data-[state=active]:shadow-kv-brand/15',
].join(' ');

/** White/surface active pill on muted track — auth login/register. */
const TRIGGER_ACTIVE_SURFACE = [
  'data-[state=active]:bg-kv-surface data-[state=active]:text-kv-text',
  'data-[state=active]:shadow-kv-raised',
].join(' ');

const TRIGGER_NORMAL_SIZE = [
  'flex-1 gap-1.5 px-1.5 py-2.5 text-xs leading-none',
  'md:w-auto md:flex-none md:grow-0 md:gap-2 md:px-5 md:py-2.5 md:text-[13px]',
].join(' ');

const TRIGGER_FULL_SIZE = [
  'flex-1 gap-1.5 px-1.5 py-2.5 text-xs leading-none',
].join(' ');

type AppTabsContextValue = {
  fullWidth: boolean;
  activeTone: AppTabsActiveTone;
};

const AppTabsContext = React.createContext<AppTabsContextValue>({
  fullWidth: false,
  activeTone: 'brand',
});

function useAppTabsContext() {
  return React.useContext(AppTabsContext);
}

export type AppTabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  /**
   * `true` — always full-width equal tabs (auth register/login).
   * `false` (default) — normal: full on mobile, hug content on md+.
   */
  fullWidth?: boolean;
  /**
   * Active pill color. Default `brand` everywhere;
   * use `surface` only on the auth login/register card.
   */
  activeTone?: AppTabsActiveTone;
};

/** Shared capsule tabs. Width via `fullWidth`; active fill via `activeTone`. */
function AppTabs({
  className,
  children,
  orientation = 'horizontal',
  fullWidth = false,
  activeTone = 'brand',
  ...props
}: AppTabsProps) {
  return (
    <AppTabsContext.Provider value={{ fullWidth, activeTone }}>
      <TabsPrimitive.Root
        data-slot="app-tabs"
        data-full-width={fullWidth || undefined}
        data-active-tone={activeTone}
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
          'flex w-full flex-col gap-kv-stack font-sans data-[orientation=horizontal]:flex-col',
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
  const { fullWidth, activeTone } = useAppTabsContext();

  return (
    <TabsPrimitive.List
      data-slot="app-tabs-list"
      className={cn(
        fullWidth ? LIST_FULL : LIST_NORMAL,
        activeTone === 'surface' ? LIST_TRACK_SURFACE : LIST_TRACK_BRAND,
        className
      )}
      {...props}
    />
  );
}

function AppTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { fullWidth, activeTone } = useAppTabsContext();

  return (
    <TabsPrimitive.Trigger
      data-slot="app-tabs-trigger"
      className={cn(
        TRIGGER_BASE,
        activeTone === 'surface' ? TRIGGER_ACTIVE_SURFACE : TRIGGER_ACTIVE_BRAND,
        fullWidth ? TRIGGER_FULL_SIZE : TRIGGER_NORMAL_SIZE,
        className
      )}
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

export { AppTabs, AppTabsList, AppTabsTrigger, AppTabsContent };
