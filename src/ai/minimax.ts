import { Board, Move, Player } from '../engine/types'
import { generateValidMoves, applyMove, winner } from '../engine/rules'
import { evaluateBoard } from './evaluator'

type ScoredMove = { move: Move; score: number }

type SearchContext = { nodes: { count: number }; startTime: number; timeLimitMs: number; maxNodes: number }

function negamax(board: Board, player: Player, depth: number, alpha: number, beta: number, ctx: SearchContext): { score: number; move: Move | null } {
  // node visit
  ctx.nodes.count++
  // time / node guard
  if ((Date.now() - ctx.startTime) > ctx.timeLimitMs || ctx.nodes.count > ctx.maxNodes) {
    // abort search: return static evaluation for this node
    return { score: evaluateBoard(board, player), move: null }
  }

  const moves = generateValidMoves(board, player)
  if (depth === 0 || moves.length === 0) {
    const val = evaluateBoard(board, player)
    return { score: val, move: null }
  }

  let bestScore = -Infinity
  let bestMove: Move | null = null
  for (const m of moves) {
    const next = applyMove(board, m)
    const w = winner(next)
    let score: number
    if (w === player) score = 10000
    else if (w && w !== player) score = -10000
    else {
      const res = negamax(next, player === 'white' ? 'black' : 'white', depth - 1, -beta, -alpha, ctx)
      score = -res.score
    }
    if (score > bestScore) {
      bestScore = score
      bestMove = m
    }
    alpha = Math.max(alpha, score)
    if (alpha >= beta) break
  }
  return { score: bestScore, move: bestMove }
}

export function findBestMove(board: Board, player: Player, depth = 4, options?: { timeLimitMs?: number; maxNodes?: number }): Move | null {
  const timeLimitMs = options?.timeLimitMs ?? 1000
  const maxNodes = options?.maxNodes ?? 20000
  const ctx: SearchContext = { nodes: { count: 0 }, startTime: Date.now(), timeLimitMs, maxNodes }
  const res = negamax(board, player, depth, -Infinity, Infinity, ctx)
  console.log('[minimax] nodes', ctx.nodes.count, 'timeMs', Date.now() - ctx.startTime)
  return res.move
}
