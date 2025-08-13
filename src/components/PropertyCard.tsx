import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, PropertyFeatureState } from "@/store/property-store";
import { defaultScoringConfig, ScoringConfig } from "@/services/scoring-service";
import { motion } from "motion/react";
import {
  Accessibility,
  ArrowUpDown,
  Baby,
  Bath,
  Bed,
  CalendarDays,
  Car,
  Clock,
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
  MapPin,
  Monitor,
  Ruler,
  Shield,
  Snowflake,
  Sofa,
  Sparkles,
  Sun,
  Trash2,
  Trees,
  Users,
  UserX,
  Waves,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

interface PropertyDetail {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  className?: string;
  weight?: number;
}

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
  // Only add to details if the feature is explicitly mentioned (has or not_has)
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
  // If state is null or undefined, don't add to details (not mentioned/not found)
}

const getSizeValue = (property: Property): string | number => {
  if (property.squareMeters !== undefined && property.squareMeters !== null) {
    return property.squareMeters;
  }
  if (property.size !== undefined && property.size !== null) {
    return property.size;
  }
  return 'N/A';
};

const getPropertyDetails = (property: Property, formatPrice: (price: number) => string, currentConfig?: ScoringConfig): PropertyDetail[] => {
  const config = currentConfig || defaultScoringConfig;
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
      value: property.bathrooms,
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
      value: property.notes.length > 20 ? `${property.notes.substring(0, 20)}...` : property.notes,
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
      value: new Date(property.updatedAt).toLocaleDateString("es-ES"),
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

  // (duplicates removed below)

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
      value: new Date(property.publicationDate).toLocaleDateString("es-ES"),
    });
  }

  // Filter out items with zero importance and sort by importance (highest to lowest)
  return details
    .filter(detail => (detail.weight || 0) > 0)
    .sort((a, b) => (b.weight || 0) - (a.weight || 0));
};

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
  currentConfig?: ScoringConfig;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onDelete,
  currentConfig
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Check if property has an image
  const hasImage = !!(property.imageUrl || property.image);
  
  // Get the image URL from either field
  const imageUrl = property.imageUrl || property.image;



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`w-full relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm ${
          hasImage ? 'bg-cover bg-center bg-no-repeat' : ''
        }`}
        style={hasImage ? {
          backgroundImage: `url(${imageUrl})`,
          minHeight: '200px'
        } : undefined}
      >
        {/* Dark overlay for better text readability when image is present */}
        {hasImage && (
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        )}
        
        {/* Content with proper contrast */}
        <div className={`relative z-10 ${hasImage ? 'text-white' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle 
                  className={`text-lg font-semibold truncate ${
                    hasImage ? 'text-white drop-shadow-lg' : ''
                  }`}
                >
                  {property.title}
                </CardTitle>
                {property.location && (
                  <div className={`flex items-center text-sm mt-1 ${
                    hasImage ? 'text-white/90 drop-shadow-md' : 'text-muted-foreground'
                  }`}>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{property.location}</span>
                  </div>
                )}
              </div>
              {/* --- PropertyCard: Actions & Score Section --- */}
              <div className="flex items-center gap-2 ml-2">
                <Badge
                  variant="secondary"
                  hover={false}
                  className={`${getScoreColor(property.score || 0)} text-white ${
                    hasImage ? 'drop-shadow-lg' : ''
                  }`}
                >
                  {isNaN(property.score) ? 'N/A' : Math.round(property.score)}
                </Badge>
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
              {/* --- End PropertyCard: Actions & Score Section --- */}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Main property details */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {getPropertyDetails(property, formatPrice, currentConfig)
                .map(({ key, icon: Icon, title, value, className }) => (
                  <div 
                    key={key} 
                    className={`flex items-center ${
                      hasImage && className?.includes('text-destructive') ? 'bg-black/40 px-2 py-1 rounded-full' : ''
                    }`}
                    title={title}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${
                      hasImage && className?.includes('text-destructive') ? 'text-destructive' : 
                      hasImage ? 'text-white/80' : 'text-muted-foreground'
                    }`} />
                    <span className={`${className} ${
                      hasImage && !className?.includes('text-destructive') ? 'text-white/90 drop-shadow-sm' : ''
                    }`}>
                      {value}
                    </span>
                  </div>
                ))}
            </div>

            {property.notes && (
              <div className={`mt-3 p-2 rounded-md ${
                hasImage ? 'bg-black/40 backdrop-blur-sm' : 'bg-muted'
              }`}>
                <p className={`text-sm ${
                  hasImage ? 'text-white/90' : 'text-muted-foreground'
                }`}>
                  {property.notes}
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </motion.div>
  );
};
