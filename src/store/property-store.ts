import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateUniqueId } from '@/lib/utils'

export type PropertyType = 'vivienda' | 'habitacion'

// 3-state system for property features
export type PropertyFeatureState = 'has' | 'not_has' | 'not_mentioned'

// Contact status tracking
export type ContactStatus = 'pending' | 'contacted' | 'responded' | 'scheduled' | 'visited' | 'no_response' | 'not_interested'

// Visit status management
export type VisitStatus = 'requested' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

// Property status
export type PropertyStatus = 'available' | 'under_contract' | 'sold' | 'visited' | 'not_interested' | 'off_market'

// Priority system
export type PriorityLevel = 'high' | 'medium' | 'low'

// Visit checklist item
export interface VisitChecklistItem {
  id: string
  category: string
  question: string
  checked: boolean
  notes?: string
}

// Visit record
export interface VisitRecord {
  id: string
  date: Date | string
  status: VisitStatus
  notes?: string
  checklist: VisitChecklistItem[]
  contactMethod?: string
  contactPerson?: string
  scheduledTime?: string
  actualTime?: string
  duration?: number // in minutes
  followUpDate?: Date | string
  followUpNotes?: string
}

// Contact record
export interface ContactRecord {
  id: string
  date: Date | string
  method: 'phone' | 'email' | 'whatsapp' | 'idealista' | 'other'
  status: ContactStatus
  notes?: string
  contactPerson?: string
  responseTime?: number // in hours
  nextAction?: string
  nextActionDate?: Date | string
}

// Helper function to migrate old boolean properties to 3-state system
export const migrateBooleanToFeatureState = (value: boolean | undefined): PropertyFeatureState | null => {
  if (value === true) return 'has'
  if (value === false) return 'not_has'
  return null // null means not mentioned/not found
}

export interface Property {
  id: string | number
  title?: string
  price: number
  location?: string
  squareMeters?: number
  size?: number // Keep for backward compatibility
  rooms: number
  bathrooms: number
  floor: string
  elevator: PropertyFeatureState | null
  parking?: PropertyFeatureState | null
  terrace?: PropertyFeatureState | null
  balcony?: PropertyFeatureState | null
  airConditioning?: PropertyFeatureState | null
  heating: PropertyFeatureState | null
  url: string
  imageUrl?: string
  image?: string // Keep for backward compatibility with content script
  score: number
  notes?: string
  propertyType?: PropertyType // New field to distinguish between vivienda and habitacion
  createdAt?: Date | string
  updatedAt?: Date | string
  addedAt?: string
  lastUpdated?: string
  phone?: string
  professional?: string
  monthsMentioned?: string[]
  energyCert?: string
  // Additional parameters from scoring algorithms
  furnished?: PropertyFeatureState | null
  seasonal?: PropertyFeatureState | null
  desk?: number
  orientation?: string
  pricePerM2?: number

  deposit?: number
  energy?: string
  maintenance?: number
  garden?: PropertyFeatureState | null
  pool?: PropertyFeatureState | null
  accessible?: PropertyFeatureState | null
  cleaningIncluded?: PropertyFeatureState | null
  lgbtFriendly?: PropertyFeatureState | null
  ownerNotPresent?: PropertyFeatureState | null
  privateBathroom?: PropertyFeatureState | null
  window?: PropertyFeatureState | null
  couplesAllowed?: PropertyFeatureState | null
  minorsAllowed?: boolean
  publicationDate?: string
  
  // Vivienda-specific fields
  builtInWardrobes?: PropertyFeatureState | null // Armarios empotrados
  garage?: PropertyFeatureState | null // Garaje
  storage?: PropertyFeatureState | null // Trastero
  condition?: string // Estado: 'obra nueva', 'buen estado', 'a reformar'
  propertySubType?: string // Tipo de vivienda: 'piso', 'ático', 'dúplex', 'casa', 'chalet', etc.
  hasFloorPlan?: PropertyFeatureState | null // Con plano
  hasVirtualTour?: PropertyFeatureState | null // Con visita virtual
  bankAd?: PropertyFeatureState | null // Tipo de anuncio: De bancos
  
