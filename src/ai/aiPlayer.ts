import { findBestMove } from './minimax'
import { Board, Player } from '../engine/types'
import { applyMove } from '../engine/rules'

export function computeBestMoveAndApply(board: Board, player: Player, depth = 4): { board: Board; move: any } {
  const move = findBestMove(board, player, depth)
  if (!move) return { board, move: null }
  const next = applyMove(board, move)
  return { board: next, move }
}
