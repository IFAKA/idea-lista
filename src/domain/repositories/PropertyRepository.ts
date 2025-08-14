import { Property } from '../entities/Property'

export interface PropertyRepository {
  // Basic CRUD operations
  getAll(): Promise<Property[]>
  getById(id: string): Promise<Property | null>
  save(property: Property): Promise<void>
  update(property: Property): Promise<void>
  delete(id: string): Promise<void>
  clear(): Promise<void>
  
  // Batch operations
  saveAll(properties: Property[]): Promise<void>
  
  // Query operations
  getByScore(minScore: number): Promise<Property[]>
  getByStatus(status: Property['propertyStatus']): Promise<Property[]>
  getByPriority(priority: Property['priority']): Promise<Property[]>
  getByContactStatus(status: Property['contactStatus']): Promise<Property[]>
  getUpcomingVisits(): Promise<Property[]>
  getPropertiesNeedingFollowUp(): Promise<Property[]>
  
  // Configuration operations
  saveScoringConfig(config: any): Promise<void>
  getScoringConfig(): Promise<any>
  
  // Export operations
  exportVisitData(): Promise<string>
}
