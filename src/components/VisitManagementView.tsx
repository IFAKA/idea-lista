import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Property, 
  ContactStatus, 
  PropertyStatus, 
  VisitStatus,
  VisitRecord
} from '@/domain/entities/Property'
import { 
  CheckCircle,
  Plus,
  Clock,
  ArrowLeft
} from 'lucide-react'

interface VisitManagementViewProps {
  property: Property
  onBack: () => void
  onUpdateProperty: (updates: Partial<Property>) => void
  onAddVisit: (visit: Omit<VisitRecord, 'id'>) => void
  onUpdateVisit: (visitId: string, updates: Partial<VisitRecord>) => void
}

const getStatusColor = (status: ContactStatus | PropertyStatus | VisitStatus) => {
  switch (status) {
    case 'pending':
    case 'requested':
      return 'bg-yellow-100 text-yellow-800'
    case 'contacted':
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'responded':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
    case 'visited':
      return 'bg-purple-100 text-purple-800'
    case 'no_response':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'not_interested':
      return 'bg-gray-100 text-gray-800'
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'under_contract':
      return 'bg-orange-100 text-orange-800'
    case 'sold':
      return 'bg-red-100 text-red-800'
    case 'off_market':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: ContactStatus | PropertyStatus | VisitStatus) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    contacted: 'Contactado',
    responded: 'Respondido',
    scheduled: 'Agendado',
    visited: 'Visitado',
    no_response: 'Sin Respuesta',
    not_interested: 'No Interesado',
    requested: 'Solicitado',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    rescheduled: 'Reprogramado',
    available: 'Disponible',
    under_contract: 'En Contrato',
    sold: 'Vendido',
    off_market: 'Fuera de Mercado'
  }
  return labels[status] || status
}

