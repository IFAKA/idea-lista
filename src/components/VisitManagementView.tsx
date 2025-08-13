import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Property, 
  ContactStatus, 
  PropertyStatus, 
  VisitStatus,
  VisitRecord
} from '@/store/property-store'
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
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecord, setNewRecord] = useState({
    status: 'requested' as VisitStatus,
    scheduledTime: '',
    contactPerson: '',
    notes: ''
  })

  const handleAddRecord = () => {
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
    ...(property.visits || []).map(visit => ({ ...visit, type: 'visit' as const })),
    ...(property.contacts || []).map(contact => ({ ...contact, type: 'contact' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{property.title}</h2>
            {property.location && (
              <p className="text-sm text-muted-foreground">{property.location}</p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado de Contacto</Label>
                  <Badge className={getStatusColor(property.contactStatus || 'pending')}>
                    {getStatusLabel(property.contactStatus || 'pending')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Estado de Propiedad</Label>
                  <Badge className={getStatusColor(property.propertyStatus || 'available')}>
                    {getStatusLabel(property.propertyStatus || 'available')}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notas de Visita</Label>
                <div className="p-3 border rounded-md bg-muted min-h-[100px]">
                  {property.visitNotes ? (
                    <div className="whitespace-pre-wrap text-sm">{property.visitNotes}</div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No hay notas de visita</p>
                  )}
                </div>

              </div>
            </TabsContent>

            <TabsContent value="historial" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Historial de Registros</h3>
                <Button onClick={() => setShowAddModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
              
              {allRecords.length > 0 ? (
                <div className="space-y-3">
                  {allRecords.map((record) => (
                    <div key={`${record.type}-${record.id}`} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2">
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
                        <p className="text-sm text-muted-foreground">{record.notes}</p>
                      )}

                      {record.type === 'visit' && 'scheduledTime' in record && record.scheduledTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Agendado para: {formatDate(record.scheduledTime)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
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
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value: VisitStatus) => 
                  setNewRecord({ ...newRecord, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">Solicitado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="rescheduled">Reprogramado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRecord.status === 'scheduled' && (
              <div className="space-y-2">
                <Label>Fecha y Hora</Label>
                <Input
                  type="datetime-local"
                  value={newRecord.scheduledTime}
                  onChange={(e) => setNewRecord({ ...newRecord, scheduledTime: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Persona de Contacto</Label>
              <Input
                value={newRecord.contactPerson}
                onChange={(e) => setNewRecord({ ...newRecord, contactPerson: e.target.value })}
                placeholder="Nombre del agente/propietario"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Notas sobre la visita..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddRecord}
                disabled={newRecord.status === 'scheduled' && !newRecord.scheduledTime}
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
