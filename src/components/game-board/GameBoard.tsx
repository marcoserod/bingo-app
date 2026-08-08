import { useState } from 'react'
import { useActiveGame } from '../../hooks/useActiveGame'
import { NumberGrid } from './NumberGrid'
import { LastNumber } from './LastNumber'
import { CalledHistory } from './CalledHistory'
import { NumberInput } from './NumberInput'
import { GameStats } from './GameStats'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface GameBoardProps {
  gameId: string
  onGameUpdate?: () => void
}

export function GameBoard({ gameId, onGameUpdate }: GameBoardProps) {
  const { game, callNumber, removeNumber, resetGame, isComplete } = useActiveGame(gameId, onGameUpdate)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [removingNumber, setRemovingNumber] = useState<number | null>(null)

  if (!game) {
    return <div className="flex-1 flex items-center justify-center text-slate-400">Cargando partida...</div>
  }

  const calledNumbers = game.calledNumbers
  const lastNumber = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false)
    resetGame()
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto w-full h-full">
      {/* Columna Izquierda: Panel Principal */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Encabezado del Tablero */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {game.name}
              </h1>
              {isComplete && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider animate-pulse">
                  Partida Completa
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-1">
              Partida {isComplete ? 'finalizada' : 'en curso'}
            </p>
          </div>
        </div>

        {/* Controles y Último Número */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[260px]">
          <div className="xl:col-span-5 h-full">
            <LastNumber number={lastNumber} />
          </div>
          <div className="xl:col-span-7 h-full">
            <NumberInput onAddNumber={callNumber} isComplete={isComplete} />
          </div>
        </div>

        {/* Grilla Principal */}
        <div className="bg-theme-surface p-6 rounded-2xl border border-theme-border overflow-x-auto flex-1 flex flex-col justify-center shadow-lg">
          <div className="min-w-[800px] mx-auto w-full">
            <NumberGrid calledNumbers={calledNumbers} onRemoveIntent={setRemovingNumber} />
          </div>
        </div>

        {/* Estadísticas (Agregado) */}
        <GameStats calledCount={calledNumbers.length} />
      </div>

      {/* Columna Derecha: Historial */}
      <div className="w-full xl:w-80 h-[600px] xl:h-auto flex-shrink-0">
        <CalledHistory calledNumbers={calledNumbers} onReset={() => setIsResetConfirmOpen(true)} />
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        message="¿Reiniciar el tablero?"
        description="Se eliminarán todos los números llamados de esta partida. Esta acción no se puede deshacer."
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
        confirmText="Reiniciar"
      />

      <ConfirmDialog
        isOpen={removingNumber !== null}
        message="Eliminar número"
        description={`¿Querés eliminar el número ${removingNumber} de la partida?`}
        onConfirm={() => {
          if (removingNumber !== null) {
            removeNumber(removingNumber)
          }
          setRemovingNumber(null)
        }}
        onCancel={() => setRemovingNumber(null)}
        confirmText="Eliminar número"
      />
    </div>
  )
}
