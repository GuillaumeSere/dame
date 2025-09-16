import { Board, Player } from '../engine/types'
import { generateValidMoves } from '../engine/rules'

export function evaluateBoard(board: Board, player: Player): number {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const val = p.isKing ? 5 : 3
      score += (p.player === player ? val : -val)
    }
  }
  // mobility
  // lightweight: count moves difference
  try {
    const movesSelf = generateValidMoves(board, player).length
    const movesOpp = generateValidMoves(board, player === 'white' ? 'black' : 'white').length
    score += 0.1 * (movesSelf - movesOpp)
  } catch (e) {
    // ignore
  }
  return score
}
