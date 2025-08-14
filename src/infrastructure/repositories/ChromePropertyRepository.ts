import { Property } from '../../domain/entities/Property'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { generateUniqueId } from '../../lib/utils'

export class ChromePropertyRepository implements PropertyRepository {
  async getAll(): Promise<Property[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['properties'], (result) => {
        if (result.properties) {
          const properties = result.properties.map((p: any) => Property.fromRawData(p))
          resolve(properties)
        } else {
          resolve([])
        }
      })
    })
  }

  async getById(id: string): Promise<Property | null> {
    const properties = await this.getAll()
    return properties.find(p => p.id === id) || null
  }

  async save(property: Property): Promise<void> {
    const properties = await this.getAll()
    const existingIds = properties.map(p => String(p.id))
    
    if (!property.id) {
      const newProperty = new Property(
        generateUniqueId(existingIds),
        property.title,
        property.price,
        property.location,
        property.rooms,
        property.bathrooms,
        property.floor,
        property.url,
        property.propertyType,
        property.squareMeters,
        property.elevator,
        property.parking,
        property.terrace,
        property.balcony,
        property.airConditioning,
        property.heating,
        property.imageUrl,
        property.score,
        property.notes,
        property.createdAt,
        property.updatedAt,
        property.contactStatus,
        property.propertyStatus,
        property.priority,
        property.visits,
        property.contacts,
        property.visitNotes,
        property.lastContactDate,
        property.nextFollowUpDate,
        property.phone,
        property.professional,
        property.contactPerson,
        property.energyCert,
        property.furnished,
        property.seasonal,
        property.desk,
        property.orientation,
        property.pricePerM2,
        property.deposit,
        property.energy,
        property.maintenance,
        property.garden,
        property.pool,
        property.accessible,
        property.cleaningIncluded,
        property.lgbtFriendly,
        property.ownerNotPresent,
        property.privateBathroom,
        property.window,
        property.couplesAllowed,
        property.minorsAllowed,
        property.publicationDate,
        property.builtInWardrobes,
        property.garage,
        property.storage,
        property.condition,
        property.propertySubType,
        property.hasFloorPlan,
        property.hasVirtualTour,
        property.bankAd,
        property.gender,
        property.smokers,
        property.bed,
        property.roommates
      )
      properties.push(newProperty)
    } else {
      properties.push(property)
    }

    await this.saveAll(properties)
  }

  async update(property: Property): Promise<void> {
    const properties = await this.getAll()
    const updatedProperties = properties.map(p => 
      p.id === property.id ? property : p
    )
    await this.saveAll(updatedProperties)
  }

  async delete(id: string): Promise<void> {
    const properties = await this.getAll()
    const filteredProperties = properties.filter(p => p.id !== id)
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
      const rawData = properties.map(p => p.toRawData())
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

  async saveScoringConfig(config: any): Promise<void> {
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

  async getScoringConfig(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scoringConfig'], (result) => {
        resolve(result.scoringConfig || null)
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
