import { PropertyType } from './PropertyType'

export type PropertyFeatureState = 'has' | 'not_has' | 'not_mentioned'
export type ContactStatus = 'pending' | 'contacted' | 'responded' | 'scheduled' | 'visited' | 'no_response' | 'not_interested'
export type PropertyStatus = 'available' | 'under_contract' | 'sold' | 'visited' | 'not_interested' | 'off_market'
export type PriorityLevel = 'high' | 'medium' | 'low'

export interface VisitChecklistItem {
  id: string
  category: string
  question: string
  checked: boolean
  notes?: string
}

export type VisitStatus = 'requested' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export interface VisitRecord {
  id: string
  date: Date
  status: VisitStatus
  notes?: string
  checklist: VisitChecklistItem[]
  contactMethod?: string
  contactPerson?: string
  scheduledTime?: string
  actualTime?: string
  duration?: number
  followUpDate?: Date
  followUpNotes?: string
}

export interface ContactRecord {
  id: string
  date: Date
  method: 'phone' | 'email' | 'whatsapp' | 'portal' | 'other'
  status: ContactStatus
  notes?: string
  contactPerson?: string
  responseTime?: number
  nextAction?: string
  nextActionDate?: Date
}

export class Property {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly price: number,
    public readonly location: string,
    public readonly rooms: number,
    public readonly bathrooms: number,
    public readonly floor: string,
    public readonly url: string,
    public readonly propertyType: PropertyType = 'vivienda',
    public readonly squareMeters?: number,
    public readonly elevator: PropertyFeatureState | null = null,
    public readonly parking: PropertyFeatureState | null = null,
    public readonly terrace: PropertyFeatureState | null = null,
    public readonly balcony: PropertyFeatureState | null = null,
    public readonly airConditioning: PropertyFeatureState | null = null,
    public readonly heating: PropertyFeatureState | null = null,
    public readonly imageUrl?: string,
    public readonly score: number = 0,
    public readonly notes?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly contactStatus: ContactStatus = 'pending',
    public readonly propertyStatus: PropertyStatus = 'available',
    public readonly priority: PriorityLevel = 'medium',
    public readonly visits: VisitRecord[] = [],
    public readonly contacts: ContactRecord[] = [],
    public readonly visitNotes?: string,
    public readonly lastContactDate?: Date,
    public readonly nextFollowUpDate?: Date,
    // Additional optional properties
    public readonly phone?: string,
    public readonly professional?: string,
    public readonly contactPerson?: string,
    public readonly energyCert?: string,
    public readonly furnished: PropertyFeatureState | null = null,
    public readonly seasonal: PropertyFeatureState | null = null,
    public readonly desk?: number,
    public readonly orientation?: string,
    public readonly pricePerM2?: number,
    public readonly deposit?: number,
    public readonly energy?: string,
    public readonly maintenance?: number,
    public readonly garden: PropertyFeatureState | null = null,
    public readonly pool: PropertyFeatureState | null = null,
    public readonly accessible: PropertyFeatureState | null = null,
    public readonly cleaningIncluded: PropertyFeatureState | null = null,
    public readonly lgbtFriendly: PropertyFeatureState | null = null,
    public readonly ownerNotPresent: PropertyFeatureState | null = null,
    public readonly privateBathroom: PropertyFeatureState | null = null,
    public readonly window: PropertyFeatureState | null = null,
    public readonly couplesAllowed: PropertyFeatureState | null = null,
    public readonly minorsAllowed?: boolean,
    public readonly publicationDate?: string,
    // Vivienda-specific fields
    public readonly builtInWardrobes: PropertyFeatureState | null = null,
    public readonly garage: PropertyFeatureState | null = null,
    public readonly storage: PropertyFeatureState | null = null,
    public readonly condition?: string,
    public readonly propertySubType?: string,
    public readonly hasFloorPlan: PropertyFeatureState | null = null,
    public readonly hasVirtualTour: PropertyFeatureState | null = null,
    public readonly bankAd: PropertyFeatureState | null = null,
    // Habitación-specific fields
    public readonly gender?: string,
    public readonly smokers: PropertyFeatureState | null = null,
    public readonly bed: PropertyFeatureState | null = null,
    public readonly roommates?: number
  ) {}

  // Business logic methods
  public isHighPriority(): boolean {
    return this.priority === 'high'
  }

  public isAvailable(): boolean {
    return this.propertyStatus === 'available'
  }

  public hasUpcomingVisits(): boolean {
    const now = new Date()
    return this.visits.some(visit => 
      visit.status === 'confirmed' && 
      visit.scheduledTime && 
      new Date(visit.scheduledTime) > now
    )
  }

  public needsFollowUp(): boolean {
    return this.nextFollowUpDate ? new Date(this.nextFollowUpDate) <= new Date() : false
  }

  public getVisitCount(): number {
    return this.visits.filter(visit => visit.status === 'scheduled' || visit.status === 'rescheduled').length
  }

  public getContactCount(): number {
    return this.contacts.length
  }

  public getCompletedVisits(): number {
    return this.visits.filter(visit => visit.status === 'completed').length
  }

  public getVisitSuccessRate(): number {
    const scheduledVisits = this.visits.filter(visit => visit.status === 'scheduled' || visit.status === 'rescheduled')
    if (scheduledVisits.length === 0) return 0
    return Math.round((this.getCompletedVisits() / scheduledVisits.length) * 100)
  }

  public updateScore(newScore: number): Property {
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      newScore,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      this.propertyStatus,
      this.priority,
      this.visits,
      this.contacts,
      this.visitNotes,
      this.lastContactDate,
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  public addVisit(visit: Omit<VisitRecord, 'id' | 'date'>): Property {
    const newVisit: VisitRecord = {
      ...visit,
      id: this.generateVisitId(),
      date: new Date()
    }
    
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      this.score,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      this.propertyStatus,
      this.priority,
      [...this.visits, newVisit],
      this.contacts,
      this.visitNotes,
      new Date(),
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  public updateVisit(visitId: string, updates: Partial<VisitRecord>): Property {
    const updatedVisits = this.visits.map(visit =>
      visit.id === visitId ? { ...visit, ...updates } : visit
    )
    
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      this.score,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      this.propertyStatus,
      this.priority,
      updatedVisits,
      this.contacts,
      this.visitNotes,
      this.lastContactDate,
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  public addContact(contact: Omit<ContactRecord, 'id' | 'date'>): Property {
    const newContact: ContactRecord = {
      ...contact,
      id: this.generateContactId(),
      date: new Date()
    }
    
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      this.score,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      this.propertyStatus,
      this.priority,
      this.visits,
      [...this.contacts, newContact],
      this.visitNotes,
      new Date(),
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  public updateStatus(status: PropertyStatus): Property {
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      this.score,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      status,
      this.priority,
      this.visits,
      this.contacts,
      this.visitNotes,
      this.lastContactDate,
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  public updatePriority(priority: PriorityLevel): Property {
    return new Property(
      this.id,
      this.title,
      this.price,
      this.location,
      this.rooms,
      this.bathrooms,
      this.floor,
      this.url,
      this.propertyType,
      this.squareMeters,
      this.elevator,
      this.parking,
      this.terrace,
      this.balcony,
      this.airConditioning,
      this.heating,
      this.imageUrl,
      this.score,
      this.notes,
      this.createdAt,
      new Date(),
      this.contactStatus,
      this.propertyStatus,
      priority,
      this.visits,
      this.contacts,
      this.visitNotes,
      this.lastContactDate,
      this.nextFollowUpDate,
      this.phone,
      this.professional,
      this.contactPerson,
      this.energyCert,
      this.furnished,
      this.seasonal,
      this.desk,
      this.orientation,
      this.pricePerM2,
      this.deposit,
      this.energy,
      this.maintenance,
      this.garden,
      this.pool,
      this.accessible,
      this.cleaningIncluded,
      this.lgbtFriendly,
      this.ownerNotPresent,
      this.privateBathroom,
      this.window,
      this.couplesAllowed,
      this.minorsAllowed,
      this.publicationDate,
      this.builtInWardrobes,
      this.garage,
      this.storage,
      this.condition,
      this.propertySubType,
      this.hasFloorPlan,
      this.hasVirtualTour,
      this.bankAd,
      this.gender,
      this.smokers,
      this.bed,
      this.roommates
    )
  }

  private generateVisitId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const hash = `${timestamp}-${random}`.padEnd(16, '0')
    return `visit-${hash.substring(0, 16)}`
  }

  private generateContactId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const hash = `${timestamp}-${random}`.padEnd(16, '0')
    return `contact-${hash.substring(0, 16)}`
  }

  // Factory method to create from raw data
  static fromRawData(data: any): Property {
    return new Property(
      String(data.id),
      data.title || '',
      data.price,
      data.location || '',
      data.rooms,
      data.bathrooms,
      data.floor || '',
      data.url,
      data.propertyType || 'vivienda',
      data.squareMeters || data.size,
      data.elevator,
      data.parking,
      data.terrace,
      data.balcony,
      data.airConditioning,
      data.heating,
      data.imageUrl || data.image,
      data.score || 0,
      data.notes,
      data.createdAt ? new Date(data.createdAt) : new Date(),
      data.updatedAt ? new Date(data.updatedAt) : new Date(),
      data.contactStatus || 'pending',
      data.propertyStatus || 'available',
      data.priority || 'medium',
      (data.visits || []).map((v: any) => ({ 
        ...v, 
        date: new Date(v.date),
        followUpDate: v.followUpDate ? new Date(v.followUpDate) : undefined
      })),
      (data.contacts || []).map((c: any) => ({ 
        ...c, 
        date: new Date(c.date),
        nextActionDate: c.nextActionDate ? new Date(c.nextActionDate) : undefined
      })),
      data.visitNotes,
      data.lastContactDate ? new Date(data.lastContactDate) : undefined,
      data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
      data.phone,
      data.professional,
      data.contactPerson,
      data.energyCert,
      data.furnished,
      data.seasonal,
      data.desk,
      data.orientation,
      data.pricePerM2,
      data.deposit,
      data.energy,
      data.maintenance,
      data.garden,
      data.pool,
      data.accessible,
      data.cleaningIncluded,
      data.lgbtFriendly,
      data.ownerNotPresent,
      data.privateBathroom,
      data.window,
      data.couplesAllowed,
      data.minorsAllowed,
      data.publicationDate,
      data.builtInWardrobes,
      data.garage,
      data.storage,
      data.condition,
      data.propertySubType,
      data.hasFloorPlan,
      data.hasVirtualTour,
      data.bankAd,
      data.gender,
      data.smokers,
      data.bed,
      data.roommates
    )
  }

  // Convert to raw data for storage
  toRawData(): any {
    return {
      id: this.id,
      title: this.title,
      price: this.price,
      location: this.location,
      rooms: this.rooms,
      bathrooms: this.bathrooms,
      floor: this.floor,
      url: this.url,
      propertyType: this.propertyType,
      squareMeters: this.squareMeters,
      elevator: this.elevator,
      parking: this.parking,
      terrace: this.terrace,
      balcony: this.balcony,
      airConditioning: this.airConditioning,
      heating: this.heating,
      imageUrl: this.imageUrl,
      score: this.score,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      contactStatus: this.contactStatus,
      propertyStatus: this.propertyStatus,
      priority: this.priority,
      visits: this.visits.map(v => ({
        ...v,
        date: v.date.toISOString(),
        followUpDate: v.followUpDate?.toISOString()
      })),
      contacts: this.contacts.map(c => ({
        ...c,
        date: c.date.toISOString(),
        nextActionDate: c.nextActionDate?.toISOString()
      })),
      visitNotes: this.visitNotes,
      lastContactDate: this.lastContactDate?.toISOString(),
      nextFollowUpDate: this.nextFollowUpDate?.toISOString(),
      phone: this.phone,
      professional: this.professional,
      energyCert: this.energyCert,
      furnished: this.furnished,
      seasonal: this.seasonal,
      desk: this.desk,
      orientation: this.orientation,
      pricePerM2: this.pricePerM2,
      deposit: this.deposit,
      energy: this.energy,
      maintenance: this.maintenance,
      garden: this.garden,
      pool: this.pool,
      accessible: this.accessible,
      cleaningIncluded: this.cleaningIncluded,
      lgbtFriendly: this.lgbtFriendly,
      ownerNotPresent: this.ownerNotPresent,
      privateBathroom: this.privateBathroom,
      window: this.window,
      couplesAllowed: this.couplesAllowed,
      minorsAllowed: this.minorsAllowed,
      publicationDate: this.publicationDate,
      builtInWardrobes: this.builtInWardrobes,
      garage: this.garage,
      storage: this.storage,
      condition: this.condition,
      propertySubType: this.propertySubType,
      hasFloorPlan: this.hasFloorPlan,
      hasVirtualTour: this.hasVirtualTour,
      bankAd: this.bankAd,
      gender: this.gender,
      smokers: this.smokers,
      bed: this.bed,
      roommates: this.roommates
    }
  }
}
