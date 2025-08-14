import { create } from 'zustand'
import { Property as StoreProperty } from './property-store'
import { PropertyApplicationService, PropertyMetrics } from '../application/services/PropertyApplicationService'
import { PropertyAdapter } from '../infrastructure/adapters/PropertyAdapter'
import { container } from '../infrastructure/di/container'

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
  addProperty: (propertyData: Omit<StoreProperty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProperty: (id: string, updates: Partial<StoreProperty>) => Promise<void>
  removeProperty: (id: string) => Promise<void>
  clearProperties: () => Promise<void>
  
  // Visit and Contact Actions
  addVisit: (propertyId: string, visit: any) => Promise<void>
  updateVisit: (propertyId: string, visitId: string, updates: any) => Promise<void>
  addContact: (propertyId: string, contact: any) => Promise<void>
  updateContact: (propertyId: string, contactId: string, updates: any) => Promise<void>
  updatePropertyStatus: (propertyId: string, status: StoreProperty['propertyStatus']) => Promise<void>
  updatePropertyPriority: (propertyId: string, priority: StoreProperty['priority']) => Promise<void>
  
  // Export Actions
  exportProperties: () => Promise<string>
  exportVisitData: () => Promise<string>
  
  // Configuration Actions
  updateScoringConfig: (configs: any) => Promise<void>
  getScoringConfig: () => Promise<any>
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCleanPropertyStore = create<CleanPropertyStore>((set, get) => {
  // Get the application service from the DI container
  const applicationService = container.getPropertyApplicationService()

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
      set({ isLoading: true, error: null })
      try {
        // Load properties from storage
        const domainProperties = await applicationService.getAllProperties()
        
        // Convert to store properties
        const properties = domainProperties.map(p => PropertyAdapter.toStore(p))
        
        // Calculate metrics
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
    },

    refreshProperties: async () => {
      set({ isLoading: true })
      try {
        const domainProperties = await applicationService.getAllProperties()
        const properties = domainProperties.map(p => PropertyAdapter.toStore(p))
        const metrics = await applicationService.calculateMetrics()
        
        set({ properties, metrics, isLoading: false })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    addProperty: async (propertyData) => {
      set({ isLoading: true, error: null })
      try {
        // Convert store property to domain property
        const domainProperty = PropertyAdapter.toDomain(propertyData as StoreProperty)
        await applicationService.addProperty(domainProperty)
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    updateProperty: async (id, updates) => {
      set({ isLoading: true, error: null })
      try {
        // Convert store property updates to domain property updates
        const domainUpdates = updates as any
        await applicationService.updateProperty(id, domainUpdates)
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    removeProperty: async (id) => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.deleteProperty(id)
        // Update state immediately like clearProperties does
        const currentProperties = get().properties
        const updatedProperties = currentProperties.filter(p => String(p.id) !== String(id))
        const metrics = await applicationService.calculateMetrics()
        set({ properties: updatedProperties, metrics, isLoading: false })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    clearProperties: async () => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.clearAllProperties()
        set({ properties: [], metrics: await applicationService.calculateMetrics(), isLoading: false })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    addVisit: async (propertyId, visit) => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.addVisit({
          propertyId,
          status: visit.status,
          notes: visit.notes,
          checklist: visit.checklist || [],
          contactMethod: visit.contactMethod,
          contactPerson: visit.contactPerson,
          scheduledTime: visit.scheduledTime,
          duration: visit.duration,
          followUpDate: visit.followUpDate,
          followUpNotes: visit.followUpNotes
        })
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    updateVisit: async (propertyId, visitId, updates) => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.updateVisit({
          propertyId,
          visitId,
          updates
        })
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    addContact: async (propertyId, contact) => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.addContact({
          propertyId,
          method: contact.method,
          status: contact.status,
          notes: contact.notes,
          contactPerson: contact.contactPerson,
          responseTime: contact.responseTime,
          nextAction: contact.nextAction,
          nextActionDate: contact.nextActionDate
        })
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    updateContact: async (propertyId, contactId, updates) => {
      set({ isLoading: true, error: null })
      try {
        await applicationService.updateContact({
          propertyId,
          contactId,
          updates
        })
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    updatePropertyStatus: async (propertyId, status) => {
      set({ isLoading: true, error: null })
      try {
        if (status) {
          await applicationService.updatePropertyStatus(propertyId, status)
          await get().refreshProperties()
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    updatePropertyPriority: async (propertyId, priority) => {
      set({ isLoading: true, error: null })
      try {
        if (priority) {
          await applicationService.updatePropertyPriority(propertyId, priority)
          await get().refreshProperties()
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    exportProperties: async () => {
      try {
        return await applicationService.exportProperties()
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
      set({ isLoading: true, error: null })
      try {
        await applicationService.updateScoringConfig(configs)
        await get().refreshProperties()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        })
      }
    },

    getScoringConfig: async () => {
      try {
        return await applicationService.getScoringConfig()
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error })
  }
})
