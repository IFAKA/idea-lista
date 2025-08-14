import { defaultViviendaConfig } from '../use-cases/default-configs'

export type PropertyType = 'vivienda' | 'habitacion'

export interface ScoringImportance {
  price: number
  size: number
  rooms: number
  bathrooms: number
  floor: number
  heating: number
  elevator: number
  airConditioning: number
  furnished: number
  parking: number
  terrace: number
  balcony: number
  seasonal: number
  builtInWardrobes: number
  garage: number
  storage: number
  condition: number
  propertySubType: number
  hasFloorPlan: number
  hasVirtualTour: number
  bankAd: number
  gender: number
  smokers: number
  bed: number
  roommates: number
  couplesAllowed: number
  minorsAllowed: number
  window: number
  privateBathroom: number
  cleaningIncluded: number
  lgbtFriendly: number
  ownerNotPresent: number
  desk: number
  orientation: number
  deposit: number
  maintenance: number
  energy: number
  garden: number
  pool: number
  accessible: number
  publicationDate: number
}

export interface ScoringConfig {
  weights: ScoringImportance
  priceRange: { min: number | null; max: number | null }
  sizeRange: { min: number | null; max: number | null }
  roomRange: { min: number | null; max: number | null }
  bathroomRange: { min: number | null; max: number | null }
}

export interface PropertyTypeConfigs {
  vivienda: ScoringConfig
  habitacion: ScoringConfig
}

export function getDefaultLevels(): Record<keyof ScoringImportance, 'irrelevante' | 'valorable' | 'esencial'> {
  const levels: Partial<Record<keyof ScoringImportance, 'irrelevante' | 'valorable' | 'esencial'>> = {}
  
  // Set all properties to irrelevant by default
  for (const key of Object.keys(defaultViviendaConfig.weights)) {
    levels[key as keyof ScoringImportance] = 'irrelevante'
  }
  
  return levels as Record<keyof ScoringImportance, 'irrelevante' | 'valorable' | 'esencial'>
}

export function levelToNumericImportance(level: 'irrelevante' | 'valorable' | 'esencial'): number {
  switch (level) {
    case 'irrelevante': return 0
    case 'valorable': return 1
    case 'esencial': return 2
  }
}

export function convertLevelsToImportance(levels: Record<keyof ScoringImportance, 'irrelevante' | 'valorable' | 'esencial'>): ScoringImportance {
  const importance: Partial<ScoringImportance> = {}
  
  for (const [key, level] of Object.entries(levels)) {
    importance[key as keyof ScoringImportance] = levelToNumericImportance(level)
  }
  
  return importance as ScoringImportance
}
