// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGames } from '../hooks/useGames'
import { __setStorageBackend } from '../services/gameStorage'

// Reutilizamos la misma estrategia de mock seguro para el storage
function makeLocalStorageMock(): Storage {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}

beforeEach(() => {
  const mockStorage = makeLocalStorageMock()
  vi.stubGlobal('localStorage', mockStorage)
  __setStorageBackend(mockStorage)
})

describe('useGames', () => {
  it('inicializa sin partidas si el storage está vacío', () => {
    const { result } = renderHook(() => useGames())
    expect(result.current.games).toEqual([])
    expect(result.current.activeId).toBeNull()
  })

  it('crea una partida y la establece como activa', () => {
    const { result } = renderHook(() => useGames())
    
    act(() => {
      result.current.createGame('Mi Partida')
    })

    expect(result.current.games).toHaveLength(1)
    expect(result.current.games[0].name).toBe('Mi Partida')
    expect(result.current.activeId).toBe(result.current.games[0].id)
  })

  it('cargar partida existente la establece como activa', () => {
    const { result } = renderHook(() => useGames())
    
    act(() => {
      result.current.createGame('A')
      result.current.createGame('B') // B queda activa
    })
    
    const gameA_Id = result.current.games.find(g => g.name === 'A')!.id
    
    act(() => {
      result.current.loadGame(gameA_Id)
    })

    expect(result.current.activeId).toBe(gameA_Id)
  })

  it('eliminar partida actualiza la lista', () => {
    const { result } = renderHook(() => useGames())
    
    act(() => {
      result.current.createGame('A')
    })
    const id = result.current.activeId!
    
    act(() => {
      result.current.deleteGame(id)
    })

    expect(result.current.games).toHaveLength(0)
    expect(result.current.activeId).toBeNull()
  })

  it('limpia activeId si hace referencia a una partida huérfana/inexistente', () => {
    // 1. Preparamos el storage con un índice que apunta a algo que no existe
    const mockStorage = makeLocalStorageMock()
    mockStorage.setItem('bingo:index', JSON.stringify({
      games: [{ id: 'fantasma', name: 'No existo', createdAt: '2024', updatedAt: '2024' }],
      activeId: 'fantasma'
    }))
    // Nota: bingo:game:fantasma NO se inserta en el storage.
    
    vi.stubGlobal('localStorage', mockStorage)
    __setStorageBackend(mockStorage)

    // 2. Renderizamos el hook, debería detectar el huérfano y limpiar activeId
    const { result } = renderHook(() => useGames())
    
    expect(result.current.activeId).toBeNull()
    
    // Verificamos que el índice fue corregido en storage
    const savedIndex = JSON.parse(mockStorage.getItem('bingo:index')!)
    expect(savedIndex.activeId).toBeNull()
  })
})
