import create from 'zustand'
import { Board, Player, Move } from '../engine/types'
import { createInitialBoard, applyMove, generateValidMoves, getCapturesFrom } from '../engine/rules'
import { findBestMove } from '../ai/minimax'

type State = {
    board: Board
    turn: Player
    history: Board[]
    selected: [number, number] | null
    aiThinking: boolean
    autoAiTimer: number | null
    autoAiCountdown: number
    reset: () => void
    select: (pos: [number, number] | null) => void
    makeMove: (move: Move) => void
    getValidMovesForSelected: () => Move[]
    aiMove: (depth?: number) => void
    startAutoAiTimer: () => void
    clearAutoAiTimer: () => void
}

export const useGameStore = create<State>((set, get) => ({
    board: createInitialBoard(),
    turn: 'white',
    history: [],
    selected: null,
    aiThinking: false,
    autoAiTimer: null,
    autoAiCountdown: 0,
    reset: () => {
        const state = get()
        if (state.autoAiTimer) {
            clearInterval(state.autoAiTimer)
        }
        set({ board: createInitialBoard(), turn: 'white', history: [], selected: null, autoAiTimer: null, autoAiCountdown: 0 })
    },
    select: pos => set({ selected: pos }),
    makeMove: move => {
        const state = get()
        console.log('[makeMove] player', state.turn, 'move', move)
        const next = applyMove(state.board, move)
        const player = state.turn

        // after a capture, check if further captures exist from landing square for the same piece
        let willContinue = false
        let further: any[] = []
        if (move.captures && move.captures.length > 0) {
            const landing = move.to
            further = getCapturesFrom(next, landing[0], landing[1])
            console.log('[makeMove] captures, further captures from', landing, 'count', further.length)
            if (further.length > 0) willContinue = true
        }

        const newState: any = {
            board: next,
            history: state.history.concat([state.board]),
            turn: willContinue ? player : (state.turn === 'white' ? 'black' : 'white'),
            selected: willContinue ? move.to : null,
        }
        set(newState)

        // Si le tour passe aux noirs (IA) et qu'il n'y a pas de continuation forcée, démarrer le délai automatique
        if (!willContinue && newState.turn === 'black') {
            const store = get()
            store.startAutoAiTimer()
        }

        // If there's exactly one forced continuation, auto-play it after a short delay
        if (willContinue && further.length === 1) {
            setTimeout(() => {
                const cur = get()
                // ensure turn hasn't changed and piece still there
                if (cur.turn === player) {
                    const nextMove = further[0]
                    // call makeMove from store
                    cur.makeMove(nextMove)
                }
            }, 100)
        }
    },
    getValidMovesForSelected: () => {
        const state = get()
        if (!state.selected) return []
        const moves = generateValidMoves(state.board, state.turn)
        return moves.filter(m => m.from[0] === state.selected![0] && m.from[1] === state.selected![1])
    },
    aiMove: (depth = 2) => {
        // Nettoyer le timer automatique avant de jouer
        const state = get()
        state.clearAutoAiTimer()
        
        // run AI until it's no longer black's turn
        set({ aiThinking: true })
        try {
            let guard = 0
            while (true) {
                const state = get()
                if (state.turn !== 'black') break
                if (++guard > 20) { console.warn('[aiMove] guard break after 20 iterations'); break }
                console.log('[aiMove] computing best move, depth', depth)
                const move = findBestMove(state.board, 'black', depth, { timeLimitMs: 1000, maxNodes: 20000 })
                if (!move) { console.log('[aiMove] no move found for black'); break }
                console.log('[aiMove] best move', move)
                // use the store's makeMove so continuation logic is consistent
                const make = get().makeMove
                make(move)
            }
        } finally {
            set({ aiThinking: false })
        }
    },
    startAutoAiTimer: () => {
        const state = get()
        // Nettoyer tout timer existant
        if (state.autoAiTimer) {
            clearInterval(state.autoAiTimer)
        }
        
        let countdown = 5
        set({ autoAiCountdown: countdown })
        
        const timer = setInterval(() => {
            countdown--
            set({ autoAiCountdown: countdown })
            
            if (countdown <= 0) {
                clearInterval(timer)
                const currentState = get()
                // Vérifier que c'est toujours le tour des noirs avant de jouer
                if (currentState.turn === 'black' && !currentState.aiThinking) {
                    currentState.aiMove(2)
                }
                set({ autoAiTimer: null, autoAiCountdown: 0 })
            }
        }, 1000)
        
        set({ autoAiTimer: timer })
    },
    clearAutoAiTimer: () => {
        const state = get()
        if (state.autoAiTimer) {
            clearInterval(state.autoAiTimer)
            set({ autoAiTimer: null, autoAiCountdown: 0 })
        }
    }
}))
