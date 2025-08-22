import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { usePropertyStore } from '@/store/property-store'
import { PropertyTypeConfigs, FeatureWeight } from '@/domain/entities/PropertyType'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const featureLabels = {
  price: 'Precio',
  size: 'Tamaño',
  rooms: 'Habitaciones',
  bathrooms: 'Baños',
  heating: 'Calefacción',
  elevator: 'Ascensor',
  furnished: 'Amueblado',
  parking: 'Parking'
}

const weightOptions = [
  { value: 0, label: 'Irrelevante' },
  { value: 1, label: 'Valioso' },
  { value: 2, label: 'Esencial' }
]

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { updateScoringConfig, recalculateAllScores } = usePropertyStore()
  const [configs, setConfigs] = useState<PropertyTypeConfigs>({
    vivienda: {
      weights: {
        price: 2,
        size: 2,
        rooms: 2,
        bathrooms: 2,
        heating: 2,
        elevator: 2,
        furnished: 1,
        parking: 1,
      },
      ranges: {
        priceRange: { min: 500, max: 3000 },
        sizeRange: { min: 30, max: 150 },
        roomRange: { min: 1, max: 5 },
        bathroomRange: { min: 1, max: 3 },
      },
    },
    habitacion: {
      weights: {
        price: 2,
        size: 1,
        rooms: 0,
        bathrooms: 1,
        heating: 2,
        elevator: 1,
        furnished: 2,
        parking: 1,
      },
      ranges: {
        priceRange: { min: 200, max: 800 },
        sizeRange: { min: 8, max: 25 },
        roomRange: { min: 1, max: 1 },
        bathroomRange: { min: 1, max: 1 },
      },
    },
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load current config when modal opens
    if (isOpen) {
      const loadConfig = async () => {
        try {
          const service = usePropertyStore.getState().getApplicationService()
          const currentConfig = await service.getScoringConfig()
          setConfigs(currentConfig)
        } catch (error) {
          console.error('Error loading config:', error)
        }
      }
      loadConfig()
    }
  }, [isOpen])

  const handleWeightChange = (propertyType: 'vivienda' | 'habitacion', feature: string, weight: FeatureWeight) => {
    setConfigs(prev => ({
      ...prev,
      [propertyType]: {
        ...prev[propertyType],
        weights: {
          ...prev[propertyType].weights,
          [feature]: weight
        }
      }
    }))
  }

  const handleRangeChange = (propertyType: 'vivienda' | 'habitacion', rangeType: string, field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0
    setConfigs(prev => ({
      ...prev,
      [propertyType]: {
        ...prev[propertyType],
        ranges: {
          ...prev[propertyType].ranges,
          [rangeType]: {
            ...prev[propertyType].ranges[rangeType as keyof typeof prev[typeof propertyType]['ranges']],
            [field]: numValue
          }
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateScoringConfig(configs)
      await recalculateAllScores()
      onClose()
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to default configs
    setConfigs({
      vivienda: {
        weights: {
          price: 2,
          size: 2,
          rooms: 2,
          bathrooms: 2,
          heating: 2,
          elevator: 2,
          furnished: 1,
          parking: 1,
        },
        ranges: {
          priceRange: { min: 500, max: 3000 },
          sizeRange: { min: 30, max: 150 },
          roomRange: { min: 1, max: 5 },
          bathroomRange: { min: 1, max: 3 },
        },
      },
      habitacion: {
        weights: {
          price: 2,
          size: 1,
          rooms: 0,
          bathrooms: 1,
          heating: 2,
          elevator: 1,
          furnished: 2,
          parking: 1,
        },
        ranges: {
          priceRange: { min: 200, max: 800 },
          sizeRange: { min: 8, max: 25 },
          roomRange: { min: 1, max: 1 },
          bathroomRange: { min: 1, max: 1 },
        },
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Sistema de Puntuación</DialogTitle>
          <DialogDescription>
            Configura los pesos y rangos para el algoritmo de puntuación de propiedades.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="vivienda" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vivienda">Vivienda</TabsTrigger>
            <TabsTrigger value="habitacion">Habitación</TabsTrigger>
          </TabsList>

          {(['vivienda', 'habitacion'] as const).map((propertyType) => (
            <TabsContent key={propertyType} value={propertyType} className="space-y-6">
              {/* Weights Configuration */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Pesos de Características</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(featureLabels).map(([feature, label]) => (
                    <div key={feature} className="space-y-2">
                      <Label htmlFor={`${propertyType}-${feature}`}>{label}</Label>
                      <Select
                        value={configs[propertyType].weights[feature as keyof typeof configs[typeof propertyType]['weights']].toString()}
                        onValueChange={(value) => handleWeightChange(propertyType, feature, parseInt(value) as FeatureWeight)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weightOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ranges Configuration */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Rangos Preferidos</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Precio (€)</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Mín"
                          value={configs[propertyType].ranges.priceRange.min}
                          onChange={(e) => handleRangeChange(propertyType, 'priceRange', 'min', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Máx"
                          value={configs[propertyType].ranges.priceRange.max}
                          onChange={(e) => handleRangeChange(propertyType, 'priceRange', 'max', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tamaño (m²)</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Mín"
                          value={configs[propertyType].ranges.sizeRange.min}
                          onChange={(e) => handleRangeChange(propertyType, 'sizeRange', 'min', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Máx"
                          value={configs[propertyType].ranges.sizeRange.max}
                          onChange={(e) => handleRangeChange(propertyType, 'sizeRange', 'max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Habitaciones</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Mín"
                          value={configs[propertyType].ranges.roomRange.min}
                          onChange={(e) => handleRangeChange(propertyType, 'roomRange', 'min', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Máx"
                          value={configs[propertyType].ranges.roomRange.max}
                          onChange={(e) => handleRangeChange(propertyType, 'roomRange', 'max', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Baños</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Mín"
                          value={configs[propertyType].ranges.bathroomRange.min}
                          onChange={(e) => handleRangeChange(propertyType, 'bathroomRange', 'min', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Máx"
                          value={configs[propertyType].ranges.bathroomRange.max}
                          onChange={(e) => handleRangeChange(propertyType, 'bathroomRange', 'max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Restablecer
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
