import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-kv-control border border-kv-border-strong bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-kv-brand selection:text-kv-brand-fg file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-kv-text placeholder:text-kv-text-placeholder disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-kv-surface-muted/30",
        "focus-visible:border-kv-ring focus-visible:ring-[3px] focus-visible:ring-kv-ring/50",
        "aria-invalid:border-kv-danger aria-invalid:ring-kv-ring-danger/20 dark:aria-invalid:ring-kv-ring-danger/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
