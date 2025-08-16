import { PropertyType } from './PropertyType'

export type PropertyFeatureState = 'has' | 'not_has' | 'not_mentioned' | null
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

// Property data interface for better type safety
export interface PropertyData {
  id: string
  title: string
  price: number
  location: string
  rooms: number
  bathrooms: number
  floor: string
  url: string
  propertyType?: PropertyType
  squareMeters?: number
  elevator?: PropertyFeatureState
  parking?: PropertyFeatureState
  terrace?: PropertyFeatureState
  balcony?: PropertyFeatureState
  airConditioning?: PropertyFeatureState
  heating?: PropertyFeatureState
  imageUrl?: string
  score?: number
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  contactStatus?: ContactStatus
  propertyStatus?: PropertyStatus
  priority?: PriorityLevel
  visits?: VisitRecord[]
  contacts?: ContactRecord[]
  visitNotes?: string
  lastContactDate?: Date
  nextFollowUpDate?: Date
  phone?: string
  professional?: string
  contactPerson?: string
  energyCert?: string
  furnished?: PropertyFeatureState
  seasonal?: PropertyFeatureState
  desk?: number
  orientation?: string
  pricePerM2?: number
  deposit?: number
  energy?: string
  maintenance?: number
  garden?: PropertyFeatureState
  pool?: PropertyFeatureState
  accessible?: PropertyFeatureState
  cleaningIncluded?: PropertyFeatureState
  lgbtFriendly?: PropertyFeatureState
  ownerNotPresent?: PropertyFeatureState
  privateBathroom?: PropertyFeatureState
  window?: PropertyFeatureState
  couplesAllowed?: PropertyFeatureState
  minorsAllowed?: boolean
  publicationDate?: string
  builtInWardrobes?: PropertyFeatureState
  garage?: PropertyFeatureState
  storage?: PropertyFeatureState
  condition?: string
  propertySubType?: string
  hasFloorPlan?: PropertyFeatureState
  hasVirtualTour?: PropertyFeatureState
  bankAd?: PropertyFeatureState
  gender?: string
  smokers?: PropertyFeatureState
  bed?: PropertyFeatureState
  roommates?: number
}

// Raw data interface for fromRawData method
export interface RawPropertyData {
  id: string | number
  title?: string
  price?: number
  location?: string
  rooms?: number
  bathrooms?: number
  floor?: string
  url?: string
  propertyType?: PropertyType
  squareMeters?: number
  elevator?: PropertyFeatureState
  parking?: PropertyFeatureState
  terrace?: PropertyFeatureState
  balcony?: PropertyFeatureState
  airConditioning?: PropertyFeatureState
  heating?: PropertyFeatureState
  imageUrl?: string
  score?: number
  notes?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  contactStatus?: ContactStatus
  propertyStatus?: PropertyStatus
  priority?: PriorityLevel
  visits?: VisitRecord[]
  contacts?: ContactRecord[]
  visitNotes?: string
  lastContactDate?: string | Date
  nextFollowUpDate?: string | Date
  phone?: string
  professional?: string
  contactPerson?: string
  energyCert?: string
  furnished?: PropertyFeatureState
  seasonal?: PropertyFeatureState
  desk?: number
  orientation?: string
  pricePerM2?: number
  deposit?: number
  energy?: string
  maintenance?: number
  garden?: PropertyFeatureState
  pool?: PropertyFeatureState
  accessible?: PropertyFeatureState
  cleaningIncluded?: PropertyFeatureState
  lgbtFriendly?: PropertyFeatureState
  ownerNotPresent?: PropertyFeatureState
  privateBathroom?: PropertyFeatureState
  window?: PropertyFeatureState
  couplesAllowed?: PropertyFeatureState
  minorsAllowed?: boolean
  publicationDate?: string
  builtInWardrobes?: PropertyFeatureState
  garage?: PropertyFeatureState
  storage?: PropertyFeatureState
  condition?: string
  propertySubType?: string
  hasFloorPlan?: PropertyFeatureState
  hasVirtualTour?: PropertyFeatureState
  bankAd?: PropertyFeatureState
  gender?: string
  smokers?: PropertyFeatureState
  bed?: PropertyFeatureState
  roommates?: number
}

