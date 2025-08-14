import React, { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { Header } from '@/components/Header'
import { PropertyCard } from '@/components/PropertyCard'
import { EmptyState } from '@/components/EmptyState'
import { SettingsView } from '@/components/SettingsView'
import { StatsBar } from '@/components/StatsBar'
import { VisitManagementView } from '@/components/VisitManagementView'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useCleanPropertyStore } from '@/store/clean-property-store'
import { Property } from '@/domain/entities/Property'
import { initializeTheme } from '@/lib/theme'

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
    updateVisit,
    initialize
  } = useCleanPropertyStore()

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
  const [visitManagementView, setVisitManagementView] = useState<{
    isOpen: boolean
    property: Property | null
  }>({
    isOpen: false,
    property: null
  })

  useEffect(() => {
    // Initialize theme system
    initializeTheme()
    
    // Initialize the clean architecture store
    initialize()
  }, [initialize])

  const handleConfig = () => {
    setShowSettings(true)
  }

  const handleExport = async () => {
    try {
      const tsvContent = await exportProperties()
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
  }

  const handleExportVisits = async () => {
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

  const confirmDelete = async () => {
    if (deleteConfirmation.propertyId) {
      await removeProperty(deleteConfirmation.propertyId)
      setDeleteConfirmation({ isOpen: false, propertyId: null, propertyTitle: '' })
    }
  }

  const confirmClear = async () => {
    await clearProperties()
    setClearConfirmation(false)
  }

  const handleSaveSettings = async (newConfigs: any) => {
    try {
      await useCleanPropertyStore.getState().updateScoringConfig(newConfigs)
      setShowSettings(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleManageVisits = (property: Property) => {
    setVisitManagementView({
      isOpen: true,
      property
    })
  }

  const handleCloseVisitManagement = () => {
    setVisitManagementView({
      isOpen: false,
      property: null
    })
  }

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
          configs={useCleanPropertyStore.getState().applicationService.getAllConfigs()}
          currentPropertyType="vivienda"
          onSave={handleSaveSettings}
          onBack={() => setShowSettings(false)}
          onPropertyTypeChange={() => {}}
        />
      ) : visitManagementView.property && visitManagementView.isOpen ? (
        <VisitManagementView
          property={visitManagementView.property}
          onBack={handleCloseVisitManagement}
          onUpdateProperty={async (updates) => {
            await updateProperty(String(visitManagementView.property!.id), updates)
          }}
          onAddVisit={async (visit) => {
            await addVisit(String(visitManagementView.property!.id), visit)
          }}
          onUpdateVisit={async (visitId, updates) => {
            await updateVisit(String(visitManagementView.property!.id), visitId, updates)
          }}
        />
      ) : (
        <div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
          <Header
            onConfig={handleConfig}
            onExport={handleExport}
            onClear={handleClear}
            onExportVisits={handleExportVisits}
            propertiesCount={properties.length}
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
                        currentConfig={useCleanPropertyStore.getState().applicationService.getConfig('vivienda')}
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
