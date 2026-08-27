'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/userService';
import { Award, CheckCircle2, Coins, Flame, Gift, RefreshCw, Sparkles, Target, Trophy, Tv } from 'lucide-react';

interface DailyQuestItem {
  id: string;
  questKey: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

interface QuestsViewProps {
  userProfile: UserProfile;
  onRefreshProfile: () => void;
  onShowRewardedAd: () => Promise<boolean>;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  userProfile,
  onRefreshProfile,
  onShowRewardedAd,
}) => {
  const [quests, setQuests] = useState<DailyQuestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [isSpinningAd, setIsSpinningAd] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  const fetchQuests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/quests?userId=${userProfile.id}`);
      const data = await res.json();
      if (data.success) {
        setQuests(data.quests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [userProfile.id]);

  const handleClaimQuest = async (questId: string, doubleWithAd: boolean) => {
    setIsClaiming(questId);
    try {
      if (doubleWithAd) {
        const adSuccess = await onShowRewardedAd();
        if (!adSuccess) {
          setIsClaiming(null);
          return;
        }
      }

      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          questId,
          doubleWithAd,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onRefreshProfile();
        fetchQuests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(null);
    }
  };

  const handleClaimLoginStreak = async (doubleWithAd: boolean) => {
    try {
      if (doubleWithAd) {
        const adSuccess = await onShowRewardedAd();
        if (!adSuccess) return;
      }

      const res = await fetch('/api/rewards/daily-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          doubleWithAd,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Claimed ${data.coinsAwarded} Coins for Day ${data.streakDay} Login Streak!`);
        onRefreshProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRewardedAdSpin = async () => {
    setIsSpinningAd(true);
    try {
      const adSuccess = await onShowRewardedAd();
      if (adSuccess) {
        const res = await fetch('/api/rewards/ad-spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userProfile.id }),
        });
        const data = await res.json();
        if (data.success) {
          setSpinResult(data.coinsWon);
          onRefreshProfile();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpinningAd(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 animate-fadeIn font-sans">
      {/* 7-DAY LOGIN STREAK REWARDS */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              7-Day Login Streak: Day {userProfile.loginStreak}
            </h2>
          </div>
          <button
            onClick={() => handleClaimLoginStreak(false)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-md"
          >
            Claim Day {userProfile.loginStreak} Reward
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {[
            { day: 1, coins: 50 },
            { day: 2, coins: 100 },
            { day: 3, coins: 200 },
            { day: 4, coins: 350 },
            { day: 5, coins: 500 },
            { day: 6, coins: 750, label: '+ Title' },
            { day: 7, coins: 1500, label: 'GODLY' },
          ].map((item) => {
            const isCurrent = userProfile.loginStreak === item.day;
            const isCompleted = userProfile.loginStreak > item.day;

            return (
              <div
                key={item.day}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                  isCurrent
                    ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_15px_rgba(250,204,21,0.3)] scale-105'
                    : isCompleted
                    ? 'border-emerald-600/40 bg-emerald-950/20 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-950/60 opacity-60'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-zinc-400">Day {item.day}</span>
                <Coins className={`w-5 h-5 my-1 ${isCurrent ? 'text-yellow-400' : 'text-zinc-500'}`} />
                <span className="text-xs font-black text-white">+{item.coins}</span>
                {item.label && <span className="text-[8px] font-extrabold text-amber-300 uppercase">{item.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* LUCKY REWARDED AD FREE COIN WHEEL */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-pink-950/30 border-2 border-purple-500/40 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0">
            <Gift className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase text-white">Free Lucky Bonus (CrazyGames Sponsored)</h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Watch a quick 3s sponsored video to claim 50 to 500 bonus coins instantly!
            </p>
          </div>
        </div>

        <button
          onClick={handleRewardedAdSpin}
          disabled={isSpinningAd}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shrink-0"
        >
          <Tv className="w-4 h-4 text-yellow-300" />
          {isSpinningAd ? 'Watching...' : 'SPIN FOR FREE COINS'}
        </button>
      </div>

      {spinResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center font-black text-sm uppercase tracking-wider animate-fadeIn">
          🎉 Awesome! You won +{spinResult} Coins from the Lucky Sponsor!
        </div>
      )}

      {/* DAILY QUESTS LIST */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Daily Objectives</h2>
          </div>
          <span className="text-xs font-bold text-zinc-400">Resets in 12h</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Loading daily objectives...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map((q) => {
              const progressPct = Math.min(100, (q.current / q.target) * 100);
              const isDone = q.current >= q.target;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    q.isClaimed
                      ? 'border-zinc-800 bg-zinc-950/40 opacity-50'
                      : isDone
                      ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                      : 'border-zinc-800 bg-zinc-950/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{q.icon}</span>
                    <div>
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        {q.title}
                        {q.isClaimed && (
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{q.description}</div>
                      
                      {/* Progress Bar */}
                      <div className="w-48 bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-1">
                        {q.current} / {q.target} Completed
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Claim Button */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 text-xs font-black">
                      <span className="text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" /> +{q.rewardCoins}
                      </span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> +{q.rewardXp} XP
                      </span>
                    </div>

                    {!q.isClaimed && isDone && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleClaimQuest(q.id, false)}
                          disabled={isClaiming === q.id}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-xs uppercase"
                        >
                          Claim
                        </button>
                        <button
                          onClick={() => handleClaimQuest(q.id, true)}
                          disabled={isClaiming === q.id}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase flex items-center gap-1 shadow-md hover:scale-105 transition-transform"
                        >
                          <Tv className="w-3 h-3 text-yellow-300" />
                          2x with Ad
                        </button>
                      </div>
                    )}
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
