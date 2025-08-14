import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, RotateCcw, Home, Users, ArrowLeft } from 'lucide-react'
import { 
  PropertyTypeConfigs, 
  ScoringConfig, 
  ScoringImportance,
  getDefaultLevels,
  convertLevelsToImportance
} from '@/domain/entities/PropertyType'
import { PropertyType } from '@/domain/entities/PropertyType'

type ImportanceLevel = 'irrelevante' | 'valorable' | 'esencial'

interface SettingsViewProps {
  configs: PropertyTypeConfigs
  currentPropertyType: PropertyType
  onSave: (configs: PropertyTypeConfigs) => void
  onBack: () => void
  onPropertyTypeChange?: (propertyType: PropertyType) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  configs,
  currentPropertyType,
  onSave,
  onBack,
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
    onBack()
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
      'privateBathroom', 'builtInWardrobes', 'garage', 'storage', 
      'condition', 'propertySubType', 'couplesAllowed', 'gender', 
      'smokers', 'roommates'
    ]

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Importancia de Propiedades</h3>
        <div className="grid grid-cols-1 gap-4">
          {propertyOrder.map((key) => {
            return (
            <div
              key={key}
              className="flex items-center w-full gap-4 border border-muted rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <label
                className="text-sm font-medium capitalize flex-1 min-w-0 truncate"
                title={
                  key === 'price' ? 'Precio' :
                  key === 'size' ? 'Tamaño' :
                  key === 'rooms' ? 'Habitaciones' :
                  key === 'bathrooms' ? 'Baños' :
                  key === 'floor' ? 'Planta' :
                  key === 'heating' ? 'Calefacción' :
                  key === 'elevator' ? 'Ascensor' :
                  key === 'airConditioning' ? 'Aire Acondicionado' :
                  key === 'furnished' ? 'Amueblado' :
                  key === 'parking' ? 'Parking' :
                  key === 'terrace' ? 'Terraza' :
                  key === 'balcony' ? 'Balcón' :
                  key === 'desk' ? 'Escritorio' :
                  key === 'orientation' ? 'Orientación' :
                  key === 'seasonal' ? 'Temporal' :
                  key === 'deposit' ? 'Fianza' :
                  key === 'maintenance' ? 'Gastos Comunidad' :
                  key === 'energy' ? 'Certificado Energético' :
                  key === 'garden' ? 'Jardín' :
                  key === 'pool' ? 'Piscina' :
                  key === 'privateBathroom' ? 'Baño Privado' :
                  key === 'builtInWardrobes' ? 'Armarios Empotrados' :
                  key === 'garage' ? 'Garaje' :
                  key === 'storage' ? 'Trastero' :
                  key === 'condition' ? 'Estado' :
                  key === 'propertySubType' ? 'Tipo de Vivienda' :
                  key === 'couplesAllowed' ? 'Parejas Permitidas' :
                  key === 'gender' ? 'Género' :
                  key === 'smokers' ? 'Fumadores' :
                  key === 'roommates' ? 'Compañeros de Casa' : ''
                }
              >
                <span className="truncate block">
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
                  {key === 'privateBathroom' && 'Baño Privado'}
                  {key === 'builtInWardrobes' && 'Armarios Empotrados'}
                  {key === 'garage' && 'Garaje'}
                  {key === 'storage' && 'Trastero'}
                  {key === 'condition' && 'Estado'}
                  {key === 'propertySubType' && 'Tipo de Vivienda'}
                  {key === 'couplesAllowed' && 'Parejas Permitidas'}
                  {key === 'gender' && 'Género'}
                  {key === 'smokers' && 'Fumadores'}
                  {key === 'roommates' && 'Compañeros de Casa'}
                </span>
              </label>
              <div className="flex-shrink-0">
                <Select
                  value={levels[key as keyof ScoringImportance]}
                  onValueChange={(level: ImportanceLevel) => handleImportanceChange(propertyType, key as keyof ScoringConfig['weights'], level)}
                >
                  <SelectTrigger className="w-fit min-w-[120px]">
                    <SelectValue placeholder="Seleccionar importancia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irrelevante">Irrelevante</SelectItem>
                    <SelectItem value="valorable">Valorable</SelectItem>
                    <SelectItem value="esencial">Esencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Mín</Label>
            <Input
              type="number"
              min={minValue}
              max={maxValue}
              value={config[rangeKey].min || ''}
              onChange={(e) => {
                const value = e.target.value
                handleRangeChange(propertyType, rangeKey, 'min', value === '' ? null : parseInt(value) || null)
              }}
              className="w-full h-9 text-sm"
              placeholder="Sin límite"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Máx</Label>
            <Input
              type="number"
              min={minValue}
              max={maxValue}
              value={config[rangeKey].max || ''}
              onChange={(e) => {
                const value = e.target.value
                handleRangeChange(propertyType, rangeKey, 'max', value === '' ? null : parseInt(value) || null)
              }}
              className="w-full h-9 text-sm"
              placeholder="Sin límite"
            />
          </div>
        </div>
      </div>
    )

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Rangos de Búsqueda</h3>
        <div className="grid gap-4">
          {renderRangeField('priceRange', 'Precio (€)')}
          {renderRangeField('sizeRange', 'Tamaño (m²)')}
          {renderRangeField('roomRange', 'Habitaciones', 1, 10)}
          {renderRangeField('bathroomRange', 'Baños', 1, 10)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-semibold">Configuración</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
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
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className='flex-1'>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Restablecer Configuración</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que quieres restablecer la configuración de{' '}
              <strong>{activeTab === 'vivienda' ? 'Vivienda' : 'Habitación'}</strong> 
              {' '}a los valores predeterminados? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetConfirmation(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmReset}>
                Restablecer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
