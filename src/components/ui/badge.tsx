import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-kv-control border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-kv-ring focus-visible:ring-kv-ring/50 focus-visible:ring-[3px] aria-invalid:ring-kv-ring-danger/20 dark:aria-invalid:ring-kv-ring-danger/40 aria-invalid:border-kv-danger transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-kv-brand text-kv-brand-fg [a&]:hover:bg-kv-brand-hover",
        secondary:
          "border-transparent bg-kv-surface-muted text-kv-text-muted [a&]:hover:bg-kv-surface-subtle",
        destructive:
          "border-transparent bg-kv-danger text-kv-danger-fg [a&]:hover:bg-kv-danger-hover focus-visible:ring-kv-ring-danger/20 dark:focus-visible:ring-kv-ring-danger/40 dark:bg-kv-danger",
        outline:
          "text-kv-text [a&]:hover:bg-kv-brand-soft [a&]:hover:text-kv-brand-soft-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
