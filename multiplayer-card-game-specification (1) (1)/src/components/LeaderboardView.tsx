'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/userService';
import { getRankDetails } from '@/game/lobbies';
import { PlayerCard } from './PlayerCard';
import { Award, Crown, Flame, RefreshCw, Shield, Sparkles, Trophy } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  banner?: string;
  title: string;
  trophies: number;
  level: number;
  wins: number;
  isRealPlayer: boolean;
}

interface LeaderboardViewProps {
  userProfile: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userProfile }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [season, setSeason] = useState<number>(1);
  const [seasonEndsInDays, setSeasonEndsInDays] = useState<number>(14);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setEntries(data.leaderboard);
          setSeason(data.season);
          setSeasonEndsInDays(data.seasonEndsInDays);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const rankInfo = getRankDetails(userProfile.trophies);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-5 animate-fadeIn font-sans">
      {/* SEASON HEADER BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-yellow-950/40 border-2 border-yellow-500/40 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Crown className="w-6 h-6 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest">Season {season} Championship</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
            Merciless Titans: Season {season}
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Top 10 players at season reset unlock the exclusive <strong className="rainbow-animated-text">« GOD OF NO MERCY »</strong> Animated Title & 10,000 Coins!
          </p>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 px-4 py-2 rounded-2xl text-center shrink-0">
          <div className="text-[10px] font-bold uppercase text-zinc-400">Season Ends In</div>
          <div className="text-lg font-black text-amber-400 font-mono">{seasonEndsInDays} Days</div>
        </div>
      </div>

      {/* MY RANK COMPOSITE CARD */}
      <div className="rounded-2xl bg-zinc-900/90 border border-yellow-500/40 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <PlayerCard
            username={userProfile.username}
            avatarId={userProfile.avatar}
            bannerId={userProfile.banner}
            titleId={userProfile.title}
            trophies={userProfile.trophies}
            coins={userProfile.coins}
            level={userProfile.level}
            size="md"
            isLocalPlayer
          />
        </div>

        <div className="flex items-center gap-4 text-right justify-between w-full sm:w-auto px-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Tier</div>
            <div className={`text-sm font-black ${rankInfo.color}`}>{rankInfo.tierName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Trophies</div>
            <div className="text-base font-black text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              {userProfile.trophies.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Wins</div>
            <div className="text-base font-black text-emerald-400">{userProfile.gamesWon}</div>
          </div>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-3 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Top 50 Merciless Ranks</span>
          <span className="text-xs text-zinc-500 font-bold">Synchronized Server-Side</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-zinc-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading leaderboard...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((player) => {
              const isTop3 = player.rank <= 3;
              const isMe = player.username === userProfile.username;

              return (
                <div
                  key={player.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all gap-2 ${
                    isMe
                      ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                      : isTop3
                      ? 'border-zinc-700 bg-zinc-950/70'
                      : 'border-zinc-800/80 bg-zinc-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Rank Badge */}
                    <div className="w-8 text-center shrink-0">
                      {player.rank === 1 ? (
                        <Crown className="w-6 h-6 text-yellow-400 mx-auto fill-yellow-400" />
                      ) : player.rank === 2 ? (
                        <span className="font-black text-base text-slate-300">#2</span>
                      ) : player.rank === 3 ? (
                        <span className="font-black text-base text-amber-600">#3</span>
                      ) : (
                        <span className="font-bold text-xs text-zinc-500">#{player.rank}</span>
                      )}
                    </div>

                    {/* Composite PlayerCard Badge */}
                    <div className="flex-1 min-w-0">
                      <PlayerCard
                        username={player.username}
                        avatarId={player.avatar}
                        bannerId={player.banner || 'banner_slate_clean'}
                        titleId={player.title}
                        level={player.level}
                        size="sm"
                        isLocalPlayer={isMe}
                      />
                    </div>
                  </div>

                  {/* Trophies & Wins */}
                  <div className="flex items-center justify-end gap-5 w-full sm:w-auto px-3">
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Wins</div>
                      <div className="text-xs font-bold text-zinc-300">{player.wins}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Trophies</div>
                      <div className="text-sm font-black text-yellow-400 flex items-center gap-1 justify-end">
                        <Trophy className="w-3.5 h-3.5" />
                        {player.trophies.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
