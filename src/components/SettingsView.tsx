import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { usePropertyStore } from '@/store/property-store'
import { PropertyTypeConfigs, FeatureWeight } from '@/domain/entities/PropertyType'

interface SettingsViewProps {
	onBack: () => void
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

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
	const { updateScoringConfig, recalculateAllScores, getApplicationService } = usePropertyStore()
	const [configs, setConfigs] = useState<PropertyTypeConfigs | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		const loadConfig = async () => {
			try {
				const service = getApplicationService()
				const currentConfig = await service.getScoringConfig()
				setConfigs(currentConfig)
			} catch (error) {
				console.error('Error loading config:', error)
			}
		}
		loadConfig()
	}, [getApplicationService])

	if (!configs) return null

	const handleWeightChange = (propertyType: 'vivienda' | 'habitacion', feature: string, weight: FeatureWeight) => {
		setConfigs(prev => {
			if (!prev) return prev
			return ({
				...prev,
				[propertyType]: {
					...prev[propertyType],
					weights: {
						...prev[propertyType].weights,
						[feature]: weight
					}
				}
			})
		})
	}

	const handleRangeChange = (propertyType: 'vivienda' | 'habitacion', rangeType: string, field: 'min' | 'max', value: string) => {
		const numValue = parseInt(value) || 0
		setConfigs(prev => {
			if (!prev) return prev
			return ({
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
			})
		})
	}

	const handleSave = async () => {
		if (!configs) return
		setIsSaving(true)
		try {
			await updateScoringConfig(configs)
			await recalculateAllScores()
			onBack()
		} catch (error) {
			console.error('Error saving config:', error)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Configuración</h2>
					<div className="space-x-2">
						<Button variant="outline" onClick={onBack}>Cancelar</Button>
						<Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<Tabs defaultValue="vivienda" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="vivienda">Vivienda</TabsTrigger>
						<TabsTrigger value="habitacion">Habitación</TabsTrigger>
					</TabsList>

					{(['vivienda', 'habitacion'] as const).map((propertyType) => (
						<TabsContent key={propertyType} value={propertyType} className="space-y-6">
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

							<div>
								<h3 className="text-lg font-semibold mb-4">Rangos Preferidos</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Precio (€)</Label>
											<div className="flex space-x-2">
												<Input type="number" placeholder="Mín" value={configs[propertyType].ranges.priceRange.min}
													onChange={(e) => handleRangeChange(propertyType, 'priceRange', 'min', e.target.value)} />
												<Input type="number" placeholder="Máx" value={configs[propertyType].ranges.priceRange.max}
													onChange={(e) => handleRangeChange(propertyType, 'priceRange', 'max', e.target.value)} />
											</div>
										</div>
										<div className="space-y-2">
											<Label>Tamaño (m²)</Label>
											<div className="flex space-x-2">
												<Input type="number" placeholder="Mín" value={configs[propertyType].ranges.sizeRange.min}
													onChange={(e) => handleRangeChange(propertyType, 'sizeRange', 'min', e.target.value)} />
												<Input type="number" placeholder="Máx" value={configs[propertyType].ranges.sizeRange.max}
													onChange={(e) => handleRangeChange(propertyType, 'sizeRange', 'max', e.target.value)} />
											</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label>Habitaciones</Label>
											<div className="flex space-x-2">
												<Input type="number" placeholder="Mín" value={configs[propertyType].ranges.roomRange.min}
													onChange={(e) => handleRangeChange(propertyType, 'roomRange', 'min', e.target.value)} />
												<Input type="number" placeholder="Máx" value={configs[propertyType].ranges.roomRange.max}
													onChange={(e) => handleRangeChange(propertyType, 'roomRange', 'max', e.target.value)} />
											</div>
										</div>
										<div className="space-y-2">
											<Label>Baños</Label>
											<div className="flex space-x-2">
												<Input type="number" placeholder="Mín" value={configs[propertyType].ranges.bathroomRange.min}
													onChange={(e) => handleRangeChange(propertyType, 'bathroomRange', 'min', e.target.value)} />
												<Input type="number" placeholder="Máx" value={configs[propertyType].ranges.bathroomRange.max}
													onChange={(e) => handleRangeChange(propertyType, 'bathroomRange', 'max', e.target.value)} />
											</div>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>
					))}
					</Tabs>
			</div>
		</div>
	)
}
