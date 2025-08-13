import React, { useState } from 'react'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImportanceSelector, ImportanceLevel } from '@/components/ui/importance-selector'
import { Save, RotateCcw, Home, Users } from 'lucide-react'
import { 
  PropertyTypeConfigs, 
  ScoringConfig, 
  ScoringImportance,
  getDefaultLevels,
  convertLevelsToImportance
} from '@/services/scoring-service'
import { PropertyType } from '@/store/property-store'

interface SettingsProps {
  configs: PropertyTypeConfigs
  currentPropertyType: PropertyType
  onSave: (configs: PropertyTypeConfigs) => void
  onClose: () => void
  onPropertyTypeChange?: (propertyType: PropertyType) => void
}

export const Settings: React.FC<SettingsProps> = ({
  configs,
  currentPropertyType,
  onSave,
  onClose,
  onPropertyTypeChange
}) => {
  const [localConfigs, setLocalConfigs] = useState<PropertyTypeConfigs>({ ...configs })
  const [activeTab, setActiveTab] = useState<PropertyType>(currentPropertyType)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)

  // Convert current importance values to levels for initialization
  const convertImportanceToLevels = (importance: ScoringImportance): Record<keyof ScoringImportance, ImportanceLevel> => {
    const levels: Partial<Record<keyof ScoringImportance, ImportanceLevel>> = {}
    
    for (const [key, importanceValue] of Object.entries(importance)) {
      switch (importanceValue) {
        case 0:
          levels[key as keyof ScoringImportance] = 'irrelevante'
          break
        case 1:
          levels[key as keyof ScoringImportance] = 'valorable'
          break
        case 2:
          levels[key as keyof ScoringImportance] = 'esencial'
          break
        default:
          levels[key as keyof ScoringImportance] = 'irrelevante'
      }
    }
    
    return levels as Record<keyof ScoringImportance, ImportanceLevel>
  }

  // Initialize importance levels from current configs
  const [importanceLevels, setImportanceLevels] = useState<Record<PropertyType, Record<keyof ScoringImportance, ImportanceLevel>>>({
    vivienda: convertImportanceToLevels(configs.vivienda.weights),
    habitacion: convertImportanceToLevels(configs.habitacion.weights)
  })

  const handleImportanceChange = (propertyType: PropertyType, key: keyof ScoringConfig['weights'], level: ImportanceLevel) => {
    // Update the levels
    setImportanceLevels(prev => ({
      ...prev,
      [propertyType]: {
        ...prev[propertyType],
        [key]: level
      }
    }))

    // Convert to numeric importance values and update configs
    const newLevels = {
      ...importanceLevels[propertyType],
      [key]: level
    }
    const newImportance = convertLevelsToImportance(newLevels)
    setLocalConfigs(prev => ({
      ...prev,
      [propertyType]: {
        ...prev[propertyType],
        weights: newImportance
      }
    }))
  }

  const handleRangeChange = (
    propertyType: PropertyType,
    rangeKey: keyof Omit<ScoringConfig, 'weights'>,
    field: 'min' | 'max',
    value: number | null
  ) => {
    setLocalConfigs(prev => ({
      ...prev,
      [propertyType]: {
        ...prev[propertyType],
        [rangeKey]: {
          ...prev[propertyType][rangeKey],
          [field]: value
        }
      }
    }))
  }



  const handleTabChange = (newTab: string) => {
    const propertyType = newTab as PropertyType
    setActiveTab(propertyType)
    if (onPropertyTypeChange) {
      onPropertyTypeChange(propertyType)
    }
  }

  const handleSave = () => {
    // Convert current levels to importance values and save
    const finalConfigs = { ...localConfigs }
    
    for (const propertyType of ['vivienda', 'habitacion'] as PropertyType[]) {
      const levels = importanceLevels[propertyType]
      const importance = convertLevelsToImportance(levels)
      
      finalConfigs[propertyType] = {
        ...finalConfigs[propertyType],
        weights: importance
      }
    }
    
    onSave(finalConfigs)
    onClose()
  }

  const handleReset = () => {
    setShowResetConfirmation(true)
  }

  const confirmReset = () => {
    // Reset only the currently selected property type to all irrelevant
    const defaultLevels = getDefaultLevels()
    
    setLocalConfigs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        weights: convertLevelsToImportance(defaultLevels)
      }
    }))
    
    setImportanceLevels(prev => ({
      ...prev,
      [activeTab]: defaultLevels
    }))
    
    setShowResetConfirmation(false)
  }

  const renderImportanceSection = (propertyType: PropertyType) => {
    const levels = importanceLevels[propertyType]

    // Define a consistent order for properties
    const propertyOrder = [
      'price', 'size', 'rooms', 'bathrooms', 'floor',
      'heating', 'elevator', 'airConditioning', 'furnished', 'parking',
      'terrace', 'balcony', 'desk', 'orientation', 'seasonal',
      'deposit', 'maintenance', 'energy', 'garden', 'pool',
      'accessible', 'cleaningIncluded', 'privateBathroom', 'window',
      'couplesAllowed', 'minorsAllowed', 'lgbtFriendly', 'ownerNotPresent',
      'publicationDate', 'builtInWardrobes', 'garage', 'storage',
      'condition', 'propertySubType', 'hasFloorPlan', 'hasVirtualTour',
      'bankAd', 'gender', 'smokers', 'bed', 'roommates'
    ]

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Importancia de Propiedades</h3>
        <div className="grid grid-cols-1 gap-4">
          {propertyOrder.map((key) => {
            return (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium capitalize">
                {key === 'price' && 'Precio'}
                {key === 'size' && 'Tamaño'}
                {key === 'rooms' && 'Habitaciones'}
                {key === 'bathrooms' && 'Baños'}
                {key === 'floor' && 'Planta'}
                {key === 'heating' && 'Calefacción'}
                {key === 'elevator' && 'Ascensor'}
                {key === 'airConditioning' && 'Aire Acondicionado'}
                {key === 'furnished' && 'Amueblado'}
                {key === 'parking' && 'Parking'}
                {key === 'terrace' && 'Terraza'}
                {key === 'balcony' && 'Balcón'}
                {key === 'desk' && 'Escritorio'}
                {key === 'orientation' && 'Orientación'}
                {key === 'seasonal' && 'Temporal'}
                {key === 'deposit' && 'Fianza'}
                {key === 'maintenance' && 'Gastos Comunidad'}
                {key === 'energy' && 'Certificado Energético'}
                {key === 'garden' && 'Jardín'}
                {key === 'pool' && 'Piscina'}
                {key === 'accessible' && 'Accesible'}
                {key === 'cleaningIncluded' && 'Limpieza Incluida'}
                {key === 'privateBathroom' && 'Baño Privado'}
                {key === 'window' && 'Ventana'}
                {key === 'couplesAllowed' && 'Parejas Permitidas'}
                {key === 'minorsAllowed' && 'Menores Permitidos'}
                {key === 'lgbtFriendly' && 'LGBT Friendly'}
                {key === 'ownerNotPresent' && 'Sin Propietario'}
                {key === 'publicationDate' && 'Fecha Publicación'}
                {key === 'builtInWardrobes' && 'Armarios Empotrados'}
                {key === 'garage' && 'Garaje'}
                {key === 'storage' && 'Trastero'}
                {key === 'condition' && 'Estado'}
                {key === 'propertySubType' && 'Tipo de Vivienda'}
                {key === 'hasFloorPlan' && 'Con Plano'}
                {key === 'hasVirtualTour' && 'Con Visita Virtual'}
                {key === 'bankAd' && 'Anuncio de Banco'}
                {key === 'gender' && 'Género'}
                {key === 'smokers' && 'Fumadores'}
                {key === 'bed' && 'Cama'}
                {key === 'roommates' && 'Compañeros de Casa'}
              </label>
              <ImportanceSelector
                value={levels[key as keyof ScoringImportance]}
                onValueChange={(level) => handleImportanceChange(propertyType, key as keyof ScoringConfig['weights'], level)}
                className="w-full"
              />
            </div>
          )
          })}
        </div>
      </div>
    )
  }

  const renderRangesSection = (propertyType: PropertyType) => {
    const config = localConfigs[propertyType]

    const renderRangeField = (
      rangeKey: 'priceRange' | 'sizeRange' | 'roomRange' | 'bathroomRange',
      title: string,
      minValue: number = 0,
      maxValue: number = 9999
    ) => (
      <div className="space-y-3">
        <h4 className="font-medium">{title}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Mínimo</Label>
            <Input
              type="number"
              min={minValue}
              max={maxValue}
              value={config[rangeKey].min || ''}
              onChange={(e) => {
                const value = e.target.value
                handleRangeChange(propertyType, rangeKey, 'min', value === '' ? null : parseInt(value) || null)
              }}
              className="w-full"
              placeholder="Sin límite"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Máximo</Label>
            <Input
              type="number"
              min={minValue}
              max={maxValue}
              value={config[rangeKey].max || ''}
              onChange={(e) => {
                const value = e.target.value
                handleRangeChange(propertyType, rangeKey, 'max', value === '' ? null : parseInt(value) || null)
              }}
              className="w-full"
              placeholder="Sin límite"
            />
          </div>
        </div>
      </div>
    )

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Rangos de Búsqueda</h3>
        <div className="grid gap-6">
          {renderRangeField('priceRange', 'Precio (€)')}
          {renderRangeField('sizeRange', 'Tamaño (m²)')}
          {renderRangeField('roomRange', 'Habitaciones', 1, 10)}
          {renderRangeField('bathroomRange', 'Baños', 1, 10)}
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="settings-description">
          <DialogHeader>
            <DialogTitle className="text-xl">Configuración de Búsqueda</DialogTitle>
            <DialogDescription id="settings-description">
              Configura la importancia de cada propiedad y rangos de búsqueda para viviendas y habitaciones.
            </DialogDescription>
          </DialogHeader>

          <CardContent className="space-y-6">
            {/* Property Type Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vivienda" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Vivienda
                </TabsTrigger>
                <TabsTrigger value="habitacion" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Habitación
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vivienda" className="space-y-6">
                {renderImportanceSection('vivienda')}
                <Separator className="my-6" />
                {renderRangesSection('vivienda')}
              </TabsContent>

              <TabsContent value="habitacion" className="space-y-6">
                {renderImportanceSection('habitacion')}
                <Separator className="my-6" />
                {renderRangesSection('habitacion')}
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex space-between gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleReset} className='w-full'>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restablecer
              </Button>
              <Button 
                onClick={handleSave} 
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
      
      {/* Reset Confirmation Modal */}
      <Dialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
        <DialogContent className="max-w-md" aria-describedby="reset-description">
          <DialogHeader>
            <DialogTitle>Restablecer Configuración</DialogTitle>
            <DialogDescription id="reset-description">
              ¿Estás seguro de que quieres restablecer la configuración de{' '}
              <strong>{activeTab === 'vivienda' ? 'Vivienda' : 'Habitación'}</strong> 
              {' '}a los valores predeterminados? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowResetConfirmation(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Restablecer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

