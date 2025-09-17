import React from 'react'
import { useGameStore } from '../../store/useGameStore'
import { winner as getWinner } from '../../engine/rules'

export default function HUD() {
    const board = useGameStore(s => s.board)
    const turn = useGameStore(s => s.turn)
    const aiThinking = useGameStore(s => s.aiThinking)
    const autoAiCountdown = useGameStore(s => s.autoAiCountdown)

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
        <div style={{ position: 'absolute', left: 12, top: 60, color: '#ffffff', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: 8 }}>
                <div style={{ background: '#000', padding: '6px 10px', borderRadius: 6, display: 'inline-block' }}>
                    <strong style={{ marginRight: 6 }}>Tour:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{turn}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ background: '#222', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: '#fff', boxShadow: '0 2px 4px #0008' }}>Blancs</div>
                    <div style={{ fontSize: 18 }}>{white}</div>
                </div>
                <div style={{ background: '#222', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: '#fff', boxShadow: '0 2px 4px #0008' }}>Noirs</div>
                    <div style={{ fontSize: 18 }}>{black}</div>
                </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button 
                    style={{ background: '#161616', color: "#74ff03", padding: 8, borderRadius: 6, cursor: "pointer", boxShadow: '0 2px 4px #0008' }} 
                    onClick={() => useGameStore.getState().reset()} 
                    disabled={aiThinking}
                >
                    Nouvelle partie
                </button>
                {aiThinking && <span style={{ marginLeft: 8 }}>Thinking...</span>}
                {autoAiCountdown > 0 && turn === 'black' && (
                    <div style={{ 
                        background: '#ff6b35', 
                        color: '#fff', 
                        padding: '6px 10px', 
                        borderRadius: 6, 
                        fontSize: 14,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px #0008'
                    }}>
                        IA joue dans {autoAiCountdown}s
                    </div>
                )}
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
