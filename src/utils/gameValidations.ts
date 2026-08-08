/**
 * gameValidations.ts
 *
 * Funciones puras de validación para la lógica de Bingo.
 * Sin efectos secundarios. Sin dependencias de React ni de localStorage.
 */

import type { Game } from '../types/game'

export const MAX_NUMBERS = 90;

/**
 * Devuelve true si la partida ha llamado todos los números posibles.
 */
export function isGameComplete(game: Game): boolean {
  return game.calledNumbers.length >= MAX_NUMBERS
}

/**
 * Devuelve true si `n` es un entero entre 1 y 90 (inclusive).
 */
export function isValidNumber(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_NUMBERS
}

/**
 * Devuelve true si `n` ya fue llamado en la partida.
 * Usa includes en lugar de Set porque calledNumbers nunca supera 90 elementos.
 */
export function isAlreadyCalled(n: number, game: Game): boolean {
  return game.calledNumbers.includes(n)
}

/**
 * Convierte el string crudo de un input a un número entero válido.
 * Devuelve null si:
 *   - el string está vacío o sólo tiene espacios
 *   - no es un número
 *   - es un decimal (ej. "3.5")
 *   - no es un entero en rango válido de Bingo
 *
 * No lanza errores: siempre devuelve number | null.
 */
export function parseNumberInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  if (!Number.isInteger(parsed)) return null

  return parsed
}
