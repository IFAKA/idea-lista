import React, { useMemo } from 'react'
import { motion } from "motion/react"
import { MapPin, Trash2, Calendar, Clock, Users, UserX } from 'lucide-react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Property } from '@/domain/entities/Property'
import { ScoringConfig } from '@/domain/entities/PropertyType'
import { PropertyFeatureState, ContactStatus, PropertyStatus, VisitStatus } from "@/domain/entities/Property";
import { defaultViviendaConfig } from "@/domain/use-cases/default-configs";
import { formatDate, truncateText } from "@/lib/utils";
import {
  Accessibility,
  ArrowUpDown,
  Baby,
  Bath,
  Bed,
  CalendarDays,
  Car,
  Clock3,
  Compass,
  DoorOpen,
  Euro,
  Eye,
  FileText,
  Flame,
  Heart,
  Image,
  Layers,
  Link,
  Monitor,
  Ruler,
  Shield,
  Snowflake,
  Sofa,
  Sparkles,
  Sun,
  Trees,
  Waves,
  Wind,
  Wrench,
  Zap,
  Phone,
} from "lucide-react";

interface PropertyDetail {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  className?: string;
  weight?: number;
}

// Helper function to add feature details
const addFeatureDetail = (
  details: PropertyDetail[],
  state: PropertyFeatureState | null | undefined,
  key: string,
  icon: React.ComponentType<{ className?: string }>,
  title: string,
  positiveCopy: string,
  negativeCopy: string,
  weight: number
) => {
  if (state === 'has' || state === 'not_has') {
    details.push({
      key,
      icon,
      title,
      value: state === 'has' ? positiveCopy : negativeCopy,
      className: state === 'has' ? 'text-green-600' : 'text-destructive',
      weight
    })
  }
}

// Helper function to get size value
const getSizeValue = (property: Property): string | number => {
  if (property.squareMeters !== undefined && property.squareMeters !== null) {
    return property.squareMeters;
  }
  return 'N/A';
};

// Helper function to format property title
const formatPropertyTitle = (title: string): string => {
  return title
    .replace(/^Avenida de\s+la\s+/i, '')
    .replace(/^Avenida de\s+/i, '')
    .replace(/^Avenida\s+/i, '')
    .replace(/^Calle del\s+/i, '')
    .replace(/^Calle de\s+la\s+/i, '')
    .replace(/^Calle de\s+/i, '')
    .replace(/^Calle\s+/i, '')
    .replace(/^Plaza de\s+la\s+/i, '')
    .replace(/^Plaza de\s+/i, '')
    .replace(/^Plaza\s+/i, '')
    .replace(/^Paseo de\s+la\s+/i, '')
    .replace(/^Paseo de\s+/i, '')
    .replace(/^Paseo\s+/i, '')
    .replace(/^Carrera de\s+/i, '')
    .replace(/^Carrera\s+/i, '')
    .replace(/^Camino de\s+/i, '')
    .replace(/^Camino\s+/i, '')
    .replace(/^Ronda de\s+/i, '')
    .replace(/^Ronda\s+/i, '');
};

