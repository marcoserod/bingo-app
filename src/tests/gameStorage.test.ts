import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initStorage,
  loadIndex,
  saveIndex,
  loadGame,
  saveGame,
  deleteGame,
  updateSummary,
  createGame,
  __setStorageBackend,
} from '../services/gameStorage'
import type { Game, GamesIndex, GameSummary } from '../types/game'

// ─── Mock de localStorage ───────────────────────────────────────────────────
//
// Vitest corre en Node; localStorage no existe de forma nativa.
//
// Estrategia de aislación:
//   - Un único mock singleton (una sola referencia, nunca reemplazada).
//   - vi.stubGlobal se llama UNA VEZ a nivel de módulo para que gameStorage.ts
//     reciba este objeto cuando se carga su módulo ESM.
//   - beforeEach llama a _store.clear() DIRECTAMENTE sobre el Map, sin pasar
//     por los métodos del mock, garantizando limpieza real entre tests.
//
// Por qué singleton y no factory:
//   Vitest cachea el módulo gameStorage.ts entre tests. Si reemplazamos el
//   global con vi.stubGlobal en beforeEach, el módulo ya importado retiene la
//   referencia al mock ANTERIOR. Mutando el store interno del mock original
//   garantizamos que el módulo siempre ve el estado correcto.

const _store = new Map<string, string>()

const localStorageMock: Storage = {
  getItem: (key: string) => _store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    _store.set(key, value)
  },
  removeItem: (key: string) => {
    _store.delete(key)
  },
  clear: () => {
    _store.clear()
  },
  get length() {
    return _store.size
  },
  key: (index: number) => [..._store.keys()][index] ?? null,
}

// Instalar el mock UNA SOLA VEZ antes de que cualquier test importe gameStorage
vi.stubGlobal('localStorage', localStorageMock)

// ─── Fixture ────────────────────────────────────────────────────────────────

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game-1',
    name: 'Partida Test',
    calledNumbers: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─── Setup ──────────────────────────────────────────────────────────────────
//
// Antes de cada test:
//   1. Limpiamos el Map directamente (garantiza store vacío).
//   2. Inyectamos nuestro mock en gameStorage via __setStorageBackend.
//      Esto evita cualquier ambigüedad de vi.stubGlobal con módulos
//      cacheados por el sistema ESM de Vitest.

beforeEach(() => {
  _store.clear()
  __setStorageBackend(localStorageMock)
})

// ─── initStorage ────────────────────────────────────────────────────────────

describe('initStorage', () => {
  it('crea un índice vacío si no existe', () => {
    initStorage()
    const index = loadIndex()
    expect(index).toEqual({ games: [], activeId: null })
  })

  it('no sobreescribe el índice si ya existe', () => {
    const existingIndex: GamesIndex = {
      games: [{ id: 'x', name: 'X', createdAt: '', updatedAt: '' }],
      activeId: 'x',
    }
    saveIndex(existingIndex)

    initStorage() // no debe tocar nada

    const index = loadIndex()
    expect(index.games).toHaveLength(1)
    expect(index.activeId).toBe('x')
  })
})

// ─── loadIndex ──────────────────────────────────────────────────────────────

describe('loadIndex', () => {
  it('devuelve índice vacío si no hay nada en localStorage', () => {
    const index = loadIndex()
    expect(index).toEqual({ games: [], activeId: null })
  })

  it('devuelve índice vacío si el JSON es inválido', () => {
    localStorageMock.setItem('bingo:index', 'esto no es json{{{')
    const index = loadIndex()
    expect(index).toEqual({ games: [], activeId: null })
  })

  it('carga correctamente un índice guardado', () => {
    const data: GamesIndex = {
      games: [{ id: 'a', name: 'A', createdAt: '2024', updatedAt: '2024' }],
      activeId: 'a',
    }
    saveIndex(data)
    const index = loadIndex()
    expect(index).toEqual(data)
  })
})

// ─── createGame ─────────────────────────────────────────────────────────────

describe('createGame', () => {
  it('devuelve un Game con los campos correctos', () => {
    const game = createGame('Mi Partida')!
    expect(game.name).toBe('Mi Partida')
    expect(game.calledNumbers).toEqual([])
    expect(game.id).toBeTruthy()
    expect(game.createdAt).toBeTruthy()
    expect(game.updatedAt).toBe(game.createdAt)
  })

  it('persiste el Game en localStorage', () => {
    const game = createGame('Guardada')!
    const loaded = loadGame(game.id)
    expect(loaded).toEqual(game)
  })

  it('agrega el summary al índice', () => {
    const game = createGame('Nueva')!
    const index = loadIndex()
    expect(index.games).toHaveLength(1)
    expect(index.games[0].id).toBe(game.id)
    expect(index.games[0].name).toBe('Nueva')
  })

  it('establece activeId en el índice', () => {
    const game = createGame('Activa')!
    const index = loadIndex()
    expect(index.activeId).toBe(game.id)
  })

  it('genera IDs únicos para cada partida', () => {
    const g1 = createGame('A')!
    const g2 = createGame('B')!
    expect(g1.id).not.toBe(g2.id)
  })

  it('pone la partida más reciente primero en el índice', () => {
    const g1 = createGame('Primera')!
    const g2 = createGame('Segunda')!
    const index = loadIndex()
    expect(index.games[0].id).toBe(g2.id)
    expect(index.games[1].id).toBe(g1.id)
  })
})

