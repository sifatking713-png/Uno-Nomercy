'use client';

import React, { useEffect, useState } from 'react';
import { CardColor } from '@/game/types';
import { COLOR_CONFIG } from '@/game/cards';
import { soundManager } from '@/game/audio';
import { Sparkles } from 'lucide-react';

interface RouletteModalProps {
  isOpen: boolean;
  activeColor?: CardColor;
  onFinish?: () => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  activeColor = 'crimson',
  onFinish,
}) => {
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const colors: CardColor[] = ['crimson', 'cobalt', 'emerald', 'sunburst'];

  useEffect(() => {
    if (!isOpen) {
      setIsFinished(false);
      return;
    }

    setIsFinished(false);
    let step = 0;
    const totalSteps = 24 + colors.indexOf(activeColor); // Spin ~3 full rounds then land
    let speed = 60; // ms

    const spinInterval = () => {
      setCurrentHighlightIndex((prev) => (prev + 1) % colors.length);
      soundManager.playRouletteTick(500 + (step % 4) * 100);
      step++;

      if (step < totalSteps) {
        speed += 12; // Gradual slowdown
        setTimeout(spinInterval, speed);
      } else {
        setIsFinished(true);
        soundManager.playCardPlay(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 1200);
      }
    };

    const timer = setTimeout(spinInterval, speed);
    return () => clearTimeout(timer);
  }, [isOpen, activeColor]);

  if (!isOpen) return null;

  const winningConfig = COLOR_CONFIG[activeColor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-purple-500/70 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
        <div className="flex items-center justify-center gap-2 mb-2 text-yellow-400">
          <Sparkles className="w-6 h-6 animate-spin" />
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">Color Roulette</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-6">The wheel is spinning fate for all players!</p>

        {/* 4-quadrant Roulette wheel */}
        <div className="relative w-48 h-48 mx-auto mb-6 rounded-full p-2 bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2 w-full h-full rounded-full overflow-hidden p-1">
            {colors.map((c, i) => {
              const cfg = COLOR_CONFIG[c];
              const isSelected = i === currentHighlightIndex;

              return (
                <div
                  key={c}
                  className={`rounded-2xl transition-all duration-100 flex items-center justify-center font-black text-xs text-white uppercase shadow-md ${
                    isSelected
                      ? `scale-110 z-20 ring-4 ring-white shadow-[0_0_25px_${cfg.glow}] bg-gradient-to-br ${cfg.bgGradient}`
                      : `opacity-30 bg-gradient-to-br ${cfg.bgGradient}`
                  }`}
                >
                  {c.slice(0, 3)}
                </div>
              );
            })}
          </div>
        </div>

        {isFinished ? (
          <div className="animate-bounce">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">SELECTED COLOR:</span>
            <div className={`text-2xl font-black uppercase ${winningConfig.textColor} drop-shadow-md`}>
              {winningConfig.name}!
            </div>
          </div>
        ) : (
          <div className="text-sm font-extrabold text-purple-300 animate-pulse uppercase tracking-widest">
            Spinning...
          </div>
        )}
      </div>
    </div>
  );
};
