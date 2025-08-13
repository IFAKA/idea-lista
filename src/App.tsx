import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { Header } from '@/components/Header'
import { PropertyCard } from '@/components/PropertyCard'
import { EmptyState } from '@/components/EmptyState'
import { Settings } from '@/components/Settings'
import { StatsBar } from '@/components/StatsBar'


import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { usePropertyStore } from '@/store/property-store'
import { ScoringService, defaultPropertyTypeConfigs } from '@/services/scoring-service'
import { validateUniqueIds } from '@/lib/utils'
import { PropertyType } from '@/store/property-store'

const App: React.FC = () => {
  const {
    properties,
    metrics,
    removeProperty,
    clearProperties,
    importProperties,
    exportProperties,
    refreshProperties,
    setLoading
  } = usePropertyStore()

  const [scoringService] = useState(() => new ScoringService(defaultPropertyTypeConfigs))
  const [currentConfigs, setCurrentConfigs] = useState(defaultPropertyTypeConfigs)
  const [currentPropertyType, setCurrentPropertyType] = useState<PropertyType>('vivienda')
  const [showSettings, setShowSettings] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    propertyId: string | null
    propertyTitle: string
  }>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ''
  })
  const [clearConfirmation, setClearConfirmation] = useState(false)


  useEffect(() => {
    // Initialize the extension
    setLoading(true)
    
    // Load any existing data from Chrome storage
    chrome.storage.local.get(['properties', 'scoringConfig'], (result) => {
      if (result.properties) {
        // Migrate legacy scores if needed
        const migratedProperties = result.properties.map((property: any) => {
          let newScore = property.score
          
          // Handle different legacy score formats
          if (property.score > 10000) {
            // Very inflated scores (like 10000 -> 100)
            newScore = Math.round(property.score / 100)
            console.log(`Migrating property ${property.id}: very inflated score ${property.score} -> ${newScore}`)
          } else if (property.score > 100) {
            // Moderately inflated scores (like 9800 -> 98)
            newScore = Math.round(property.score / 100)
            console.log(`Migrating property ${property.id}: inflated score ${property.score} -> ${newScore}`)
          }
          
          // Ensure score is within valid range
          newScore = Math.max(0, Math.min(100, newScore))
          
          return { ...property, score: newScore }
        })
        importProperties(migratedProperties)
        

      }
      if (result.scoringConfig) {
        // Handle legacy single config format
        if (result.scoringConfig.weights) {
          // Convert legacy config to new format
          scoringService.updateConfig('vivienda', result.scoringConfig)
          scoringService.updateConfig('habitacion', result.scoringConfig)
        } else if (result.scoringConfig.vivienda && result.scoringConfig.habitacion) {
          // New format with both property types
          scoringService.updateConfig('vivienda', result.scoringConfig.vivienda)
          scoringService.updateConfig('habitacion', result.scoringConfig.habitacion)
        }
        
        // Update current configs
        setCurrentConfigs(result.scoringConfig)
      }
      setLoading(false)
    })
  }, [])

  const handleConfig = () => {
    setShowSettings(true)
  }



  const handleExport = () => {
    const data = exportProperties()
    
    // Sort properties by score (highest first)
    const sortedProperties = [...data].sort((a, b) => b.score - a.score)
    
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

    // Generate TSV content
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
    
    const tsvRows = [
      headers.join('\t'),
      ...sortedProperties.map(property => [
        property.id,
        sanitizeText(property.title),
        property.price ?? '',
        sanitizeText(property.location),
        property.size ?? '',
        property.rooms ?? '',
        property.bathrooms ?? '',
        sanitizeText(property.floor),
        property.elevator ? 'Sí' : 'No',
        property.parking ? 'Sí' : 'No',
        property.terrace ? 'Sí' : 'No',
        property.balcony ? 'Sí' : 'No',
        property.airConditioning ? 'Sí' : 'No',
        property.heating ? 'Sí' : 'No',
        sanitizeText(property.url),
        sanitizeText(property.imageUrl || ''),
        property.score ?? '',
        sanitizeText(property.notes || ''),
        formatDate(property.createdAt),
        formatDate(property.updatedAt)
      ].join('\t'))
    ]
    
    const tsvContent = tsvRows.join('\n')
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propiedades_ordenadas_por_score_${new Date().toISOString().split('T')[0]}.tsv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setClearConfirmation(true)
  }

  const handleDelete = (id: string) => {
    const property = properties.find(p => String(p.id) === String(id))
    setDeleteConfirmation({
      isOpen: true,
      propertyId: id,
      propertyTitle: property?.title || 'esta propiedad'
    })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.propertyId) {
      removeProperty(deleteConfirmation.propertyId)
    }
  }

  const confirmClear = () => {
    clearProperties()
    setClearConfirmation(false)
  }









  const handleSaveSettings = (newConfigs: any) => {
    // Show loading state while saving
    setLoading(true)
    
    // Update both property type configurations
    scoringService.updateConfig('vivienda', newConfigs.vivienda)
    scoringService.updateConfig('habitacion', newConfigs.habitacion)
    
    // Update current configs state
    setCurrentConfigs(newConfigs)
    
    // Recalculate scores for all current properties with the new config
    const recalculatedProperties = properties.map((property: any) => {
      const newScore = scoringService.calculateScore(property)
      return { ...property, score: newScore }
    })
    
    // Update the store with recalculated data
    importProperties(recalculatedProperties)
    
    // Save to Chrome storage
    chrome.storage.local.set({ scoringConfig: newConfigs })
    
    // Notify background script of configuration update
    chrome.runtime.sendMessage({
      action: 'saveConfiguration',
      config: newConfigs
    }, () => {
      // After configuration is saved, refresh the property list
      setTimeout(() => {
        refreshProperties()
        setLoading(false)
      }, 500)
    })
  }

  const handlePropertyTypeChange = (newPropertyType: PropertyType) => {
    setCurrentPropertyType(newPropertyType)
  }

  // Debug function to check current IDs
  const debugIds = () => {
    const ids = properties.map(p => p.id)
    const validation = validateUniqueIds(ids as string[])
    
    if (!validation.isUnique) {
      console.error('❌ DUPLICATE IDs FOUND:', validation.duplicates)
    }
  }

  // Debug IDs on component mount and when properties change
  useEffect(() => {
    if (properties.length > 0) {
      debugIds()
    }
  }, [properties])

  return (
    <div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
      <Header
        onConfig={handleConfig}
        onExport={handleExport}
        onClear={handleClear}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {properties.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <StatsBar metrics={metrics} />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onDelete={handleDelete}
                    currentConfig={currentConfigs[currentPropertyType]}
                  />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
      
      {showSettings && (
        <Settings
          configs={scoringService.getAllConfigs()}
          currentPropertyType={currentPropertyType}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
          onPropertyTypeChange={handlePropertyTypeChange}
        />
      )}
      
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, propertyId: null, propertyTitle: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Propiedad"
        message={`¿Estás seguro de que quieres eliminar "${deleteConfirmation.propertyTitle}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={clearConfirmation}
        onClose={() => setClearConfirmation(false)}
        onConfirm={confirmClear}
        title="Eliminar Todas las Propiedades"
        message="¿Estás seguro de que quieres eliminar todas las propiedades? Esta acción no se puede deshacer."
        confirmText="Eliminar Todo"
        cancelText="Cancelar"
        variant="destructive"
      />
      


    </div>
  )
}

export default App