export class Property {
  public readonly id: string
  public readonly title: string
  public readonly price: number
  public readonly location: string
  public readonly rooms: number
  public readonly bathrooms: number
  public readonly floor: string
  public readonly url: string
  public readonly propertyType: PropertyType
  public readonly squareMeters?: number
  public readonly elevator?: PropertyFeatureState
  public readonly parking?: PropertyFeatureState
  public readonly terrace?: PropertyFeatureState
  public readonly balcony?: PropertyFeatureState
  public readonly airConditioning?: PropertyFeatureState
  public readonly heating?: PropertyFeatureState
  public readonly imageUrl?: string
  public readonly score: number
  public readonly notes?: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly contactStatus: ContactStatus
  public readonly propertyStatus: PropertyStatus
  public readonly priority: PriorityLevel
  public readonly visits: VisitRecord[]
  public readonly contacts: ContactRecord[]
  public readonly visitNotes?: string
  public readonly lastContactDate?: Date
  public readonly nextFollowUpDate?: Date
  public readonly phone?: string
  public readonly professional?: string
  public readonly contactPerson?: string
  public readonly energyCert?: string
  public readonly furnished?: PropertyFeatureState
  public readonly seasonal?: PropertyFeatureState
  public readonly desk?: number
  public readonly orientation?: string
  public readonly pricePerM2?: number
  public readonly deposit?: number
  public readonly energy?: string
  public readonly maintenance?: number
  public readonly garden?: PropertyFeatureState
  public readonly pool?: PropertyFeatureState
  public readonly accessible?: PropertyFeatureState
  public readonly cleaningIncluded?: PropertyFeatureState
  public readonly lgbtFriendly?: PropertyFeatureState
  public readonly ownerNotPresent?: PropertyFeatureState
  public readonly privateBathroom?: PropertyFeatureState
  public readonly window?: PropertyFeatureState
  public readonly couplesAllowed?: PropertyFeatureState
  public readonly minorsAllowed?: boolean
  public readonly publicationDate?: string
  public readonly builtInWardrobes?: PropertyFeatureState
  public readonly garage?: PropertyFeatureState
  public readonly storage?: PropertyFeatureState
  public readonly condition?: string
  public readonly propertySubType?: string
  public readonly hasFloorPlan?: PropertyFeatureState
  public readonly hasVirtualTour?: PropertyFeatureState
  public readonly bankAd?: PropertyFeatureState
  public readonly gender?: string
  public readonly smokers?: PropertyFeatureState
  public readonly bed?: PropertyFeatureState
  public readonly roommates?: number

  constructor(data: PropertyData) {
    this.id = data.id
    this.title = data.title
    this.price = data.price
    this.location = data.location
    this.rooms = data.rooms
    this.bathrooms = data.bathrooms
    this.floor = data.floor
    this.url = data.url
    this.propertyType = data.propertyType || 'vivienda'
    this.squareMeters = data.squareMeters
    this.elevator = data.elevator
    this.parking = data.parking
    this.terrace = data.terrace
    this.balcony = data.balcony
    this.airConditioning = data.airConditioning
    this.heating = data.heating
    this.imageUrl = data.imageUrl
    this.score = data.score || 0
    this.notes = data.notes
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.contactStatus = data.contactStatus || 'pending'
    this.propertyStatus = data.propertyStatus || 'available'
    this.priority = data.priority || 'medium'
    this.visits = data.visits || []
    this.contacts = data.contacts || []
    this.visitNotes = data.visitNotes
    this.lastContactDate = data.lastContactDate
    this.nextFollowUpDate = data.nextFollowUpDate
    this.phone = data.phone
    this.professional = data.professional
    this.contactPerson = data.contactPerson
    this.energyCert = data.energyCert
    this.furnished = data.furnished
    this.seasonal = data.seasonal
    this.desk = data.desk
    this.orientation = data.orientation
    this.pricePerM2 = data.pricePerM2
    this.deposit = data.deposit
    this.energy = data.energy
    this.maintenance = data.maintenance
    this.garden = data.garden
    this.pool = data.pool
    this.accessible = data.accessible
    this.cleaningIncluded = data.cleaningIncluded
    this.lgbtFriendly = data.lgbtFriendly
    this.ownerNotPresent = data.ownerNotPresent
    this.privateBathroom = data.privateBathroom
    this.window = data.window
    this.couplesAllowed = data.couplesAllowed
    this.minorsAllowed = data.minorsAllowed
    this.publicationDate = data.publicationDate
    this.builtInWardrobes = data.builtInWardrobes
    this.garage = data.garage
    this.storage = data.storage
    this.condition = data.condition
    this.propertySubType = data.propertySubType
    this.hasFloorPlan = data.hasFloorPlan
    this.hasVirtualTour = data.hasVirtualTour
    this.bankAd = data.bankAd
    this.gender = data.gender
    this.smokers = data.smokers
    this.bed = data.bed
    this.roommates = data.roommates
  }

  // Simple business logic methods
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

