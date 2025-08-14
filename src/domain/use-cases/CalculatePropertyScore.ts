import { Property } from '../entities/Property'
import { PropertyType, ScoringConfig, PropertyTypeConfigs } from '../entities/PropertyType'

export class CalculatePropertyScore {
  private configs: PropertyTypeConfigs

  constructor(configs: PropertyTypeConfigs) {
    this.configs = configs
  }

  execute(property: Property): number {
    const propertyType = property.propertyType || 'vivienda'
    const config = this.configs[propertyType]
    
    const scores = {
      price: this.calculatePriceScore(property.price, config),
      size: this.calculateSizeScore(property.squareMeters || 0, config),
      rooms: this.calculateRoomScore(property.rooms, config),
      bathrooms: this.calculateBathroomScore(property.bathrooms, config),
      elevator: property.elevator === 'has' ? 1 : 0,
      parking: property.parking === 'has' ? 1 : 0,
      terrace: property.terrace === 'has' ? 1 : 0,
      balcony: property.balcony === 'has' ? 1 : 0,
      airConditioning: property.airConditioning === 'has' ? 1 : 0,
      heating: property.heating === 'has' ? 1 : 0
    }

    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
      const importance = (config.weights as any)[key] || 0
      if (importance > 0) {
        const score100 = Math.round(score * 100)
        return total + (score100 * importance)
      }
      return total
    }, 0)

    const totalImportance = Object.values(config.weights).reduce((sum, importance) => sum + importance, 0)
    
    return totalImportance > 0 ? Math.round(totalScore / totalImportance) : 0
  }

  private calculatePriceScore(price: number, config: ScoringConfig): number {
    const { min, max } = config.priceRange
    
    const effectiveMin = min || 0
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    if (price >= effectiveMin && price <= effectiveMax) {
      const normalizedPrice = (price - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, 1 - normalizedPrice)
    }
    
    return 0
  }

  private calculateSizeScore(size: number, config: ScoringConfig): number {
    const { min, max } = config.sizeRange
    
    const effectiveMin = min || 0
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    if (size >= effectiveMin && size <= effectiveMax) {
      const normalizedSize = (size - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedSize))
    }
    
    return 0
  }

  private calculateRoomScore(rooms: number, config: ScoringConfig): number {
    const { min, max } = config.roomRange
    
    const effectiveMin = min || 1
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    if (rooms >= effectiveMin && rooms <= effectiveMax) {
      const normalizedRooms = (rooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedRooms))
    }
    
    return 0
  }

  private calculateBathroomScore(bathrooms: number, config: ScoringConfig): number {
    const { min, max } = config.bathroomRange
    
    const effectiveMin = min || 1
    const effectiveMax = max || Number.MAX_SAFE_INTEGER
    
    if (effectiveMax === effectiveMin) return 1
    
    if (bathrooms >= effectiveMin && bathrooms <= effectiveMax) {
      const normalizedBathrooms = (bathrooms - effectiveMin) / (effectiveMax - effectiveMin)
      return Math.max(0, Math.min(1, normalizedBathrooms))
    }
    
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
