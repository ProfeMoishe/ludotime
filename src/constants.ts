import { PlayerColor } from './types';

export const BOARD_SIZE = 15;

export const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  green: '#22c55e',
};

export const START_POSITIONS: Record<number, number> = {
  0: 0,  // Red
  1: 13, // Blue
  2: 26, // Yellow
  3: 39, // Green
};

export const HOME_STRETCH_START = 51;
export const WIN_POSITION = 57;

// Grid coordinates for the path (0-51)
// This is a simplified mapping for a 15x15 grid
export const PATH_COORDS: [number, number][] = [
  // Red start area (bottom left-ish)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0]
];

// Home stretch coordinates for each player
export const HOME_STRETCHES: Record<number, [number, number][]> = {
  0: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]], // Red
  1: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]], // Blue
  2: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]], // Yellow
  3: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], // Green
};

// Base positions (where pieces stay when not in play)
export const BASE_POSITIONS: Record<number, [number, number][]> = {
  0: [[2, 2], [2, 3], [3, 2], [3, 3]], // Red
  1: [[2, 11], [2, 12], [3, 11], [3, 12]], // Blue
  2: [[11, 11], [11, 12], [12, 11], [12, 12]], // Yellow
  3: [[11, 2], [11, 3], [12, 2], [12, 3]], // Green
};
