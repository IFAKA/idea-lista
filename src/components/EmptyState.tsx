import React from 'react'
import { Home, Plus } from 'lucide-react'

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Home className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">No hay propiedades guardadas</h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Ve a Idealista.com y usa el botón <Plus className="inline w-4 h-4" /> para agregar propiedades a tu lista.
      </p>
      
      <div className="text-xs text-muted-foreground">
        <p>Las propiedades se analizan automáticamente</p>
        <p>y se ordenan por puntuación</p>
      </div>
    </div>
  )
}
