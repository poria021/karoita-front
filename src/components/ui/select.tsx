"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { FaIcon } from "@/components/shared/FaIcon"
import { KvOverlayScrollMoreCue } from "@/components/shared/KvOverlayScrollMoreCue"
import {
  kvKeepPageScrollProps,
  kvOverlayListScrollClassName,
} from "@/components/shared/kvOverlayMenu"
import {
  mergeEdgeAutoScrollRef,
  useEdgeAutoScroll,
} from "@/hooks/useEdgeAutoScroll"
import { KeepPageScrollOnMount } from "@/hooks/useKeepPageScroll"
import { cn } from "@/lib/utils"
import { faIcons } from "@/utils/iconMap"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ref,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit cursor-pointer items-center justify-between gap-2 rounded-kv-control border bg-transparent px-3 py-2 text-sm whitespace-nowrap outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-11 data-[size=sm]:h-11",
        "*:data-[slot=select-value]:block *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:overflow-hidden *:data-[slot=select-value]:text-start *:data-[slot=select-value]:[unicode-bidi:isolate]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <FaIcon
          icon={faIcons.chevronDown}
          size="sm"
          className="text-kv-text-placeholder"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ref,
  onPointerMove,
  onPointerLeave,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const {
    ref: edgeScrollRef,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    canScrollDown,
    nudgeDown,
    stop,
  } = useEdgeAutoScroll<HTMLDivElement>()

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        {...kvKeepPageScrollProps}
        ref={mergeEdgeAutoScrollRef(edgeScrollRef, ref)}
        onPointerMove={(event) => {
          handlePointerMove(event)
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          handlePointerLeave()
          onPointerLeave?.(event)
        }}
        className={cn(
          "relative z-50 flex min-w-[8rem] origin-(--radix-select-content-transform-origin) flex-col overflow-hidden rounded-kv-control border border-kv-border/70 bg-kv-surface text-kv-text shadow-kv-overlay",
          "max-h-[min(14rem,var(--radix-select-content-available-height))]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <KeepPageScrollOnMount />
        <SelectPrimitive.Viewport
          data-edge-auto-scroll=""
          className={cn(
            kvOverlayListScrollClassName,
            "h-0 p-0",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <KvOverlayScrollMoreCue
          visible={canScrollDown}
          onHoverStart={nudgeDown}
          onHoverEnd={stop}
        />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-kv-text-faint px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-kv-brand-soft focus:text-kv-brand-soft-fg [&_svg:not([class*='text-'])]:text-kv-text-faint relative flex w-full cursor-pointer items-center gap-2 rounded-kv-control py-1.5 pe-8 ps-2 text-sm outline-hidden select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span:last-child]:block [&>span:last-child]:min-w-0 [&>span:last-child]:text-start [&>span:last-child]:[unicode-bidi:isolate]",
        className
      )}
      {...props}
    >
      <span className="absolute end-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <FaIcon icon={faIcons.check} size="sm" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none mx-0 my-0 h-px bg-kv-border/40", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <FaIcon icon={faIcons.chevronUp} size="sm" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex w-full cursor-pointer items-center justify-center px-3.5 py-2.5",
        "border-t border-kv-border/40 bg-kv-surface text-kv-text-muted",
        "hover:bg-kv-surface-muted hover:text-kv-text-secondary",
        className
      )}
      {...props}
    >
      <FaIcon icon={faIcons.chevronDown} size="xs" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
