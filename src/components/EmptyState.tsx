import React from 'react'
import { motion } from "motion/react"
import { Home, Plus } from 'lucide-react'

export const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"
      >
        <Home className="w-8 h-8 text-muted-foreground" />
      </motion.div>
      
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold mb-2"
      >
        No hay propiedades guardadas
      </motion.h3>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-sm"
      >
        Navega a una propiedad en el portal inmobiliario y haz clic en "Agregar" para comenzar a usar Idea-lista
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Plus className="w-3 h-3" />
        <span>Agregar primera propiedad</span>
      </motion.div>
    </motion.div>
  )
}
