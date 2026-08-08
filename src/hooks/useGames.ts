import { useState, useEffect, useCallback } from 'react'
import type { GameSummary } from '../types/game'
import * as gameStorage from '../services/gameStorage'

export function useGames() {
  const [games, setGames] = useState<GameSummary[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // 1. Inicialización
  useEffect(() => {
    gameStorage.initStorage()
    const index = gameStorage.loadIndex()
    
    // Defensa contra activeId huérfano
    if (index.activeId) {
      const activeGame = gameStorage.loadGame(index.activeId)
      if (!activeGame) {
        console.warn('activeId huérfano detectado. Limpiando...')
        index.activeId = null
        gameStorage.saveIndex(index)
      }
    }
    
    setGames(index.games)
    setActiveId(index.activeId)
  }, [])

  // 2. createGame
  const createGame = useCallback((name: string) => {
    const newGame = gameStorage.createGame(name)
    if (!newGame) {
      alert('No se pudo crear la partida. Es posible que el almacenamiento esté lleno o corrupto.')
      return
    }
    const index = gameStorage.loadIndex()
    setGames(index.games)
    setActiveId(index.activeId)
  }, [])

  // 3. loadGame
  const loadGame = useCallback((id: string) => {
    const game = gameStorage.loadGame(id)
    if (game) {
      const index = gameStorage.loadIndex()
      index.activeId = id
      gameStorage.saveIndex(index)
      
      setGames(index.games)
      setActiveId(index.activeId)
    }
  }, [])

  // 4. deleteGame
  const deleteGame = useCallback((id: string) => {
    gameStorage.deleteGame(id)
    const index = gameStorage.loadIndex()
    setGames(index.games)
    setActiveId(index.activeId)
  }, [])

  // 5. refreshGames (Para sincronización explícita desde otras partes de la app)
  const refreshGames = useCallback(() => {
    const index = gameStorage.loadIndex()
    setGames(index.games)
  }, [])

  return {
    games,
    activeId,
    createGame,
    loadGame,
    deleteGame,
    refreshGames,
  }
}
