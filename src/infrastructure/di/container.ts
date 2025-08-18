import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { ChromePropertyRepository } from '../repositories/ChromePropertyRepository'
import { PropertyApplicationService } from '../../application/services/PropertyApplicationService'

class Container {
  private static instance: Container
  private services: Map<string, any> = new Map()

  private constructor() {
    this.initializeServices()
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  private initializeServices(): void {
    // Register repositories
    this.services.set('PropertyRepository', new ChromePropertyRepository())
    
    // Register application services
    const propertyRepository = this.get<PropertyRepository>('PropertyRepository')
    this.services.set('PropertyApplicationService', new PropertyApplicationService(propertyRepository))
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service as T
  }
}

export const container = Container.getInstance()
