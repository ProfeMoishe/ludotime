import React from 'react';
import { motion } from 'motion/react';
import { PlayerColor, GameState } from '../types';
import { BOARD_SIZE, COLOR_MAP, PATH_COORDS, HOME_STRETCHES, BASE_POSITIONS } from '../constants';

interface LudoBoardProps {
  gameState: GameState;
  onPieceClick: (playerIndex: number, pieceIndex: number) => void;
  currentPlayerIndex: number | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({ gameState, onPieceClick, currentPlayerIndex }) => {
  const renderCell = (r: number, c: number) => {
    // Determine cell color/type
    let bgColor = 'bg-white';
    let border = 'border border-gray-200';

    // Home areas
    if (r < 6 && c < 6) bgColor = 'bg-red-100';
    if (r < 6 && c > 8) bgColor = 'bg-blue-100';
    if (r > 8 && c > 8) bgColor = 'bg-yellow-100';
    if (r > 8 && c < 6) bgColor = 'bg-green-100';

    // Center area
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) bgColor = 'bg-gray-100';

    // Home stretches
    if (r === 7 && c > 0 && c < 7) bgColor = 'bg-red-500';
    if (c === 7 && r > 0 && r < 7) bgColor = 'bg-blue-500';
    if (r === 7 && c > 7 && c < 14) bgColor = 'bg-yellow-500';
    if (c === 7 && r > 7 && r < 14) bgColor = 'bg-green-500';

    // Start positions
    if (r === 6 && c === 1) bgColor = 'bg-red-500';
    if (r === 1 && c === 8) bgColor = 'bg-blue-500';
    if (r === 8 && c === 13) bgColor = 'bg-yellow-500';
    if (r === 13 && c === 6) bgColor = 'bg-green-500';

    return (
      <div
        key={`${r}-${c}`}
        className={`w-full h-full ${bgColor} ${border} relative flex items-center justify-center`}
      />
    );
  };

  const getPieceCoords = (playerIndex: number, pieceIndex: number, position: number): [number, number] => {
    if (position === -1) {
      return BASE_POSITIONS[playerIndex][pieceIndex];
    }
    if (position <= 51) {
      // Offset position based on player start
      const offset = [0, 13, 26, 39][playerIndex];
      const actualPos = (position + offset) % 52;
      return PATH_COORDS[actualPos];
    }
    // Home stretch
    const stretchPos = position - 52;
    return HOME_STRETCHES[playerIndex][stretchPos];
  };

  return (
    <div className="relative w-full max-w-[600px] aspect-square bg-white shadow-2xl rounded-lg overflow-hidden border-8 border-gray-800">
      {/* Grid Background */}
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full">
        {Array.from({ length: BOARD_SIZE }).map((_, r) =>
          Array.from({ length: BOARD_SIZE }).map((_, c) => renderCell(r, c))
        )}
      </div>

      {/* Center Logo */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-white border-4 border-gray-800 flex items-center justify-center z-10 rotate-45">
        <div className="text-gray-800 font-bold -rotate-45 text-xl">LUDO</div>
      </div>

      {/* Pieces */}
      {Object.entries(gameState.pieces).map(([key, position]) => {
        const [pIdxStr, pieceIdxStr] = key.split('_');
        const pIdx = parseInt(pIdxStr);
        const pieceIdx = parseInt(pieceIdxStr);
        const pos = position as number;
        const [r, c] = getPieceCoords(pIdx, pieceIdx, pos);
        const color = gameState.players[pIdx]?.color || 'red';
        const isCurrentTurn = pIdx === gameState.turn;
        const isMyPiece = pIdx === currentPlayerIndex;
        const canMove = isCurrentTurn && isMyPiece && gameState.diceRolled;

        return (
          <motion.div
            key={key}
            layoutId={key}
            initial={false}
            animate={{
              top: `${(r / BOARD_SIZE) * 100}%`,
              left: `${(c / BOARD_SIZE) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`absolute w-[6.66%] h-[6.66%] p-1 z-20 cursor-pointer`}
            onClick={() => onPieceClick(pIdx, pieceIdx)}
          >
            <div
              className={`w-full h-full rounded-full shadow-lg border-2 border-white flex items-center justify-center
                ${canMove ? 'ring-4 ring-white animate-pulse' : ''}
              `}
              style={{ backgroundColor: COLOR_MAP[color] }}
            >
              <div className="w-2 h-2 bg-white/30 rounded-full" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
