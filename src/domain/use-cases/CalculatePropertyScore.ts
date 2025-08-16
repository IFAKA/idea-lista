import { Property, PropertyFeatureState } from '../entities/Property'
import { PropertyType, ScoringConfig, PropertyTypeConfigs } from '../entities/PropertyType'

/**
 * Calculates property scores based on configured weights and preferences.
 * Simplified scoring system that focuses on core property attributes.
 */
export class CalculatePropertyScore {
  private configs: PropertyTypeConfigs

  constructor(configs: PropertyTypeConfigs) {
    this.configs = configs
  }

  execute(property: Property): number {
    const propertyType = property.propertyType || 'vivienda'
    const config = this.configs[propertyType]
    
    const scores = {
      // Core properties
      price: this.calculatePriceScore(property.price, config),
      size: this.calculateSizeScore(property.squareMeters || 0, config),
      rooms: this.calculateRoomScore(property.rooms, config),
      bathrooms: this.calculateBathroomScore(property.bathrooms, config),
      
      // Amenities (has = 1, not_has = 0, not_mentioned = 0.5)
      elevator: this.calculateAmenityScore(property.elevator),
      parking: this.calculateAmenityScore(property.parking),
      terrace: this.calculateAmenityScore(property.terrace),
      balcony: this.calculateAmenityScore(property.balcony),
      airConditioning: this.calculateAmenityScore(property.airConditioning),
      heating: this.calculateAmenityScore(property.heating),
      furnished: this.calculateAmenityScore(property.furnished),
      seasonal: this.calculateAmenityScore(property.seasonal),
      garden: this.calculateAmenityScore(property.garden),
      pool: this.calculateAmenityScore(property.pool),
      accessible: this.calculateAmenityScore(property.accessible),
      cleaningIncluded: this.calculateAmenityScore(property.cleaningIncluded),
      lgbtFriendly: this.calculateAmenityScore(property.lgbtFriendly),
      ownerNotPresent: this.calculateAmenityScore(property.ownerNotPresent),
      privateBathroom: this.calculateAmenityScore(property.privateBathroom),
      window: this.calculateAmenityScore(property.window),
      couplesAllowed: this.calculateAmenityScore(property.couplesAllowed),
      minorsAllowed: property.minorsAllowed ? 1.0 : 0.0,
      smokers: this.calculateAmenityScore(property.smokers),
      roommates: property.roommates ? Math.max(0, 1 - property.roommates / 5) : 0.5, // Fewer roommates = better
      bed: property.bed ? 1.0 : 0.0,
      hasFloorPlan: this.calculateAmenityScore(property.hasFloorPlan),
      hasVirtualTour: this.calculateAmenityScore(property.hasVirtualTour),
      bankAd: this.calculateAmenityScore(property.bankAd),
      gender: property.gender ? 1.0 : 0.0,
      
      // Additional features
      floor: this.calculateFloorScore(property.floor),
      desk: this.calculateDeskScore(property.desk || 0),
      orientation: this.calculateOrientationScore(property.orientation),
      builtInWardrobes: this.calculateAmenityScore(property.builtInWardrobes),
      garage: this.calculateAmenityScore(property.garage),
      storage: this.calculateAmenityScore(property.storage),
      condition: this.calculateConditionScore(property.condition),
      propertySubType: this.calculatePropertySubTypeScore(property.propertySubType),
      
      // Financial information
      deposit: this.calculateDepositScore(property.deposit || 0, property.price),
      maintenance: this.calculateMaintenanceScore(property.maintenance || 0, property.price),
      energy: this.calculateEnergyScore(property.energy),
      pricePerM2: this.calculatePricePerM2Score(property.pricePerM2 || 0),
      
      // Metadata
      publicationDate: this.calculatePublicationDateScore(property.publicationDate)
    }

    // Calculate weighted average score
    let totalScore = 0
    let totalWeight = 0

    Object.entries(scores).forEach(([key, score]) => {
      const importance = config.weights[key as keyof typeof config.weights] || 0
      if (importance > 0) {
        totalScore += score * importance
        totalWeight += importance
      }
    })
    
    // Return final score (0-100 scale)
    const finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0
    return Math.round(Math.max(0, Math.min(100, finalScore)))
  }

  // Amenity scoring (has = 1, not_has = 0, not_mentioned = 0.5)
  private calculateAmenityScore(amenity: PropertyFeatureState | null | undefined): number {
    if (!amenity) return 0.5 // Not mentioned gets neutral score
    switch (amenity) {
      case 'has': return 1.0
      case 'not_has': return 0.0
      case 'not_mentioned': return 0.5
      default: return 0.5
    }
  }

  // Core scoring methods
  private calculatePriceScore(price: number, config: ScoringConfig): number {
    const { min, max } = config.priceRange
    const effectiveMin = min || 300
    const effectiveMax = max || 2000
    
    if (effectiveMax === effectiveMin) return 1
    
    if (price >= effectiveMin && price <= effectiveMax) {
      const normalizedPrice = (price - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, 1 - normalizedPrice) // Lower price = higher score
    }
    
    if (price < effectiveMin) return 1.0 // Below minimum is good (cheaper)
    
    const penalty = (price - effectiveMax) / effectiveMax
    return Math.max(0, 1 - penalty)
  }

