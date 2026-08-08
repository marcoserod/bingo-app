import { useState, useEffect, useCallback } from 'react'
import type { Game } from '../types/game'
import * as gameStorage from '../services/gameStorage'
import { isValidNumber, isAlreadyCalled, isGameComplete } from '../utils/gameValidations'

export function useActiveGame(gameId: string | null, onUpdate?: () => void) {
  const [game, setGame] = useState<Game | null>(null)

  // 1. Inicialización
  useEffect(() => {
    if (gameId) {
      const loadedGame = gameStorage.loadGame(gameId)
      // Si el juego es null (corrupto/inexistente), limpiamos el activeGame.
      setGame(loadedGame)
    } else {
      setGame(null)
    }
  }, [gameId])

  // 2. callNumber
  const callNumber = useCallback((number: number): { success: boolean, error?: string } => {
    if (!game) return { success: false, error: 'No hay partida activa.' }
    if (isGameComplete(game)) return { success: false, error: 'La partida está completa.' }
    if (!isValidNumber(number)) return { success: false, error: 'El número debe estar entre 1 y 90.' }
    if (isAlreadyCalled(number, game)) return { success: false, error: `El número ${number} ya fue llamado.` }

    setGame(currentGame => {
      // Validaciones tempranas: no mutan estado si fallan
      if (!currentGame) return currentGame
      if (isGameComplete(currentGame)) return currentGame
      if (!isValidNumber(number)) return currentGame
      if (isAlreadyCalled(number, currentGame)) return currentGame

      // Creación inmutable de la nueva versión
      const newGame: Game = {
        ...currentGame,
        calledNumbers: [...currentGame.calledNumbers, number],
        updatedAt: new Date().toISOString()
      }

      // Persistencia
      if (!gameStorage.saveGame(newGame)) {
        alert('Error al guardar el número. Es posible que el almacenamiento esté lleno.')
        return currentGame
      }
      
      gameStorage.updateSummary(newGame)
      if (onUpdate) onUpdate()

      return newGame
    })
    
    return { success: true }
  }, [game, onUpdate])

  // 3. resetGame
  const resetGame = useCallback(() => {
    setGame(currentGame => {
      if (!currentGame) return currentGame

      const newGame: Game = {
        ...currentGame,
        calledNumbers: [],
        updatedAt: new Date().toISOString()
      }

      if (!gameStorage.saveGame(newGame)) {
        alert('Error al reiniciar el tablero. Es posible que el almacenamiento esté lleno.')
        return currentGame
      }
      
      gameStorage.updateSummary(newGame)
      if (onUpdate) onUpdate()

      return newGame
    })
  }, [onUpdate])

  // 4. removeNumber
  const removeNumber = useCallback((number: number): { success: boolean, error?: string } => {
    if (!game) return { success: false, error: 'No hay partida activa.' }
    if (!isAlreadyCalled(number, game)) return { success: false, error: `El número ${number} no fue llamado.` }

    setGame(currentGame => {
      if (!currentGame) return currentGame
      if (!isAlreadyCalled(number, currentGame)) return currentGame

      const newGame: Game = {
        ...currentGame,
        calledNumbers: currentGame.calledNumbers.filter(n => n !== number),
        updatedAt: new Date().toISOString()
      }

      if (!gameStorage.saveGame(newGame)) {
        alert('Error al actualizar el tablero. Es posible que el almacenamiento esté lleno.')
        return currentGame
      }
      
      gameStorage.updateSummary(newGame)
      if (onUpdate) onUpdate()

      return newGame
    })

    return { success: true }
  }, [game, onUpdate])

  return {
    game,
    callNumber,
    removeNumber,
    resetGame,
    isComplete: game ? isGameComplete(game) : false
  }
}
