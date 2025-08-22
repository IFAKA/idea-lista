import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { usePropertyStore } from '@/store/property-store'
import { Property, VisitStatus, VisitChecklistItem } from '@/domain/entities/Property'
import { Calendar, Clock, Phone, Mail, MessageSquare, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react'

interface VisitManagementViewProps {
	onBack: () => void
	property: Property
}

const visitStatusOptions = [
	{ value: 'requested', label: 'Solicitada', icon: ClockIcon },
	{ value: 'confirmed', label: 'Confirmada', icon: CheckCircle },
	{ value: 'scheduled', label: 'Programada', icon: Calendar },
	{ value: 'completed', label: 'Completada', icon: CheckCircle },
	{ value: 'cancelled', label: 'Cancelada', icon: XCircle },
	{ value: 'rescheduled', label: 'Reprogramada', icon: ClockIcon }
]

const contactMethods = [
	{ value: 'phone', label: 'Teléfono', icon: Phone },
	{ value: 'email', label: 'Email', icon: Mail },
	{ value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
]

const defaultChecklistItems: VisitChecklistItem[] = [
	{ id: '1', category: 'General', question: '¿El estado general es como se ve en las fotos?', checked: false },
	{ id: '2', category: 'General', question: '¿La ubicación es conveniente?', checked: false },
	{ id: '3', category: 'General', question: '¿El precio está justificado?', checked: false },
	{ id: '4', category: 'Instalaciones', question: '¿La calefacción funciona correctamente?', checked: false },
	{ id: '5', category: 'Instalaciones', question: '¿El ascensor funciona?', checked: false },
	{ id: '6', category: 'Instalaciones', question: '¿Hay problemas de humedad?', checked: false },
	{ id: '7', category: 'Vecindario', question: '¿El vecindario es tranquilo?', checked: false },
	{ id: '8', category: 'Vecindario', question: '¿Hay servicios cercanos?', checked: false }
]

export const VisitManagementView: React.FC<VisitManagementViewProps> = ({ onBack, property }) => {
	const { addVisit } = usePropertyStore()
	const [activeTab, setActiveTab] = useState('visits')
	const [newVisit, setNewVisit] = useState({
		status: 'requested' as VisitStatus,
		notes: '',
		contactMethod: '',
		contactPerson: '',
		scheduledTime: '',
		duration: 60,
		checklist: [...defaultChecklistItems]
	})
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		setNewVisit({
			status: 'requested',
			notes: '',
			contactMethod: '',
			contactPerson: '',
			scheduledTime: '',
			duration: 60,
			checklist: [...defaultChecklistItems]
		})
	}, [property.id])

	const handleChecklistChange = (itemId: string, checked: boolean) => {
		setNewVisit(prev => ({
			...prev,
			checklist: prev.checklist.map(item => 
				item.id === itemId ? { ...item, checked } : item
			)
		}))
	}

	const handleAddVisit = async () => {
		setIsSaving(true)
		try {
			const visitData = {
				...newVisit,
				date: new Date(),
				id: Date.now().toString()
			}
			await addVisit(property.id, visitData)
			onBack()
		} catch (error) {
			console.error('Error adding visit:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const getStatusColor = (status: VisitStatus) => {
		switch (status) {
			case 'completed': return 'bg-green-100 text-green-800'
			case 'confirmed': return 'bg-blue-100 text-blue-800'
			case 'scheduled': return 'bg-purple-100 text-purple-800'
			case 'requested': return 'bg-yellow-100 text-yellow-800'
			case 'cancelled': return 'bg-red-100 text-red-800'
			case 'rescheduled': return 'bg-orange-100 text-orange-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	const getContactMethodIcon = (method: string) => {
		const contactMethod = contactMethods.find(m => m.value === method)
		return contactMethod ? contactMethod.icon : Phone
	}

	const visitCount = property.visits?.length || 0
	const completedVisits = property.visits?.filter(v => v.status === 'completed').length || 0

	return (
		<div className="w-96 h-[600px] bg-background text-foreground flex flex-col">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Gestionar Visitas - {property.title}</h2>
					<div className="space-x-2">
						<Button variant="outline" onClick={onBack}>Cerrar</Button>
						{activeTab === 'new' && (
							<Button onClick={handleAddVisit} disabled={isSaving}>
								{isSaving ? 'Guardando...' : 'Agregar Visita'}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="visits">Visitas ({visitCount})</TabsTrigger>
						<TabsTrigger value="new">Nueva Visita</TabsTrigger>
					</TabsList>

					<TabsContent value="visits" className="space-y-4">
						{visitCount === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>No hay visitas registradas para esta propiedad.</p>
								<p className="text-sm">Agrega una nueva visita para comenzar el seguimiento.</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
									<div className="text-center">
										<div className="text-2xl font-bold">{visitCount}</div>
										<div className="text-sm text-muted-foreground">Total Visitas</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-green-600">{completedVisits}</div>
										<div className="text-sm text-muted-foreground">Completadas</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-blue-600">{visitCount - completedVisits}</div>
										<div className="text-sm text-muted-foreground">Pendientes</div>
									</div>
								</div>

								<div className="space-y-3">
									{property.visits?.map((visit) => (
										<div key={visit.id} className="border rounded-lg p-4 space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Badge className={getStatusColor(visit.status)}>
														{visitStatusOptions.find(s => s.value === visit.status)?.label}
													</Badge>
													<span className="text-sm text-muted-foreground">
														{visit.date instanceof Date ? visit.date.toLocaleDateString('es-ES') : new Date(visit.date).toLocaleDateString('es-ES')}
													</span>
												</div>
												{visit.scheduledTime && (
													<div className="flex items-center space-x-1 text-sm text-muted-foreground">
														<Clock className="h-4 w-4" />
														<span>{visit.scheduledTime}</span>
													</div>
												)}
											</div>

											{visit.contactMethod && (
												<div className="flex items-center space-x-2 text-sm">
													{React.createElement(getContactMethodIcon(visit.contactMethod), { className: 'h-4 w-4' })}
													<span>{visit.contactPerson || 'Contacto'}</span>
												</div>
											)}

											{visit.notes && (
												<p className="text-sm bg-muted p-2 rounded">{visit.notes}</p>
											)}

											{visit.checklist && visit.checklist.length > 0 && (
												<div className="space-y-1">
													<p className="text-sm font-medium">Checklist:</p>
													<div className="grid grid-cols-2 gap-1 text-xs">
														{visit.checklist.map((item) => (
															<div key={item.id} className="flex items-center space-x-1">
																{item.checked ? (
																	<CheckCircle className="h-3 w-3 text-green-600" />
																) : (
																	<XCircle className="h-3 w-3 text-gray-400" />
																)}
																<span className={item.checked ? 'line-through text-muted-foreground' : ''}>
																	{item.question}
																</span>
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="new" className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Estado de la Visita</Label>
								<Select value={newVisit.status} onValueChange={(value) => setNewVisit(prev => ({ ...prev, status: value as VisitStatus }))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{visitStatusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												<div className="flex items-center space-x-2">
													{React.createElement(option.icon, { className: 'h-4 w-4' })}
													<span>{option.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Duración (minutos)</Label>
								<Input type="number" value={newVisit.duration} onChange={(e) => setNewVisit(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))} />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Método de Contacto</Label>
								<Select value={newVisit.contactMethod} onValueChange={(value) => setNewVisit(prev => ({ ...prev, contactMethod: value }))}>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar método" />
									</SelectTrigger>
									<SelectContent>
										{contactMethods.map((method) => (
											<SelectItem key={method.value} value={method.value}>
												<div className="flex items-center space-x-2">
													{React.createElement(method.icon, { className: 'h-4 w-4' })}
													<span>{method.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Persona de Contacto</Label>
								<Input value={newVisit.contactPerson} onChange={(e) => setNewVisit(prev => ({ ...prev, contactPerson: e.target.value }))} placeholder="Nombre del contacto" />
							</div>
						</div>

						<div className="space-y-2">
							<Label>Hora Programada</Label>
							<Input type="datetime-local" value={newVisit.scheduledTime} onChange={(e) => setNewVisit(prev => ({ ...prev, scheduledTime: e.target.value }))} placeholder="Seleccionar fecha y hora" />
						</div>

						<div className="space-y-2">
							<Label>Notas</Label>
							<Textarea value={newVisit.notes} onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observaciones sobre la visita..." rows={3} />
						</div>

						<Separator />

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Checklist de Visita</h3>
							<div className="grid grid-cols-1 gap-2">
								{newVisit.checklist.map((item) => (
									<div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
										<input type="checkbox" checked={item.checked} onChange={(e) => handleChecklistChange(item.id, e.target.checked)} className="rounded" />
										<span className={item.checked ? 'line-through text-muted-foreground' : ''}>{item.question}</span>
									</div>
								))}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
