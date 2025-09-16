import React, { useMemo } from 'react'
import { useGameStore } from '../../store/useGameStore'

function Square({ r, c, color, onClick }: { r: number; c: number; color: string; onClick: () => void }) {
  return (
    <mesh position={[c - 3.5, 0, r - 3.5]} onClick={onClick}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function PieceMesh({ r, c, player, isKing }: { r: number; c: number; player: string; isKing: boolean }) {
  const color = player === 'white' ? '#fff' : '#111'
  return (
    <mesh position={[c - 3.5, 0.2, r - 3.5]}>
      <cylinderGeometry args={[0.35, 0.35, 0.3, 24]} />
      <meshStandardMaterial color={color} metalness={0.3} />
      {isKing && (
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.2, 0.15, 16]} />
          <meshStandardMaterial color={player === 'white' ? '#ff0' : '#ff0'} />
        </mesh>
      )}
    </mesh>
  )
}

export default function Board() {
  const board = useGameStore(state => state.board)
  const turn = useGameStore(state => state.turn)
  const select = useGameStore(state => state.select)
  const selected = useGameStore(state => state.selected)
  const getValidMovesForSelected = useGameStore(state => state.getValidMovesForSelected)
  const makeMove = useGameStore(state => state.makeMove)

  const highlights = useMemo(() => {
    const moves = getValidMovesForSelected()
    return moves.map(m => `${m.to[0]}-${m.to[1]}`)
  }, [selected, board])

  const squares: JSX.Element[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1
      const key = `${r}-${c}`
      const isHighlighted = highlights.includes(key)
      squares.push(
        <Square
          key={key}
          r={r}
          c={c}
          color={isHighlighted ? '#505dbf' : isDark ? '#0b42a7' : '#eee'}
          onClick={() => {
            // if selected and move exists to this square, perform move
            const moves = getValidMovesForSelected()
            const m = moves.find(mm => mm.to[0] === r && mm.to[1] === c)
            console.log('[Board] click', { r, c, selected })
            if (m) {
              console.log('[Board] applying move', m)
              makeMove(m)
            } else select([r, c])
          }}
        />
      )
    }
  }

  const pieces: JSX.Element[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (p) pieces.push(<PieceMesh key={`p-${r}-${c}`} r={r} c={c} player={p.player} isKing={p.isKing} />)
    }
  }

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#072b4d" />
      </mesh>
      {squares}
      {pieces}
    </group>
  )
}
