import { PropertyTypeConfigs } from '../entities/PropertyType'

export const defaultViviendaConfig = {
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

export const defaultHabitacionConfig = {
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

// Default configurations for both property types
export const defaultPropertyTypeConfigs: PropertyTypeConfigs = {
  vivienda: defaultViviendaConfig,
  habitacion: defaultHabitacionConfig
}