  private calculateSizeScore(size: number, config: ScoringConfig): number {
    const { min, max } = config.sizeRange
    const effectiveMin = min || 20
    const effectiveMax = max || 200
    
    if (effectiveMax === effectiveMin) return 1
    
    if (size >= effectiveMin && size <= effectiveMax) {
      const normalizedSize = (size - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedSize)) // Bigger = higher score
    }
    
    if (size < effectiveMin) return 0.0 // Too small
    return 1.0 // Bigger is better
  }

  private calculateRoomScore(rooms: number, config: ScoringConfig): number {
    const { min, max } = config.roomRange
    const effectiveMin = min || 1
    const effectiveMax = max || 6
    
    if (effectiveMax === effectiveMin) return 1
    
    if (rooms >= effectiveMin && rooms <= effectiveMax) {
      const normalizedRooms = (rooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedRooms)) // More rooms = higher score
    }
    
    if (rooms < effectiveMin) return 0.0 // Too few rooms
    return 1.0 // More rooms is better
  }

  private calculateBathroomScore(bathrooms: number, config: ScoringConfig): number {
    const { min, max } = config.bathroomRange
    const effectiveMin = min || 1
    const effectiveMax = max || 4
    
    if (effectiveMax === effectiveMin) return 1
    
    if (bathrooms >= effectiveMin && bathrooms <= effectiveMax) {
      const normalizedBathrooms = (bathrooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedBathrooms)) // More bathrooms = higher score
    }
    
    if (bathrooms < effectiveMin) return 0.0 // Too few bathrooms
    return 1.0 // More bathrooms is better
  }

  // Additional scoring methods
  private calculateFloorScore(floor: string | undefined): number {
    if (!floor) return 0.5
    const floorNum = parseInt(floor)
    if (isNaN(floorNum)) return 0.5
    
    // Middle floors (2-4) score highest
    if (floorNum >= 2 && floorNum <= 4) return 1.0
    if (floorNum === 1) return 0.8
    if (floorNum >= 5) return 0.6
    return 0.5
  }

  private calculateDeskScore(desk: number): number {
    if (desk <= 0) return 0.0
    return Math.min(1, desk / 10) // 10+ desk rating = perfect score
  }

  private calculateOrientationScore(orientation: string | undefined): number {
    if (!orientation) return 0.5
    const orient = orientation.toLowerCase()
    
    if (orient.includes('sur') || orient.includes('south')) return 1.0
    if (orient.includes('este') || orient.includes('east')) return 0.8
    if (orient.includes('oeste') || orient.includes('west')) return 0.7
    if (orient.includes('norte') || orient.includes('north')) return 0.5
    return 0.5
  }

  private calculateConditionScore(condition: string | undefined): number {
    if (!condition) return 0.5
    const cond = condition.toLowerCase()
    
    if (cond.includes('excelente')) return 1.0
    if (cond.includes('muy bueno')) return 0.9
    if (cond.includes('bueno')) return 0.8
    if (cond.includes('regular')) return 0.6
    if (cond.includes('malo')) return 0.3
    return 0.5
  }

  private calculatePropertySubTypeScore(subType: string | undefined): number {
    if (!subType) return 0.5
    // All subtypes get neutral score for now
    return 0.5
  }

  private calculateDepositScore(deposit: number, price: number): number {
    if (deposit <= 0 || price <= 0) return 0.5
    const ratio = deposit / price
    // Lower deposit ratio is better (1 month = 0.5, 2 months = 0.25, etc.)
    return Math.max(0, 1 - ratio)
  }

  private calculateMaintenanceScore(maintenance: number, price: number): number {
    if (maintenance <= 0 || price <= 0) return 0.5
    const ratio = maintenance / price
    // Lower maintenance ratio is better
    return Math.max(0, 1 - ratio)
  }

  private calculateEnergyScore(energy: string | undefined): number {
    if (!energy) return 0.5
    const energyLevel = energy.toUpperCase()
    
    switch (energyLevel) {
      case 'A': return 1.0
      case 'B': return 0.9
      case 'C': return 0.8
      case 'D': return 0.7
      case 'E': return 0.6
      case 'F': return 0.4
      case 'G': return 0.2
      default: return 0.5
    }
  }

  private calculatePricePerM2Score(pricePerM2: number): number {
    if (pricePerM2 <= 0) return 0.5
    // Lower price per m² is better
    return Math.max(0, 1 - (pricePerM2 / 20)) // €20/m² = 0, €0/m² = 1
  }

  private calculatePublicationDateScore(publicationDate: string | undefined): number {
    if (!publicationDate) return 0.5
    const pubDate = new Date(publicationDate)
    const now = new Date()
    const daysDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Newer listings score higher
    if (daysDiff <= 7) return 1.0
    if (daysDiff <= 30) return 0.8
    if (daysDiff <= 90) return 0.6
    return 0.4
  }

  // Configuration methods
  updateConfig(propertyType: PropertyType, config: ScoringConfig): void {
    this.configs[propertyType] = config
  }

  getAllConfigs(): PropertyTypeConfigs {
    return this.configs
  }
}
