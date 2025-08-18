import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { Property } from '../../domain/entities/Property'
import { PropertyTypeConfigs, ScoringConfig } from '../../domain/entities/PropertyType'
import { CalculatePropertyScore } from '../../domain/use-cases/CalculatePropertyScore'

export class PropertyApplicationService {
  constructor(private propertyRepository: PropertyRepository) {}

  async getAllProperties(): Promise<Property[]> {
    return await this.propertyRepository.getAllProperties()
  }

  async addProperty(propertyData: any): Promise<void> {
    const property = Property.fromRawData(propertyData)
    const config = await this.getConfig(property.propertyType)
    const scoredProperty = property.updateScore(CalculatePropertyScore.calculate(property, config))
    await this.propertyRepository.addProperty(scoredProperty)
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<void> {
    const properties = await this.getAllProperties()
    const property = properties.find(p => p.id === id)
    
    if (property) {
      const updatedProperty = new Property({ ...property.toData(), ...updates })
      const config = await this.getConfig(updatedProperty.propertyType)
      const scoredProperty = updatedProperty.updateScore(CalculatePropertyScore.calculate(updatedProperty, config))
      await this.propertyRepository.updateProperty(id, scoredProperty)
    }
  }

  async removeProperty(id: string): Promise<void> {
    await this.propertyRepository.removeProperty(id)
  }

  async clearProperties(): Promise<void> {
    await this.propertyRepository.clearProperties()
  }

  async addVisit(propertyId: string, visitData: any): Promise<void> {
    const properties = await this.getAllProperties()
    const property = properties.find(p => p.id === propertyId)
    
    if (property) {
      const updatedProperty = property.addVisit(visitData)
      await this.propertyRepository.updateProperty(propertyId, updatedProperty)
    }
  }

  async getScoringConfig(): Promise<PropertyTypeConfigs> {
    return await this.propertyRepository.getScoringConfig()
  }

  async updateScoringConfig(config: PropertyTypeConfigs): Promise<void> {
    await this.propertyRepository.updateScoringConfig(config)
    // Recalculate all property scores with new config
    await this.recalculateAllScores()
  }

  async getConfig(type: string): Promise<ScoringConfig> {
    return await this.propertyRepository.getConfig(type)
  }

  async recalculateAllScores(): Promise<void> {
    const properties = await this.getAllProperties()
    
    for (const property of properties) {
      const config = await this.getConfig(property.propertyType)
      const scoredProperty = property.updateScore(CalculatePropertyScore.calculate(property, config))
      await this.propertyRepository.updateProperty(property.id, scoredProperty)
    }
  }

  async exportProperties(options: {
    format: 'tsv' | 'json'
    sortBy?: 'score' | 'price' | 'date'
    sortOrder?: 'asc' | 'desc'
    includeVisits?: boolean
  }): Promise<string> {
    const properties = await this.getAllProperties()
    
    // Sort properties
    if (options.sortBy) {
      properties.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (options.sortBy) {
          case 'score':
            aValue = a.score
            bValue = b.score
            break
          case 'price':
            aValue = a.price
            bValue = b.price
            break
          case 'date':
            aValue = a.createdAt
            bValue = b.createdAt
            break
          default:
            return 0
        }
        
        if (options.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    if (options.format === 'tsv') {
      return this.exportToTSV(properties, options.includeVisits)
    } else {
      return JSON.stringify(properties.map(p => p.toData()), null, 2)
    }
  }

  async exportVisitData(): Promise<string> {
    const properties = await this.getAllProperties()
    const visitData = properties
      .filter(p => p.visits.length > 0)
      .map(p => ({
        propertyId: p.id,
        propertyTitle: p.title,
        propertyUrl: p.url,
        visits: p.visits
      }))
    
    return JSON.stringify(visitData, null, 2)
  }

  private exportToTSV(properties: Property[], includeVisits: boolean = false): string {
    const headers = [
      'ID', 'Title', 'Price', 'Location', 'Rooms', 'Bathrooms', 'Floor', 'Size (m²)',
      'Score', 'Heating', 'Elevator', 'Furnished', 'Parking', 'URL', 'Created At'
    ]
    
    if (includeVisits) {
      headers.push('Visit Count', 'Completed Visits')
    }

    const rows = properties.map(property => {
      const row = [
        property.id,
        property.title,
        property.price.toString(),
        property.location,
        property.rooms.toString(),
        property.bathrooms.toString(),
        property.floor,
        property.squareMeters?.toString() || '',
        property.score.toString(),
        property.heating || '',
        property.elevator || '',
        property.furnished || '',
        property.parking || '',
        property.url,
        property.createdAt.toISOString()
      ]
      
      if (includeVisits) {
        row.push(property.getVisitCount().toString(), property.getCompletedVisits().toString())
      }
      
      return row
    })

    return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n')
  }
}