// ─── loadGame ───────────────────────────────────────────────────────────────

describe('loadGame', () => {
  it('devuelve null si el ID no existe', () => {
    expect(loadGame('no-existe')).toBeNull()
  })

  it('devuelve null si el JSON es inválido', () => {
    localStorageMock.setItem('bingo:game:bad-id', '{{invalid json')
    expect(loadGame('bad-id')).toBeNull()
  })

  it('carga correctamente un Game guardado', () => {
    const game = makeGame({ id: 'abc', name: 'Test' })
    saveGame(game)
    expect(loadGame('abc')).toEqual(game)
  })

  it('persiste calledNumbers correctamente', () => {
    const game = makeGame({ id: 'nums', calledNumbers: [5, 23, 67] })
    saveGame(game)
    const loaded = loadGame('nums')
    expect(loaded?.calledNumbers).toEqual([5, 23, 67])
  })
})

// ─── updateSummary ──────────────────────────────────────────────────────────

describe('updateSummary', () => {
  it('actualiza el summary del índice cuando cambia updatedAt', () => {
    const game = createGame('Original') as Game

    const updated: Game = {
      ...game,
      updatedAt: '2099-01-01T00:00:00.000Z',
    }
    updateSummary(updated)

    const index = loadIndex()
    const summary = index.games.find((s: GameSummary) => s.id === game.id)
    expect(summary?.updatedAt).toBe('2099-01-01T00:00:00.000Z')
  })

  it('no hace nada si el ID no está en el índice', () => {
    const game = makeGame({ id: 'fantasma' })
    // No creamos la partida en el índice, sólo en storage
    saveGame(game)
    expect(() => updateSummary(game)).not.toThrow()
    const index = loadIndex()
    expect(index.games).toHaveLength(0)
  })

  it('reordena el índice por updatedAt descendente', () => {
    const g1 = createGame('Antigua') as Game
    createGame('Nueva')

    // Actualizamos g1 con un updatedAt más reciente que g2
    const updatedG1: Game = {
      ...g1,
      updatedAt: '2099-12-31T00:00:00.000Z',
    }
    updateSummary(updatedG1)

    const index = loadIndex()
    expect(index.games[0].id).toBe(g1.id)
  })
})

// ─── deleteGame ─────────────────────────────────────────────────────────────

describe('deleteGame', () => {
  it('elimina el Game de localStorage', () => {
    const game = createGame('A eliminar')!
    deleteGame(game.id)
    expect(loadGame(game.id)).toBeNull()
  })

  it('elimina el summary del índice', () => {
    const game = createGame('A eliminar')!
    deleteGame(game.id)
    const index = loadIndex()
    expect(index.games.find((s: GameSummary) => s.id === game.id)).toBeUndefined()
  })

  it('establece activeId en null si se elimina la partida activa', () => {
    const game = createGame('Activa')!
    // createGame la deja como activa
    expect(loadIndex().activeId).toBe(game.id)

    deleteGame(game.id)

    expect(loadIndex().activeId).toBeNull()
  })

  it('no altera activeId si la partida eliminada no era la activa', () => {
    const g1 = createGame('Primera')!
    const g2 = createGame('Segunda')! // queda como activa
    expect(loadIndex().activeId).toBe(g2.id)

    deleteGame(g1.id)

    expect(loadIndex().activeId).toBe(g2.id)
  })

  it('no lanza error si se intenta eliminar un ID inexistente', () => {
    expect(() => deleteGame('no-existe')).not.toThrow()
  })

  it('conserva las demás partidas al eliminar una', () => {
    const g1 = createGame('Queda')!
    const g2 = createGame('Se va')!
    deleteGame(g2.id)

    const index = loadIndex()
    expect(index.games).toHaveLength(1)
    expect(index.games[0].id).toBe(g1.id)
  })
})

// ─── Manejo de errores de Storage ───────────────────────────────────────────

describe('Manejo de errores de Storage', () => {
  it('saveIndex devuelve false si localStorage lanza error (ej. QuotaExceededError)', () => {
    vi.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    
    const result = saveIndex({ games: [], activeId: null })
    expect(result).toBe(false)
  })

  it('saveGame devuelve false si localStorage lanza error', () => {
    vi.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    
    const game = makeGame()
    const result = saveGame(game)
    expect(result).toBe(false)
  })

  it('createGame devuelve null si no se puede guardar la partida nueva', () => {
    vi.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    
    const game = createGame('Falla')
    expect(game).toBeNull()
  })
})
