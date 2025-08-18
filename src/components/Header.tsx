import React from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Download, Trash2, Share2, FileText } from 'lucide-react'

interface HeaderProps {
  onConfig: () => void
  onExport: () => void
  onClear: () => void
  onExportVisits: () => void
  onShare: () => void
  propertiesCount: number
}

export const Header: React.FC<HeaderProps> = ({
  onConfig,
  onExport,
  onClear,
  onExportVisits,
  onShare,
  propertiesCount
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold">Idea-lista</h1>
        <span className="text-sm text-muted-foreground">
          {propertiesCount} propiedades
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          title="Compartir lista"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          title="Exportar datos"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportVisits}
          title="Exportar visitas"
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
          title="Eliminar todo"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
