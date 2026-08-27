'use client';

import React from 'react';
import { ArrowLeftRight, Ban, Flame, HelpCircle, Layers, RefreshCw, Shuffle, Sparkles, X, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border-2 border-indigo-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.3)] my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">How To Play — Rules of No Mercy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 text-sm text-zinc-300 pr-1">
          {/* Rule 1: Objective & Win Conditions */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-yellow-400 flex items-center gap-2 mb-2">
              <span>🏆</span> 2 Ways To Win
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-2">
              <strong>1. Empty your hand:</strong> Be the first player to discard all your cards.
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong>2. Last Player Standing:</strong> Eliminate all 3 opponents via the brutal <strong>25-Card Mercy Rule</strong>!
            </p>
          </div>

          {/* Rule 2: 25-Card Mercy Rule Elimination */}
          <div className="bg-rose-950/30 p-4 rounded-2xl border border-rose-600/40">
            <h3 className="text-base font-extrabold uppercase text-rose-400 flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-rose-500" /> The 25-Card Mercy Rule (Instant Elimination)
            </h3>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              If at any moment a player holds <strong>25 or more cards</strong> in their hand, they are <strong>INSTANTLY ELIMINATED</strong> from the match! Do not let incoming draw penalties accumulate in your hand!
            </p>
          </div>

          {/* Rule 3: Merciless Stacking */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-amber-400 flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-400" /> Merciless Stacking (+2, +4, +6, +10)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-2">
              When a Draw penalty card is played against you, you can <strong>PASS the penalty to the next player</strong> by playing an <strong>equal or higher draw card</strong>:
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold py-1">
              <div className="bg-zinc-800 p-2 rounded-lg text-blue-300">+2 Draw</div>
              <div className="bg-zinc-800 p-2 rounded-lg text-yellow-300">+4 Draw</div>
              <div className="bg-zinc-800 p-2 rounded-lg text-purple-300">+6 Wild</div>
              <div className="bg-red-950/80 border border-red-500/50 p-2 rounded-lg text-red-300">+10 OVERKILL</div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Example: Player A plays +2, Player B stacks +4, Player C stacks +10. The penalty accumulates to <strong>+16 CARDS</strong>! If Player D cannot stack, they must draw all 16 cards!
            </p>
          </div>

          {/* Rule 4: 0-Pass and 7-Swap */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-cyan-400 flex items-center gap-2 mb-2">
              <Shuffle className="w-5 h-5 text-cyan-400" /> 0-Pass & 7-Swap Special Hands
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <ArrowLeftRight className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <strong>0 = Pass Hand:</strong> When any color 0 is played, ALL players must pass their entire hand in the current direction of play!
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <strong>7 = Swap Hand:</strong> When any color 7 is played, you choose ANY player to steal their entire hand! (Target opponents with 1-2 cards left!).
                </div>
              </div>
            </div>
          </div>

          {/* Rule 5: Action & Wild Cards */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-purple-400 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Chaos Action & Wild Cards
            </h3>
            <ul className="text-xs space-y-1.5 text-zinc-300 list-disc list-inside">
              <li><strong>Discard All:</strong> Instantly discard every card of that color from your hand!</li>
              <li><strong>Skip Everyone:</strong> Skips all 3 players and takes another turn immediately.</li>
              <li><strong>Wild Reverse +4:</strong> Reverses play direction and inflicts a +4 draw penalty.</li>
              <li><strong>Wild Color Roulette:</strong> Spins the fate wheel to force a random new color for everyone.</li>
            </ul>
          </div>

          {/* Rule 6: 1-Card Callout & Disruptions */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            <h3 className="text-base font-extrabold uppercase text-emerald-400 flex items-center gap-2 mb-2">
              <span>🚨</span> Last Card Call & Arena Disruptions
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-2">
              When down to 1 card, immediately tap <strong>CALL LAST CARD!</strong> If you forget, opponents can hit <strong>CALLOUT</strong> to slap you with a +2 card penalty.
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Watch the top banner for <strong>timed arena disruptions</strong> (banned colors, double penalties, turbo 6s turns) that shake up the battlefield in real time!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider transition-all"
          >
            I UNDERSTAND — ENTER ARENA
          </button>
        </div>
      </div>
    </div>
  );
};
