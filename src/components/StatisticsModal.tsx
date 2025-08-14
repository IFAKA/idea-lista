import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PropertyMetrics } from '@/application/services/PropertyApplicationService'
import { Euro, Ruler, TrendingUp, Home, BarChart3, Calendar, Phone } from 'lucide-react'

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
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-muted-foreground" />
                <div className="font-medium">{metrics.totalProperties}</div>
              </div>
              <div className="text-xs text-muted-foreground">Propiedades</div>
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

        {/* Visit Metrics */}
        {metrics.visitMetrics.totalVisits > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Métricas de Visitas
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="font-medium">{metrics.visitMetrics.totalVisits}</div>
                </div>
                <div className="text-xs text-muted-foreground">Total visitas</div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div className="font-medium">{metrics.visitMetrics.visitSuccessRate}%</div>
                </div>
                <div className="text-xs text-muted-foreground">Tasa de éxito</div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Metrics */}
        {metrics.contactMetrics.totalContacts > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Phone className="w-4 h-4" />
              Métricas de Contactos
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div className="font-medium">{metrics.contactMetrics.totalContacts}</div>
                </div>
                <div className="text-xs text-muted-foreground">Total contactos</div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div className="font-medium">{metrics.contactMetrics.respondedContacts}</div>
                </div>
                <div className="text-xs text-muted-foreground">Contactos respondidos</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
