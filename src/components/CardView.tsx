'use client';

import React from 'react';
import { Card, CardColor } from '@/game/types';
import { COLOR_CONFIG } from '@/game/cards';
import { ArrowLeftRight, Ban, FastForward, Flame, Layers, RefreshCw, Shuffle, Sparkles, Zap } from 'lucide-react';

interface CardViewProps {
  card: Card;
  isPlayable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  cardBackTheme?: string;
  isFaceDown?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isPlayable = false,
  onClick,
  size = 'md',
  cardBackTheme = 'cardback_classic_dark',
  isFaceDown = false,
  disabled = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-18 text-xs',
    md: 'w-18 h-26 text-sm sm:w-20 sm:h-28',
    lg: 'w-24 h-36 text-base sm:w-28 sm:h-42',
    xl: 'w-32 h-48 text-lg sm:w-36 sm:h-54',
  }[size];

  if (isFaceDown) {
    return (
      <div
        className={`relative select-none rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-neutral-900 via-zinc-900 to-black shadow-lg shadow-black/60 flex items-center justify-center overflow-hidden transition-all duration-200 ${sizeClasses} ${className}`}
      >
        <div className="absolute inset-1 rounded-lg border border-indigo-500/20 bg-gradient-to-tr from-purple-950/40 via-transparent to-indigo-900/40 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center opacity-70">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="text-[8px] font-black tracking-widest text-indigo-300">NO MERCY</span>
          </div>
        </div>
      </div>
    );
  }

  const colorConfig = COLOR_CONFIG[card.color] || COLOR_CONFIG.wild;

  // Render Card Icon / Center Display
  const renderCardContent = () => {
    if (card.type === 'number') {
      if (card.value === 0) {
        return (
          <div className="flex flex-col items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-tighter text-amber-200 mt-0.5">PASS ALL</span>
          </div>
        );
      }
      if (card.value === 7) {
        return (
          <div className="flex flex-col items-center justify-center">
            <Shuffle className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-yellow-300 mt-0.5">SWAP 7</span>
          </div>
        );
      }
      return (
        <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
          {card.value}
        </span>
      );
    }

    if (card.type === 'skip') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Ban className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md" />
          <span className="text-[9px] font-extrabold tracking-wider text-white">SKIP</span>
        </div>
      );
    }

    if (card.type === 'reverse') {
      return (
        <div className="flex flex-col items-center justify-center">
          <RefreshCw className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md" />
          <span className="text-[9px] font-extrabold tracking-wider text-white">REVERSE</span>
        </div>
      );
    }

    if (card.type === 'draw_two') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">+2</span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/90">DRAW</span>
        </div>
      );
    }

    if (card.type === 'draw_four') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">+4</span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-200">STACK</span>
        </div>
      );
    }

    if (card.type === 'discard_all') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" />
          <span className="text-[8px] font-black tracking-tighter text-yellow-200 text-center uppercase">DISCARD ALL</span>
        </div>
      );
    }

    if (card.type === 'skip_everyone') {
      return (
        <div className="flex flex-col items-center justify-center">
          <FastForward className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-md" />
          <span className="text-[8px] font-black uppercase text-center text-white">SKIP ALL</span>
        </div>
      );
    }

    // WILD CARDS
    if (card.type === 'wild_reverse_draw_four') {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1">
            <RefreshCw className="w-4 h-4 text-purple-200" />
            <span className="text-xl sm:text-2xl font-black text-white">+4</span>
          </div>
          <span className="text-[8px] font-black text-purple-200 uppercase">REV DRAW</span>
        </div>
      );
    }

    if (card.type === 'wild_draw_six') {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-amber-300" />
            <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">+6</span>
          </div>
          <span className="text-[8px] font-black text-purple-200 uppercase">WILD +6</span>
        </div>
      );
    }

    if (card.type === 'wild_draw_ten') {
      return (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <div className="flex items-center justify-center gap-0.5">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-2xl sm:text-3xl font-black text-red-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]">+10</span>
          </div>
          <span className="text-[8px] font-black text-yellow-300 tracking-tighter uppercase">OVERKILL</span>
        </div>
      );
    }

    if (card.type === 'wild_color_roulette') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-[8px] font-black uppercase tracking-tighter text-yellow-200">ROULETTE</span>
        </div>
      );
    }

    return null;
  };

  const playableAura = isPlayable
    ? 'cursor-pointer hover:-translate-y-3 hover:scale-105 ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.85)] z-20'
    : disabled
    ? 'opacity-40 grayscale-[40%] cursor-not-allowed'
    : 'opacity-85 hover:opacity-100 cursor-default';

  return (
    <div
      onClick={isPlayable && !disabled ? onClick : undefined}
      style={{
        borderColor: colorConfig.borderHex,
      }}
      className={`relative select-none rounded-xl border-2 bg-gradient-to-br ${colorConfig.bgGradient} shadow-md transition-all duration-200 flex flex-col items-center justify-between p-1 overflow-hidden ${sizeClasses} ${playableAura} ${className}`}
    >
      {/* Corner indicators */}
      <div className="w-full flex items-center justify-between px-1 text-[10px] font-black text-white/90">
        <span>{card.drawAmount ? `+${card.drawAmount}` : card.value !== undefined ? card.value : '★'}</span>
        <span className="text-[8px] uppercase tracking-wider opacity-75">{card.color === 'wild' ? 'W' : card.color[0].toUpperCase()}</span>
      </div>

      {/* Center Oval graphic */}
      <div className="relative my-auto flex items-center justify-center w-full py-1">
        <div className="absolute inset-0 mx-auto w-[86%] h-full rounded-full bg-black/35 backdrop-blur-[1px] border border-white/20 transform -rotate-12" />
        <div className="relative z-10 flex items-center justify-center">
          {renderCardContent()}
        </div>
      </div>

      {/* Bottom Corner indicator */}
      <div className="w-full flex items-center justify-between px-1 text-[10px] font-black text-white/90 transform rotate-180">
        <span>{card.drawAmount ? `+${card.drawAmount}` : card.value !== undefined ? card.value : '★'}</span>
        <span className="text-[8px] uppercase tracking-wider opacity-75">{card.color === 'wild' ? 'W' : card.color[0].toUpperCase()}</span>
      </div>
    </div>
  );
};
