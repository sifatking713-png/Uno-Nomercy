'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '@/game/types';
import { getTierById } from '@/game/lobbies';
import { getXpRequiredForLevel, UserProfile } from '@/lib/userService';
import { soundManager } from '@/game/audio';
import { Award, Coins, Flame, Play, Sparkles, Trophy, Tv, Undo2 } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  tierId: string;
  players: Player[];
  winnerId: string | null;
  placements: string[]; // [1st, 2nd, 3rd, 4th player ids]
  localPlayerId: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onWatchRewardedAdForDouble: () => Promise<void>;
  userProfile?: UserProfile;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  tierId,
  players,
  winnerId,
  placements,
  localPlayerId,
  onPlayAgain,
  onBackToLobby,
  onWatchRewardedAdForDouble,
  userProfile,
}) => {
  const [adDoubled, setAdDoubled] = useState<boolean>(false);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);

  const tier = getTierById(tierId);
  const localPlayer = players.find((p) => p.id === localPlayerId);

  // Determine local player placement (1, 2, 3, 4)
  let localRank = 4;
  if (winnerId === localPlayerId) {
    localRank = 1;
  } else {
    const idx = placements.indexOf(localPlayerId);
    if (idx !== -1) {
      localRank = idx + 1;
    } else {
      localRank = 4;
    }
  }

  const isWin = localRank === 1;

  useEffect(() => {
    if (isOpen) {
      if (isWin) {
        soundManager.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        soundManager.playMercyElimination();
      }
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  // Base earnings
  let baseCoins = localRank === 1 ? tier.payouts.first : localRank === 2 ? tier.payouts.second : localRank === 3 ? tier.payouts.third : tier.payouts.fourth;
  let baseXp = localRank === 1 ? tier.xpRewards.first : localRank === 2 ? tier.xpRewards.second : localRank === 3 ? tier.xpRewards.third : tier.xpRewards.fourth;
  let trophyDelta = localRank === 1 ? tier.trophyRewards.first : localRank === 2 ? tier.trophyRewards.second : localRank === 3 ? tier.trophyRewards.third : tier.trophyRewards.fourth;

  const currentCoins = adDoubled ? baseCoins * 2 : baseCoins;
  const currentXp = adDoubled ? baseXp * 2 : baseXp;

  const handleDoubleRewards = async () => {
    setIsAdLoading(true);
    try {
      await onWatchRewardedAdForDouble();
      setAdDoubled(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: '1ST PLACE - VICTORY!', color: 'bg-yellow-500 text-black', icon: '👑' };
    if (rank === 2) return { text: '2ND PLACE - RUNNER UP', color: 'bg-slate-300 text-black', icon: '🥈' };
    if (rank === 3) return { text: '3RD PLACE - SURVIVED', color: 'bg-amber-700 text-white', icon: '🥉' };
    return { text: '4TH PLACE - ELIMINATED', color: 'bg-rose-900 text-rose-200', icon: '💀' };
  };

  const badge = getRankBadge(localRank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-zinc-700 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)] my-auto">
        {/* Banner */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md ${badge.color}`}>
            <span>{badge.icon}</span>
            {badge.text}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2 drop-shadow-md">
            {isWin ? 'SHOWED NO MERCY!' : 'MATCH CONCLUDED'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">{tier.name} • {tier.badge}</p>
        </div>

        {/* Standings List with Composite Badges */}
        <div className="bg-zinc-950/80 rounded-2xl p-3 border border-zinc-800 mb-5 text-left space-y-2">
          {players.map((p) => {
            const isWinner = p.id === winnerId;
            const rank = isWinner ? 1 : placements.indexOf(p.id) !== -1 ? placements.indexOf(p.id) + 1 : 4;
            const isMe = p.id === localPlayerId;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  isMe
                    ? 'border-yellow-500/50 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                    : 'border-zinc-800 bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 text-center font-black text-sm text-zinc-400 shrink-0">#{rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs text-white flex items-center gap-1.5 truncate">
                      {p.name}
                      {isMe && <span className="text-[9px] bg-yellow-500 text-black px-1.5 rounded font-black">YOU</span>}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {p.isEliminated ? p.eliminationReason || 'Mercy Rule Eliminated' : isWinner ? 'Emptied Hand First' : 'Survived'}
                    </div>
                  </div>
                </div>

                <div className="text-right pl-2 shrink-0">
                  <span className="font-mono text-xs text-zinc-400">{p.hand.length} cards</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rewards Section */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Coins className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-400">Coins</span>
            <span className={`text-xl font-black ${currentCoins >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              +{currentCoins}
            </span>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-400">Trophies</span>
            <span className={`text-xl font-black ${trophyDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trophyDelta >= 0 ? `+${trophyDelta}` : trophyDelta}
            </span>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-400">XP</span>
            <span className="text-xl font-black text-cyan-400">+{currentXp}</span>
          </div>
        </div>

        {/* CrazyGames Rewarded Ad 2x Multiplier Button */}
        {!adDoubled && (
          <button
            onClick={handleDoubleRewards}
            disabled={isAdLoading}
            className="w-full mb-5 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-200 transform hover:scale-102 active:scale-98"
          >
            <Tv className="w-5 h-5 text-yellow-200 animate-pulse" />
            {isAdLoading ? 'Loading Ad...' : 'WATCH AD TO 2X ALL REWARDS! (FREE)'}
          </button>
        )}

        {adDoubled && (
          <div className="w-full mb-5 py-2 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            REWARDS DOUBLED BY 2X VIA CRAZYGAMES REWARDED AD!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-zinc-700"
          >
            <Undo2 className="w-4 h-4" />
            Lobby
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all hover:scale-102 active:scale-98"
          >
            <Play className="w-4 h-4 fill-black" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
