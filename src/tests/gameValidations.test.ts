import { describe, it, expect } from 'vitest'
import {
  isValidNumber,
  isAlreadyCalled,
  parseNumberInput,
} from '../utils/gameValidations'
import type { Game } from '../types/game'

// ─── Fixture ───────────────────────────────────────────────────────────────

function makeGame(calledNumbers: number[] = []): Game {
  return {
    id: 'test-id',
    name: 'Test',
    calledNumbers,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ─── isValidNumber ──────────────────────────────────────────────────────────

describe('isValidNumber', () => {
  it('acepta 1 (límite inferior)', () => {
    expect(isValidNumber(1)).toBe(true)
  })

  it('acepta 50 (valor central)', () => {
    expect(isValidNumber(50)).toBe(true)
  })

  it('acepta 90 (límite superior)', () => {
    expect(isValidNumber(90)).toBe(true)
  })

  it('rechaza 0 (por debajo del mínimo)', () => {
    expect(isValidNumber(0)).toBe(false)
  })

  it('rechaza 91 (por encima del máximo)', () => {
    expect(isValidNumber(91)).toBe(false)
  })

  it('rechaza números negativos', () => {
    expect(isValidNumber(-1)).toBe(false)
    expect(isValidNumber(-50)).toBe(false)
  })

  it('rechaza decimales', () => {
    expect(isValidNumber(3.5)).toBe(false)
    expect(isValidNumber(45.1)).toBe(false)
    expect(isValidNumber(1.0000001)).toBe(false)
  })

  it('rechaza NaN', () => {
    expect(isValidNumber(NaN)).toBe(false)
  })

  it('rechaza Infinity', () => {
    expect(isValidNumber(Infinity)).toBe(false)
    expect(isValidNumber(-Infinity)).toBe(false)
  })
})

// ─── isAlreadyCalled ────────────────────────────────────────────────────────

describe('isAlreadyCalled', () => {
  it('devuelve true si el número está en calledNumbers', () => {
    expect(isAlreadyCalled(42, makeGame([10, 42, 75]))).toBe(true)
  })

  it('devuelve false si el número no está en calledNumbers', () => {
    expect(isAlreadyCalled(42, makeGame([10, 75]))).toBe(false)
  })

  it('devuelve false con calledNumbers vacío', () => {
    expect(isAlreadyCalled(1, makeGame([]))).toBe(false)
  })

  it('detecta el primer número', () => {
    expect(isAlreadyCalled(1, makeGame([1, 2, 3]))).toBe(true)
  })

  it('detecta el último número', () => {
    expect(isAlreadyCalled(3, makeGame([1, 2, 3]))).toBe(true)
  })

  it('no produce falsos positivos con números similares', () => {
    expect(isAlreadyCalled(9, makeGame([19, 90, 9]))).toBe(true)
    expect(isAlreadyCalled(9, makeGame([19, 90]))).toBe(false)
  })
})

// ─── parseNumberInput ───────────────────────────────────────────────────────

describe('parseNumberInput', () => {
  it('parsea un número entero válido', () => {
    expect(parseNumberInput('42')).toBe(42)
  })

  it('ignora espacios alrededor del número', () => {
    expect(parseNumberInput('  7  ')).toBe(7)
  })

  it('devuelve null para string vacío', () => {
    expect(parseNumberInput('')).toBeNull()
  })

  it('devuelve null para string de sólo espacios', () => {
    expect(parseNumberInput('   ')).toBeNull()
  })

  it('devuelve null para texto no numérico', () => {
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('doce')).toBeNull()
  })

  it('devuelve null para un decimal no entero', () => {
    expect(parseNumberInput('3.5')).toBeNull()
    expect(parseNumberInput('45.7')).toBeNull()
    expect(parseNumberInput('1.001')).toBeNull()
  })

  it('parsea "45.0" como 45 (es un entero matemáticamente)', () => {
    // Number('45.0') === 45, Number.isInteger(45) === true
    expect(parseNumberInput('45.0')).toBe(45)
  })

  it('devuelve null para NaN literal', () => {
    expect(parseNumberInput('NaN')).toBeNull()
  })

  it('devuelve null para Infinity literal', () => {
    expect(parseNumberInput('Infinity')).toBeNull()
  })

  it('parsea correctamente los límites del Bingo', () => {
    expect(parseNumberInput('1')).toBe(1)
    expect(parseNumberInput('90')).toBe(90)
  })

  it('devuelve 0 o valores fuera de rango (el rango lo valida isValidNumber)', () => {
    // parseNumberInput no filtra por rango — eso es responsabilidad de isValidNumber
    expect(parseNumberInput('0')).toBe(0)
    expect(parseNumberInput('91')).toBe(91)
    expect(parseNumberInput('-1')).toBe(-1)
  })
})
