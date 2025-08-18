import { create } from 'zustand'
import { Property } from '../domain/entities/Property'
import { PropertyTypeConfigs } from '../domain/entities/PropertyType'
import { container } from '../infrastructure/di/container'
import { PropertyApplicationService } from '../application/services/PropertyApplicationService'

interface PropertyMetrics {
  totalProperties: number
  averageScore: number
  scoreDistribution: {
    excellent: number
    good: number
    average: number
    poor: number
  }
  bestProperty?: Property
}

interface PropertyStore {
  // State
  properties: Property[]
  metrics: PropertyMetrics
  isLoading: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  refreshProperties: () => Promise<void>
  addProperty: (propertyData: any) => Promise<void>
  removeProperty: (id: string) => Promise<void>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  clearProperties: () => Promise<void>
  addVisit: (propertyId: string, visitData: any) => Promise<void>
  updateScoringConfig: (config: PropertyTypeConfigs) => Promise<void>
  recalculateAllScores: () => Promise<void>
  exportProperties: (options: any) => Promise<string>
  exportVisitData: () => Promise<string>
  
  // Computed
  getApplicationService: () => PropertyApplicationService
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  // Initial state
  properties: [],
  metrics: {
    totalProperties: 0,
    averageScore: 0,
    scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
  },
  isLoading: false,
  error: null,

  // Actions
  initialize: async () => {
    set({ isLoading: true, error: null })
    try {
      const service = get().getApplicationService()
      const properties = await service.getAllProperties()
      const metrics = calculateMetrics(properties)
      set({ properties, metrics, isLoading: false })
    } catch (error) {
      set({ error: String(error), isLoading: false })
    }
  },

  refreshProperties: async () => {
    try {
      const service = get().getApplicationService()
      const properties = await service.getAllProperties()
      const metrics = calculateMetrics(properties)
      set({ properties, metrics })
    } catch (error) {
      set({ error: String(error) })
    }
  },

  addProperty: async (propertyData: any) => {
    try {
      const service = get().getApplicationService()
      await service.addProperty(propertyData)
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  removeProperty: async (id: string) => {
    try {
      const service = get().getApplicationService()
      await service.removeProperty(id)
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  updateProperty: async (id: string, updates: Partial<Property>) => {
    try {
      const service = get().getApplicationService()
      await service.updateProperty(id, updates)
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  clearProperties: async () => {
    try {
      const service = get().getApplicationService()
      await service.clearProperties()
      set({ properties: [], metrics: { totalProperties: 0, averageScore: 0, scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 } } })
    } catch (error) {
      set({ error: String(error) })
    }
  },

  addVisit: async (propertyId: string, visitData: any) => {
    try {
      const service = get().getApplicationService()
      await service.addVisit(propertyId, visitData)
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  updateScoringConfig: async (config: PropertyTypeConfigs) => {
    try {
      const service = get().getApplicationService()
      await service.updateScoringConfig(config)
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  recalculateAllScores: async () => {
    try {
      const service = get().getApplicationService()
      await service.recalculateAllScores()
      await get().refreshProperties()
    } catch (error) {
      set({ error: String(error) })
    }
  },

  exportProperties: async (options: any) => {
    const service = get().getApplicationService()
    return await service.exportProperties(options)
  },

  exportVisitData: async () => {
    const service = get().getApplicationService()
    return await service.exportVisitData()
  },

  // Computed
  getApplicationService: () => {
    return container.get<PropertyApplicationService>('PropertyApplicationService')
  }
}))

function calculateMetrics(properties: Property[]): PropertyMetrics {
  if (properties.length === 0) {
    return {
      totalProperties: 0,
      averageScore: 0,
      scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
    }
  }

  const totalProperties = properties.length
  const averageScore = Math.round(properties.reduce((sum, p) => sum + p.score, 0) / totalProperties)
  const bestProperty = properties.reduce((best, current) => current.score > best.score ? current : best)

  const scoreDistribution = {
    excellent: properties.filter(p => p.score >= 80).length,
    good: properties.filter(p => p.score >= 60 && p.score < 80).length,
    average: properties.filter(p => p.score >= 40 && p.score < 60).length,
    poor: properties.filter(p => p.score < 40).length
  }

  return {
    totalProperties,
    averageScore,
    scoreDistribution,
    bestProperty
  }
}
