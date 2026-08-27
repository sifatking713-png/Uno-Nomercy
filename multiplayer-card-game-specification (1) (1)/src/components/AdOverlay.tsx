'use client';

import React, { useEffect, useState } from 'react';
import { Tv, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdOverlayProps {
  isOpen: boolean;
  adType: 'midgame' | 'rewarded';
  onComplete: () => void;
}

export const AdOverlay: React.FC<AdOverlayProps> = ({ isOpen, adType, onComplete }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(3);
      return;
    }

    setSecondsRemaining(3);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border-2 border-yellow-500/60 rounded-3xl p-8 text-center shadow-[0_0_80px_rgba(234,179,8,0.3)]">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center mx-auto mb-4 text-yellow-400">
          <Tv className="w-8 h-8 animate-pulse" />
        </div>

        <div className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1">CrazyGames Sponsored Video</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          {adType === 'rewarded' ? 'Unlocking Rewarded Bonus' : 'Midgame Break'}
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          Supporting the game helps fund new arenas and cosmetics!
        </p>

        {/* Ad Video Simulator Visual */}
        <div className="relative w-full h-40 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-yellow-900/20 to-black animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <Sparkles className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
            <span className="text-sm font-black text-white tracking-widest uppercase">CRAZYGAMES NETWORK</span>
            <span className="text-[10px] text-zinc-400 mt-1">HD Interactive Experience</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-300">
          {secondsRemaining > 0 ? (
            <span>Reward in <strong className="text-yellow-400 font-mono text-base">{secondsRemaining}s</strong></span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Reward Granted!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
