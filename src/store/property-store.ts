// Re-export domain types for backward compatibility with components
export { Property } from '../domain/entities/Property'
export type { 
  PropertyFeatureState,
  ContactStatus,
  PropertyStatus,
  PriorityLevel,
  VisitRecord,
  ContactRecord,
  VisitChecklistItem,
  VisitStatus
} from '../domain/entities/Property'

// Re-export metrics type
export type { PropertyMetrics } from '../application/services/PropertyApplicationService'
