/**
 * gameStorage.ts
 *
 * Única capa con acceso directo a localStorage.
 * Hooks y componentes nunca deben llamar a localStorage directamente.
 *
 * Claves:
 *   bingo:index        → GamesIndex
 *   bingo:game:{id}    → Game
 */

import type { Game, GameSummary, GamesIndex } from '../types/game'

// ─── Storage backend ───────────────────────────────────────────────────────
//
// Todas las funciones acceden al storage a través de `getBackend()`.
// Por defecto usa `localStorage`, pero puede reemplazarse con
// `__setStorageBackend()` para inyectar un mock en tests sin depender
// de que vi.stubGlobal intercepte correctamente el módulo cacheado.

let _backend: Storage | null = null

function getBackend(): Storage {
  return _backend ?? localStorage
}

/**
 * Inyecta un storage alternativo. SÓLO para uso en tests.
 * Llamar con `null` para restaurar el comportamiento por defecto.
 */
export function __setStorageBackend(backend: Storage | null): void {
  _backend = backend
}

// ─── Claves ────────────────────────────────────────────────────────────────

const INDEX_KEY = 'bingo:index'

function gameKey(id: string): string {
  return `bingo:game:${id}`
}

// ─── Índice ────────────────────────────────────────────────────────────────

/**
 * Lee y parsea el índice desde localStorage.
 * Si no existe o el JSON es inválido, devuelve un índice vacío.
 */
export function loadIndex(): GamesIndex {
  try {
    const raw = getBackend().getItem(INDEX_KEY)
    if (!raw) return { games: [], activeId: null }
    
    const data = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return { games: [], activeId: null }
    
    const games = Array.isArray(data.games) ? data.games.filter((g: any) => g && g.id && g.name) : []
    const activeId = typeof data.activeId === 'string' ? data.activeId : null
    
    return { games, activeId }
  } catch (e) {
    console.error("Failed to load index:", e)
    return { games: [], activeId: null }
  }
}

/**
 * Persiste el índice en localStorage.
 */
export function saveIndex(index: GamesIndex): boolean {
  try {
    getBackend().setItem(INDEX_KEY, JSON.stringify(index))
    return true
  } catch (e) {
    console.error("Storage error (saveIndex):", e)
    return false
  }
}

/**
 * Si no existe `bingo:index`, lo inicializa con un índice vacío.
 * Si ya existe, no lo modifica.
 */
export function initStorage(): void {
  try {
    if (getBackend().getItem(INDEX_KEY) === null) {
      saveIndex({ games: [], activeId: null })
    }
  } catch (e) {
    console.error("Storage error (initStorage):", e)
  }
}

// ─── Partidas individuales ─────────────────────────────────────────────────

/**
 * Lee una partida por ID.
 * Devuelve null si no existe o si el JSON almacenado es inválido.
 */
export function loadGame(id: string): Game | null {
  try {
    const raw = getBackend().getItem(gameKey(id))
    if (!raw) return null
    
    const data = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null
    if (!data.id || !data.name || !Array.isArray(data.calledNumbers)) return null
    
    return data as Game
  } catch (e) {
    console.error("Failed to load game:", e)
    return null
  }
}

/**
 * Persiste el Game completo en su clave individual.
 */
export function saveGame(game: Game): boolean {
  try {
    getBackend().setItem(gameKey(game.id), JSON.stringify(game))
    return true
  } catch (e) {
    console.error("Storage error (saveGame):", e)
    return false
  }
}

/**
 * Elimina el Game de localStorage, lo remueve del índice,
 * y si era el activeId lo establece en null.
 */
export function deleteGame(id: string): void {
  try {
    getBackend().removeItem(gameKey(id))
  } catch (e) {
    console.error("Storage error (deleteGame):", e)
  }

  const index = loadIndex()
  const initialLength = index.games.length
  index.games = index.games.filter((s) => s.id !== id)
  
  if (index.activeId === id) {
    index.activeId = null
  }
  
  // Only save if there was a change
  if (initialLength !== index.games.length || index.activeId === null) {
    saveIndex(index)
  }
}

/**
 * Actualiza el GameSummary de una partida dentro del índice.
 * Usado tras cada mutación que cambie name o updatedAt.
 * Si el summary no existe aún en el índice, no hace nada.
 */
export function updateSummary(game: Game): boolean {
  const index = loadIndex()
  const i = index.games.findIndex((s) => s.id === game.id)
  if (i === -1) return false

  index.games[i] = {
    id: game.id,
    name: game.name,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  }

  // Reordenar por updatedAt descendente
  index.games.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return saveIndex(index)
}

// ─── Creación ──────────────────────────────────────────────────────────────

/**
 * Crea una partida nueva, la persiste y la establece como activa.
 * Usa crypto.randomUUID() para el ID.
 * Devuelve el Game creado.
 */
export function createGame(name: string): Game | null {
  const now = new Date().toISOString()
  const game: Game = {
    id: crypto.randomUUID(),
    name,
    calledNumbers: [],
    createdAt: now,
    updatedAt: now,
  }

  // 1. Guardar el Game completo (si falla, abortamos)
  if (!saveGame(game)) {
    return null
  }

  // 2. Agregar el summary al índice y establecer como activo
  const index = loadIndex()
  const summary: GameSummary = {
    id: game.id,
    name: game.name,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  }
  index.games.unshift(summary) // más reciente primero
  index.activeId = game.id
  
  // Si falla al guardar el índice, revertimos la creación para no dejar huérfanos
  if (!saveIndex(index)) {
    try { getBackend().removeItem(gameKey(game.id)) } catch {}
    return null
  }

  return game
}
