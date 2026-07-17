"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { FaIcon } from "@/components/shared/FaIcon"
import { faIcons } from "@/utils/iconMap"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <FaIcon icon={faIcons.circleCheck} size="sm" />,
        info: <FaIcon icon={faIcons.circleInfo} size="sm" />,
        warning: <FaIcon icon={faIcons.triangleExclamation} size="sm" />,
        error: <FaIcon icon={faIcons.circleXmark} size="sm" />,
        loading: <FaIcon icon={faIcons.spinner} size="sm" spin />,
      }}
      style={
        {
          "--normal-bg": "var(--kv-surface)",
          "--normal-text": "var(--kv-text)",
          "--normal-border": "var(--kv-border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
