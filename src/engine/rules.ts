import { Board, Move, Piece, Player } from './types'

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null))
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { id: `b-${r}-${c}`, player: 'black', isKing: false }
      }
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { id: `w-${r}-${c}`, player: 'white', isKing: false }
      }
    }
  }
  return board
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)))
}

// directions for simple pieces (white moves up - decreasing row, black moves down - increasing row)
const DIRS = {
  white: [ [-1, -1], [-1, 1] ] as [number, number][],
  black: [ [1, -1], [1, 1] ] as [number, number][],
  king: [ [-1, -1], [-1, 1], [1, -1], [1, 1] ] as [number, number][]
}

// Generate all single-step non-capturing moves for a piece at (r,c)
function genSimpleMoves(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c]
  if (!piece) return []
  const dirs = piece.isKing ? DIRS.king : DIRS[piece.player]
  const moves: Move[] = []
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (!inBounds(nr, nc)) continue
    if (board[nr][nc] === null) {
      moves.push({ from: [r, c], to: [nr, nc] })
    }
  }
  return moves
}

// Generate capture moves starting from (r,c). Returns array of Move (captures may be multiple)
function genCapturesFrom(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c]
  if (!piece) return []

  const directions = piece.isKing ? DIRS.king : DIRS[piece.player]

  // dfs returns an array of sequences starting from (cr,cc)
  function dfs(currBoard: Board, cr: number, cc: number): Array<{ to: [number, number]; captures: [number, number][] }> {
    const localResults: Array<{ to: [number, number]; captures: [number, number][] }> = []
    for (const [dr, dc] of (currBoard[cr][cc]?.isKing ? DIRS.king : directions)) {
      const mr = cr + dr
      const mc = cc + dc
      const tr = cr + 2 * dr
      const tc = cc + 2 * dc
      if (!inBounds(tr, tc) || !inBounds(mr, mc)) continue
      const mid = currBoard[mr][mc]
      if (!mid || mid.player === currBoard[cr][cc]!.player) continue
      if (currBoard[tr][tc] !== null) continue

      const next = cloneBoard(currBoard)
      next[tr][tc] = next[cr][cc]
      next[cr][cc] = null
      next[mr][mc] = null

      const further = dfs(next, tr, tc)
      if (further.length === 0) {
        localResults.push({ to: [tr, tc], captures: [[mr, mc]] })
      } else {
        for (const f of further) {
          localResults.push({ to: f.to, captures: [[mr, mc], ...f.captures] })
        }
      }
    }
    return localResults
  }

  const seqs = dfs(board, r, c)
  return seqs.map(s => ({ from: [r, c], to: s.to, captures: s.captures }))
}

export function getCapturesFrom(board: Board, r: number, c: number): Move[] {
  return genCapturesFrom(board, r, c)
}

// Generate all valid moves for a player. If any capture exists, only returns capture moves (forced capture rule).
export function generateValidMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = []
  const captureMoves: Move[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece || piece.player !== player) continue
      const caps = genCapturesFrom(board, r, c)
      if (caps.length > 0) captureMoves.push(...caps)
      else moves.push(...genSimpleMoves(board, r, c))
    }
  }
  if (captureMoves.length > 0) {
    // prefer longest capture sequences
    let maxCaptures = 0
    for (const m of captureMoves) if ((m.captures?.length || 0) > maxCaptures) maxCaptures = m.captures!.length
    return captureMoves.filter(m => (m.captures?.length || 0) === maxCaptures)
  }
  return moves
}

export function applyMove(board: Board, move: Move): Board {
  const copy = cloneBoard(board)
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  const piece = copy[fr][fc]
  if (!piece) return copy
  copy[tr][tc] = piece
  copy[fr][fc] = null
  if (move.captures) {
    for (const [cr, cc] of move.captures) copy[cr][cc] = null
  }
  // promotion en king
  if ((piece.player === 'white' && tr === 0) || (piece.player === 'black' && tr === 7)) {
    piece.isKing = true
  }
  return copy
}

export function hasAnyMoves(board: Board, player: Player): boolean {
  return generateValidMoves(board, player).length > 0
}

export function winner(board: Board): Player | 'draw' | null {
  const whitePieces = board.flat().filter(p => p && p.player === 'white').length
  const blackPieces = board.flat().filter(p => p && p.player === 'black').length
  if (whitePieces === 0) return 'black'
  if (blackPieces === 0) return 'white'
  const whiteMoves = hasAnyMoves(board, 'white')
  const blackMoves = hasAnyMoves(board, 'black')
  if (!whiteMoves && !blackMoves) return 'draw'
  if (!whiteMoves) return 'black'
  if (!blackMoves) return 'white'
  return null
}

