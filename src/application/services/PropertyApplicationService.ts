import { Property } from '../../domain/entities/Property'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { CalculatePropertyScore } from '../../domain/use-cases/CalculatePropertyScore'
import { ManagePropertyVisits, AddVisitRequest, UpdateVisitRequest, AddContactRequest, UpdateContactRequest } from '../../domain/use-cases/ManagePropertyVisits'
import { ExportPropertyData, ExportOptions } from '../../domain/use-cases/ExportPropertyData'
import { generateUniqueId } from '../../lib/utils'
import { PropertyType, ScoringConfig, PropertyTypeConfigs } from '../../domain/entities/PropertyType'

export interface PropertyMetrics {
  totalProperties: number
  averagePrice: number
  averageSize: number
  averageScore: number
  priceRange: { min: number; max: number }
  sizeRange: { min: number; max: number }
  visitMetrics: {
    totalVisits: number
    completedVisits: number
    pendingVisits: number
    averageResponseTime: number
    visitSuccessRate: number
  }
  contactMetrics: {
    totalContacts: number
    respondedContacts: number
    scheduledVisits: number
    averageResponseTime: number
  }
  statusDistribution: {
    available: number
    under_contract: number
    sold: number
    visited: number
    not_interested: number
  }
  priorityDistribution: {
    high: number
    medium: number
    low: number
  }
}

export class PropertyApplicationService {
  private calculatePropertyScore: CalculatePropertyScore
  private managePropertyVisits: ManagePropertyVisits
  private exportPropertyData: ExportPropertyData

  constructor(
    private propertyRepository: PropertyRepository,
    initialConfigs: PropertyTypeConfigs
  ) {
    this.calculatePropertyScore = new CalculatePropertyScore(initialConfigs)
    this.managePropertyVisits = new ManagePropertyVisits(propertyRepository)
    this.exportPropertyData = new ExportPropertyData(propertyRepository)
  }

  // Property Management
  async getAllProperties(): Promise<Property[]> {
    return this.propertyRepository.getAll()
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyRepository.getById(id)
  }

  async addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const properties = await this.propertyRepository.getAll()
    const existingIds = properties.map(p => String(p.id))
    
    const newProperty = new Property(
      generateUniqueId(existingIds),
      propertyData.title,
      propertyData.price,
      propertyData.location,
      propertyData.rooms,
      propertyData.bathrooms,
      propertyData.floor,
      propertyData.url,
      propertyData.propertyType,
      propertyData.squareMeters,
      propertyData.elevator,
      propertyData.parking,
      propertyData.terrace,
      propertyData.balcony,
      propertyData.airConditioning,
      propertyData.heating,
      propertyData.imageUrl,
      0, // Initial score will be calculated
      propertyData.notes,
      new Date(),
      new Date(),
      propertyData.contactStatus || 'pending',
      propertyData.propertyStatus || 'available',
      propertyData.priority || 'medium',
      propertyData.visits || [],
      propertyData.contacts || [],
      propertyData.visitNotes,
      propertyData.lastContactDate,
      propertyData.nextFollowUpDate,
      propertyData.phone,
      propertyData.professional,
      propertyData.contactPerson,
      propertyData.energyCert,
      propertyData.furnished,
      propertyData.seasonal,
      propertyData.desk,
      propertyData.orientation,
      propertyData.pricePerM2,
      propertyData.deposit,
      propertyData.energy,
      propertyData.maintenance,
      propertyData.garden,
      propertyData.pool,
      propertyData.accessible,
      propertyData.cleaningIncluded,
      propertyData.lgbtFriendly,
      propertyData.ownerNotPresent,
      propertyData.privateBathroom,
      propertyData.window,
      propertyData.couplesAllowed,
      propertyData.minorsAllowed,
      propertyData.publicationDate,
      propertyData.builtInWardrobes,
      propertyData.garage,
      propertyData.storage,
      propertyData.condition,
      propertyData.propertySubType,
      propertyData.hasFloorPlan,
      propertyData.hasVirtualTour,
      propertyData.bankAd,
      propertyData.gender,
      propertyData.smokers,
      propertyData.bed,
      propertyData.roommates
    )

    // Calculate initial score
    const score = this.calculatePropertyScore.execute(newProperty)
    const propertyWithScore = newProperty.updateScore(score)
    
    await this.propertyRepository.save(propertyWithScore)
    return propertyWithScore
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const property = await this.propertyRepository.getById(id)
    if (!property) {
      throw new Error(`Property with id ${id} not found`)
    }

