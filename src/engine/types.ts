export type Player = 'white' | 'black'

export type Piece = {
  id: string
  player: Player
  isKing: boolean
}

export type Board = (Piece | null)[][]

export type Move = {
  from: [number, number]
  to: [number, number]
  captures?: [number, number][]
}
