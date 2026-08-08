// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '../hooks/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('devuelve dark por defecto si no hay preferencia guardada', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('lee la preferencia existente desde localStorage', () => {
    localStorage.setItem('bingo:theme', 'light')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('asume dark si el valor en localStorage es inválido', () => {
    localStorage.setItem('bingo:theme', 'purple')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('cambia el theme al ejecutar toggleTheme y lo guarda', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(localStorage.getItem('bingo:theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('bingo:theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
