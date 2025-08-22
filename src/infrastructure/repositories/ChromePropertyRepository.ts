import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { Property } from '../../domain/entities/Property'
import { PropertyTypeConfigs, defaultConfigs } from '../../domain/entities/PropertyType'

export class ChromePropertyRepository implements PropertyRepository {
  private readonly PROPERTIES_KEY = 'idea-lista-properties'
  private readonly CONFIG_KEY = 'idea-lista-config'
  private readonly BACKUPS_KEY = 'idea-lista-properties-backups'

  // Keep up to this many snapshots
  private readonly MAX_BACKUPS = 10

  private async backupSnapshot(rawProperties: any[]): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.BACKUPS_KEY)
      const backups = Array.isArray(result[this.BACKUPS_KEY]) ? result[this.BACKUPS_KEY] : []
      const newBackups = [
        ...backups,
        { timestamp: new Date().toISOString(), properties: rawProperties }
      ]
      // Keep only the last MAX_BACKUPS snapshots
      const trimmed = newBackups.slice(-this.MAX_BACKUPS)
      await chrome.storage.local.set({ [this.BACKUPS_KEY]: trimmed })
    } catch (error) {
      // Backup failures must never block normal operation
      console.warn('Warning: failed to create backup snapshot', error)
    }
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      const result = await chrome.storage.local.get(this.PROPERTIES_KEY)
      const propertiesData = result[this.PROPERTIES_KEY] || []
      return propertiesData.map((data: any) => Property.fromRawData(data))
    } catch (error) {
      console.error('Error getting properties:', error)
      // Surface the error so callers don't overwrite storage with partial data
      throw error
    }
  }

  async addProperty(property: Property): Promise<void> {
    try {
      const properties = await this.getAllProperties()
      // Backup current state before mutating
      await this.backupSnapshot(properties.map(p => p.toData()))
      const existingIndex = properties.findIndex(p => p.url === property.url)
      
      if (existingIndex >= 0) {
        // Update existing property
        properties[existingIndex] = property
      } else {
        // Add new property
        properties.push(property)
      }
      
      await chrome.storage.local.set({ [this.PROPERTIES_KEY]: properties.map(p => p.toData()) })
    } catch (error) {
      console.error('Error adding property:', error)
      throw error
    }
  }

  async updateProperty(id: string, property: Property): Promise<void> {
    try {
      const properties = await this.getAllProperties()
      // Backup current state before mutating
      await this.backupSnapshot(properties.map(p => p.toData()))
      const index = properties.findIndex(p => p.id === id)
      
      if (index >= 0) {
        properties[index] = property
        await chrome.storage.local.set({ [this.PROPERTIES_KEY]: properties.map(p => p.toData()) })
      }
    } catch (error) {
      console.error('Error updating property:', error)
      throw error
    }
  }

  async removeProperty(id: string): Promise<void> {
    try {
      const properties = await this.getAllProperties()
      // Backup current state before mutating
      await this.backupSnapshot(properties.map(p => p.toData()))
      const filteredProperties = properties.filter(p => p.id !== id)
      await chrome.storage.local.set({ [this.PROPERTIES_KEY]: filteredProperties.map(p => p.toData()) })
    } catch (error) {
      console.error('Error removing property:', error)
      throw error
    }
  }

  async clearProperties(): Promise<void> {
    try {
      // Backup current state before clearing
      const current = await this.getAllProperties()
      await this.backupSnapshot(current.map(p => p.toData()))
      await chrome.storage.local.remove(this.PROPERTIES_KEY)
    } catch (error) {
      console.error('Error clearing properties:', error)
      throw error
    }
  }

  async getScoringConfig(): Promise<PropertyTypeConfigs> {
    try {
      const result = await chrome.storage.local.get(this.CONFIG_KEY)
      return result[this.CONFIG_KEY] || defaultConfigs
    } catch (error) {
      console.error('Error getting scoring config:', error)
      return defaultConfigs
    }
  }

  async updateScoringConfig(config: PropertyTypeConfigs): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.CONFIG_KEY]: config })
    } catch (error) {
      console.error('Error updating scoring config:', error)
      throw error
    }
  }

  async getConfig(type: string): Promise<any> {
    try {
      const configs = await this.getScoringConfig()
      return configs[type as keyof PropertyTypeConfigs] || configs.vivienda
    } catch (error) {
      console.error('Error getting config:', error)
      return defaultConfigs.vivienda
    }
  }
}
