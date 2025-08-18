import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, ExternalLink, Calendar, Eye } from 'lucide-react'
import { Property } from '@/domain/entities/Property'
import { formatPrice, getScoreColor, getScoreBadge } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  onDelete: (id: string) => void
  onManageVisits: (property: Property) => void
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onDelete,
  onManageVisits
}) => {
  const visitCount = property.getVisitCount()
  const completedVisits = property.getCompletedVisits()

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md"
      data-property-id={property.id}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {property.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {property.location}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium ${getScoreColor(property.score)}`}
            >
              {property.score}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(property.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Price and Score */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatPrice(property.price)}</span>
            <span className="text-xs text-muted-foreground">
              {getScoreBadge(property.score)}
            </span>
          </div>
          
          {/* Property Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Habitaciones:</span>
              <span className="font-medium">{property.rooms}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Baños:</span>
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            
            {property.squareMeters && (
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Tamaño:</span>
                <span className="font-medium">{property.squareMeters}m²</span>
              </div>
            )}
            
            {property.floor && (
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Piso:</span>
                <span className="font-medium">{property.floor}</span>
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {property.heating === 'has' && (
              <Badge variant="outline" className="text-xs">Calefacción</Badge>
            )}
            {property.elevator === 'has' && (
              <Badge variant="outline" className="text-xs">Ascensor</Badge>
            )}
            {property.furnished === 'has' && (
              <Badge variant="outline" className="text-xs">Amueblado</Badge>
            )}
            {property.parking === 'has' && (
              <Badge variant="outline" className="text-xs">Parking</Badge>
            )}
          </div>
          
          {/* Visit Info */}
          {(visitCount > 0 || completedVisits > 0) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{visitCount} visitas</span>
              </div>
              {completedVisits > 0 && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{completedVisits} completadas</span>
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageVisits(property)}
              className="flex-1 text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Gestionar visitas
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(property.url, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
