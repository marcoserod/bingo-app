/**
 * Representa una partida de Bingo completa.
 * Se persiste individualmente en localStorage bajo la clave `bingo:game:{id}`.
 */
export interface Game {
  id: string
  name: string
  /**
   * Números llamados en orden de aparición.
   * El último elemento es el número más reciente.
   * Nunca contiene duplicados.
   */
  calledNumbers: number[]
  /** ISO 8601 */
  createdAt: string
  /** ISO 8601 */
  updatedAt: string
}

/**
 * Metadata liviana de una partida.
 * Se almacena dentro de GamesIndex para renderizar la lista
 * sin deserializar cada Game completo.
 */
export interface GameSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * Índice global de partidas persistido en `bingo:index`.
 *
 * INVARIANTE: todo id presente en `games` debe tener su Game completo
 * en `bingo:game:{id}`. `activeId` es null o uno de los IDs de `games`.
 */
export interface GamesIndex {
  /** Ordenado por updatedAt descendente. */
  games: GameSummary[]
  activeId: string | null
}
