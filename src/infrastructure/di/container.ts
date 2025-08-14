import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { ChromePropertyRepository } from '../repositories/ChromePropertyRepository'
import { PropertyApplicationService } from '../../application/services/PropertyApplicationService'
import { defaultPropertyTypeConfigs } from '../../domain/use-cases/default-configs'

class Container {
  private static instance: Container
  private repositories: Map<string, any> = new Map()
  private services: Map<string, any> = new Map()

  private constructor() {
    this.initializeDependencies()
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  private initializeDependencies(): void {
    // Register repositories
    this.repositories.set('PropertyRepository', new ChromePropertyRepository())

    // Register services
    const propertyRepository = this.repositories.get('PropertyRepository') as PropertyRepository
    this.services.set('PropertyApplicationService', new PropertyApplicationService(propertyRepository, defaultPropertyTypeConfigs))
  }

  getPropertyRepository(): PropertyRepository {
    return this.repositories.get('PropertyRepository')
  }

  getPropertyApplicationService(): PropertyApplicationService {
    return this.services.get('PropertyApplicationService')
  }

  // Method to reset container (useful for testing)
  reset(): void {
    this.repositories.clear()
    this.services.clear()
    this.initializeDependencies()
  }
}

export const container = Container.getInstance()