  // Habitación-specific fields
  gender?: string // Tú eres: 'chico', 'chica'
  smokers?: PropertyFeatureState | null // Fumadores
  bed?: PropertyFeatureState | null // Cama
  roommates?: number // Compartir casa con: número de personas

  // NEW: Visit and Contact Tracking
  contactStatus?: ContactStatus
  propertyStatus?: PropertyStatus
  priority?: PriorityLevel
  visits?: VisitRecord[]
  contacts?: ContactRecord[]
  visitNotes?: string
  lastContactDate?: Date | string
  nextFollowUpDate?: Date | string
}

export interface PropertyMetrics {
  totalProperties: number
  averagePrice: number
  averageSize: number
  averageScore: number
  priceRange: {
    min: number
    max: number
  }
  sizeRange: {
    min: number
    max: number
  }
  // NEW: Visit and Contact Metrics
  visitMetrics: {
    totalVisits: number
    completedVisits: number
    pendingVisits: number
    averageResponseTime: number
    visitSuccessRate: number
  }
  contactMetrics: {
    totalContacts: number
    respondedContacts: number
    scheduledVisits: number
    averageResponseTime: number
  }
  statusDistribution: {
    available: number
    under_contract: number
    sold: number
    visited: number
    not_interested: number
  }
  priorityDistribution: {
    high: number
    medium: number
    low: number
  }
}

interface PropertyStore {
  properties: Property[]
  metrics: PropertyMetrics
  isLoading: boolean
  error: string | null
  
  // Actions
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  removeProperty: (id: string) => void
  clearProperties: () => void
  importProperties: (properties: Property[]) => void
  exportProperties: () => Property[]
  refreshProperties: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // NEW: Visit and Contact Actions
  addVisit: (propertyId: string, visit: Omit<VisitRecord, 'id'>) => void
  updateVisit: (propertyId: string, visitId: string, updates: Partial<VisitRecord>) => void
  removeVisit: (propertyId: string, visitId: string) => void
  addContact: (propertyId: string, contact: Omit<ContactRecord, 'id'>) => void
  updateContact: (propertyId: string, contactId: string, updates: Partial<ContactRecord>) => void
  removeContact: (propertyId: string, contactId: string) => void
  updatePropertyStatus: (propertyId: string, status: PropertyStatus) => void
  updateContactStatus: (propertyId: string, status: ContactStatus) => void
  updatePriority: (propertyId: string, priority: PriorityLevel) => void
  addVisitNotes: (propertyId: string, notes: string) => void
  exportVisitData: () => string
  
  // Computed
  getPropertyById: (id: string) => Property | undefined
  getPropertiesByScore: (minScore: number) => Property[]
  getPropertiesByStatus: (status: PropertyStatus) => Property[]
  getPropertiesByPriority: (priority: PriorityLevel) => Property[]
  getPropertiesByContactStatus: (status: ContactStatus) => Property[]
  getUpcomingVisits: () => Property[]
  getPropertiesNeedingFollowUp: () => Property[]
  calculateMetrics: () => PropertyMetrics
}

