'use client';

import React from 'react';
import { getCosmeticById } from '@/game/cosmetics';
import { Coins, Flame, Layers, Skull, Trophy } from 'lucide-react';

export interface PlayerCardProps {
  username: string;
  avatarId?: string;
  bannerId?: string;
  titleId?: string;
  coins?: number;
  trophies?: number;
  level?: number;
  cardCount?: number;
  isTurn?: boolean;
  turnTimeRemaining?: number;
  isDangerZone?: boolean; // Hand has >= 20 cards
  isEliminated?: boolean;
  eliminationReason?: string;
  isLocalPlayer?: boolean;
  hasCalledOneCard?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  className?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  username,
  avatarId = 'avatar_rookie_stacker',
  bannerId = 'banner_slate_clean',
  titleId = 'title_rookie',
  coins,
  trophies,
  level,
  cardCount,
  isTurn = false,
  turnTimeRemaining,
  isDangerZone = false,
  isEliminated = false,
  eliminationReason,
  isLocalPlayer = false,
  hasCalledOneCard = false,
  size = 'md',
  compact = false,
  className = '',
}) => {
  // Resolve cosmetic items from catalog
  const avatarItem = getCosmeticById(avatarId) || {
    id: 'avatar_default',
    name: 'Rookie',
    type: 'avatar' as const,
    gradient: 'from-slate-700 to-zinc-900',
    characterArtEmoji: '🧢',
    rarity: 'common' as const,
    price: 0,
    description: '',
    borderClass: 'border-white/30',
    glowClass: '',
  };

  const bannerItem = getCosmeticById(bannerId) || {
    id: 'banner_default',
    name: 'Slate Minimal',
    type: 'banner' as const,
    gradient: 'from-zinc-900 via-slate-900 to-zinc-950',
    rarity: 'common' as const,
    price: 0,
    description: '',
    glowClass: '',
  };

  // Title can be passed as ID or as literal text string
  const titleItem =
    getCosmeticById(titleId) ||
    (titleId.startsWith('title_') ? undefined : undefined);

  // Render title styling based on item or text
  const renderTitle = () => {
    const titleText = titleItem?.name || titleId || 'Rookie Stacker';
    const isGodly = titleItem?.rarity === 'godly' || titleText.includes('GOD') || titleText.includes('RAINBOW');
    const isLegendary = titleItem?.rarity === 'legendary' || titleText.includes('Executioner') || titleText.includes('Harbinger');
    const isEpic = titleItem?.rarity === 'epic';

    if (isGodly) {
      return (
        <span className="rainbow-animated-text font-black text-[10px] sm:text-xs tracking-wider uppercase drop-shadow">
          {titleText}
        </span>
      );
    }
    if (isLegendary) {
      return (
        <span className="text-amber-300 font-black text-[10px] sm:text-xs tracking-wide uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse">
          {titleText}
        </span>
      );
    }
    if (isEpic) {
      return (
        <span className="text-cyan-400 font-extrabold text-[10px] sm:text-xs tracking-wide uppercase animate-pulse">
          {titleText}
        </span>
      );
    }
    return (
      <span className="text-zinc-400 font-medium text-[10px] sm:text-[11px] truncate block max-w-[130px]">
        {titleText}
      </span>
    );
  };

  const sizeClasses = {
    sm: 'p-1.5 min-w-[120px] max-w-[170px]',
    md: 'p-2 sm:p-3 min-w-[150px] max-w-[240px]',
    lg: 'p-4 min-w-[240px] max-w-[360px]',
  }[size];

  const avatarSizeClass = {
    sm: 'w-8 h-8 text-base',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl',
  }[size];

  const bannerGradient = bannerItem.gradient || 'from-zinc-900 via-slate-900 to-zinc-950';

  return (
    <div
      className={`relative select-none rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-2 overflow-hidden shadow-lg ${
        isTurn && !isEliminated
          ? 'ring-2 ring-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-102 z-20'
          : isDangerZone && !isEliminated
          ? 'ring-2 ring-rose-500 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] z-20'
          : isEliminated
          ? 'border-zinc-800 opacity-40 grayscale bg-zinc-950/80'
          : 'border-zinc-700/80 hover:border-zinc-500'
      } bg-gradient-to-r ${bannerGradient} ${bannerItem.glowClass || ''} ${sizeClasses} ${className}`}
    >
      {/* Turn indicator badge */}
      {isTurn && !isEliminated && (
        <span className="absolute -top-2.5 right-3 bg-yellow-500 text-black font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse z-30 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
          TURN {turnTimeRemaining !== undefined ? `(${turnTimeRemaining}s)` : ''}
        </span>
      )}

      {/* Danger Zone (>= 20 cards) */}
      {isDangerZone && !isEliminated && (
        <span className="absolute -bottom-2 right-2 bg-rose-600 text-white font-black text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-full border border-white animate-bounce z-30 flex items-center gap-1 shadow-md">
          <Flame className="w-3 h-3 text-yellow-300" />
          DANGER {cardCount}/25
        </span>
      )}

      {/* Elimination overlay banner */}
      {isEliminated && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-30">
          <div className="flex items-center gap-1 text-rose-500 font-black text-[10px] sm:text-xs uppercase tracking-wider bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600/50">
            <Skull className="w-3 h-3" />
            ELIMINATED
          </div>
        </div>
      )}

      {/* LEFT: AVATAR WITH TIER FRAME */}
      <div className="relative shrink-0">
        <div
          className={`rounded-2xl bg-gradient-to-tr ${avatarItem.gradient} border-2 ${
            avatarItem.borderClass || 'border-white/30'
          } flex items-center justify-center shadow-md ${avatarSizeClass} ${
            avatarItem.glowClass || ''
          }`}
        >
          {avatarItem.characterArtEmoji ? (
            <span className="transform hover:scale-110 transition-transform">
              {avatarItem.characterArtEmoji}
            </span>
          ) : (
            <span className="font-black text-white">{username.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        {/* Level badge */}
        {level !== undefined && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black font-black text-[8px] px-1.5 py-0.2 rounded-full border border-black shadow">
            {level}
          </span>
        )}

        {/* 1-Card Alert Badge */}
        {hasCalledOneCard && !isEliminated && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.2 rounded-full border border-white animate-pulse">
            1 CARD
          </span>
        )}
      </div>

      {/* CENTER / DETAILS: NICKNAME + EQUIPPED TITLE */}
      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-[140px] drop-shadow-sm">
            {username}
          </span>
          {isLocalPlayer && (
            <span className="bg-yellow-500/20 text-yellow-400 text-[8px] font-black px-1 py-0.2 rounded border border-yellow-500/40">
              YOU
            </span>
          )}
        </div>

        <div>{renderTitle()}</div>

        {/* Coins or Trophies info (if provided) */}
        {!compact && (coins !== undefined || trophies !== undefined) && (
          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-zinc-300">
            {coins !== undefined && (
              <span className="flex items-center gap-0.5 text-amber-400">
                <Coins className="w-3 h-3" />
                {coins.toLocaleString()}
              </span>
            )}
            {trophies !== undefined && (
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Trophy className="w-3 h-3" />
                {trophies.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: CARD COUNT BADGE (FOR IN-MATCH HUD) */}
      {cardCount !== undefined && !isEliminated && (
        <div className="shrink-0 flex flex-col items-end justify-center pl-1">
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/60 border border-white/10 shadow-inner">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-black text-xs sm:text-sm text-white">
              {cardCount}
            </span>
          </div>
          <span className="text-[8px] font-bold uppercase text-zinc-400 mt-0.5">
            Cards
          </span>
        </div>
      )}
    </div>
  );
};
