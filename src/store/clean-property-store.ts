import { create } from 'zustand'
import { Property as StoreProperty } from './property-store'
import { PropertyApplicationService, PropertyMetrics } from '../application/services/PropertyApplicationService'
import { PropertyAdapter } from '../infrastructure/adapters/PropertyAdapter'
import { container } from '../infrastructure/di/container'
import { PropertyData, VisitRecord, ContactRecord } from '../domain/entities/Property'
import { PropertyTypeConfigs } from '../domain/entities/PropertyType'

interface ExportOptions {
  format?: 'tsv' | 'json'
  includeVisits?: boolean
  includeContacts?: boolean
  sortBy?: 'score' | 'price' | 'date'
  sortOrder?: 'asc' | 'desc'
}

interface CleanPropertyStore {
  // State
  properties: StoreProperty[]
  metrics: PropertyMetrics
  isLoading: boolean
  error: string | null
  
  // Application service
  applicationService: PropertyApplicationService
  
  // Actions
  initialize: () => Promise<void>
  refreshProperties: () => Promise<void>
  addProperty: (propertyData: Omit<PropertyData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProperty: (id: string, updates: Partial<PropertyData>) => Promise<void>
  removeProperty: (id: string) => Promise<void>
  clearProperties: () => Promise<void>
  
  // Visit and Contact Actions
  addVisit: (propertyId: string, visit: Omit<VisitRecord, 'id'>) => Promise<void>
  updateVisit: (propertyId: string, visitId: string, updates: Partial<VisitRecord>) => Promise<void>
  addContact: (propertyId: string, contact: Omit<ContactRecord, 'id'>) => Promise<void>
  updateContact: (propertyId: string, contactId: string, updates: Partial<ContactRecord>) => Promise<void>
  updatePropertyStatus: (propertyId: string, status: StoreProperty['propertyStatus']) => Promise<void>
  updatePropertyPriority: (propertyId: string, priority: StoreProperty['priority']) => Promise<void>
  
  // Export Actions
  exportProperties: (options?: ExportOptions) => Promise<string>
  exportVisitData: () => Promise<string>
  
  // Configuration Actions
  updateScoringConfig: (configs: PropertyTypeConfigs) => Promise<void>
  getScoringConfig: () => Promise<PropertyTypeConfigs>
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Migration Actions
  recalculateAllScores: () => Promise<void>
  
  // Scoring Actions
  calculateAndUpdatePropertyScore: (propertyId: string) => Promise<void>
}

export const useCleanPropertyStore = create<CleanPropertyStore>((set) => {
  // Get the application service from the DI container
  const applicationService = container.getPropertyApplicationService()

  // Private method to load properties and metrics
  const loadPropertiesAndMetrics = async () => {
    set({ isLoading: true, error: null })
    try {
      const domainProperties = await applicationService.getPropertiesSortedByScore()
      const properties = domainProperties.map(p => PropertyAdapter.toStore(p))
      const metrics = await applicationService.calculateMetrics()
      
      set({ 
        properties, 
        metrics, 
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      })
    }
  }

  // Private method to handle async operations with error handling
  const handleAsyncOperation = async (operation: () => Promise<unknown>) => {
    set({ isLoading: true, error: null })
    try {
      await operation()
      await loadPropertiesAndMetrics()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      })
    }
  }

  return {
    properties: [],
    metrics: {
      totalProperties: 0,
      averagePrice: 0,
      averageSize: 0,
      averageScore: 0,
      priceRange: { min: 0, max: 0 },
      sizeRange: { min: 0, max: 0 },
      visitMetrics: {
        totalVisits: 0,
        completedVisits: 0,
        pendingVisits: 0,
        averageResponseTime: 0,
        visitSuccessRate: 0
      },
      contactMetrics: {
        totalContacts: 0,
        respondedContacts: 0,
        scheduledVisits: 0,
        averageResponseTime: 0
      },
      statusDistribution: {
        available: 0,
        under_contract: 0,
        sold: 0,
        visited: 0,
        not_interested: 0
      },
      priorityDistribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    },
    isLoading: false,
    error: null,
    applicationService,

    initialize: async () => {
      await loadPropertiesAndMetrics()
    },

    refreshProperties: async () => {
      await loadPropertiesAndMetrics()
    },

    addProperty: async (propertyData) => {
      await handleAsyncOperation(() => applicationService.addProperty(PropertyAdapter.toDomain(propertyData as StoreProperty)))
    },

    updateProperty: async (id, updates) => {
      await handleAsyncOperation(() => applicationService.updateProperty(id, updates))
    },

    removeProperty: async (id) => {
      await handleAsyncOperation(() => applicationService.deleteProperty(id))
    },

    clearProperties: async () => {
      await handleAsyncOperation(() => applicationService.clearAllProperties())
    },

    addVisit: async (propertyId, visit) => {
      await handleAsyncOperation(() => applicationService.addVisit({ propertyId, ...visit }))
    },

    updateVisit: async (propertyId, visitId, updates) => {
      await handleAsyncOperation(() => applicationService.updateVisit({ propertyId, visitId, updates }))
    },

    addContact: async (propertyId, contact) => {
      await handleAsyncOperation(() => applicationService.addContact({ propertyId, ...contact }))
    },

    updateContact: async (propertyId, contactId, updates) => {
      await handleAsyncOperation(() => applicationService.updateContact({ propertyId, contactId, updates }))
    },

    updatePropertyStatus: async (propertyId, status) => {
      await handleAsyncOperation(() => applicationService.updatePropertyStatus(propertyId, status))
    },

    updatePropertyPriority: async (propertyId, priority) => {
      await handleAsyncOperation(() => applicationService.updatePropertyPriority(propertyId, priority))
    },

    exportProperties: async (options) => {
      try {
        const exportOptions = {
          format: 'tsv' as const,
          sortBy: 'score' as const,
          sortOrder: 'desc' as const,
          includeVisits: true,
          includeContacts: true,
          ...options
        }
        return await applicationService.exportProperties(exportOptions)
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },

    exportVisitData: async () => {
      try {
        return await applicationService.exportVisitData()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },

    updateScoringConfig: async (configs) => {
      await handleAsyncOperation(() => applicationService.updateScoringConfig(configs))
    },

    getScoringConfig: async () => {
      try {
        return await applicationService.getScoringConfig()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },

    setLoading: (loading) => {
      set({ isLoading: loading })
    },

    setError: (error) => {
      set({ error })
    },

    recalculateAllScores: async () => {
      await handleAsyncOperation(() => applicationService.recalculateAllScores())
    },

    calculateAndUpdatePropertyScore: async (propertyId) => {
      await handleAsyncOperation(() => applicationService.calculateAndUpdatePropertyScore(propertyId))
    }
  }
})
