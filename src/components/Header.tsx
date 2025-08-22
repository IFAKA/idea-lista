import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Download, Trash2, Share2, FileText, ArrowLeft } from 'lucide-react'

interface HeaderProps {
  onConfig: () => void
  onExport: () => void
  onClear: () => void
  onExportVisits: () => void
  onShare: () => void
  propertiesCount: number
  onBack?: () => void
  titleOverride?: string
  mode?: 'list' | 'detail'
}

export const Header: React.FC<HeaderProps> = ({
  onConfig,
  onExport,
  onClear,
  onExportVisits,
  onShare,
  propertiesCount,
  onBack,
  titleOverride,
  mode = 'list'
}) => {
  const hasProperties = propertiesCount > 0

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} title="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{titleOverride || 'Idea-lista'}</h1>
        {mode === 'list' && (
          <span className="text-sm text-muted-foreground">
            {propertiesCount} propiedades
          </span>
        )}
      </div>
      
      {mode === 'list' ? (
        <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          disabled={!hasProperties}
          title={hasProperties ? "Compartir lista" : "No hay propiedades para compartir"}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          disabled={!hasProperties}
          title={hasProperties ? "Exportar datos" : "No hay propiedades para exportar"}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportVisits}
          disabled={!hasProperties}
          title={hasProperties ? "Exportar visitas" : "No hay propiedades para exportar visitas"}
        >
          <FileText className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onConfig}
          title="Configuración"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasProperties}
          title={hasProperties ? "Eliminar todo" : "No hay propiedades para eliminar"}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
