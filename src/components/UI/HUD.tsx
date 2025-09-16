import React from 'react'
import { useGameStore } from '../../store/useGameStore'
import { winner as getWinner } from '../../engine/rules'

export default function HUD() {
  const board = useGameStore(s => s.board)
  const turn = useGameStore(s => s.turn)
  const aiMove = useGameStore(s => s.aiMove)
  const aiThinking = useGameStore(s => s.aiThinking)

  const winner = getWinner(board)

  let white = 0
  let black = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      if (p.player === 'white') white++
      else black++
    }
  }

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 8 }}>
        <strong>Tour:</strong> <span>{turn}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ background: '#222', padding: 8, borderRadius: 6 }}>
          <div style={{ color: '#fff' }}>Blancs</div>
          <div style={{ fontSize: 18 }}>{white}</div>
        </div>
        <div style={{ background: '#222', padding: 8, borderRadius: 6 }}>
          <div style={{ color: '#fff' }}>Noirs</div>
          <div style={{ fontSize: 18 }}>{black}</div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => aiMove(2)} disabled={aiThinking || !!winner}>AI joue (noir)</button>
        <button onClick={() => useGameStore.getState().reset()} disabled={aiThinking}>Nouvelle partie</button>
        {aiThinking && <span style={{ marginLeft: 8 }}>Thinking...</span>}
      </div>
      {winner && (
        <div style={{ marginTop: 12, background: '#0008', padding: 10, borderRadius: 6 }}>
          <strong style={{ fontSize: 16 }}>
            {winner === 'draw' ? 'Match nul' : (winner === 'white' ? 'Blancs ont gagné !' : 'Noirs ont gagné !')}
          </strong>
        </div>
      )}
    </div>
  )
}
