import { Property, PropertyType } from '@/store/property-store'

export type ImportanceLevel = 'irrelevante' | 'valorable' | 'esencial'

export interface ScoringImportance {
  // Core financial and size
  price: number
  size: number
  rooms: number
  bathrooms: number
  floor: number
  
  // Essential amenities
  heating: number
  elevator: number
  airConditioning: number
  
  // Convenience features
  furnished: number
  parking: number
  terrace: number
  balcony: number
  
  // Vivienda-specific features
  seasonal: number // Tipo de alquiler (Temporal)
  builtInWardrobes: number // Armarios empotrados
  garage: number // Garaje
  storage: number // Trastero
  condition: number // Estado (Obra nueva, Buen estado, A reformar)
  propertySubType: number // Tipo de vivienda (Pisos, áticos, dúplex, etc.)
  hasFloorPlan: number // Con plano
  hasVirtualTour: number // Con visita virtual
  bankAd: number // Tipo de anuncio (De bancos)
  
  // Habitación-specific features
  gender: number // Tú eres (Chico/Chica)
  smokers: number // Fumadores
  bed: number // Cama
  roommates: number // Compartir casa con (1, 2, 3+ personas)
  couplesAllowed: number // Admite parejas
  minorsAllowed: number // Admite menores de edad
  window: number // Ventana a la calle
  privateBathroom: number // Baño privado
  cleaningIncluded: number // Limpieza incluida
  lgbtFriendly: number // LGTB friendly
  ownerNotPresent: number // El propietario/a no vive en la casa
  
  // Additional features (shared)
  desk: number
  orientation: number
  
  // Financial information
  deposit: number
  maintenance: number
  energy: number
  
  // Additional amenities (shared)
  garden: number
  pool: number
  accessible: number
  
  // Metadata
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

export class ScoringService {
  private configs: PropertyTypeConfigs

  constructor(configs: PropertyTypeConfigs) {
    this.configs = configs
  }

  calculateScore(property: Property): number {
    const propertyType = property.propertyType || 'vivienda' // Default to vivienda for legacy properties
    const config = this.configs[propertyType]
    
    // Simple state-based scoring: Essential (2) > Valuable (1) > Irrelevant (0)
    const scores = {
      price: this.calculatePriceScore(property.price, config),
      size: this.calculateSizeScore(
        property.squareMeters !== undefined
          ? property.squareMeters
          : property.size !== undefined
            ? property.size
            : 0,
        config
      ),
      rooms: this.calculateRoomScore(property.rooms ?? 0, config),
      bathrooms: this.calculateBathroomScore(property.bathrooms ?? 0, config),
      elevator: property.elevator ? 1 : 0,
      parking: property.parking ? 1 : 0,
      terrace: property.terrace ? 1 : 0,
      balcony: property.balcony ? 1 : 0,
      airConditioning: property.airConditioning ? 1 : 0,
      heating: property.heating ? 1 : 0
    }

    // Calculate score based on state importance (Essential = 2, Valuable = 1, Irrelevant = 0)
    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
      const importance = config.weights[key as keyof ScoringImportance] || 0
      // Only count scores for properties that are not irrelevant
      if (importance > 0) {
        const score100 = Math.round(score * 100)
        return total + (score100 * importance)
      }
      return total
    }, 0)

    const totalImportance = Object.values(config.weights).reduce((sum, importance) => sum + importance, 0)
    
    // Calculate final score as percentage of total possible score
    const finalScore = totalImportance > 0 ? Math.round(totalScore / totalImportance) : 0
    
