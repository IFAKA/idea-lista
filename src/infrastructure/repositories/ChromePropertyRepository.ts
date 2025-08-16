import { Property } from '../../domain/entities/Property'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { PropertyTypeConfigs } from '../../domain/entities/PropertyType'
import { generateUniqueId } from '../../lib/utils'

export class ChromePropertyRepository implements PropertyRepository {
  async getAll(): Promise<Property[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['properties'], (result) => {
        if (result.properties) {
          const properties = result.properties.map((p: Record<string, unknown>) => Property.fromRawData(p as any)) // eslint-disable-line @typescript-eslint/no-explicit-any
          
          // Check if any properties have incremental IDs and migrate them
          const needsMigration = properties.some((p: Property) => /^\d+$/.test(p.id))
          if (needsMigration) {
            this.migrateIncrementalIds(properties).then(() => {
              resolve(properties)
            })
          } else {
            resolve(properties)
          }
        } else {
          resolve([])
        }
      })
    })
  }

  private async migrateIncrementalIds(properties: Property[]): Promise<void> {
    const existingIds = properties.map(p => p.id)
    const migratedProperties = properties.map(property => {
      // If the property has an incremental ID, generate a new hash-based ID
      if (/^\d+$/.test(property.id)) {
        const newId = generateUniqueId(existingIds.filter(id => id !== property.id))
        
        // Use the property's toData method and create a new property with the new ID
        const propertyData = property.toData()
        return new Property({
          ...propertyData,
          id: newId
        })
      }
      return property
    })
    
    // Save the migrated properties
    await this.saveAll(migratedProperties)
  }

  async getById(id: string): Promise<Property | null> {
    const properties = await this.getAll()
    return properties.find(p => String(p.id) === String(id)) || null
  }

  async save(property: Property): Promise<void> {
    const properties = await this.getAll()
    const existingIds = properties.map(p => String(p.id))
    
    // Always generate a hash-based ID for new properties or properties with incremental IDs
    const shouldGenerateNewId = !property.id || /^\d+$/.test(property.id)
    
    if (shouldGenerateNewId) {
      const newProperty = new Property({
        id: generateUniqueId(existingIds),
        title: property.title,
        price: property.price,
        location: property.location,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        url: property.url,
        propertyType: property.propertyType,
        squareMeters: property.squareMeters,
        elevator: property.elevator,
        parking: property.parking,
        terrace: property.terrace,
        balcony: property.balcony,
        airConditioning: property.airConditioning,
        heating: property.heating,
        imageUrl: property.imageUrl,
        score: property.score,
        notes: property.notes,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        contactStatus: property.contactStatus,
        propertyStatus: property.propertyStatus,
        priority: property.priority,
        visits: property.visits,
        contacts: property.contacts,
        visitNotes: property.visitNotes,
        lastContactDate: property.lastContactDate,
        nextFollowUpDate: property.nextFollowUpDate,
        phone: property.phone,
        professional: property.professional,
        contactPerson: property.contactPerson,
        energyCert: property.energyCert,
        furnished: property.furnished,
        seasonal: property.seasonal,
        desk: property.desk,
        orientation: property.orientation,
        pricePerM2: property.pricePerM2,
        deposit: property.deposit,
        energy: property.energy,
        maintenance: property.maintenance,
        garden: property.garden,
        pool: property.pool,
        accessible: property.accessible,
        cleaningIncluded: property.cleaningIncluded,
        lgbtFriendly: property.lgbtFriendly,
        ownerNotPresent: property.ownerNotPresent,
        privateBathroom: property.privateBathroom,
        window: property.window,
        couplesAllowed: property.couplesAllowed,
        minorsAllowed: property.minorsAllowed,
        publicationDate: property.publicationDate,
        builtInWardrobes: property.builtInWardrobes,
        garage: property.garage,
        storage: property.storage,
        condition: property.condition,
        propertySubType: property.propertySubType,
        hasFloorPlan: property.hasFloorPlan,
        hasVirtualTour: property.hasVirtualTour,
        bankAd: property.bankAd,
        gender: property.gender,
        smokers: property.smokers,
        bed: property.bed,
        roommates: property.roommates
      })
      properties.push(newProperty)
    } else {
      properties.push(property)
    }

    await this.saveAll(properties)
  }

  async update(property: Property): Promise<void> {
    const properties = await this.getAll()
    const updatedProperties = properties.map(p => 
      String(p.id) === String(property.id) ? property : p
    )
    await this.saveAll(updatedProperties)
  }

  async delete(id: string): Promise<void> {
    const properties = await this.getAll()
    const filteredProperties = properties.filter(p => String(p.id) !== String(id))
    await this.saveAll(filteredProperties)
    
    // Notify background script of the deletion
    chrome.runtime.sendMessage({
      action: 'removeProperty',
      propertyId: id
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['properties'], () => {
        // Send to background script for Chrome storage sync
        chrome.runtime.sendMessage({
          action: 'clearProperties'
        }, (response: { success: boolean; error?: string }) => {
          if (response && !response.success) {
            console.error('Error clearing properties in background:', response.error)
          }
          resolve()
        })
      })
    })
  }

  async saveAll(properties: Property[]): Promise<void> {
    return new Promise((resolve) => {
      const rawData = properties.map(p => p.toData())
      chrome.storage.local.set({ properties: rawData }, () => {
        // Notify background script of the update
        chrome.runtime.sendMessage({
          action: 'propertiesUpdated',
          properties: rawData
        })
        resolve()
      })
    })
  }

  async getByScore(minScore: number): Promise<Property[]> {
    const properties = await this.getAll()
    return properties.filter(property => property.score >= minScore)
  }

  async getByStatus(status: Property['propertyStatus']): Promise<Property[]> {
    const properties = await this.getAll()
    return properties.filter(property => property.propertyStatus === status)
  }

  async getByPriority(priority: Property['priority']): Promise<Property[]> {
    const properties = await this.getAll()
    return properties.filter(property => property.priority === priority)
  }

  async getByContactStatus(status: Property['contactStatus']): Promise<Property[]> {
    const properties = await this.getAll()
    return properties.filter(property => property.contactStatus === status)
  }

  async getUpcomingVisits(): Promise<Property[]> {
    const properties = await this.getAll()
    const now = new Date()
    return properties.filter(property => 
      property.visits.some(visit => 
        visit.status === 'confirmed' && 
        visit.scheduledTime && 
        new Date(visit.scheduledTime) > now
      )
    )
  }

  async getPropertiesNeedingFollowUp(): Promise<Property[]> {
    const properties = await this.getAll()
    const now = new Date()
    return properties.filter(property => 
      property.nextFollowUpDate && 
      new Date(property.nextFollowUpDate) <= now
    )
  }

  async saveScoringConfig(config: PropertyTypeConfigs): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ scoringConfig: config }, () => {
        // Notify background script of configuration update
        chrome.runtime.sendMessage({
          action: 'saveConfiguration',
          config: config
        }, () => {
          resolve()
        })
      })
    })
  }

  async getScoringConfig(): Promise<PropertyTypeConfigs> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scoringConfig'], (result) => {
        resolve(result.scoringConfig || { vivienda: { weights: {}, priceRange: { min: null, max: null }, sizeRange: { min: null, max: null }, roomRange: { min: null, max: null }, bathroomRange: { min: null, max: null } }, habitacion: { weights: {}, priceRange: { min: null, max: null }, sizeRange: { min: null, max: null }, roomRange: { min: null, max: null }, bathroomRange: { min: null, max: null } } })
      })
    })
  }

  async exportVisitData(): Promise<string> {
    const properties = await this.getAll()
    const visitData = properties.map(property => ({
      id: property.id,
      title: property.title,
      price: property.price,
      location: property.location,
      contactStatus: property.contactStatus,
      propertyStatus: property.propertyStatus,
      priority: property.priority,
      visits: property.visits,
      contacts: property.contacts,
      visitNotes: property.visitNotes,
      lastContactDate: property.lastContactDate,
      nextFollowUpDate: property.nextFollowUpDate
    }))
    
    return JSON.stringify(visitData, null, 2)
  }
}
