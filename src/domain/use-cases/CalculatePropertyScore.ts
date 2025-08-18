import { Property } from '../entities/Property'
import { ScoringConfig } from '../entities/PropertyType'

export class CalculatePropertyScore {
  static calculate(property: Property, config: ScoringConfig): number {
    let totalScore = 0
    let maxPossibleScore = 0

    // Price scoring (with 50% premium when essential)
    if (config.weights.price > 0) {
      const priceWeight = config.weights.price === 2 ? 3 : config.weights.price // 50% premium for essential
      const priceScore = this.calculatePriceScore(property.price, config.ranges.priceRange)
      totalScore += priceScore * priceWeight
      maxPossibleScore += priceWeight
    }

    // Size scoring
    if (config.weights.size > 0 && property.squareMeters) {
      const sizeScore = this.calculateSizeScore(property.squareMeters, config.ranges.sizeRange)
      totalScore += sizeScore * config.weights.size
      maxPossibleScore += config.weights.size
    }

    // Rooms scoring
    if (config.weights.rooms > 0) {
      const roomScore = this.calculateRoomScore(property.rooms, config.ranges.roomRange)
      totalScore += roomScore * config.weights.rooms
      maxPossibleScore += config.weights.rooms
    }

    // Bathrooms scoring
    if (config.weights.bathrooms > 0) {
      const bathroomScore = this.calculateBathroomScore(property.bathrooms, config.ranges.bathroomRange)
      totalScore += bathroomScore * config.weights.bathrooms
      maxPossibleScore += config.weights.bathrooms
    }

    // Feature scoring
    if (config.weights.heating > 0) {
      const heatingScore = this.calculateFeatureScore(property.heating)
      totalScore += heatingScore * config.weights.heating
      maxPossibleScore += config.weights.heating
    }

    if (config.weights.elevator > 0) {
      const elevatorScore = this.calculateFeatureScore(property.elevator)
      totalScore += elevatorScore * config.weights.elevator
      maxPossibleScore += config.weights.elevator
    }

    if (config.weights.furnished > 0) {
      const furnishedScore = this.calculateFeatureScore(property.furnished)
      totalScore += furnishedScore * config.weights.furnished
      maxPossibleScore += config.weights.furnished
    }

    if (config.weights.parking > 0) {
      const parkingScore = this.calculateFeatureScore(property.parking)
      totalScore += parkingScore * config.weights.parking
      maxPossibleScore += config.weights.parking
    }

    // Calculate final score (0-100)
    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
  }

  private static calculatePriceScore(price: number, range: { min: number; max: number }): number {
    if (price <= range.min) return 1.0 // Best score for lowest price
    if (price >= range.max) return 0.0 // Worst score for highest price
    
    // Linear interpolation: lower price = higher score
    const normalizedPrice = (price - range.min) / (range.max - range.min)
    return 1.0 - normalizedPrice
  }

  private static calculateSizeScore(size: number, range: { min: number; max: number }): number {
    if (size <= range.min) return 0.0 // Too small
    if (size >= range.max) return 1.0 // Perfect size
    
    // Linear interpolation: bigger size = higher score (up to max)
    const normalizedSize = (size - range.min) / (range.max - range.min)
    return normalizedSize
  }

  private static calculateRoomScore(rooms: number, range: { min: number; max: number }): number {
    if (rooms < range.min) return 0.0
    if (rooms >= range.max) return 1.0
    
    // Linear interpolation: more rooms = higher score (up to max)
    const normalizedRooms = (rooms - range.min) / (range.max - range.min)
    return normalizedRooms
  }

  private static calculateBathroomScore(bathrooms: number, range: { min: number; max: number }): number {
    if (bathrooms < range.min) return 0.0
    if (bathrooms >= range.max) return 1.0
    
    // Linear interpolation: more bathrooms = higher score (up to max)
    const normalizedBathrooms = (bathrooms - range.min) / (range.max - range.min)
    return normalizedBathrooms
  }

  private static calculateFeatureScore(feature: 'has' | 'not_has' | 'not_mentioned' | null | undefined): number {
    switch (feature) {
      case 'has': return 1.0
      case 'not_has': return 0.0
      case 'not_mentioned': return 0.5 // Neutral score for unknown
      default: return 0.5
    }
  }
}
