import { Property } from '../entities/Property'
import { PropertyTypeConfigs } from '../entities/PropertyType'

export interface PropertyRepository {
  getAllProperties(): Promise<Property[]>
  addProperty(property: Property): Promise<void>
  updateProperty(id: string, property: Property): Promise<void>
  removeProperty(id: string): Promise<void>
  clearProperties(): Promise<void>
  getScoringConfig(): Promise<PropertyTypeConfigs>
  updateScoringConfig(config: PropertyTypeConfigs): Promise<void>
  getConfig(type: string): Promise<any>
}
