import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { motion } from "motion/react"
import { Header } from '@/components/Header'
import { PropertyCard } from '@/components/PropertyCard'
import { EmptyState } from '@/components/EmptyState'
import { SettingsView } from '@/components/SettingsView'
import { StatsBar } from '@/components/StatsBar'
import { VisitManagementView } from '@/components/VisitManagementView'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useCleanPropertyStore } from '@/store/clean-property-store'
import { Property, VisitChecklistItem } from '@/domain/entities/Property'
import { PropertyAdapter } from '@/infrastructure/adapters/PropertyAdapter'
import { initializeTheme } from '@/lib/theme'
import { ScoringConfig, PropertyTypeConfigs } from '@/domain/entities/PropertyType'

interface ChromeMessage {
  action: string
  properties?: unknown[]
  [key: string]: unknown
}

interface DeleteConfirmationState {
  isOpen: boolean
  propertyId: string | null
  propertyTitle: string
}

interface VisitManagementState {
  isOpen: boolean
  property: Property | null
}

const App: React.FC = () => {
  const {
    properties,
    metrics,
    isLoading,
    error,
    removeProperty,
    clearProperties,
    exportProperties,
    exportVisitData,
    updateProperty,
    addVisit,
    initialize,
    refreshProperties,
    recalculateAllScores
  } = useCleanPropertyStore()
  
  const [currentConfig, setCurrentConfig] = useState<ScoringConfig | undefined>(undefined)
  const [settingsConfigs, setSettingsConfigs] = useState<PropertyTypeConfigs | undefined>(undefined)

  const [showSettings, setShowSettings] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ''
  })
  const [clearConfirmation, setClearConfirmation] = useState(false)
  const [migrationConfirmation, setMigrationConfirmation] = useState(false)
  const [visitManagementView, setVisitManagementView] = useState<VisitManagementState>({
    isOpen: false,
    property: null
  })

  // Add ref for scrolling container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Memoized handlers
  const handleConfig = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleExport = useCallback(async () => {
    try {
      const tsvContent = await exportProperties({
        format: 'tsv',
        sortBy: 'score',
        sortOrder: 'desc',
        includeVisits: true,
        includeContacts: true
      })
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `propiedades_ordenadas_por_score_${new Date().toISOString().split('T')[0]}.tsv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [exportProperties])

  const handleExportVisits = useCallback(async () => {
    try {
      const visitData = await exportVisitData()
      const blob = new Blob([visitData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `datos_visitas_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Visit export failed:', error)
    }
  }, [exportVisitData])

  const handleShare = useCallback(() => {
    if (properties.length === 0) return

    // Create a summary of properties for sharing
    const sortedProperties = properties
      .sort((a, b) => b.score - a.score)

    let shareText = `Mi Lista de Propiedades (${properties.length} propiedades)\n\n`
    
    sortedProperties.forEach((property, index) => {
      shareText += `${index + 1}. ${property.title}\n`
      const details = []
      if (property.price && property.price > 0) details.push(`${property.price}€`)
      if (property.squareMeters && property.squareMeters > 0) details.push(`${property.squareMeters}m²`)
      if (property.rooms && property.rooms > 0) details.push(`${property.rooms}hab`)
      if (property.bathrooms && property.bathrooms > 0) details.push(`${property.bathrooms}baño`)
      if (property.floor && property.floor.trim() && property.floor !== '') details.push(`p${property.floor}`)
      if (property.location && property.location.trim() && property.location !== '') details.push(property.location)
      if (property.score !== undefined && property.score !== null) details.push(`${property.score.toFixed(1)}`)
      
      if (details.length > 0) {
        shareText += `   ${details.join(' • ')}\n`
      }
      if (property.url) {
        shareText += `   ${property.url}\n`
      }
      shareText += '\n'
    })

    // Create WhatsApp share URL
    const encodedText = encodeURIComponent(shareText)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')
  }, [properties])

  const handleClear = useCallback(() => {
    setClearConfirmation(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    const property = properties.find(p => String(p.id) === String(id))
    setDeleteConfirmation({
      isOpen: true,
      propertyId: id,
      propertyTitle: property?.title || 'esta propiedad'
    })
  }, [properties])

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.propertyId) {
      await removeProperty(deleteConfirmation.propertyId)
      setDeleteConfirmation({ isOpen: false, propertyId: null, propertyTitle: '' })
    }
  }, [deleteConfirmation.propertyId, removeProperty])

  const confirmClear = useCallback(async () => {
    await clearProperties()
    setClearConfirmation(false)
  }, [clearProperties])

  const handleMigration = useCallback(() => {
    setMigrationConfirmation(true)
  }, [])

  const confirmMigration = useCallback(async () => {
    await recalculateAllScores()
    setMigrationConfirmation(false)
  }, [recalculateAllScores])

  const handleSaveSettings = useCallback(async (newConfigs: PropertyTypeConfigs) => {
    try {
      await useCleanPropertyStore.getState().updateScoringConfig(newConfigs)
      // Update the current config with the new vivienda config
      setCurrentConfig(newConfigs.vivienda)
      setSettingsConfigs(newConfigs)
      setShowSettings(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [])

  const handleManageVisits = useCallback((property: Property) => {
    setVisitManagementView({
      isOpen: true,
      property
    })
  }, [])

  const handleCloseVisitManagement = useCallback(() => {
    setVisitManagementView({
      isOpen: false,
      property: null
    })
  }, [])

  const handleUpdateProperty = useCallback(async (updates: Partial<Property>) => {
    if (visitManagementView.property) {
      await updateProperty(String(visitManagementView.property.id), updates)
    }
  }, [visitManagementView.property, updateProperty])

  const handleAddVisit = useCallback(async (visit: {
    status: 'requested' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
    date: Date
    notes?: string
    checklist: VisitChecklistItem[]
    contactMethod?: string
    contactPerson?: string
    scheduledTime?: string
    duration?: number
    followUpDate?: Date
    followUpNotes?: string
  }) => {
    if (visitManagementView.property) {
      await addVisit(String(visitManagementView.property.id), visit)
      // Refresh the property data in the visit management view
      const updatedProperties = await useCleanPropertyStore.getState().applicationService.getAllProperties()
      const updatedProperty = updatedProperties.find(p => String(p.id) === String(visitManagementView.property!.id))
      if (updatedProperty) {
        setVisitManagementView(prev => ({
          ...prev,
          property: PropertyAdapter.toStore(updatedProperty)
        }))
      }
    }
  }, [visitManagementView.property, addVisit])

  // Memoized values
  const hasProperties = useMemo(() => properties.length > 0, [properties.length])

  useEffect(() => {
    // Initialize theme system
    initializeTheme()
    
    // Initialize the clean architecture store and load configuration
    const initApp = async () => {
      await initialize()
      // Load current configuration
      try {
        const config = await useCleanPropertyStore.getState().applicationService.getConfig('vivienda')
        const allConfigs = await useCleanPropertyStore.getState().applicationService.getScoringConfig()
        setCurrentConfig(config)
        setSettingsConfigs(allConfigs)
      } catch (error) {
        console.error('Failed to load configuration:', error)
      }
    }
    
    initApp()
    
    // Listen for property updates from background script
    const handleMessage = (message: ChromeMessage) => {
      if (message.action === 'propertiesUpdated') {
        // Refresh the properties list when a new property is added
        refreshProperties()
      } else if (message.action === 'propertyDeleted') {
        // Refresh the properties list when a property is deleted
        refreshProperties()
      }
    }

    // Add message listener
    chrome.runtime.onMessage.addListener(handleMessage)
    
    // Cleanup function to remove listener
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }

  }, [initialize, refreshProperties])

  // Add effect to scroll to current property when popup opens
  useEffect(() => {
    const scrollToCurrentProperty = async () => {
      if (properties.length === 0 || isLoading) return

      try {
        // Get the active tab to check if we're on a property page
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        
        if (!activeTab.url || !activeTab.url.includes('idealista.com/inmueble/')) {
          return // Not on a property page
        }

        // Find the property that matches the current URL
        const currentProperty = properties.find(property => property.url === activeTab.url)
        
        if (currentProperty && scrollContainerRef.current) {
          const containerElement = scrollContainerRef.current
          
          // Find the property card element by its data attribute
          const cardElement = containerElement.querySelector(`[data-property-id="${currentProperty.id}"]`) as HTMLElement
          
          if (cardElement) {
            // Calculate the scroll position to center the card
            const containerRect = containerElement.getBoundingClientRect()
            const cardRect = cardElement.getBoundingClientRect()
            
            const scrollTop = cardElement.offsetTop - containerElement.offsetTop - (containerRect.height / 2) + (cardRect.height / 2)
            
            // Smooth scroll to the card
            containerElement.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: 'smooth'
            })
            
            // Add a subtle highlight effect
            cardElement.style.transition = 'box-shadow 0.3s ease'
            cardElement.style.boxShadow = '0 0 0 2px hsl(var(--primary))'
            
            setTimeout(() => {
              cardElement.style.boxShadow = ''
            }, 2000)
          }
        }
      } catch (error) {
        console.error('Error scrolling to current property:', error)
      }
    }

    // Small delay to ensure the popup is fully rendered
    const timer = setTimeout(scrollToCurrentProperty, 100)
    
    return () => clearTimeout(timer)
  }, [properties, isLoading])

  if (isLoading) {
    return (
      <div className="w-96 h-[600px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando propiedades...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-96 h-[600px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Error: {error}</p>
          <button 
            onClick={() => initialize()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showSettings ? (
        <SettingsView
          configs={settingsConfigs || useCleanPropertyStore.getState().applicationService.getAllConfigs()}
          currentPropertyType="vivienda"
          onSave={handleSaveSettings}
          onBack={() => setShowSettings(false)}
          onPropertyTypeChange={() => {}}
        />
      ) : visitManagementView.property && visitManagementView.isOpen ? (
        <VisitManagementView
          property={visitManagementView.property}
          onBack={handleCloseVisitManagement}
          onUpdateProperty={handleUpdateProperty}
          onAddVisit={handleAddVisit}
        />
      ) : (
        <div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
          <Header
            onConfig={handleConfig}
            onExport={handleExport}
            onClear={handleClear}
            onExportVisits={handleExportVisits}
            onShare={handleShare}
            propertiesCount={properties.length}
          />
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 pb-4" ref={scrollContainerRef}>
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
                        currentConfig={currentConfig}
                        onManageVisits={handleManageVisits}
                        allProperties={properties}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Migration Button - Temporary */}
      {hasProperties && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMigration}
          disabled={isLoading}
          className="fixed bottom-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-full p-3 shadow-lg transition-all duration-200"
          title="Recalculate all property scores with new algorithm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>
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

      <ConfirmationModal
        isOpen={migrationConfirmation}
        onClose={() => setMigrationConfirmation(false)}
        onConfirm={confirmMigration}
        title="Actualizar Puntuaciones"
        message="¿Estás seguro de que quieres recalcular todas las puntuaciones de propiedades con el nuevo algoritmo? Esto actualizará las puntuaciones de todas las propiedades existentes."
        confirmText="Actualizar"
        cancelText="Cancelar"
        variant="default"
      />
    </>
  )
}

export default App