const calculateMetrics = (properties: Property[]): PropertyMetrics => {
  if (properties.length === 0) {
    return {
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
    }
  }

  const prices = properties.map(p => p.price).filter(p => p !== undefined)
  const sizes = properties.map(p => p.squareMeters || p.size).filter(s => s !== undefined)
  const scores = properties.map(p => p.score).filter(s => s !== undefined)

  // Calculate visit metrics
  const allVisits = properties.flatMap(p => p.visits || [])
  const completedVisits = allVisits.filter(v => v.status === 'completed')
  const pendingVisits = allVisits.filter(v => v.status === 'requested' || v.status === 'confirmed')
  const responseTimes = allVisits
    .filter(v => v.status === 'completed' && v.actualTime)
    .map(v => {
      const scheduled = new Date(v.scheduledTime || v.date)
      const actual = new Date(v.actualTime!)
      return Math.abs(actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60) // hours
    })

  // Calculate contact metrics
  const allContacts = properties.flatMap(p => p.contacts || [])
  const respondedContacts = allContacts.filter(c => c.status === 'responded' || c.status === 'scheduled' || c.status === 'visited')
  const scheduledFromContacts = allContacts.filter(c => c.status === 'scheduled' || c.status === 'visited')
  const contactResponseTimes = allContacts
    .filter(c => c.responseTime !== undefined)
    .map(c => c.responseTime!)

  // Calculate status distribution
  const statusCounts = properties.reduce((acc, p) => {
    const status = p.propertyStatus || 'available'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<PropertyStatus, number>)

  // Calculate priority distribution
  const priorityCounts = properties.reduce((acc, p) => {
    const priority = p.priority || 'medium'
    acc[priority] = (acc[priority] || 0) + 1
    return acc
  }, {} as Record<PriorityLevel, number>)

  return {
    totalProperties: properties.length,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    averageSize: sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    sizeRange: {
      min: sizes.length > 0 ? Math.min(...sizes) : 0,
      max: sizes.length > 0 ? Math.max(...sizes) : 0
    },
    visitMetrics: {
      totalVisits: allVisits.length,
      completedVisits: completedVisits.length,
      pendingVisits: pendingVisits.length,
      averageResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
      visitSuccessRate: allVisits.length > 0 ? Math.round((completedVisits.length / allVisits.length) * 100) : 0
    },
    contactMetrics: {
      totalContacts: allContacts.length,
      respondedContacts: respondedContacts.length,
      scheduledVisits: scheduledFromContacts.length,
      averageResponseTime: contactResponseTimes.length > 0 ? Math.round(contactResponseTimes.reduce((a, b) => a + b, 0) / contactResponseTimes.length) : 0
    },
    statusDistribution: {
      available: statusCounts.available || 0,
      under_contract: statusCounts.under_contract || 0,
      sold: statusCounts.sold || 0,
      visited: statusCounts.visited || 0,
      not_interested: statusCounts.not_interested || 0
    },
    priorityDistribution: {
      high: priorityCounts.high || 0,
      medium: priorityCounts.medium || 0,
      low: priorityCounts.low || 0
    }
  }
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      metrics: calculateMetrics([]),
      isLoading: false,
      error: null,

      addProperty: (propertyData) => {
        const existingIds = get().properties.map(p => String(p.id))
        const newProperty: Property = {
          ...propertyData,
          id: generateUniqueId(existingIds),
          createdAt: new Date(),
          updatedAt: new Date(),
          contactStatus: 'pending',
          propertyStatus: 'available',
          priority: 'medium',
          visits: [],
          contacts: []
        }
        
        set((state) => {
          const newProperties = [...state.properties, newProperty]
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      updateProperty: (id, updates) => {
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(id)
              ? { ...property, ...updates, updatedAt: new Date() }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      removeProperty: (id) => {
        set((state) => {
          const newProperties = state.properties.filter(property => String(property.id) !== String(id))
          
          // Notify background script of the deletion
          chrome.runtime.sendMessage({
            action: 'removeProperty',
            propertyId: id
          })
          
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      clearProperties: () => {
        set({
          properties: [],
          metrics: calculateMetrics([])
        })
      },

      importProperties: (properties) => {
        set(() => ({
          properties: properties.map(p => ({
            ...p,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            contactStatus: p.contactStatus || 'pending',
            propertyStatus: p.propertyStatus || 'available',
            priority: p.priority || 'medium',
            visits: p.visits || [],
            contacts: p.contacts || []
          })),
          metrics: calculateMetrics(properties)
        }))
      },

      refreshProperties: () => {
        // Load properties from Chrome storage and update the store
        chrome.storage.local.get(['properties'], (result) => {
          if (result.properties) {
            const properties = result.properties.map((p: any) => ({
              ...p,
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
              contactStatus: p.contactStatus || 'pending',
              propertyStatus: p.propertyStatus || 'available',
              priority: p.priority || 'medium',
              visits: p.visits || [],
              contacts: p.contacts || []
            }))
            set(() => ({
              properties,
              metrics: calculateMetrics(properties)
            }))
          }
        })
      },

      exportProperties: () => {
        return get().properties
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // NEW: Visit and Contact Actions
      addVisit: (propertyId, visit) => {
        const visitId = generateUniqueId([])
        const newVisit: VisitRecord = {
          ...visit,
          id: visitId,
          date: new Date(),
          checklist: visit.checklist || []
        }
        
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  visits: [...(property.visits || []), newVisit],
                  updatedAt: new Date(),
                  lastContactDate: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      updateVisit: (propertyId, visitId, updates) => {
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  visits: (property.visits || []).map(visit =>
                    visit.id === visitId
                      ? { ...visit, ...updates }
                      : visit
                  ),
                  updatedAt: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      removeVisit: (propertyId, visitId) => {
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  visits: (property.visits || []).filter(visit => visit.id !== visitId),
                  updatedAt: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      addContact: (propertyId, contact) => {
        const contactId = generateUniqueId([])
        const newContact: ContactRecord = {
          ...contact,
          id: contactId,
          date: new Date()
        }
        
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  contacts: [...(property.contacts || []), newContact],
                  updatedAt: new Date(),
                  lastContactDate: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      updateContact: (propertyId, contactId, updates) => {
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  contacts: (property.contacts || []).map(contact =>
                    contact.id === contactId
                      ? { ...contact, ...updates }
                      : contact
                  ),
                  updatedAt: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      removeContact: (propertyId, contactId) => {
        set((state) => {
          const newProperties = state.properties.map(property =>
            String(property.id) === String(propertyId)
              ? {
                  ...property,
                  contacts: (property.contacts || []).filter(contact => contact.id !== contactId),
                  updatedAt: new Date()
                }
              : property
          )
          return {
            properties: newProperties,
            metrics: calculateMetrics(newProperties)
          }
        })
      },

      updatePropertyStatus: (propertyId, status) => {
        get().updateProperty(propertyId, { propertyStatus: status })
      },

      updateContactStatus: (propertyId, status) => {
        get().updateProperty(propertyId, { contactStatus: status })
      },

      updatePriority: (propertyId, priority) => {
        get().updateProperty(propertyId, { priority })
      },

      addVisitNotes: (propertyId, notes) => {
        const property = get().getPropertyById(propertyId)
        if (property) {
          const currentNotes = property.visitNotes || ''
          const newNotes = currentNotes ? `${currentNotes}\n\n${new Date().toLocaleDateString()}: ${notes}` : `${new Date().toLocaleDateString()}: ${notes}`
          get().updateProperty(propertyId, { visitNotes: newNotes })
        }
      },

      exportVisitData: () => {
        const properties = get().properties
        const visitData = properties.map(property => ({
          id: property.id,
          title: property.title,
          price: property.price,
          location: property.location,
          contactStatus: property.contactStatus,
          propertyStatus: property.propertyStatus,
          priority: property.priority,
          visits: property.visits || [],
          contacts: property.contacts || [],
          visitNotes: property.visitNotes,
          lastContactDate: property.lastContactDate,
          nextFollowUpDate: property.nextFollowUpDate
        }))
        
        return JSON.stringify(visitData, null, 2)
      },

      getPropertyById: (id) => {
        return get().properties.find(property => String(property.id) === String(id))
      },

      getPropertiesByScore: (minScore) => {
        return get().properties.filter(property => property.score >= minScore)
      },

      getPropertiesByStatus: (status) => {
        return get().properties.filter(property => property.propertyStatus === status)
      },

      getPropertiesByPriority: (priority) => {
        return get().properties.filter(property => property.priority === priority)
      },

      getPropertiesByContactStatus: (status) => {
        return get().properties.filter(property => property.contactStatus === status)
      },

      getUpcomingVisits: () => {
        const now = new Date()
        return get().properties.filter(property => 
          (property.visits || []).some(visit => 
            visit.status === 'confirmed' && 
            new Date(visit.scheduledTime || visit.date) > now
          )
        )
      },

      getPropertiesNeedingFollowUp: () => {
        const now = new Date()
        return get().properties.filter(property => 
          property.nextFollowUpDate && 
          new Date(property.nextFollowUpDate) <= now
        )
      },

      calculateMetrics: () => {
        const properties = get().properties
        return calculateMetrics(properties)
      }
    }),
    {
      name: 'idea-lista-properties',
      version: 2 // Increment version for new data structure
    }
  )
)
