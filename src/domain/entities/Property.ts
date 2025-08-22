import { PropertyType } from './PropertyType'

export type PropertyFeatureState = 'has' | 'not_has' | 'not_mentioned' | null
export type VisitStatus = 'requested' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export interface VisitChecklistItem {
  id: string
  category: string
  question: string
  checked: boolean
  notes?: string
}

export interface VisitRecord {
  id: string
  date: Date
  status: VisitStatus
  notes?: string
  checklist: VisitChecklistItem[]
  contactMethod?: string
  contactPerson?: string
  scheduledTime?: string
  duration?: number
  followUpDate?: Date
  followUpNotes?: string
}

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
  heating?: PropertyFeatureState
  furnished?: PropertyFeatureState
  imageUrl?: string
  score?: number
  notes?: string
  createdAt?: Date
  updatedAt?: Date
  visits?: VisitRecord[]
  phone?: string
  professional?: string
  contactPerson?: string
  energyCert?: string
  orientation?: string
  pricePerM2?: number
  deposit?: number
  energy?: string
  maintenance?: number
  condition?: string
  propertySubType?: string
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
  public readonly heating?: PropertyFeatureState
  public readonly furnished?: PropertyFeatureState
  public readonly imageUrl?: string
  public readonly score: number
  public readonly notes?: string
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly visits: VisitRecord[]
  public readonly phone?: string
  public readonly professional?: string
  public readonly contactPerson?: string
  public readonly energyCert?: string
  public readonly orientation?: string
  public readonly pricePerM2?: number
  public readonly deposit?: number
  public readonly energy?: string
  public readonly maintenance?: number
  public readonly condition?: string
  public readonly propertySubType?: string

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
    this.heating = data.heating
    this.furnished = data.furnished
    this.imageUrl = data.imageUrl
    this.score = data.score || 0
    this.notes = data.notes
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.visits = data.visits || []
    this.phone = data.phone
    this.professional = data.professional
    this.contactPerson = data.contactPerson
    this.energyCert = data.energyCert
    this.orientation = data.orientation
    this.pricePerM2 = data.pricePerM2
    this.deposit = data.deposit
    this.energy = data.energy
    this.maintenance = data.maintenance
    this.condition = data.condition
    this.propertySubType = data.propertySubType
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
      updatedAt: new Date()
    })
  }

  public updateScore(newScore: number): Property {
    return new Property({
      ...this.toData(),
      score: newScore,
      updatedAt: new Date()
    })
  }

  public getVisitCount(): number {
    return this.visits.length
  }

  public getCompletedVisits(): number {
    return this.visits.filter(visit => visit.status === 'completed').length
  }

  private generateVisitId(): string {
    return `visit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  }

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
      heating: this.heating,
      furnished: this.furnished,
      imageUrl: this.imageUrl,
      score: this.score,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      visits: this.visits,
      phone: this.phone,
      professional: this.professional,
      contactPerson: this.contactPerson,
      energyCert: this.energyCert,
      orientation: this.orientation,
      pricePerM2: this.pricePerM2,
      deposit: this.deposit,
      energy: this.energy,
      maintenance: this.maintenance,
      condition: this.condition,
      propertySubType: this.propertySubType
    }
  }

  static fromRawData(data: any): Property {
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
      heating: data.heating,
      furnished: data.furnished,
      imageUrl: data.imageUrl,
      score: data.score || 0,
      notes: data.notes,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      visits: data.visits ? data.visits.map((visit: any) => ({
        ...visit,
        date: visit.date ? new Date(visit.date) : new Date(),
        followUpDate: visit.followUpDate ? new Date(visit.followUpDate) : undefined
      })) : [],
      phone: data.phone,
      professional: data.professional,
      contactPerson: data.contactPerson,
      energyCert: data.energyCert,
      orientation: data.orientation,
      pricePerM2: data.pricePerM2,
      deposit: data.deposit,
      energy: data.energy,
      maintenance: data.maintenance,
      condition: data.condition,
      propertySubType: data.propertySubType
    })
  }
}