  // Immutable update methods
  public updateScore(newScore: number): Property {
    return new Property({
      ...this.toData(),
      score: newScore,
      updatedAt: new Date()
    })
  }

  public addVisit(visit: Omit<VisitRecord, 'id' | 'date'>): Property {
    const newVisit: VisitRecord = {
      ...visit,
      id: this.generateVisitId(),
      date: new Date()
    }
    
    return new Property({
      ...this.toData(),
      visits: [...this.visits, newVisit],
      lastContactDate: new Date(),
      updatedAt: new Date()
    })
  }

  public updateVisit(visitId: string, updates: Partial<VisitRecord>): Property {
    const updatedVisits = this.visits.map(visit =>
      visit.id === visitId ? { ...visit, ...updates } : visit
    )
    
    return new Property({
      ...this.toData(),
      visits: updatedVisits,
      updatedAt: new Date()
    })
  }

  public addContact(contact: Omit<ContactRecord, 'id' | 'date'>): Property {
    const newContact: ContactRecord = {
      ...contact,
      id: this.generateContactId(),
      date: new Date()
    }
    
    return new Property({
      ...this.toData(),
      contacts: [...this.contacts, newContact],
      lastContactDate: new Date(),
      updatedAt: new Date()
    })
  }

  public updateContact(contactId: string, updates: Partial<ContactRecord>): Property {
    const updatedContacts = this.contacts.map(contact =>
      contact.id === contactId ? { ...contact, ...updates } : contact
    )
    
    return new Property({
      ...this.toData(),
      contacts: updatedContacts,
      updatedAt: new Date()
    })
  }

  public updateStatus(status: PropertyStatus): Property {
    return new Property({
      ...this.toData(),
      propertyStatus: status,
      updatedAt: new Date()
    })
  }

  public updatePriority(priority: PriorityLevel): Property {
    return new Property({
      ...this.toData(),
      priority,
      updatedAt: new Date()
    })
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

  // Convert to data object for easier manipulation
  public toData(): PropertyData {
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      contactStatus: this.contactStatus,
      propertyStatus: this.propertyStatus,
      priority: this.priority,
      visits: this.visits,
      contacts: this.contacts,
      visitNotes: this.visitNotes,
      lastContactDate: this.lastContactDate,
      nextFollowUpDate: this.nextFollowUpDate,
      phone: this.phone,
      professional: this.professional,
      contactPerson: this.contactPerson,
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

  // Factory method for creating from raw data
  static fromRawData(data: RawPropertyData): Property {
    return new Property({
      id: String(data.id),
      title: data.title || '',
      price: data.price || 0,
      location: data.location || '',
      rooms: data.rooms || 0,
      bathrooms: data.bathrooms || 0,
      floor: data.floor || '',
      url: data.url || '',
      propertyType: data.propertyType,
      squareMeters: data.squareMeters,
      elevator: data.elevator,
      parking: data.parking,
      terrace: data.terrace,
      balcony: data.balcony,
      airConditioning: data.airConditioning,
      heating: data.heating,
      imageUrl: data.imageUrl,
      score: data.score || 0,
      notes: data.notes,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      contactStatus: data.contactStatus || 'pending',
      propertyStatus: data.propertyStatus || 'available',
      priority: data.priority || 'medium',
      visits: data.visits || [],
      contacts: data.contacts || [],
      visitNotes: data.visitNotes,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined,
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
      phone: data.phone,
      professional: data.professional,
      contactPerson: data.contactPerson,
      energyCert: data.energyCert,
      furnished: data.furnished,
      seasonal: data.seasonal,
      desk: data.desk,
      orientation: data.orientation,
      pricePerM2: data.pricePerM2,
      deposit: data.deposit,
      energy: data.energy,
      maintenance: data.maintenance,
      garden: data.garden,
      pool: data.pool,
      accessible: data.accessible,
      cleaningIncluded: data.cleaningIncluded,
      lgbtFriendly: data.lgbtFriendly,
      ownerNotPresent: data.ownerNotPresent,
      privateBathroom: data.privateBathroom,
      window: data.window,
      couplesAllowed: data.couplesAllowed,
      minorsAllowed: data.minorsAllowed,
      publicationDate: data.publicationDate,
      builtInWardrobes: data.builtInWardrobes,
      garage: data.garage,
      storage: data.storage,
      condition: data.condition,
      propertySubType: data.propertySubType,
      hasFloorPlan: data.hasFloorPlan,
      hasVirtualTour: data.hasVirtualTour,
      bankAd: data.bankAd,
      gender: data.gender,
      smokers: data.smokers,
      bed: data.bed,
      roommates: data.roommates
    })
  }
}
