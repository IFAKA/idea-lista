export type PropertyType = 'vivienda' | 'habitacion'

export type FeatureWeight = 0 | 1 | 2 // Irrelevant, Valuable, Essential

export interface ScoringConfig {
  weights: {
    price: FeatureWeight
    size: FeatureWeight
    rooms: FeatureWeight
    bathrooms: FeatureWeight
    heating: FeatureWeight
    elevator: FeatureWeight
    furnished: FeatureWeight
    parking: FeatureWeight
  }
  ranges: {
    priceRange: { min: number; max: number }
    sizeRange: { min: number; max: number }
    roomRange: { min: number; max: number }
    bathroomRange: { min: number; max: number }
  }
}

export interface PropertyTypeConfigs {
  vivienda: ScoringConfig
  habitacion: ScoringConfig
}

export const defaultConfigs: PropertyTypeConfigs = {
  vivienda: {
    weights: {
      price: 2, // Essential
      size: 2, // Essential
      rooms: 2, // Essential
      bathrooms: 2, // Essential
      heating: 2, // Essential
      elevator: 2, // Essential
      furnished: 1, // Valuable
      parking: 1, // Valuable
    },
    ranges: {
      priceRange: { min: 500, max: 3000 },
      sizeRange: { min: 30, max: 150 },
      roomRange: { min: 1, max: 5 },
      bathroomRange: { min: 1, max: 3 },
    },
  },
  habitacion: {
    weights: {
      price: 2, // Essential
      size: 1, // Valuable
      rooms: 0, // Irrelevant (always 1)
      bathrooms: 1, // Valuable
      heating: 2, // Essential
      elevator: 1, // Valuable
      furnished: 2, // Essential
      parking: 1, // Valuable
    },
    ranges: {
      priceRange: { min: 200, max: 800 },
      sizeRange: { min: 8, max: 25 },
      roomRange: { min: 1, max: 1 },
      bathroomRange: { min: 1, max: 1 },
    },
  },
}
