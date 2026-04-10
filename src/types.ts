export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export interface Player {
  uid: string;
  name: string;
  color: PlayerColor;
  index: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  players: Player[];
  pieces: Record<string, number>; // key: "playerIndex_pieceIndex", value: position (-1 for home, 0-51 for path, 52-57 for home stretch)
  turn: number;
  diceValue: number;
  diceRolled: boolean;
  status: GameStatus;
  winner: string | null;
  lastMoveAt: string;
}
