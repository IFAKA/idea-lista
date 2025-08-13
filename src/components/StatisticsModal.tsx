import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PropertyMetrics } from '@/store/property-store'
import { Euro, Ruler, TrendingUp, Home, BarChart3 } from 'lucide-react'

interface StatisticsModalProps {
  isOpen: boolean
  onClose: () => void
  metrics: PropertyMetrics
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ 
  isOpen, 
  onClose, 
  metrics 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="stats-description">
        <DialogHeader>
          <DialogTitle>Estadísticas de Propiedades</DialogTitle>
          <DialogDescription id="stats-description">
            Información detallada sobre las propiedades guardadas y sus métricas de evaluación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
        {/* General Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            Estadísticas Generales
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{metrics.totalProperties}</div>
              </div>
              <div className="text-xs text-muted-foreground">Propiedades</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{Math.round(metrics.averageScore)}%</div>
              </div>
              <div className="text-xs text-muted-foreground">Score Promedio</div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            Métricas Detalladas
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{formatPrice(metrics.averagePrice)}</div>
              </div>
              <div className="text-xs text-muted-foreground">Precio medio</div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{formatNumber(metrics.averageSize)}m²</div>
              </div>
              <div className="text-xs text-muted-foreground">Tamaño medio</div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{Math.round(metrics.averageScore)}%</div>
              </div>
              <div className="text-xs text-muted-foreground">Score medio</div>
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
