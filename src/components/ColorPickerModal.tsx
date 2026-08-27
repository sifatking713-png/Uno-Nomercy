'use client';

import React from 'react';
import { CardColor } from '@/game/types';
import { COLOR_CONFIG } from '@/game/cards';
import { Sparkles } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
  bannedColor?: CardColor;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onSelectColor,
  bannedColor,
}) => {
  if (!isOpen) return null;

  const colors: CardColor[] = ['crimson', 'cobalt', 'emerald', 'sunburst'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-purple-500/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        <div className="flex items-center justify-center gap-2 mb-2 text-purple-400">
          <Sparkles className="w-6 h-6 animate-spin" />
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">Choose Active Color</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-6">Select the new dominant suit for the arena table</p>

        <div className="grid grid-cols-2 gap-4">
          {colors.map((color) => {
            const config = COLOR_CONFIG[color];
            const isBanned = color === bannedColor;

            return (
              <button
                key={color}
                disabled={isBanned}
                onClick={() => onSelectColor(color)}
                className={`relative py-6 px-4 rounded-xl font-black text-lg text-white uppercase tracking-wider shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isBanned
                    ? 'opacity-30 bg-zinc-800 border-2 border-red-500/40 cursor-not-allowed'
                    : `bg-gradient-to-br ${config.bgGradient} hover:scale-105 active:scale-95 ring-2 ring-white/20 hover:ring-white/80 shadow-[0_0_15px_${config.glow}]`
                }`}
              >
                <span>{config.name}</span>
                {isBanned && <span className="text-[10px] text-red-400 font-bold tracking-normal bg-red-950/80 px-2 py-0.5 rounded">BANNED BY DISRUPTION</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
