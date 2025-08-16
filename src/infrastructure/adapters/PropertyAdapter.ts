import { Property as DomainProperty } from '../../domain/entities/Property'
import { Property as StoreProperty } from '../../store/property-store'

import { VisitStatus, ContactStatus } from '../../domain/entities/Property'

import { VisitChecklistItem } from '../../domain/entities/Property'

interface RawVisitRecord {
  id: string
  date: string | Date
  status: string
  notes?: string
  checklist: VisitChecklistItem[]
  contactMethod?: string
  contactPerson?: string
  scheduledTime?: string
  actualTime?: string
  duration?: number
  followUpDate?: string | Date
  followUpNotes?: string
}

interface RawContactRecord {
  id: string
  date: string | Date
  method: string
  status: string
  notes?: string
  contactPerson?: string
  responseTime?: number
  nextAction?: string
  nextActionDate?: string | Date
}

export class PropertyAdapter {
  static toDomain(storeProperty: StoreProperty): DomainProperty {
    return new DomainProperty({
      id: String(storeProperty.id),
      title: storeProperty.title || '',
      price: storeProperty.price,
      location: storeProperty.location || '',
      rooms: storeProperty.rooms,
      bathrooms: storeProperty.bathrooms,
      floor: storeProperty.floor || '',
      url: storeProperty.url,
      propertyType: storeProperty.propertyType || 'vivienda',
      squareMeters: storeProperty.squareMeters,
      elevator: storeProperty.elevator,
      parking: storeProperty.parking,
      terrace: storeProperty.terrace,
      balcony: storeProperty.balcony,
      airConditioning: storeProperty.airConditioning,
      heating: storeProperty.heating,
      imageUrl: storeProperty.imageUrl,
      score: storeProperty.score || 0,
      notes: storeProperty.notes,
      createdAt: storeProperty.createdAt ? new Date(storeProperty.createdAt) : new Date(),
      updatedAt: storeProperty.updatedAt ? new Date(storeProperty.updatedAt) : new Date(),
      contactStatus: storeProperty.contactStatus || 'pending',
      propertyStatus: storeProperty.propertyStatus || 'available',
      priority: storeProperty.priority || 'medium',
      visits: (storeProperty.visits || []).map((v: RawVisitRecord) => ({ 
        ...v, 
        date: new Date(v.date),
        status: v.status as VisitStatus,
        followUpDate: v.followUpDate ? new Date(v.followUpDate) : undefined
      })),
      contacts: (storeProperty.contacts || []).map((c: RawContactRecord) => ({ 
        ...c, 
        date: new Date(c.date),
        method: c.method as 'phone' | 'email' | 'whatsapp' | 'portal' | 'other',
        status: c.status as ContactStatus,
        nextActionDate: c.nextActionDate ? new Date(c.nextActionDate) : undefined
      })),
      visitNotes: storeProperty.visitNotes,
      lastContactDate: storeProperty.lastContactDate ? new Date(storeProperty.lastContactDate) : undefined,
      nextFollowUpDate: storeProperty.nextFollowUpDate ? new Date(storeProperty.nextFollowUpDate) : undefined,
      phone: storeProperty.phone,
      professional: storeProperty.professional,
      contactPerson: storeProperty.contactPerson,
      energyCert: storeProperty.energyCert,
      furnished: storeProperty.furnished,
      seasonal: storeProperty.seasonal,
      desk: storeProperty.desk,
      orientation: storeProperty.orientation,
      pricePerM2: storeProperty.pricePerM2,
      deposit: storeProperty.deposit,
      energy: storeProperty.energy,
      maintenance: storeProperty.maintenance,
      garden: storeProperty.garden,
      pool: storeProperty.pool,
      accessible: storeProperty.accessible,
      cleaningIncluded: storeProperty.cleaningIncluded,
      lgbtFriendly: storeProperty.lgbtFriendly,
      ownerNotPresent: storeProperty.ownerNotPresent,
      privateBathroom: storeProperty.privateBathroom,
      window: storeProperty.window,
      couplesAllowed: storeProperty.couplesAllowed,
      minorsAllowed: storeProperty.minorsAllowed,
      publicationDate: storeProperty.publicationDate,
      builtInWardrobes: storeProperty.builtInWardrobes,
      garage: storeProperty.garage,
      storage: storeProperty.storage,
      condition: storeProperty.condition,
      propertySubType: storeProperty.propertySubType,
      hasFloorPlan: storeProperty.hasFloorPlan,
      hasVirtualTour: storeProperty.hasVirtualTour,
      bankAd: storeProperty.bankAd,
      gender: storeProperty.gender,
      smokers: storeProperty.smokers,
      bed: storeProperty.bed,
      roommates: storeProperty.roommates
    })
  }

  static toStore(domainProperty: DomainProperty): StoreProperty {
    return {
      id: domainProperty.id,
      title: domainProperty.title,
      price: domainProperty.price,
      location: domainProperty.location,
      rooms: domainProperty.rooms,
      bathrooms: domainProperty.bathrooms,
      floor: domainProperty.floor,
      url: domainProperty.url,
      propertyType: domainProperty.propertyType,
      squareMeters: domainProperty.squareMeters,
      elevator: domainProperty.elevator,
      parking: domainProperty.parking,
      terrace: domainProperty.terrace,
      balcony: domainProperty.balcony,
      airConditioning: domainProperty.airConditioning,
      heating: domainProperty.heating,
      imageUrl: domainProperty.imageUrl,
      score: domainProperty.score,
      notes: domainProperty.notes,
      createdAt: domainProperty.createdAt,
      updatedAt: domainProperty.updatedAt,
      contactStatus: domainProperty.contactStatus,
      propertyStatus: domainProperty.propertyStatus,
      priority: domainProperty.priority,
      visits: domainProperty.visits,
      contacts: domainProperty.contacts,
      visitNotes: domainProperty.visitNotes,
      lastContactDate: domainProperty.lastContactDate,
      nextFollowUpDate: domainProperty.nextFollowUpDate,
      phone: domainProperty.phone,
      professional: domainProperty.professional,
      contactPerson: domainProperty.contactPerson,
      energyCert: domainProperty.energyCert,
      furnished: domainProperty.furnished,
      seasonal: domainProperty.seasonal,
      desk: domainProperty.desk,
      orientation: domainProperty.orientation,
      pricePerM2: domainProperty.pricePerM2,
      deposit: domainProperty.deposit,
      energy: domainProperty.energy,
      maintenance: domainProperty.maintenance,
      garden: domainProperty.garden,
      pool: domainProperty.pool,
      accessible: domainProperty.accessible,
      cleaningIncluded: domainProperty.cleaningIncluded,
      lgbtFriendly: domainProperty.lgbtFriendly,
      ownerNotPresent: domainProperty.ownerNotPresent,
      privateBathroom: domainProperty.privateBathroom,
      window: domainProperty.window,
      couplesAllowed: domainProperty.couplesAllowed,
      minorsAllowed: domainProperty.minorsAllowed,
      publicationDate: domainProperty.publicationDate,
      builtInWardrobes: domainProperty.builtInWardrobes,
      garage: domainProperty.garage,
      storage: domainProperty.storage,
      condition: domainProperty.condition,
      propertySubType: domainProperty.propertySubType,
      hasFloorPlan: domainProperty.hasFloorPlan,
      hasVirtualTour: domainProperty.hasVirtualTour,
      bankAd: domainProperty.bankAd,
      gender: domainProperty.gender,
      smokers: domainProperty.smokers,
      bed: domainProperty.bed,
      roommates: domainProperty.roommates
    } as StoreProperty
  }
}
