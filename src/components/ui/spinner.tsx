"use client"

import { FaIcon } from "@/components/shared/FaIcon"
import { cn } from "@/lib/utils"
import { faIcons } from "@/utils/iconMap"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex size-4", className)}
      {...props}
    >
      <FaIcon
        icon={faIcons.spinner}
        size="sm"
        spin
      />
    </span>
  )
}

export { Spinner }
