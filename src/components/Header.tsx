import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Download, 
  Trash2, 
  Home 
} from 'lucide-react'

interface HeaderProps {
  onConfig: () => void
  onExport: () => void
  onClear: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onConfig,
  onExport,
  onClear
}) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Home className="w-5 h-5" />
        <h1 className="text-lg font-semibold">Idea-lista</h1>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onConfig}
          title="Configurar parámetros de búsqueda"
          className="h-8 w-8"
        >
          <Settings className="w-4 h-4" />
        </Button>
        

        
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          title="Exportar propiedades"
          className="h-8 w-8"
        >
          <Download className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          title="Limpiar todas las propiedades"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
