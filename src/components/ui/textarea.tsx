import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-kv-border-strong placeholder:text-kv-text-placeholder focus-visible:border-kv-ring focus-visible:ring-kv-ring/50 aria-invalid:ring-kv-ring-danger/20 dark:aria-invalid:ring-kv-ring-danger/40 aria-invalid:border-kv-danger dark:bg-kv-surface-muted/30 flex field-sizing-content min-h-16 w-full rounded-kv-control border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
