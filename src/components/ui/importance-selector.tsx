import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus, Star } from "lucide-react"

export type ImportanceLevel = 'irrelevante' | 'valorable' | 'esencial'

export interface ImportanceOption {
  level: ImportanceLevel
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  value: number
}

const importanceOptions: ImportanceOption[] = [
  {
    level: 'irrelevante',
    icon: Minus,
    title: 'Irrelevante',
    description: 'No importante para la decisión',
    value: 0
  },
  {
    level: 'valorable',
    icon: Plus,
    title: 'Valorable',
    description: 'Importante pero no crítico',
    value: 1
  },
  {
    level: 'esencial',
    icon: Star,
    title: 'Esencial',
    description: 'Crítico para la decisión',
    value: 2
  }
]

interface ImportanceSelectorProps {
  value: ImportanceLevel
  onValueChange: (value: ImportanceLevel) => void
  className?: string
  disabled?: boolean
}

const ImportanceSelector = React.forwardRef<HTMLDivElement, ImportanceSelectorProps>(
  ({ value, onValueChange, className, disabled = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-1 p-0.5 bg-muted rounded-lg",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {importanceOptions.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.level
          
          return (
            <button
              key={option.level}
              type="button"
              onClick={() => !disabled && onValueChange(option.level)}
              disabled={disabled}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200",
                "hover:bg-background/80 hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected 
                  ? "bg-background shadow-sm border border-border" 
                  : "bg-transparent",
                disabled && "cursor-not-allowed"
              )}
            >
              <Icon 
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isSelected 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors",
                  isSelected 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {option.title}
              </span>
            </button>
          )
        })}
      </div>
    )
  }
)

ImportanceSelector.displayName = "ImportanceSelector"

export { ImportanceSelector, importanceOptions }
