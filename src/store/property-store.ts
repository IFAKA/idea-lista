import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateUniqueId } from '@/lib/utils'

export type PropertyType = 'vivienda' | 'habitacion'

// 3-state system for property features
export type PropertyFeatureState = 'has' | 'not_has' | 'not_mentioned'

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
  
  // Computed
  getPropertyById: (id: string) => Property | undefined
  getPropertiesByScore: (minScore: number) => Property[]
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
      sizeRange: { min: 0, max: 0 }
    }
  }

  const prices = properties.map(p => p.price).filter(p => p !== undefined)
  const sizes = properties.map(p => p.squareMeters || p.size).filter(s => s !== undefined)
  const scores = properties.map(p => p.score).filter(s => s !== undefined)

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
          updatedAt: new Date()
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
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
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
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
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

      getPropertyById: (id) => {
        return get().properties.find(property => String(property.id) === String(id))
      },

      getPropertiesByScore: (minScore) => {
        return get().properties.filter(property => property.score >= minScore)
      },

      calculateMetrics: () => {
        const properties = get().properties
        return calculateMetrics(properties)
      }
    }),
    {
      name: 'idea-lista-properties',
      version: 1
    }
  )
)
