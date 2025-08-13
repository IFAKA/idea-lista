import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

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

export { Badge, badgeVariants }
