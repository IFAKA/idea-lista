import React from 'react'
import { formatPrice } from '@/lib/utils'

interface StatsBarProps {
  metrics: {
    totalProperties: number
    averageScore: number
    scoreDistribution: {
      excellent: number
      good: number
      average: number
      poor: number
    }
    bestProperty?: {
      score: number
      price: number
    }
  }
}

export const StatsBar: React.FC<StatsBarProps> = ({ metrics }) => {
  if (metrics.totalProperties === 0) return null

  return (
    <div className="bg-muted/50 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium">Puntuación promedio</div>
          <div className="text-2xl font-bold">{metrics.averageScore}</div>
        </div>
        
        {metrics.bestProperty && (
          <div>
            <div className="font-medium">Mejor propiedad</div>
            <div className="text-lg font-semibold">
              {metrics.bestProperty.score} • {formatPrice(metrics.bestProperty.price)}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-3 text-xs">
        <div className="flex items-center space-x-1">
          <span className="text-green-600">🟢</span>
          <span>{metrics.scoreDistribution.excellent}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-blue-600">🔵</span>
          <span>{metrics.scoreDistribution.good}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-600">🟡</span>
          <span>{metrics.scoreDistribution.average}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-red-600">🔴</span>
          <span>{metrics.scoreDistribution.poor}</span>
        </div>
      </div>
    </div>
  )
}
