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

  // Initialize the service by loading saved configuration
  async initialize(): Promise<void> {
    try {
      // Load saved configuration from storage
      const savedConfig = await this.propertyRepository.getScoringConfig()
      
            if (savedConfig) {
        // Update the scoring service with saved configuration
        Object.entries(savedConfig).forEach(([propertyType, config]) => {
          this.calculatePropertyScore.updateConfig(propertyType as PropertyType, config as ScoringConfig)
        })
        // Configuration loaded successfully
      }
      } catch (error) {
      // Continue with default configuration if loading fails
    }
  }

  // Property Management
  async getAllProperties(): Promise<Property[]> {
    await this.initialize()
    return this.propertyRepository.getAll()
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyRepository.getById(id)
  }

  async addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    // Step 1: Ensure configuration is loaded
    await this.initialize()
    
    // Step 2: Create property data object
    const properties = await this.propertyRepository.getAll()
    const existingIds = properties.map(p => String(p.id))
    
    const newProperty = new Property({
      id: generateUniqueId(existingIds),
      title: propertyData.title,
      price: propertyData.price,
      location: propertyData.location,
      rooms: propertyData.rooms,
      bathrooms: propertyData.bathrooms,
      floor: propertyData.floor,
      url: propertyData.url,
      propertyType: propertyData.propertyType,
      squareMeters: propertyData.squareMeters,
      elevator: propertyData.elevator,
      parking: propertyData.parking,
      terrace: propertyData.terrace,
      balcony: propertyData.balcony,
      airConditioning: propertyData.airConditioning,
      heating: propertyData.heating,
      imageUrl: propertyData.imageUrl,
      score: 0, // Score will be calculated in step 3
      notes: propertyData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      contactStatus: propertyData.contactStatus || 'pending',
      propertyStatus: propertyData.propertyStatus || 'available',
      priority: propertyData.priority || 'medium',
      visits: propertyData.visits || [],
      contacts: propertyData.contacts || [],
      visitNotes: propertyData.visitNotes,
      lastContactDate: propertyData.lastContactDate,
      nextFollowUpDate: propertyData.nextFollowUpDate,
      phone: propertyData.phone,
      professional: propertyData.professional,
      contactPerson: propertyData.contactPerson,
      energyCert: propertyData.energyCert,
      furnished: propertyData.furnished,
      seasonal: propertyData.seasonal,
      desk: propertyData.desk,
      orientation: propertyData.orientation,
      pricePerM2: propertyData.pricePerM2,
      deposit: propertyData.deposit,
      energy: propertyData.energy,
      maintenance: propertyData.maintenance,
      garden: propertyData.garden,
      pool: propertyData.pool,
      accessible: propertyData.accessible,
      cleaningIncluded: propertyData.cleaningIncluded,
      lgbtFriendly: propertyData.lgbtFriendly,
      ownerNotPresent: propertyData.ownerNotPresent,
      privateBathroom: propertyData.privateBathroom,
      window: propertyData.window,
      couplesAllowed: propertyData.couplesAllowed,
      minorsAllowed: propertyData.minorsAllowed,
      publicationDate: propertyData.publicationDate,
      builtInWardrobes: propertyData.builtInWardrobes,
      garage: propertyData.garage,
      storage: propertyData.storage,
      condition: propertyData.condition,
      propertySubType: propertyData.propertySubType,
      hasFloorPlan: propertyData.hasFloorPlan,
      hasVirtualTour: propertyData.hasVirtualTour,
      bankAd: propertyData.bankAd,
      gender: propertyData.gender,
      smokers: propertyData.smokers,
      bed: propertyData.bed,
      roommates: propertyData.roommates
    })

    // Step 3: Calculate score for that property based on the data
    const score = this.calculatePropertyScore.execute(newProperty)
    
    // Step 4: Add to list (save with calculated score)
    const propertyWithScore = newProperty.updateScore(score)
    await this.propertyRepository.save(propertyWithScore)
    
    return propertyWithScore
  }

  // Separate method to calculate and update property score
  async calculateAndUpdatePropertyScore(propertyId: string): Promise<void> {
    await this.initialize()
    
    const property = await this.propertyRepository.getById(propertyId)
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`)
    }

    // Calculate score with properly loaded configuration
    const score = this.calculatePropertyScore.execute(property)
    
    // Update property with calculated score
    const propertyWithScore = property.updateScore(score)
    await this.propertyRepository.update(propertyWithScore)
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    // Ensure configuration is loaded before updating property
    await this.initialize()
    
    const property = await this.propertyRepository.getById(id)
    if (!property) {
      throw new Error(`Property with id ${id} not found`)
    }

    // Create updated property with new values
    const updatedProperty = new Property({
      ...property.toData(),
      ...updates,
      updatedAt: new Date()
    })

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
    // Ensure configuration is loaded before recalculating scores
    await this.initialize()
    
    const properties = await this.propertyRepository.getAll()
    const updatedProperties = properties.map(property => {
      const newScore = this.calculatePropertyScore.execute(property)
      return property.updateScore(newScore)
    })
    
    await this.propertyRepository.saveAll(updatedProperties)
  }

  // Get properties sorted by score (highest first)
  async getPropertiesSortedByScore(): Promise<Property[]> {
    const properties = await this.propertyRepository.getAll()
    return properties.sort((a, b) => (b.score || 0) - (a.score || 0))
  }

  async updateScoringConfig(configs: PropertyTypeConfigs): Promise<void> {
    // Update the scoring service configuration
    Object.entries(configs).forEach(([propertyType, config]) => {
      this.calculatePropertyScore.updateConfig(propertyType as PropertyType, config)
    })
    
    // Save configuration to storage
    await this.propertyRepository.saveScoringConfig(configs)
    
    // Recalculate all scores with new configuration
    await this.recalculateAllScores()
  }

  async getScoringConfig(): Promise<PropertyTypeConfigs> {
    await this.initialize()
    return this.calculatePropertyScore.getAllConfigs()
  }

  // Add missing methods for configuration access
  async getConfig(propertyType: PropertyType): Promise<ScoringConfig> {
    await this.initialize()
    return this.calculatePropertyScore.getAllConfigs()[propertyType]
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
    const scheduledVisits = allVisits.filter(v => v.status === 'scheduled' || v.status === 'rescheduled')
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
        totalVisits: scheduledVisits.length,
        completedVisits: completedVisits.length,
        pendingVisits: pendingVisits.length,
        averageResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        visitSuccessRate: scheduledVisits.length > 0 ? Math.round((completedVisits.length / scheduledVisits.length) * 100) : 0
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

  // Debug method to test price premium feature
  debugPricePremium(): void {
    // Debug method implementation removed
  }

  // Debug method to analyze property scoring
  async debugPropertyScoring(): Promise<void> {
    // Debug method implementation removed
  }

  // Debug method to compare two properties
  async debugPropertyComparison(): Promise<void> {
    // Debug method implementation removed
  }
}
