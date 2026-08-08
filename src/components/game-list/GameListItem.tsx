import React, { useState } from 'react'
import type { GameSummary } from '../../types/game'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface GameListItemProps {
  game: GameSummary
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function GameListItem({ game, isActive, onSelect, onDelete }: GameListItemProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false)
    onDelete(game.id)
  }

  const date = new Date(game.updatedAt || game.createdAt).toLocaleDateString()

  return (
    <>
      <li 
        onClick={() => onSelect(game.id)}
        className={`flex items-center justify-between p-4 cursor-pointer border-l-4 transition-all ${
          isActive 
            ? 'border-blue-500 bg-theme-surface shadow-md' 
            : 'border-transparent hover:bg-theme-surface/40'
        }`}
      >
        <div className="flex flex-col overflow-hidden">
          <span className={`truncate font-bold tracking-wide ${isActive ? 'text-blue-500' : 'text-theme-text font-medium'}`}>
            {game.name}
          </span>
          <span className="text-[11px] text-theme-text-muted font-medium uppercase tracking-widest mt-0.5">{date}</span>
        </div>
        
        <button 
          onClick={handleDeleteClick}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isActive 
              ? 'text-theme-text-muted hover:text-red-500 hover:bg-theme-surface-alt' 
              : 'text-theme-text-muted hover:text-red-500 hover:bg-theme-surface-alt'
          }`}
          title="Eliminar partida"
        >
          🗑
        </button>
      </li>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        message={`¿Eliminar la partida '${game.name}'?`}
        description="Esta acción no se puede deshacer y borrará todo el progreso."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}
