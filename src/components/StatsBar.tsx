import React, { useState } from 'react'
import { motion } from "motion/react"
import { Badge } from '@/components/ui/badge'
import { Home, BarChart3 } from 'lucide-react'
import { PropertyMetrics } from '@/application/services/PropertyApplicationService'
import { StatisticsModal } from './StatisticsModal'

interface StatsBarProps {
  metrics: PropertyMetrics
}

export const StatsBar: React.FC<StatsBarProps> = ({ metrics }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/50 rounded-lg p-2 mb-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {metrics.totalProperties} {metrics.totalProperties === 1 ? 'propiedad' : 'propiedades'}
              </span>
            </div>
            {metrics.visitMetrics.totalVisits > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {metrics.visitMetrics.totalVisits} visita{metrics.visitMetrics.totalVisits > 1 ? 's' : ''}
                </span>
                {metrics.visitMetrics.visitSuccessRate > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({metrics.visitMetrics.visitSuccessRate}% éxito)
                  </span>
                )}
              </div>
            )}
            {metrics.contactMetrics.totalContacts > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {metrics.contactMetrics.totalContacts} contacto{metrics.contactMetrics.totalContacts > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-muted transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Estadísticas
          </Badge>
        </div>
      </motion.div>

      <StatisticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metrics={metrics}
      />
    </>
  )
}
