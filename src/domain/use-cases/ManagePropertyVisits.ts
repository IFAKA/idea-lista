import { Property, VisitRecord, ContactRecord } from '../entities/Property'
import { PropertyRepository } from '../repositories/PropertyRepository'

export interface AddVisitRequest {
  propertyId: string
  status: VisitRecord['status']
  notes?: string
  checklist: VisitRecord['checklist']
  contactMethod?: string
  contactPerson?: string
  scheduledTime?: string
  duration?: number
  followUpDate?: Date
  followUpNotes?: string
}

export interface UpdateVisitRequest {
  propertyId: string
  visitId: string
  updates: Partial<VisitRecord>
}

export interface AddContactRequest {
  propertyId: string
  method: ContactRecord['method']
  status: ContactRecord['status']
  notes?: string
  contactPerson?: string
  responseTime?: number
  nextAction?: string
  nextActionDate?: Date
}

export interface UpdateContactRequest {
  propertyId: string
  contactId: string
  updates: Partial<ContactRecord>
}

export class ManagePropertyVisits {
  constructor(private propertyRepository: PropertyRepository) {}

  async addVisit(request: AddVisitRequest): Promise<Property> {
    const property = await this.propertyRepository.getById(request.propertyId)
    if (!property) {
      throw new Error(`Property with id ${request.propertyId} not found`)
    }

    const visit: Omit<VisitRecord, 'id' | 'date'> = {
      status: request.status,
      notes: request.notes,
      checklist: request.checklist,
      contactMethod: request.contactMethod,
      contactPerson: request.contactPerson,
      scheduledTime: request.scheduledTime,
      duration: request.duration,
      followUpDate: request.followUpDate,
      followUpNotes: request.followUpNotes
    }

    const updatedProperty = property.addVisit(visit)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async updateVisit(request: UpdateVisitRequest): Promise<Property> {
    const property = await this.propertyRepository.getById(request.propertyId)
    if (!property) {
      throw new Error(`Property with id ${request.propertyId} not found`)
    }

    const updatedProperty = property.updateVisit(request.visitId, request.updates)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async addContact(request: AddContactRequest): Promise<Property> {
    const property = await this.propertyRepository.getById(request.propertyId)
    if (!property) {
      throw new Error(`Property with id ${request.propertyId} not found`)
    }

    const contact: Omit<ContactRecord, 'id' | 'date'> = {
      method: request.method,
      status: request.status,
      notes: request.notes,
      contactPerson: request.contactPerson,
      responseTime: request.responseTime,
      nextAction: request.nextAction,
      nextActionDate: request.nextActionDate
    }

    const updatedProperty = property.addContact(contact)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async updateContact(request: UpdateContactRequest): Promise<Property> {
    const property = await this.propertyRepository.getById(request.propertyId)
    if (!property) {
      throw new Error(`Property with id ${request.propertyId} not found`)
    }

    const updatedProperty = property.updateContact(request.contactId, request.updates)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async updatePropertyStatus(propertyId: string, status: Property['propertyStatus']): Promise<Property> {
    const property = await this.propertyRepository.getById(propertyId)
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`)
    }

    const updatedProperty = property.updateStatus(status)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async updatePropertyPriority(propertyId: string, priority: Property['priority']): Promise<Property> {
    const property = await this.propertyRepository.getById(propertyId)
    if (!property) {
      throw new Error(`Property with id ${propertyId} not found`)
    }

    const updatedProperty = property.updatePriority(priority)
    await this.propertyRepository.update(updatedProperty)
    
    return updatedProperty
  }

  async getUpcomingVisits(): Promise<Property[]> {
    return this.propertyRepository.getUpcomingVisits()
  }

  async getPropertiesNeedingFollowUp(): Promise<Property[]> {
    return this.propertyRepository.getPropertiesNeedingFollowUp()
  }

  async exportVisitData(): Promise<string> {
    return this.propertyRepository.exportVisitData()
  }
}