    // Create updated property with new values
    const updatedProperty = new Property(
      property.id,
      updates.title ?? property.title,
      updates.price ?? property.price,
      updates.location ?? property.location,
      updates.rooms ?? property.rooms,
      updates.bathrooms ?? property.bathrooms,
      updates.floor ?? property.floor,
      updates.url ?? property.url,
      updates.propertyType ?? property.propertyType,
      updates.squareMeters ?? property.squareMeters,
      updates.elevator ?? property.elevator,
      updates.parking ?? property.parking,
      updates.terrace ?? property.terrace,
      updates.balcony ?? property.balcony,
      updates.airConditioning ?? property.airConditioning,
      updates.heating ?? property.heating,
      updates.imageUrl ?? property.imageUrl,
      property.score, // Score will be recalculated if needed
      updates.notes ?? property.notes,
      property.createdAt,
      new Date(),
      updates.contactStatus ?? property.contactStatus,
      updates.propertyStatus ?? property.propertyStatus,
      updates.priority ?? property.priority,
      updates.visits ?? property.visits,
      updates.contacts ?? property.contacts,
      updates.visitNotes ?? property.visitNotes,
      updates.lastContactDate ?? property.lastContactDate,
      updates.nextFollowUpDate ?? property.nextFollowUpDate,
      updates.phone ?? property.phone,
      updates.professional ?? property.professional,
      updates.contactPerson ?? property.contactPerson,
      updates.energyCert ?? property.energyCert,
      updates.furnished ?? property.furnished,
      updates.seasonal ?? property.seasonal,
      updates.desk ?? property.desk,
      updates.orientation ?? property.orientation,
      updates.pricePerM2 ?? property.pricePerM2,
      updates.deposit ?? property.deposit,
      updates.energy ?? property.energy,
      updates.maintenance ?? property.maintenance,
      updates.garden ?? property.garden,
      updates.pool ?? property.pool,
      updates.accessible ?? property.accessible,
      updates.cleaningIncluded ?? property.cleaningIncluded,
      updates.lgbtFriendly ?? property.lgbtFriendly,
      updates.ownerNotPresent ?? property.ownerNotPresent,
      updates.privateBathroom ?? property.privateBathroom,
      updates.window ?? property.window,
      updates.couplesAllowed ?? property.couplesAllowed,
      updates.minorsAllowed ?? property.minorsAllowed,
      updates.publicationDate ?? property.publicationDate,
      updates.builtInWardrobes ?? property.builtInWardrobes,
      updates.garage ?? property.garage,
      updates.storage ?? property.storage,
      updates.condition ?? property.condition,
      updates.propertySubType ?? property.propertySubType,
      updates.hasFloorPlan ?? property.hasFloorPlan,
      updates.hasVirtualTour ?? property.hasVirtualTour,
      updates.bankAd ?? property.bankAd,
      updates.gender ?? property.gender,
      updates.smokers ?? property.smokers,
      updates.bed ?? property.bed,
      updates.roommates ?? property.roommates
    )