    return finalScore
  }

  private calculatePriceScore(price: number, config: ScoringConfig): number {
    const { min, max } = config.priceRange
    
    // Handle "don't care" values (null)
    const effectiveMin = min || 0
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    // If price is within the range, give good score
    if (price >= effectiveMin && price <= effectiveMax) {
      // Lower price = higher score (inverted within range)
      const normalizedPrice = (price - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, 1 - normalizedPrice)
    }
    
    // If price is outside the range, give bad score
    return 0
  }

  private calculateSizeScore(size: number, config: ScoringConfig): number {
    const { min, max } = config.sizeRange
    
    // Handle "don't care" values (null)
    const effectiveMin = min || 0
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    // If size is within the range, give good score
    if (size >= effectiveMin && size <= effectiveMax) {
      // Higher size = higher score
      const normalizedSize = (size - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedSize))
    }
    
    // If size is outside the range, give bad score
    return 0
  }

  private calculateRoomScore(rooms: number, config: ScoringConfig): number {
    const { min, max } = config.roomRange
    
    // Handle "don't care" values (null)
    const effectiveMin = min || 1
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    // If rooms is within the range, give good score
    if (rooms >= effectiveMin && rooms <= effectiveMax) {
      // Higher rooms = higher score (up to a point)
      const normalizedRooms = (rooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedRooms))
    }
    
    // If rooms is outside the range, give bad score
    return 0
  }

  private calculateBathroomScore(bathrooms: number, config: ScoringConfig): number {
    const { min, max } = config.bathroomRange
    
    // Handle "don't care" values (null)
    const effectiveMin = min || 1
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    // If bathrooms is within the range, give good score
    if (bathrooms >= effectiveMin && bathrooms <= effectiveMax) {
      // Higher bathrooms = higher score (up to a point)
      const normalizedBathrooms = (bathrooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedBathrooms))
    }
    
    // If bathrooms is outside the range, give bad score
    return 0
  }

  updateConfig(propertyType: PropertyType, newConfig: Partial<ScoringConfig>): void {
    this.configs[propertyType] = { ...this.configs[propertyType], ...newConfig }
  }

  getConfig(propertyType: PropertyType): ScoringConfig {
    return { ...this.configs[propertyType] }
  }

  getAllConfigs(): PropertyTypeConfigs {
    return { ...this.configs }
  }
}

// Simple state-based system - no importance balancing needed
export function getDefaultLevels(): Record<keyof ScoringImportance, ImportanceLevel> {
  const levels: Partial<Record<keyof ScoringImportance, ImportanceLevel>> = {}
  
  // Set all properties to irrelevant by default
  for (const key of Object.keys(defaultViviendaConfig.weights)) {
    levels[key as keyof ScoringImportance] = 'irrelevante'
  }
  
  return levels as Record<keyof ScoringImportance, ImportanceLevel>
}

export function levelToNumericImportance(level: ImportanceLevel): number {
  switch (level) {
    case 'irrelevante': return 0
    case 'valorable': return 1
    case 'esencial': return 2
  }
}

export function convertLevelsToImportance(levels: Record<keyof ScoringImportance, ImportanceLevel>): ScoringImportance {
  const importance: Partial<ScoringImportance> = {}
  
  for (const [key, level] of Object.entries(levels)) {
    importance[key as keyof ScoringImportance] = levelToNumericImportance(level)
  }
  
  return importance as ScoringImportance
}

