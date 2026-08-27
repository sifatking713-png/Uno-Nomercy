'use client';

import React from 'react';
import { Player } from '@/game/types';
import { Shuffle, Layers, ShieldAlert } from 'lucide-react';

interface SwapTargetModalProps {
  isOpen: boolean;
  players: Player[];
  localPlayerId: string;
  onSelectTarget: (targetPlayerId: string) => void;
}

export const SwapTargetModal: React.FC<SwapTargetModalProps> = ({
  isOpen,
  players,
  localPlayerId,
  onSelectTarget,
}) => {
  if (!isOpen) return null;

  const validTargets = players.filter((p) => p.id !== localPlayerId && !p.isEliminated);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border-2 border-yellow-500/70 rounded-2xl p-6 text-center shadow-[0_0_45px_rgba(234,179,8,0.4)]">
        <div className="flex items-center justify-center gap-2 mb-2 text-yellow-400">
          <Shuffle className="w-7 h-7 animate-bounce" />
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">7-SWAP: STEAL A HAND!</h2>
        </div>
        <p className="text-xs text-zinc-300 mb-6">
          Choose an opponent to swap your entire hand with. Target someone with fewer cards to steal their lead!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {validTargets.map((player) => {
            const cardCount = player.hand.length;
            const isDangerouslyLow = cardCount <= 2;

            return (
              <button
                key={player.id}
                onClick={() => onSelectTarget(player.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-between gap-3 ${
                  isDangerouslyLow
                    ? 'border-yellow-400 bg-yellow-950/40 hover:bg-yellow-900/60 shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-105'
                    : 'border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 hover:border-zinc-500 hover:scale-102'
                }`}
              >
                {isDangerouslyLow && (
                  <span className="absolute -top-2.5 bg-yellow-500 text-black font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    BEST TARGET!
                  </span>
                )}

                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 border-2 border-white/40 flex items-center justify-center text-xl font-black text-white shadow-md">
                  {player.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="text-center">
                  <div className="font-bold text-white text-sm truncate max-w-[120px]">{player.name}</div>
                  <div className="text-[11px] text-zinc-400">{player.title}</div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-white/10">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-base font-black text-white">{cardCount}</span>
                  <span className="text-[10px] text-zinc-400 uppercase">Cards</span>
                </div>

                <div className="w-full py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-extrabold text-xs uppercase tracking-wider border border-yellow-500/30">
                  SWAP NOW
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