    await this.propertyRepository.update(updatedProperty)
    return updatedProperty
  }

  async deleteProperty(id: string): Promise<void> {
    await this.propertyRepository.delete(id)
  }

  async clearAllProperties(): Promise<void> {
    await this.propertyRepository.clear()
  }

  // Scoring
  async recalculateAllScores(): Promise<void> {
    const properties = await this.propertyRepository.getAll()
    const updatedProperties = properties.map(property => {
      const newScore = this.calculatePropertyScore.execute(property)
      return property.updateScore(newScore)
    })
    
    await this.propertyRepository.saveAll(updatedProperties)
  }

  async updateScoringConfig(configs: PropertyTypeConfigs): Promise<void> {
    // Update the scoring service configuration
    Object.entries(configs).forEach(([propertyType, config]) => {
      this.calculatePropertyScore.updateConfig(propertyType as any, config)
    })
    
    // Save configuration to storage
    await this.propertyRepository.saveScoringConfig(configs)
    
    // Recalculate all scores with new configuration
    await this.recalculateAllScores()
  }

  async getScoringConfig(): Promise<PropertyTypeConfigs> {
    return this.calculatePropertyScore.getAllConfigs()
  }

  // Add missing methods for configuration access
  getConfig(propertyType: PropertyType): ScoringConfig {
    return this.calculatePropertyScore.getConfig(propertyType)
  }

  getAllConfigs(): PropertyTypeConfigs {
    return this.calculatePropertyScore.getAllConfigs()
  }

  // Visit Management
  async addVisit(request: AddVisitRequest): Promise<Property> {
    return this.managePropertyVisits.addVisit(request)
  }

  async updateVisit(request: UpdateVisitRequest): Promise<Property> {
    return this.managePropertyVisits.updateVisit(request)
  }

  async addContact(request: AddContactRequest): Promise<Property> {
    return this.managePropertyVisits.addContact(request)
  }

  async updateContact(request: UpdateContactRequest): Promise<Property> {
    return this.managePropertyVisits.updateContact(request)
  }

  async updatePropertyStatus(propertyId: string, status: Property['propertyStatus']): Promise<Property> {
    return this.managePropertyVisits.updatePropertyStatus(propertyId, status)
  }

  async updatePropertyPriority(propertyId: string, priority: Property['priority']): Promise<Property> {
    return this.managePropertyVisits.updatePropertyPriority(propertyId, priority)
  }

  async getUpcomingVisits(): Promise<Property[]> {
    return this.managePropertyVisits.getUpcomingVisits()
  }

  async getPropertiesNeedingFollowUp(): Promise<Property[]> {
    return this.managePropertyVisits.getPropertiesNeedingFollowUp()
  }

  // Export
  async exportProperties(options?: ExportOptions): Promise<string> {
    return this.exportPropertyData.execute(options)
  }

  async exportVisitData(): Promise<string> {
    return this.exportPropertyData.exportVisitData()
  }

  // Metrics
  async calculateMetrics(): Promise<PropertyMetrics> {
    const properties = await this.propertyRepository.getAll()
    
    if (properties.length === 0) {
      return {
        totalProperties: 0,
        averagePrice: 0,
        averageSize: 0,
        averageScore: 0,
        priceRange: { min: 0, max: 0 },
        sizeRange: { min: 0, max: 0 },
        visitMetrics: {
          totalVisits: 0,
          completedVisits: 0,
          pendingVisits: 0,
          averageResponseTime: 0,
          visitSuccessRate: 0
        },
        contactMetrics: {
          totalContacts: 0,
          respondedContacts: 0,
          scheduledVisits: 0,
          averageResponseTime: 0
        },
        statusDistribution: {
          available: 0,
          under_contract: 0,
          sold: 0,
          visited: 0,
          not_interested: 0
        },
        priorityDistribution: {
          high: 0,
          medium: 0,
          low: 0
        }
      }
    }

    const prices = properties.map(p => p.price).filter(p => p !== undefined)
    const sizes = properties.map(p => p.squareMeters).filter(s => s !== undefined)
    const scores = properties.map(p => p.score).filter(s => s !== undefined)

    // Calculate visit metrics
    const allVisits = properties.flatMap(p => p.visits)
    const completedVisits = allVisits.filter(v => v.status === 'completed')
    const pendingVisits = allVisits.filter(v => v.status === 'requested' || v.status === 'confirmed')
    const responseTimes = allVisits
      .filter(v => v.status === 'completed' && v.actualTime)
      .map(v => {
        const scheduled = new Date(v.scheduledTime || v.date)
        const actual = new Date(v.actualTime!)
        return Math.abs(actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60) // hours
      })

    // Calculate contact metrics
    const allContacts = properties.flatMap(p => p.contacts)
    const respondedContacts = allContacts.filter(c => c.status === 'responded' || c.status === 'scheduled' || c.status === 'visited')
    const scheduledFromContacts = allContacts.filter(c => c.status === 'scheduled' || c.status === 'visited')
    const contactResponseTimes = allContacts
      .filter(c => c.responseTime !== undefined)
      .map(c => c.responseTime!)

    // Calculate status distribution
    const statusCounts = properties.reduce((acc, p) => {
      const status = p.propertyStatus || 'available'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<Property['propertyStatus'], number>)

    // Calculate priority distribution
    const priorityCounts = properties.reduce((acc, p) => {
      const priority = p.priority || 'medium'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {} as Record<Property['priority'], number>)

    return {
      totalProperties: properties.length,
      averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      averageSize: sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      },
      sizeRange: {
        min: sizes.length > 0 ? Math.min(...sizes) : 0,
        max: sizes.length > 0 ? Math.max(...sizes) : 0
      },
      visitMetrics: {
        totalVisits: allVisits.length,
        completedVisits: completedVisits.length,
        pendingVisits: pendingVisits.length,
        averageResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        visitSuccessRate: allVisits.length > 0 ? Math.round((completedVisits.length / allVisits.length) * 100) : 0
      },
      contactMetrics: {
        totalContacts: allContacts.length,
        respondedContacts: respondedContacts.length,
        scheduledVisits: scheduledFromContacts.length,
        averageResponseTime: contactResponseTimes.length > 0 ? Math.round(contactResponseTimes.reduce((a, b) => a + b, 0) / contactResponseTimes.length) : 0
      },
      statusDistribution: {
        available: statusCounts.available || 0,
        under_contract: statusCounts.under_contract || 0,
        sold: statusCounts.sold || 0,
        visited: statusCounts.visited || 0,
        not_interested: statusCounts.not_interested || 0
      },
      priorityDistribution: {
        high: priorityCounts.high || 0,
        medium: priorityCounts.medium || 0,
        low: priorityCounts.low || 0
      }
    }
  }
}
