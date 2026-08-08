import { useState } from 'react'
import type { GameSummary } from '../../types/game'
import type { Theme } from '../../hooks/useTheme'
import { GameListItem } from './GameListItem'
import { NewGameForm } from './NewGameForm'

interface GameListProps {
  games: GameSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onCreate: (name: string) => void
  theme: Theme
  onToggleTheme: () => void
}

export function GameList({ games, activeId, onSelect, onDelete, onCreate, theme, onToggleTheme }: GameListProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = (name: string) => {
    onCreate(name)
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col h-full bg-theme-bg border-r border-theme-border w-full md:w-64 lg:w-72 flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="p-5 border-b border-theme-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            B
          </div>
          <h2 className="font-bold text-theme-text tracking-wider">PARTIDAS</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-theme-surface transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-theme-text-muted hover:text-theme-text"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="text-blue-500 hover:text-white transition-colors text-xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600 cursor-pointer shadow-sm"
            title="Nueva Partida"
          >
            +
          </button>
        </div>
      </div>

      {isCreating && (
        <NewGameForm onCreate={handleCreate} onCancel={() => setIsCreating(false)} />
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {games.length === 0 && !isCreating ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-6 text-theme-text-muted mt-10">
            <p className="text-sm font-medium">No hay partidas creadas</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
            >
              Nueva partida
            </button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-theme-border/50">
            {games.map(game => (
              <GameListItem 
                key={game.id}
                game={game}
                isActive={game.id === activeId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