// Default configurations for different property types
export const defaultViviendaConfig: ScoringConfig = {
  weights: {
    // Core financial and size - Essential for vivienda
    price: 2, // Essential
    size: 2, // Essential
    rooms: 2, // Essential
    bathrooms: 2, // Essential
    floor: 1, // Valuable
    
    // Essential amenities
    heating: 2, // Essential
    elevator: 2, // Essential
    airConditioning: 1, // Valuable
    
    // Convenience features
    furnished: 1, // Valuable
    parking: 2, // Essential
    terrace: 1, // Valuable
    balcony: 1, // Valuable
    
    // Vivienda-specific features
    seasonal: 1, // Valuable
    builtInWardrobes: 1, // Valuable
    garage: 1, // Valuable
    storage: 1, // Valuable
    condition: 1, // Valuable
    propertySubType: 1, // Valuable
    hasFloorPlan: 0, // Irrelevant
    hasVirtualTour: 0, // Irrelevant
    bankAd: 0, // Irrelevant
    
    // Habitación-specific features (not used in vivienda)
    gender: 0, // Irrelevant
    smokers: 0, // Irrelevant
    bed: 0, // Irrelevant
    roommates: 0, // Irrelevant
    couplesAllowed: 0, // Irrelevant
    minorsAllowed: 0, // Irrelevant
    window: 0, // Irrelevant
    privateBathroom: 0, // Irrelevant
    cleaningIncluded: 0, // Irrelevant
    lgbtFriendly: 0, // Irrelevant
    ownerNotPresent: 0, // Irrelevant
    
    // Additional features (shared)
    desk: 1, // Valuable
    orientation: 1, // Valuable
    
    // Financial information
    deposit: 1, // Valuable
    maintenance: 1, // Valuable
    energy: 1, // Valuable
    
    // Additional amenities (shared)
    garden: 1, // Valuable
    pool: 0, // Irrelevant
    accessible: 0, // Irrelevant
    
    // Metadata
    publicationDate: 0 // Irrelevant
  },
  priceRange: { min: null, max: null },
  sizeRange: { min: null, max: null },
  roomRange: { min: null, max: null },
  bathroomRange: { min: null, max: null }
}

export const defaultHabitacionConfig: ScoringConfig = {
  weights: {
    // Core financial and size - Essential for habitacion
    price: 2, // Essential
    size: 2, // Essential
    rooms: 0, // Irrelevant (always 1 for rooms)
    bathrooms: 1, // Valuable
    floor: 1, // Valuable
    
    // Essential amenities
    heating: 2, // Essential
    elevator: 2, // Essential
    airConditioning: 1, // Valuable
    
    // Convenience features
    furnished: 2, // Essential
    parking: 1, // Valuable
    terrace: 1, // Valuable
    balcony: 1, // Valuable
    
    // Vivienda-specific features (not used in habitacion)
    seasonal: 0, // Irrelevant
    builtInWardrobes: 0, // Irrelevant
    garage: 0, // Irrelevant
    storage: 0, // Irrelevant
    condition: 0, // Irrelevant
    propertySubType: 0, // Irrelevant
    hasFloorPlan: 0, // Irrelevant
    hasVirtualTour: 0, // Irrelevant
    bankAd: 0, // Irrelevant
    
    // Habitación-specific features (more important for habitacion)
    gender: 1, // Valuable
    smokers: 1, // Valuable
    bed: 1, // Valuable
    roommates: 2, // Essential
    couplesAllowed: 2, // Essential
    minorsAllowed: 1, // Valuable
    window: 2, // Essential
    privateBathroom: 2, // Essential
    cleaningIncluded: 1, // Valuable
    lgbtFriendly: 1, // Valuable
    ownerNotPresent: 1, // Valuable
    
    // Additional features (shared)
    desk: 1, // Valuable
    orientation: 1, // Valuable
    
    // Financial information
    deposit: 1, // Valuable
    maintenance: 1, // Valuable
    energy: 1, // Valuable
    
    // Additional amenities (shared)
    garden: 1, // Valuable
    pool: 0, // Irrelevant
    accessible: 1, // Valuable
    
    // Metadata
    publicationDate: 0 // Irrelevant
  },
  priceRange: { min: null, max: null },
  sizeRange: { min: null, max: null },
  roomRange: { min: null, max: null },
  bathroomRange: { min: null, max: null }
}

// Legacy default config for backward compatibility
export const defaultScoringConfig: ScoringConfig = defaultViviendaConfig

// Default configurations for both property types
export const defaultPropertyTypeConfigs: PropertyTypeConfigs = {
  vivienda: defaultViviendaConfig,
  habitacion: defaultHabitacionConfig
}
