import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { badgeVariants } from "./badge-variants"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  hover?: boolean
}

function Badge({ className, variant, hover = true, ...props }: BadgeProps) {
  const getHoverClass = () => {
    if (!hover) return ""
    switch (variant) {
      case "default":
        return "hover:bg-primary/80"
      case "secondary":
        return "hover:bg-secondary/80"
      case "destructive":
        return "hover:bg-destructive/80"
      default:
        return ""
    }
  }

  return (
    <div className={cn(badgeVariants({ variant }), getHoverClass(), className)} {...props} />
  )
}

export { Badge }
