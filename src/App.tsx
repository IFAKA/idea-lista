import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from "motion/react"
import { Header } from '@/components/Header'
import { PropertyCard } from '@/components/PropertyCard'
import { EmptyState } from '@/components/EmptyState'
import { StatsBar } from '@/components/StatsBar'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { SettingsView } from '@/components/SettingsView'
import { VisitManagementView } from '@/components/VisitManagementView'
import { usePropertyStore } from '@/store/property-store'
import { initializeTheme } from '@/lib/theme'
import { Property } from '@/domain/entities/Property'

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
    initialize,
    refreshProperties
  } = usePropertyStore()
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ''
  })
  const [clearConfirmation, setClearConfirmation] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [visitManagementOpen, setVisitManagementOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Add ref for scrolling container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleExport = useCallback(async () => {
    if (properties.length === 0) return
    
    try {
      const tsvContent = await exportProperties({
        format: 'tsv',
        sortBy: 'score',
        sortOrder: 'desc',
        includeVisits: true
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
    if (properties.length === 0) return
    
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
    const sortedProperties = properties.sort((a, b) => b.score - a.score)
    let shareText = `Mi Lista de Propiedades (${properties.length} propiedades)\n\n`
    
    sortedProperties.forEach((property, index) => {
      shareText += `${index + 1}. ${property.title}\n`
      const details = []
      if (property.price > 0) details.push(`${property.price}€`)
      if (property.squareMeters && property.squareMeters > 0) details.push(`${property.squareMeters}m²`)
      if (property.rooms > 0) details.push(`${property.rooms}hab`)
      if (property.bathrooms > 0) details.push(`${property.bathrooms}baño`)
      if (property.floor && property.floor.trim()) details.push(`p${property.floor}`)
      if (property.location && property.location.trim()) details.push(property.location)
      if (property.score !== undefined) details.push(`${property.score.toFixed(1)}`)
      
      if (details.length > 0) {
        shareText += `   ${details.join(' • ')}\n`
      }
      if (property.url) {
        shareText += `   ${property.url}\n`
      }
      shareText += '\n'
    })

    const encodedText = encodeURIComponent(shareText)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
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

  const handleManageVisits = useCallback((property: Property) => {
    setSelectedProperty(property)
    setVisitManagementOpen(true)
  }, [])

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



  // Initialize app
  useEffect(() => {
    initializeTheme()
    initialize()
    
    // Listen for property updates from background script
    const handleMessage = (message: ChromeMessage) => {
      if (message.action === 'propertiesUpdated' || message.action === 'propertyDeleted') {
        refreshProperties()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [initialize, refreshProperties])

  // Auto-scroll to current property when popup opens
  useEffect(() => {
    const scrollToCurrentProperty = async () => {
      if (properties.length === 0 || isLoading) return

      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        
        if (!activeTab.url || !activeTab.url.includes('idealista.com/inmueble/')) {
          return
        }

        const currentProperty = properties.find(property => property.url === activeTab.url)
        
        if (currentProperty && scrollContainerRef.current) {
          const containerElement = scrollContainerRef.current
          const cardElement = containerElement.querySelector(`[data-property-id="${currentProperty.id}"]`) as HTMLElement
          
          if (cardElement) {
            const containerRect = containerElement.getBoundingClientRect()
            const cardRect = cardElement.getBoundingClientRect()
            
            const scrollTop = cardElement.offsetTop - containerElement.offsetTop - (containerRect.height / 2) + (cardRect.height / 2)
            
            containerElement.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: 'smooth'
            })
            
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
      {!settingsOpen && !visitManagementOpen && (
        <div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
          <Header
            onConfig={() => setSettingsOpen(true)}
            onExport={handleExport}
            onClear={handleClear}
            onExportVisits={handleExportVisits}
            onShare={handleShare}
            propertiesCount={properties.length}
            mode="list"
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
                        onManageVisits={handleManageVisits}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsView onBack={() => setSettingsOpen(false)} />
      )}

      {visitManagementOpen && selectedProperty && (
        <VisitManagementView onBack={() => { setVisitManagementOpen(false); setSelectedProperty(null) }} property={selectedProperty} />
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

      

    </>
  )
}

export default App
