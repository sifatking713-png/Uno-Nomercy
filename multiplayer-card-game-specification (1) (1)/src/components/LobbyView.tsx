'use client';

import React, { useState } from 'react';
import { LOBBY_TIERS, getRankDetails } from '@/game/lobbies';
import { UserProfile } from '@/lib/userService';
import { PlayerCard } from './PlayerCard';
import { Award, Coins, Edit3, Flame, Play, Plus, RefreshCw, Shield, Sparkles, Trophy, Users, Zap } from 'lucide-react';

interface LobbyViewProps {
  userProfile: UserProfile;
  onStartMatch: (tierId: string) => void;
  onOpenRules: () => void;
  onOpenQuests: () => void;
  onOpenNicknameModal: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  userProfile,
  onStartMatch,
  onOpenRules,
  onOpenQuests,
  onOpenNicknameModal,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('rookie_10');
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState<number>(3);
  const [customRoomCode, setCustomRoomCode] = useState<string>('');

  const rankInfo = getRankDetails(userProfile.trophies);
  const selectedTier = LOBBY_TIERS.find((t) => t.id === selectedTierId) || LOBBY_TIERS[0];

  const handleQuickMatch = () => {
    if (userProfile.coins < selectedTier.entryFee) {
      alert(`You need at least ${selectedTier.entryFee} coins to enter this tier! Claim daily rewards or play Free Practice.`);
      return;
    }

    setIsMatchmaking(true);
    let count = 3;
    setMatchmakingCountdown(count);

    const interval = setInterval(() => {
      count--;
      setMatchmakingCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsMatchmaking(false);
        onStartMatch(selectedTierId);
      }
    }, 900);
  };

  const handleJoinCustomRoom = () => {
    if (!customRoomCode.trim()) {
      alert('Please enter a 6-character room code!');
      return;
    }
    onStartMatch(selectedTierId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-5 animate-fadeIn font-sans">
      {/* COMPOSITED USER PROFILE HERO CARD */}
      <div className="relative rounded-3xl bg-zinc-900/90 border-2 border-zinc-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Reusable Composite PlayerCard representing user's full equipped cosmetics */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <PlayerCard
              username={userProfile.username}
              avatarId={userProfile.avatar}
              bannerId={userProfile.banner}
              titleId={userProfile.title}
              coins={userProfile.coins}
              trophies={userProfile.trophies}
              level={userProfile.level}
              size="lg"
              className="w-full sm:w-auto"
            />

            {/* Edit Nickname Button */}
            <button
              onClick={onOpenNicknameModal}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-yellow-400 border border-zinc-700 transition-colors shrink-0"
              title="Change Display Name"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Bar & Rank Status */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end w-full md:w-auto">
            <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xl">{rankInfo.badgeIcon}</span>
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400">Competitive Rank</div>
                <div className={`text-xs font-black ${rankInfo.color}`}>{rankInfo.tierName}</div>
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 rounded-2xl flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400">Arena Victories</div>
                <div className="text-xs font-black text-white">{userProfile.gamesWon} Wins</div>
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 rounded-2xl flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400">Mercy Eliminations</div>
                <div className="text-xs font-black text-amber-300">{userProfile.mercyEliminations} KOs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIER SELECTION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" /> Choose Arena Stake Tier
          </h2>
          <button
            onClick={onOpenRules}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            Rules & Payout Guide
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LOBBY_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const canAfford = userProfile.coins >= tier.entryFee;
            const meetsLevel = userProfile.level >= tier.minLevel;

            return (
              <button
                key={tier.id}
                disabled={!meetsLevel}
                onClick={() => setSelectedTierId(tier.id)}
                className={`relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-yellow-400 bg-gradient-to-b from-yellow-950/40 via-zinc-900 to-zinc-950 shadow-[0_0_25px_rgba(250,204,21,0.35)] scale-102'
                    : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700'
                } ${!meetsLevel ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300">
                    {tier.badge}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="font-black text-sm text-white">{tier.name}</div>
                  <div className="text-[11px] text-zinc-400">
                    {tier.entryFee === 0 ? 'Free Entry' : `Stake: ${tier.entryFee} Coins`}
                  </div>
                </div>

                {/* Payout specs */}
                <div className="space-y-1 bg-zinc-950/60 p-2 rounded-xl border border-white/5 text-[10px] font-bold">
                  <div className="flex items-center justify-between text-yellow-400">
                    <span>1st:</span>
                    <span>+{tier.payouts.first} Coins</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>2nd:</span>
                    <span>+{tier.payouts.second} Coins</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-500">
                    <span>3rd:</span>
                    <span>+{tier.payouts.third} Coins</span>
                  </div>
                </div>

                {!meetsLevel && (
                  <div className="mt-2 text-[9px] font-black text-red-400 uppercase">
                    Requires Level {tier.minLevel}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK MATCH & CUSTOM ROOM ACTION BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Matchmaking Launcher */}
        <div className="md:col-span-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedTier.icon}</span>
              <span className="font-black text-base sm:text-lg text-white uppercase">{selectedTier.name} Quick Match</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              4-Player Real-Time Matchmaking • 168 Chaos Cards • Instant 25-Card Mercy Elimination
            </p>
          </div>

          <button
            onClick={handleQuickMatch}
            disabled={isMatchmaking}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(250,204,21,0.5)] flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shrink-0"
          >
            {isMatchmaking ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Finding Players... ({matchmakingCountdown}s)
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" />
                PLAY NOW ({selectedTier.entryFee > 0 ? `${selectedTier.entryFee} COINS` : 'FREE'})
              </>
            )}
          </button>
        </div>

        {/* Custom Room Join */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-300 font-black text-xs uppercase">
            <Users className="w-4 h-4 text-purple-400" />
            Custom Room Code
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ROOM CODE"
              maxLength={8}
              value={customRoomCode}
              onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleJoinCustomRoom}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shrink-0"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
