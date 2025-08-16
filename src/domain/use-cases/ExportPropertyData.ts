import { Property } from '../entities/Property'
import { PropertyRepository } from '../repositories/PropertyRepository'

export interface ExportOptions {
  format: 'tsv' | 'json'
  sortBy?: 'score' | 'price' | 'date'
  sortOrder?: 'asc' | 'desc'
  includeVisits?: boolean
  includeContacts?: boolean
}

export class ExportPropertyData {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(options: ExportOptions = { format: 'tsv', sortBy: 'score', sortOrder: 'desc' }): Promise<string> {
    const properties = await this.propertyRepository.getAll()
    
    if (options.format === 'tsv') {
      return this.exportToTSV(properties, options)
    } else {
      return this.exportToJSON(properties, options)
    }
  }

  private exportToTSV(properties: Property[], options: ExportOptions): string {
    const sortedProperties = this.sortProperties(properties, options.sortBy, options.sortOrder)
    
    const sanitizeText = (value: unknown): string => {
      if (value === null || value === undefined) return ""
      const text = String(value)
      return text.replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim()
    }

    const formatDate = (value: unknown): string => {
      if (value === null || value === undefined) return ""
      const d = value instanceof Date ? value : new Date(String(value))
      return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0]
    }

    const headers = [
      'ID',
      'Título',
      'Precio (€)',
      'Ubicación',
      'Tamaño (m²)',
      'Habitaciones',
      'Baños',
      'Planta',
      'Ascensor',
      'Parking',
      'Terraza',
      'Balcón',
      'Aire Acondicionado',
      'Calefacción',
      'URL',
      'Imagen',
      'Score',
      'Notas',
      'Fecha Creación',
      'Fecha Actualización'
    ]

    // Add visit and contact columns if requested
    if (options.includeVisits) {
      headers.push('Visitas (IDs)', 'Total Visitas')
    }
    if (options.includeContacts) {
      headers.push('Contactos (IDs)', 'Total Contactos')
    }
    
    const tsvRows = [
      headers.join('\t'),
      ...sortedProperties.map(property => {
        const baseRow = [
          property.id,
          sanitizeText(property.title),
          property.price ?? '',
          sanitizeText(property.location),
          property.squareMeters ?? '',
          property.rooms ?? '',
          property.bathrooms ?? '',
          sanitizeText(property.floor),
          property.elevator === 'has' ? 'Sí' : 'No',
          property.parking === 'has' ? 'Sí' : 'No',
          property.terrace === 'has' ? 'Sí' : 'No',
          property.balcony === 'has' ? 'Sí' : 'No',
          property.airConditioning === 'has' ? 'Sí' : 'No',
          property.heating === 'has' ? 'Sí' : 'No',
          sanitizeText(property.url),
          sanitizeText(property.imageUrl || ''),
          property.score ?? '',
          sanitizeText(property.notes || ''),
          formatDate(property.createdAt),
          formatDate(property.updatedAt)
        ]

        // Add visit data if requested
        if (options.includeVisits) {
          const visitIds = property.visits.map(v => v.id).join(', ')
          baseRow.push(visitIds, property.visits.length.toString())
        }

        // Add contact data if requested
        if (options.includeContacts) {
          const contactIds = property.contacts.map(c => c.id).join(', ')
          baseRow.push(contactIds, property.contacts.length.toString())
        }

        return baseRow.join('\t')
      })
    ]
    
    return tsvRows.join('\n')
  }

  private exportToJSON(properties: Property[], options: ExportOptions): string {
    const sortedProperties = this.sortProperties(properties, options.sortBy, options.sortOrder)
    
    const exportData = sortedProperties.map(property => {
      const baseData: Record<string, unknown> = {
        id: property.id,
        title: property.title,
        price: property.price,
        location: property.location,
        squareMeters: property.squareMeters,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        url: property.url,
        score: property.score,
        notes: property.notes,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        contactStatus: property.contactStatus,
        propertyStatus: property.propertyStatus,
        priority: property.priority
      }

      if (options.includeVisits) {
        baseData.visits = property.visits
      }

      if (options.includeContacts) {
        baseData.contacts = property.contacts
      }

      return baseData
    })

    return JSON.stringify(exportData, null, 2)
  }

  private sortProperties(properties: Property[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Property[] {
    if (!sortBy) return properties

    const sorted = [...properties].sort((a, b) => {
      let aValue: number | Date
      let bValue: number | Date

      switch (sortBy) {
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'date':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }

  async exportVisitData(): Promise<string> {
    return this.propertyRepository.exportVisitData()
  }
}