// Helper function to get property details
const getPropertyDetails = (property: Property, formatPrice: (price: number) => string, currentConfig?: ScoringConfig): PropertyDetail[] => {
  const config = currentConfig || defaultViviendaConfig;
  const details: PropertyDetail[] = [
    // Core property info (always shown)
    {
      key: "price",
      icon: Euro,
      title: "Precio",
      value: formatPrice(property.price),
      className: "font-medium",
      weight: config.weights.price,
    },
    {
      key: "size",
      icon: Ruler,
      title: "Metros cuadrados",
      value: `${getSizeValue(property)}m²`,
      weight: config.weights.size,
    },
    {
      key: "rooms",
      icon: Bed,
      title: "Habitaciones",
      value: property.rooms,
      weight: config.weights.rooms,
    },
    {
      key: "bathrooms",
      icon: Bath,
      title: "Baños",
      value: property.bathrooms != null ? `${property.bathrooms} ${property.bathrooms > 1 ? 'baños' : 'baño'}` : 'N/A',
      weight: config.weights.bathrooms,
    },
    {
      key: "floor",
      icon: Layers,
      title: "Planta",
      value: property.floor,
      weight: config.weights.floor,
    },
  ];

  // HIGH PRIORITY - Essential amenities for comfort (only show if mentioned)
  addFeatureDetail(details, property.heating, 'heating', Flame, 'Calefacción', 'Calefacción', 'Sin calefacción', config.weights.heating)
  addFeatureDetail(details, property.elevator, 'elevator', ArrowUpDown, 'Ascensor', 'Ascensor', 'Sin ascensor', config.weights.elevator)
  addFeatureDetail(details, property.airConditioning, 'airConditioning', Snowflake, 'Aire acondicionado', 'A/C', 'Sin A/C', config.weights.airConditioning)

  // MEDIUM PRIORITY - Convenience features
  if (property.furnished === 'has') {
    details.push({
      key: "furnished",
      icon: Sofa,
      title: "Amueblado",
      value: "Amueblado",
      weight: config.weights.furnished,
    });
  }

  // Parking (only show if mentioned)
  addFeatureDetail(details, property.parking, 'parking', Car, 'Parking', 'Parking', 'Sin parking', config.weights.parking)

  if (property.terrace === 'has') {
    details.push({
      key: "terrace",
      icon: Sun,
      title: "Terraza",
      value: "Terraza",
      weight: config.weights.terrace,
    });
  }

  if (property.balcony === 'has') {
    details.push({
      key: "balcony",
      icon: Wind,
      title: "Balcón",
      value: "Balcón",
      weight: config.weights.balcony,
    });
  }

  // Add image if available
  if (property.imageUrl) {
    details.push({
      key: "imageUrl",
      icon: Image,
      title: "Imagen",
      value: "Ver imagen",
      className: "text-blue-600 hover:underline cursor-pointer",
    });
  }

  // Add notes if available
  if (property.notes) {
    details.push({
      key: "notes",
      icon: FileText,
      title: "Notas",
      value: truncateText(property.notes, 20),
    });
  }

  // MEDIUM PRIORITY - Additional features
  if (property.desk && property.desk > 0) {
    details.push({
      key: "desk",
      icon: Monitor,
      title: "Escritorios",
      value: `${property.desk} escritorio${property.desk > 1 ? 's' : ''}`,
    });
  }

  if (property.orientation) {
    details.push({
      key: "orientation",
      icon: Compass,
      title: "Orientación",
      value: property.orientation,
    });
  }

  // Add update date
  if (property.updatedAt) {
    details.push({
      key: "updatedAt",
      icon: Clock,
      title: "Última actualización",
      value: formatDate(property.updatedAt),
    });
  }

  if (property.seasonal) {
    details.push({
      key: "seasonal",
      icon: Clock3,
      title: "Alquiler temporal",
      value: "Temporal",
    });
  }

  // MEDIUM PRIORITY - Financial information
  if (property.deposit) {
    details.push({
      key: "deposit",
      icon: Shield,
      title: "Fianza",
      value: `${property.deposit}€`,
    });
  }

  if (property.maintenance) {
    details.push({
      key: "maintenance",
      icon: Wrench,
      title: "Gastos de comunidad",
      value: `${property.maintenance}€`,
    });
  }

  if (property.energy) {
    details.push({
      key: "energy",
      icon: Zap,
      title: "Certificado energético",
      value: property.energy,
    });
  }

  // LOW PRIORITY - Additional amenities
  if (property.garden) {
    details.push({
      key: "garden",
      icon: Trees,
      title: "Jardín",
      value: "Jardín",
    });
  }

  if (property.pool) {
    details.push({
      key: "pool",
      icon: Waves,
      title: "Piscina",
      value: "Piscina",
    });
  }

  // Accessibility (only show if mentioned)
  addFeatureDetail(details, property.accessible, 'accessible', Accessibility, 'Accesible', 'Accesible', 'No accesible', config.weights.accessible)

  if (property.cleaningIncluded === 'has') {
    details.push({
      key: "cleaningIncluded",
      icon: Sparkles,
      title: "Limpieza incluida",
      value: "Limpieza incluida",
    });
  }

  // LOW PRIORITY - Room-specific features (for room rentals)
  if (property.privateBathroom === 'has') {
    details.push({
      key: "privateBathroom",
      icon: DoorOpen,
      title: "Baño privado",
      value: "Baño privado",
    });
  }

  if (property.window === 'has') {
    details.push({
      key: "window",
      icon: Eye,
      title: "Ventana",
      value: "Con ventana",
    });
  }

  if (property.couplesAllowed === 'has') {
    details.push({
      key: "couplesAllowed",
      icon: Users,
      title: "Parejas permitidas",
      value: "Parejas",
    });
  }

  if (property.minorsAllowed) {
    details.push({
      key: "minorsAllowed",
      icon: Baby,
      title: "Menores permitidos",
      value: "Menores",
    });
  }

  // LOWEST PRIORITY - Coexistence and metadata
  if (property.lgbtFriendly === 'has') {
    details.push({
      key: "lgbtFriendly",
      icon: Heart,
      title: "LGBT friendly",
      value: "LGBT friendly",
    });
  }

  if (property.ownerNotPresent === 'has') {
    details.push({
      key: "ownerNotPresent",
      icon: UserX,
      title: "Propietario no presente",
      value: "Sin propietario",
    });
  }

  if (property.publicationDate) {
    details.push({
      key: "publicationDate",
      icon: CalendarDays,
      title: "Fecha de publicación",
      value: formatDate(property.publicationDate),
    });
  }

  // Filter out items with zero importance and sort by importance (highest to lowest)
  return details
    .filter(detail => (detail.weight || 0) > 0)
    .sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

// Helper function to get score color
const getScoreColor = (score: number, allProperties?: Property[]): string => {
  if (!allProperties || allProperties.length === 0) {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  }

  const validScores = allProperties
    .map(p => p.score)
    .filter(s => !isNaN(s) && s !== undefined && s !== null)
    .sort((a, b) => b - a);

  if (validScores.length === 0) {
    return "bg-gray-500";
  }

  const scoreIndex = validScores.findIndex(s => s === score);
  if (scoreIndex === -1) {
    return "bg-gray-500";
  }

  if (validScores.length === 1) {
    return "bg-green-500";
  }
  
  const relativePosition = scoreIndex / (validScores.length - 1);

  if (relativePosition <= 0.33) return "bg-green-500";
  if (relativePosition <= 0.66) return "bg-yellow-500";
  return "bg-red-500";
};

// Helper function to get status color
const getStatusColorForAnyStatus = (status: ContactStatus | PropertyStatus | VisitStatus): string => {
  const statusColors: Record<string, string> = {
    pending: 'bg-red-100 text-red-800',
    requested: 'bg-blue-100 text-blue-800',
    contacted: 'bg-indigo-100 text-indigo-800',
    confirmed: 'bg-cyan-100 text-cyan-800',
    responded: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    scheduled: 'bg-purple-100 text-purple-800',
    visited: 'bg-violet-100 text-violet-800',
    no_response: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-slate-100 text-slate-800',
    not_interested: 'bg-zinc-100 text-zinc-800',
    available: 'bg-teal-100 text-teal-800',
    under_contract: 'bg-orange-100 text-orange-800',
    sold: 'bg-rose-100 text-rose-800',
    off_market: 'bg-neutral-100 text-neutral-800',
    rescheduled: 'bg-fuchsia-100 text-fuchsia-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status label
const getStatusLabelForAnyStatus = (status: ContactStatus | PropertyStatus | VisitStatus): string => {
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
  };
  return labels[status] || status;
};

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
  currentConfig?: ScoringConfig;
  onManageVisits?: (property: Property) => void;
  allProperties?: Property[];
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onDelete,
  currentConfig,
  onManageVisits,
  allProperties
}) => {

  // Memoize expensive calculations
  const propertyDetails = useMemo(() => 
    getPropertyDetails(property, formatPrice, currentConfig), 
    [property, currentConfig]
  );

  const scoreColor = useMemo(() => 
    getScoreColor(property.score || 0, allProperties), 
    [property.score, allProperties]
  );

  const hasImage = useMemo(() => !!(property.imageUrl), [property.imageUrl]);
  const imageUrl = useMemo(() => 
    property.imageUrl ? property.imageUrl.replace(/&quot;/g, '"') : null, 
    [property.imageUrl]
  );

  // Get latest record status
  const latestRecordStatus = useMemo(() => {
    const allRecords = [
      ...(property.visits || []),
      ...(property.contacts || [])
    ];
    
    const sortedRecords = allRecords.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    const latestAddedRecord = sortedRecords[0];
    return latestAddedRecord ? latestAddedRecord.status : property.contactStatus;
  }, [property.visits, property.contacts, property.contactStatus]);

  // Get visit count
  const visitCount = useMemo(() => 
    (property.visits || []).filter(visit => 
      visit.status === 'scheduled' || visit.status === 'rescheduled'
    ).length, 
    [property.visits]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      data-property-id={property.id}
    >
      <div 
        className={`w-full relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm ${
          hasImage ? 'bg-cover bg-center bg-no-repeat' : ''
        }`}
        style={hasImage ? {
          backgroundImage: `url(${imageUrl})`
        } : undefined}
      >
        {/* Dark overlay for better text readability when image is present */}
        {hasImage && (
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        )}
        
        {/* Content with proper contrast */}
        <div className={`relative z-10 ${hasImage ? 'text-white' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle 
                  className={`text-lg font-semibold truncate ${
                    hasImage ? 'text-white drop-shadow-lg' : ''
                  }`}
                >
                  {formatPropertyTitle(property.title || '')}
                </CardTitle>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                {property.location && (
                  <div className={`flex items-center text-sm ${
                    hasImage ? 'text-white/90 drop-shadow-md' : 'text-muted-foreground'
                  }`}>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate max-w-32">{property.location}</span>
                  </div>
                )}
                <Badge
                  variant="secondary"
                  hover={false}
                  className={`${scoreColor} text-white ${
                    hasImage ? 'drop-shadow-lg' : ''
                  }`}
                >
                  {isNaN(property.score) ? 'N/A' : Math.round(property.score)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Main property details */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {propertyDetails.map(({ key, icon: Icon, title, value, className }) => (
                <div 
                  key={key} 
                  className="flex items-center"
                  title={title}
                >
                  <Icon className={`w-4 h-4 mr-2 ${
                    hasImage ? 'text-white' : 'text-muted-foreground'
                  }`} />
                  <span className={className}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {property.notes && (
              <div className="mt-3 p-2 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  {property.notes}
                </p>
              </div>
            )}

            {/* Bottom section container */}
            <div className="mt-4 pt-3 border-t">
              {/* Inner container with space-between */}
              <div className="flex justify-between items-center">
                {/* Visit tracking status badges container */}
                <div className="flex flex-wrap gap-2">
                  {/* Contact status based on latest added record */}
                  {latestRecordStatus && (
                    <Badge className={`text-xs ${getStatusColorForAnyStatus(latestRecordStatus)}`}>
                      {getStatusLabelForAnyStatus(latestRecordStatus)}
                    </Badge>
                  )}
                  
                  {/* Visit count based on scheduled/rescheduled records */}
                  {visitCount > 0 && (
                    <Badge className="text-xs bg-purple-100 text-purple-800">
                      <Calendar className="w-3 h-3 mr-1" />
                      {visitCount} visita{visitCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  
                  {/* Contact count */}
                  {property.contacts && property.contacts.length > 0 && (
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      <Phone className="w-3 h-3 mr-1" />
                      {property.contacts.length} contacto{property.contacts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {/* Actions buttons container */}
                <div className="flex items-center gap-2">
                  {onManageVisits && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onManageVisits(property)}
                      className={`h-8 w-8 ${
                        hasImage ? 'text-white hover:bg-white/20' : ''
                      }`}
                      title="Gestionar visitas"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => property.url && window.open(property.url, '_blank')}
                    className={`h-8 w-8 ${
                      hasImage ? 'text-white hover:bg-white/20' : ''
                    }`}
                    disabled={!property.url}
                    title="Ver anuncio"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(String(property.id))}
                    className={`h-8 w-8 ${
                      hasImage ? 'text-red-300 hover:text-red-200 hover:bg-red-500/20' : 'text-destructive hover:text-destructive'
                    }`}
                    title="Eliminar propiedad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </motion.div>
  );
};