export const VisitManagementView: React.FC<VisitManagementViewProps> = ({
  property,
  onBack,
  onAddVisit,
  onUpdateVisit
}) => {
  // Use the property prop directly
  const updatedProperty = property
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecord, setNewRecord] = useState({
    status: 'requested' as VisitStatus,
    scheduledTime: '',
    contactPerson: '',
    notes: ''
  })

  // Extract contact person name from property post
  const extractContactPersonName = (): string => {
    try {
      // Look for the chat info banner text in the current page
      const chatInfoBanner = document.querySelector('.chat-info-banner-text')
      if (chatInfoBanner) {
        const strongElement = chatInfoBanner.querySelector('strong')
        if (strongElement) {
          return strongElement.textContent?.trim() || ''
        }
      }
    } catch (error) {
      console.warn('Could not extract contact person name:', error)
    }
    return ''
  }

  // Get the contact person name for the first registro
  const getInitialContactPerson = (): string => {
    const visits = updatedProperty.visits || []
    if (visits.length === 0) {
      // First registro - use property's contact person or extract from page
      const contactPerson = updatedProperty.contactPerson || extractContactPersonName()
      console.log('Modal opened - Property contactPerson:', updatedProperty.contactPerson)
      console.log('Modal opened - Extracted contactPerson:', extractContactPersonName())
      console.log('Modal opened - Final contactPerson value:', contactPerson)
      return contactPerson
    } else {
      // Use the last contact person from previous registros
      const lastVisit = visits[visits.length - 1]
      return lastVisit.contactPerson || ''
    }
  }

  const handleAddRecord = () => {
    // Validate required fields
    if (!newRecord.status || !newRecord.contactPerson.trim()) {
      return // Don't submit if required fields are empty
    }
    
    if (newRecord.status === 'scheduled' && !newRecord.scheduledTime) {
      return // Require scheduled time for scheduled visits
    }
    
    onAddVisit({
      status: newRecord.status,
      date: new Date(),
      scheduledTime: newRecord.scheduledTime || undefined,
      contactPerson: newRecord.contactPerson,
      notes: newRecord.notes,
      checklist: []
    })
    
    // Remember the last contact person used
    const lastContactPerson = newRecord.contactPerson
    
    setNewRecord({
      status: 'requested',
      scheduledTime: '',
      contactPerson: lastContactPerson, // Keep the last used contact person
      notes: ''
    })
    
    setShowAddModal(false)
  }

  const handleCancel = () => {
    // Reset form to initial state
    setNewRecord({
      status: 'requested',
      scheduledTime: '',
      contactPerson: '',
      notes: ''
    })
    setShowAddModal(false)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const allRecords = [
    ...(updatedProperty.visits || []).map(visit => ({ ...visit, type: 'visit' as const })),
    ...(updatedProperty.contacts || []).map(contact => ({ ...contact, type: 'contact' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Check if property is in a cancelled or completed state
  const cancelledPropertyStatuses = ['not_interested', 'off_market', 'sold']
  const completedContactStatuses = ['visited']
  const isPropertyCancelled = cancelledPropertyStatuses.includes(updatedProperty.propertyStatus || 'available') || 
                             completedContactStatuses.includes(updatedProperty.contactStatus || 'pending')

  // Get available status options based on current visit progression
  const getAvailableStatusOptions = (): VisitStatus[] => {
    const visits = updatedProperty.visits || []
    
    // Check if any visit has a final state (completed or cancelled)
    const hasFinalState = visits.some(visit => visit.status === 'completed' || visit.status === 'cancelled')
    if (hasFinalState) {
      // If any registro has Cancelado or Completado, no more registros can be added
      return []
    }
    
    if (visits.length === 0) {
      // First registro - always Solicitado
      return ['requested']
    }
    
    const lastVisit = visits[visits.length - 1]
    
    switch (lastVisit.status) {
      case 'requested':
        // Second registro - can be confirmed or cancelled
        return ['confirmed', 'cancelled']
        
      case 'confirmed':
        // Third registro - can schedule visit or cancel
        return ['scheduled', 'cancelled']
        
      case 'scheduled':
        // Fourth registro - can be completed, rescheduled, cancelled, or schedule contract signing
        return ['completed', 'rescheduled', 'cancelled', 'scheduled']
        
      case 'rescheduled':
        // After rescheduling - same options as scheduled
        return ['completed', 'rescheduled', 'cancelled', 'scheduled']
        
      default:
        return ['requested']
    }
  }

  const availableStatusOptions = getAvailableStatusOptions()

  // Debug logging for contact person
  console.log('Component render - newRecord.contactPerson:', newRecord.contactPerson)
  console.log('Component render - updatedProperty.contactPerson:', updatedProperty.contactPerson)

  // Update initial status when modal opens
  React.useEffect(() => {
    if (showAddModal) {
      const availableOptions = getAvailableStatusOptions()
      if (availableOptions.length > 0) {
        const initialContactPerson = getInitialContactPerson()
        console.log('Modal useEffect - Setting newRecord with contactPerson:', initialContactPerson)
        setNewRecord(prev => ({
          ...prev,
          status: availableOptions[0],
          contactPerson: initialContactPerson
        }))
      }
    }
  }, [showAddModal])

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
        <h1 className="text-xl font-semibold">Gestión de Visitas</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Property Info */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{updatedProperty.title}</h2>
            {updatedProperty.location && (
              <p className="text-sm text-muted-foreground">{updatedProperty.location}</p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Estado de Contacto</Label>
                  <Badge className={getStatusColor(updatedProperty.contactStatus || 'pending')}>
                    {getStatusLabel(updatedProperty.contactStatus || 'pending')}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Estado de Propiedad</Label>
                  <Badge className={getStatusColor(updatedProperty.propertyStatus || 'available')}>
                    {getStatusLabel(updatedProperty.propertyStatus || 'available')}
                  </Badge>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Notas de Visita</Label>
                <div className="p-5 border rounded-lg bg-muted min-h-[140px]">
                  {property.visits && property.visits.length > 0 ? (
                    <div className="space-y-5">
                      {property.visits
                        .filter(visit => visit.notes && visit.notes.trim())
                        .map((visit) => (
                          <div key={visit.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatDate(visit.date)}
                              </span>
                              {visit.contactPerson && (
                                <span className="text-xs text-muted-foreground">
                                  • {visit.contactPerson}
                                </span>
                              )}
                            </div>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{visit.notes}</div>
                          </div>
                        ))}
                      {property.visits.filter(visit => visit.notes && visit.notes.trim()).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-10">No hay notas de visita</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-10">No hay visitas registradas</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historial" className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historial de Registros</h3>
                <Button 
                  onClick={() => setShowAddModal(true)} 
                  size="sm"
                  disabled={availableStatusOptions.length === 0 || isPropertyCancelled}
                  title={
                    isPropertyCancelled 
                      ? "No se pueden agregar registros cuando la propiedad está cancelada" 
                      : updatedProperty.visits && updatedProperty.visits.some(visit => visit.status === 'completed' || visit.status === 'cancelled')
                        ? "No se pueden agregar más registros porque ya existe un registro con estado 'Completado' o 'Cancelado'"
                        : availableStatusOptions.length === 0
                          ? "No se pueden agregar más registros"
                          : ""
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
              
              {isPropertyCancelled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {cancelledPropertyStatuses.includes(updatedProperty.propertyStatus || 'available') 
                      ? `No se pueden agregar nuevos registros porque la propiedad está en estado "${getStatusLabel(updatedProperty.propertyStatus || 'available')}".`
                      : `No se pueden agregar nuevos registros porque el contacto está en estado "${getStatusLabel(updatedProperty.contactStatus || 'pending')}".`
                    }
                  </p>
                </div>
              )}

              {availableStatusOptions.length === 0 && !isPropertyCancelled && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {updatedProperty.visits && updatedProperty.visits.some(visit => visit.status === 'completed' || visit.status === 'cancelled')
                      ? "No se pueden agregar más registros porque ya existe un registro con estado 'Completado' o 'Cancelado'."
                      : "El proceso de visita ha sido completado. No se pueden agregar más registros."
                    }
                  </p>
                </div>
              )}

              {allRecords.length > 0 ? (
                <div className="space-y-5">
                  {allRecords.map((record) => (
                    <div key={`${record.type}-${record.id}`} className="p-5 border rounded-lg space-y-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                          <span className="font-medium">
                            {formatDate(record.date)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {record.type === 'visit' ? 'Visita' : 'Contacto'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          {record.contactPerson && (
                            <span className="text-sm text-muted-foreground">
                              {record.contactPerson}
                            </span>
                          )}
                          {record.type === 'visit' && record.status === 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onUpdateVisit(record.id, { status: 'completed' })}
                              className="h-8 w-8"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {record.notes && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{record.notes}</p>
                      )}

                      {record.type === 'visit' && 'scheduledTime' in record && record.scheduledTime && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Agendado para: {formatDate(record.scheduledTime)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-16">
                  No hay registros de visitas o contactos
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Record Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Nueva Visita</DialogTitle>
            <DialogDescription>
              Completa la información para registrar una nueva visita o contacto con la propiedad.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Estado *</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value: VisitStatus) => 
                  setNewRecord({ ...newRecord, status: value })
                }
                disabled={availableStatusOptions.length === 1}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newRecord.status === 'scheduled' && (
              <div className="space-y-3">
                <Label>Fecha y Hora *</Label>
                <Input
                  type="datetime-local"
                  value={newRecord.scheduledTime}
                  onChange={(e) => setNewRecord({ ...newRecord, scheduledTime: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>Persona de Contacto *</Label>
              <Input
                value={newRecord.contactPerson}
                onChange={(e) => setNewRecord({ ...newRecord, contactPerson: e.target.value })}
                placeholder="Nombre del agente/propietario"
                disabled={updatedProperty.visits && updatedProperty.visits.length === 0}
              />
            </div>

            <div className="space-y-3">
              <Label>Notas</Label>
              <Textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Notas sobre la visita... (opcional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddRecord}
                disabled={
                  !newRecord.status || 
                  !newRecord.contactPerson.trim() || 
                  (newRecord.status === 'scheduled' && !newRecord.scheduledTime)
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Visita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
