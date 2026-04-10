import React from 'react';
import { motion } from 'motion/react';

interface DiceProps {
  value: number;
  onRoll: () => void;
  disabled: boolean;
  rolling: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, onRoll, disabled, rolling }) => {
  const renderDots = (val: number) => {
    const dots = [];
    const positions = [
      [],
      [4], // 1
      [0, 8], // 2
      [0, 4, 8], // 3
      [0, 2, 6, 8], // 4
      [0, 2, 4, 6, 8], // 5
      [0, 2, 3, 5, 6, 8], // 6
    ];

    for (let i = 0; i < 9; i++) {
      if (positions[val].includes(i)) {
        dots.push(<div key={i} className="w-2 h-2 bg-gray-800 rounded-full" />);
      } else {
        dots.push(<div key={i} />);
      }
    }
    return dots;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={rolling ? {
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.2, 1],
        } : {}}
        transition={rolling ? { repeat: Infinity, duration: 0.5 } : {}}
        className={`w-16 h-16 bg-white rounded-xl shadow-xl border-2 border-gray-200 grid grid-cols-3 grid-rows-3 p-2 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}
        `}
        onClick={!disabled && !rolling ? onRoll : undefined}
      >
        {renderDots(value || 1)}
      </motion.div>
      <button
        disabled={disabled || rolling}
        onClick={onRoll}
        className={`px-6 py-2 rounded-full font-bold text-white transition-all
          ${disabled || rolling ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'}
        `}
      >
        {rolling ? 'Lanzando...' : 'Lanzar Dado'}
      </button>
    </div>
  );
};
