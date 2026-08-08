// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useActiveGame } from '../hooks/useActiveGame'
import { __setStorageBackend, createGame } from '../services/gameStorage'

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

describe('useActiveGame', () => {
  it('devuelve null si gameId es null', () => {
    const { result } = renderHook(() => useActiveGame(null))
    expect(result.current.game).toBeNull()
  })

  it('carga partida existente', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    expect(result.current.game?.id).toBe(game.id)
  })

  it('ingresa número válido y actualiza array', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    
    act(() => {
      result.current.callNumber(42)
    })

    expect(result.current.game?.calledNumbers).toEqual([42])
  })

  it('no permite número menor a 1 ni mayor a 90', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    
    act(() => {
      result.current.callNumber(0)
      result.current.callNumber(91)
    })

    expect(result.current.game?.calledNumbers).toEqual([])
  })

  it('no permite número repetido', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    
    act(() => {
      result.current.callNumber(10)
      result.current.callNumber(10)
    })

    expect(result.current.game?.calledNumbers).toEqual([10])
  })

  it('reinicia partida manteniendo metadata', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    
    act(() => {
      result.current.callNumber(15)
    })
    
    expect(result.current.game?.calledNumbers).toHaveLength(1)
    
    act(() => {
      result.current.resetGame()
    })

    expect(result.current.game?.calledNumbers).toHaveLength(0)
    expect(result.current.game?.id).toBe(game.id)
    expect(result.current.game?.name).toBe('Test')
  })

  it('no permite ingresar número si la partida está completa', () => {
    const game = createGame('Test')!
    const { result } = renderHook(() => useActiveGame(game.id))
    
    // Llenar la partida
    act(() => {
      for (let i = 1; i <= 90; i++) {
        result.current.callNumber(i)
      }
    })
    
    expect(result.current.game?.calledNumbers).toHaveLength(90)
    
    // Intentar ingresar uno más, debería fallar
    act(() => {
      const res = result.current.callNumber(91) // o incluso repitiendo, o lo que sea, el primer error debe ser de "completa"
      expect(res.success).toBe(false)
      expect(res.error).toBe('La partida está completa.')
    })
    
    expect(result.current.game?.calledNumbers).toHaveLength(90)
  })

  describe('removeNumber', () => {
    it('elimina un número existente y mantiene el orden del resto', () => {
      const game = createGame('Test')!
      const { result } = renderHook(() => useActiveGame(game.id))
      
      act(() => {
        result.current.callNumber(15)
        result.current.callNumber(42)
        result.current.callNumber(8)
      })
      
      expect(result.current.game?.calledNumbers).toEqual([15, 42, 8])

      act(() => {
        const res = result.current.removeNumber(42)
        expect(res.success).toBe(true)
      })

      expect(result.current.game?.calledNumbers).toEqual([15, 8])
    })

    it('no permite eliminar un número inexistente y no modifica el estado', () => {
      const game = createGame('Test')!
      const onUpdate = vi.fn()
      const { result } = renderHook(() => useActiveGame(game.id, onUpdate))
      
      act(() => {
        result.current.callNumber(15)
      })
      
      onUpdate.mockClear()

      act(() => {
        const res = result.current.removeNumber(99)
        expect(res.success).toBe(false)
        expect(res.error).toBe('El número 99 no fue llamado.')
      })

      expect(result.current.game?.calledNumbers).toEqual([15])
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('elimina el único número y deja la partida sin números', () => {
      const game = createGame('Test')!
      const { result } = renderHook(() => useActiveGame(game.id))
      
      act(() => { result.current.callNumber(25) })
      expect(result.current.game?.calledNumbers).toEqual([25])
      
      act(() => { result.current.removeNumber(25) })
      expect(result.current.game?.calledNumbers).toEqual([])
    })

    it('permite pasar de partida completa (90) a incompleta (89)', () => {
      const game = createGame('Test')!
      const { result } = renderHook(() => useActiveGame(game.id))
      
      act(() => {
        for (let i = 1; i <= 90; i++) {
          result.current.callNumber(i)
        }
      })
      
      expect(result.current.game?.calledNumbers).toHaveLength(90)
      expect(result.current.isComplete).toBe(true)
      
      act(() => {
        result.current.removeNumber(45)
      })
      
      expect(result.current.game?.calledNumbers).toHaveLength(89)
      expect(result.current.isComplete).toBe(false)
      
      // Debe permitir agregar otro número
      act(() => {
        const res = result.current.callNumber(45)
        expect(res.success).toBe(true)
      })
      
      expect(result.current.isComplete).toBe(true)
    })

    it('verifica persistencia y ejecución de onUpdate en eliminación exitosa', () => {
      const game = createGame('Test')!
      const onUpdate = vi.fn()
      const { result } = renderHook(() => useActiveGame(game.id, onUpdate))
      
      act(() => { result.current.callNumber(10) })
      
      onUpdate.mockClear()
      
      act(() => { result.current.removeNumber(10) })
      
      expect(onUpdate).toHaveBeenCalledTimes(1)
      
      // Verificar recargando directamente del storage con un renderHook nuevo
      const hook2 = renderHook(() => useActiveGame(game.id))
      expect(hook2.result.current.game?.calledNumbers).toEqual([])
    })
  })
})
