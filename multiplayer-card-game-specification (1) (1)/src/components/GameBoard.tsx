'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardColor, Disruption, GameState, Player, StackingState } from '@/game/types';
import { COLOR_CONFIG } from '@/game/cards';
import { CardView } from './CardView';
import { PlayerCard } from './PlayerCard';
import { soundManager } from '@/game/audio';
import {
  AlertTriangle,
  ArrowLeftRight,
  Flame,
  HelpCircle,
  Layers,
  MessageSquare,
  Play,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  localPlayerId: string;
  onPlayCard: (card: Card) => void;
  onDrawCard: () => void;
  onCallLastCard: () => void;
  onCalloutOpponent: (targetPlayerId: string) => void;
  onOpenRules: () => void;
  onLeaveGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  localPlayerId,
  onPlayCard,
  onDrawCard,
  onCallLastCard,
  onCalloutOpponent,
  onOpenRules,
  onLeaveGame,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showLogFeed, setShowLogFeed] = useState(false);
  const handContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  const localPlayerIndex = gameState.players.findIndex((p) => p.id === localPlayerId);
  const localPlayer = gameState.players[localPlayerIndex] || gameState.players[0];

  const isMyTurn = gameState.currentTurnIndex === localPlayerIndex;
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1] || null;
  const activeColorConfig = COLOR_CONFIG[gameState.activeColor] || COLOR_CONFIG.wild;

  // Map 3 opponents relative to local player (Left, Top, Right)
  const numPlayers = gameState.players.length;
  const opponentLeft = gameState.players[(localPlayerIndex + 1) % numPlayers];
  const opponentTop = gameState.players[(localPlayerIndex + 2) % numPlayers];
  const opponentRight = gameState.players[(localPlayerIndex + 3) % numPlayers];

  // Track hand container width for dynamic card overlap scaling
  useEffect(() => {
    const updateWidth = () => {
      if (handContainerRef.current) {
        setContainerWidth(handContainerRef.current.clientWidth);
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth - 32);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Find if any opponent can be caught right now (forgot 1-card declare)
  const vulnerableOpponent = gameState.players.find(
    (p) => p.id !== localPlayerId && !p.isEliminated && p.hand.length === 1 && p.canBeCalledOut && !p.calledLastCard
  );

  // Dynamic hand card overlap calculation
  const handLength = localPlayer.hand.length;
  // Base card width depending on screen size
  const baseCardWidth = containerWidth < 640 ? 64 : containerWidth < 1024 ? 76 : 88;
  const availableWidth = Math.max(280, containerWidth - 40);

  // Calculate negative margin overlap so 15-24+ cards compress neatly without overflowing
  let cardOverlapMargin = 0;
  if (handLength > 1) {
    const totalNaturalWidth = handLength * baseCardWidth;
    if (totalNaturalWidth > availableWidth) {
      // Overlap required per card:
      const neededCompression = totalNaturalWidth - availableWidth;
      const calculatedMargin = -(neededCompression / (handLength - 1));
      // On narrow mobile viewports, allow up to 78% overlap so 20+ cards fit with corner indices visible
      const maxOverlapRatio = containerWidth < 640 ? 0.78 : 0.70;
      cardOverlapMargin = Math.max(-baseCardWidth * maxOverlapRatio, calculatedMargin);
    }
  }

  return (
    <div className="relative w-full h-screen max-h-screen bg-zinc-950 text-white flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Dynamic Arena Table Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 transition-colors duration-700 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeColorConfig.hex} 0%, rgba(9, 9, 11, 0.98) 75%)`,
        }}
      />

      {/* TOP HEADER: Disruption Banner, Active Color, Controls */}
      <header className="relative z-30 flex items-center justify-between px-2 sm:px-4 py-2 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 shadow-md shrink-0">
        {/* Left: Active Color Badge & Play Direction */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-md font-black text-xs uppercase ${activeColorConfig.badgeBg}`}
          >
            <div className="w-2.5 h-2.5 rounded-full shadow" style={{ backgroundColor: activeColorConfig.hex }} />
            <span className="hidden sm:inline">{activeColorConfig.name}</span>
            <span className="sm:hidden">{gameState.activeColor.slice(0, 3).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs font-bold">
            {gameState.direction === 1 ? (
              <>
                <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="hidden md:inline text-[11px]">Clockwise</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3 text-fuchsia-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="hidden md:inline text-[11px]">Counter-CW</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Dynamic Disruption Callout Banner */}
        <div className="flex-1 max-w-sm sm:max-w-md mx-2 text-center">
          {gameState.activeDisruption ? (
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600/30 via-purple-600/30 to-amber-600/30 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
              <span className="text-xs sm:text-sm">{gameState.activeDisruption.icon}</span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-yellow-300 truncate max-w-[200px] sm:max-w-none">
                {gameState.activeDisruption.name} ({gameState.disruptionTimeRemaining}s)
              </span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs font-bold text-zinc-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-zinc-500" />
              <span>Next Disruption in {gameState.nextDisruptionCountdown}s</span>
            </div>
          )}
        </div>

        {/* Right: Sound, Rules, Logs, Leave Button */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenRules}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="How To Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setShowLogFeed(!showLogFeed)}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Match Action Log"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={onLeaveGame}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 transition-colors"
            title="Surrender / Leave Match"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MATCH ACTION LOG POPUP */}
      {showLogFeed && (
        <div className="absolute top-12 right-2 sm:right-4 z-50 w-72 sm:w-80 max-h-72 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-2xl p-3 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <span className="text-xs font-black uppercase text-zinc-300">Arena Action Feed</span>
            <button onClick={() => setShowLogFeed(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto space-y-1.5 text-[11px] pr-1">
            {gameState.logs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className={`p-1.5 rounded-lg border ${
                  log.type === 'stack'
                    ? 'border-yellow-500/40 bg-yellow-950/20 text-yellow-300 font-bold'
                    : log.type === 'elimination'
                    ? 'border-red-500/50 bg-red-950/30 text-red-300 font-bold'
                    : log.type === 'victory'
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-black'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-300'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESPONSIVE MATCH ARENA CONTAINER WITH NAMED REGIONS */}
      <main className="relative flex-1 flex flex-col justify-between p-2 sm:p-4 min-h-0 overflow-hidden">
        {/* REGION 1: TOP OPPONENT ZONE */}
        <div className="w-full flex items-center justify-center shrink-0 py-1">
          <div className="transform scale-90 sm:scale-100 transition-transform">
            <PlayerCard
              username={opponentTop.name}
              avatarId={opponentTop.avatar}
              bannerId={opponentTop.banner}
              titleId={opponentTop.title}
              coins={opponentTop.coins}
              cardCount={opponentTop.hand.length}
              isTurn={gameState.players[gameState.currentTurnIndex]?.id === opponentTop.id}
              turnTimeRemaining={gameState.turnTimeRemaining}
              isDangerZone={opponentTop.hand.length >= 20}
              isEliminated={opponentTop.isEliminated}
              eliminationReason={opponentTop.eliminationReason}
              hasCalledOneCard={opponentTop.calledLastCard}
              size="sm"
            />
          </div>
        </div>

        {/* REGION 2: MIDDLE BATTLEFIELD (LEFT OPPONENT, CENTER TABLE, RIGHT OPPONENT) */}
        <div className="flex-1 flex items-center justify-between w-full min-h-0 px-1 sm:px-4 gap-2">
          {/* LEFT OPPONENT ZONE */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="transform scale-80 sm:scale-95 transition-transform origin-left">
              <PlayerCard
                username={opponentLeft.name}
                avatarId={opponentLeft.avatar}
                bannerId={opponentLeft.banner}
                titleId={opponentLeft.title}
                coins={opponentLeft.coins}
                cardCount={opponentLeft.hand.length}
                isTurn={gameState.players[gameState.currentTurnIndex]?.id === opponentLeft.id}
                turnTimeRemaining={gameState.turnTimeRemaining}
                isDangerZone={opponentLeft.hand.length >= 20}
                isEliminated={opponentLeft.isEliminated}
                eliminationReason={opponentLeft.eliminationReason}
                hasCalledOneCard={opponentLeft.calledLastCard}
                size="sm"
                compact
              />
            </div>
          </div>

          {/* CENTER TABLE ZONE: DRAW PILE & DISCARD PILE (PLAYED STACK) */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-w-0 py-1">
            {/* Stacking Penalty Callout Banner */}
            {gameState.stacking.isActive && gameState.stacking.totalCardsToDraw > 0 && (
              <div className="mb-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-2 border-yellow-400 shadow-[0_0_25px_rgba(239,68,68,0.8)] text-center animate-bounce z-20">
                <div className="flex items-center justify-center gap-1.5 text-black font-black text-xs sm:text-sm uppercase tracking-wider">
                  <Flame className="w-4 h-4 fill-yellow-300" />
                  <span>STACK OVERLOAD: +{gameState.stacking.totalCardsToDraw} CARDS!</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-zinc-950 font-bold">
                  Stack a +{gameState.stacking.minDrawRequired} or higher, or suffer the penalty!
                </div>
              </div>
            )}

            {/* Piles Center Layout */}
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              {/* DRAW PILE */}
              <div className="flex flex-col items-center">
                <div
                  onClick={isMyTurn ? onDrawCard : undefined}
                  className={`relative group cursor-pointer transition-transform duration-200 ${
                    isMyTurn ? 'hover:scale-105 active:scale-95' : 'opacity-85'
                  }`}
                >
                  <div className="absolute -bottom-1 -right-1 w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 rounded-xl bg-zinc-800 border border-zinc-700 shadow" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 rounded-xl bg-zinc-900 border border-zinc-700 shadow" />
                  
                  <div
                    className={`relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 rounded-xl border-2 flex flex-col items-center justify-center shadow-2xl p-1 sm:p-2 ${
                      isMyTurn
                        ? 'border-yellow-400 bg-gradient-to-br from-indigo-950 via-zinc-900 to-black ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                        : 'border-zinc-700 bg-zinc-950'
                    }`}
                  >
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 mb-1 group-hover:rotate-12 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-300">DRAW</span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-zinc-500">{gameState.deck.length} Left</span>

                    {isMyTurn && (
                      <span className="absolute -bottom-2 bg-yellow-500 text-black font-black text-[8px] sm:text-[9px] uppercase px-1.5 py-0.2 rounded-full shadow-md">
                        {gameState.stacking.isActive ? `+${gameState.stacking.totalCardsToDraw}` : 'DRAW 1'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* DISCARD PILE (TOP PLAYED CARD) */}
              <div className="flex flex-col items-center">
                {topDiscard ? (
                  <div className="relative">
                    <CardView
                      card={topDiscard}
                      size={containerWidth < 640 ? 'sm' : containerWidth < 1024 ? 'md' : 'lg'}
                      className="shadow-[0_0_30px_rgba(0,0,0,0.9)] transform rotate-1"
                    />
                    <div
                      className="absolute -inset-1 rounded-2xl pointer-events-none opacity-60 blur-sm -z-10"
                      style={{ backgroundColor: activeColorConfig.hex }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 font-bold text-xs">
                    EMPTY
                  </div>
                )}
              </div>
            </div>

            {/* CATCH OPPONENT CALLOUT BUTTON */}
            {vulnerableOpponent && (
              <div className="mt-2 animate-pulse z-30">
                <button
                  onClick={() => onCalloutOpponent(vulnerableOpponent.id)}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-white flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4 text-yellow-300" />
                  CATCH {vulnerableOpponent.name}! (+2)
                </button>
              </div>
            )}
          </div>

          {/* RIGHT OPPONENT ZONE */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="transform scale-80 sm:scale-95 transition-transform origin-right">
              <PlayerCard
                username={opponentRight.name}
                avatarId={opponentRight.avatar}
                bannerId={opponentRight.banner}
                titleId={opponentRight.title}
                coins={opponentRight.coins}
                cardCount={opponentRight.hand.length}
                isTurn={gameState.players[gameState.currentTurnIndex]?.id === opponentRight.id}
                turnTimeRemaining={gameState.turnTimeRemaining}
                isDangerZone={opponentRight.hand.length >= 20}
                isEliminated={opponentRight.isEliminated}
                eliminationReason={opponentRight.eliminationReason}
                hasCalledOneCard={opponentRight.calledLastCard}
                size="sm"
                compact
              />
            </div>
          </div>
        </div>

        {/* REGION 3: BOTTOM LOCAL PLAYER ZONE (COMPOSITED BADGE + DYNAMIC RESPONSIVE HAND) */}
        <div className="w-full shrink-0 flex flex-col items-center pt-1">
          {/* Action Bar & Local Player Composited Badge */}
          <div className="w-full max-w-4xl flex items-center justify-between gap-2 px-2 mb-1">
            <div className="transform scale-90 sm:scale-100 origin-left">
              <PlayerCard
                username={localPlayer.name}
                avatarId={localPlayer.avatar}
                bannerId={localPlayer.banner}
                titleId={localPlayer.title}
                coins={localPlayer.coins}
                level={localPlayer.level}
                cardCount={localPlayer.hand.length}
                isLocalPlayer
                isTurn={isMyTurn}
                turnTimeRemaining={gameState.turnTimeRemaining}
                hasCalledOneCard={localPlayer.calledLastCard}
                size="sm"
              />
            </div>

            {/* Turn Actions & Last Card Button */}
            <div className="flex items-center gap-2">
              {/* "CALL NO MERCY!" (1 CARD) BUTTON */}
              {localPlayer.hand.length === 1 && !localPlayer.calledLastCard && (
                <button
                  onClick={onCallLastCard}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.9)] border-2 border-yellow-400 animate-bounce"
                >
                  📢 CALL NO MERCY!
                </button>
              )}

              {/* Pass / Draw Card button */}
              {isMyTurn && (
                <button
                  onClick={onDrawCard}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider border border-zinc-700 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  {gameState.stacking.isActive ? `Take +${gameState.stacking.totalCardsToDraw}` : 'Pass / Draw'}
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC SCALED HAND TRAY (COMPRESSES OVERLAPPING CARDS SO 20+ CARDS ALWAYS FIT VISIBLE SCREEN) */}
          <div
            ref={handContainerRef}
            className="w-full max-w-5xl flex items-center justify-center overflow-x-auto overflow-y-visible px-2 py-1 min-h-[110px] sm:min-h-[135px] md:min-h-[155px] no-scrollbar"
          >
            <div className="flex items-center justify-center py-1">
              {localPlayer.hand.map((card, idx) => {
                const isPlayable =
                  isMyTurn &&
                  cardPlayableCheck(
                    card,
                    topDiscard,
                    gameState.activeColor,
                    gameState.stacking,
                    gameState.activeDisruption
                  );

                return (
                  <div
                    key={card.id}
                    className="shrink-0 transition-all duration-200 hover:-translate-y-6 hover:scale-115 hover:z-40 focus:-translate-y-6"
                    style={{
                      marginLeft: idx === 0 ? 0 : `${cardOverlapMargin}px`,
                      zIndex: isPlayable ? 20 + idx : 10 + idx,
                    }}
                  >
                    <CardView
                      card={card}
                      isPlayable={isPlayable}
                      onClick={() => onPlayCard(card)}
                      size={containerWidth < 640 ? 'sm' : containerWidth < 1024 ? 'md' : 'lg'}
                      disabled={!isMyTurn || !isPlayable}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper for card playability inside board
function cardPlayableCheck(
  card: Card,
  topDiscard: Card | null,
  activeColor: CardColor,
  stacking: StackingState,
  disruption: Disruption | null
): boolean {
  if (disruption?.type === 'banned_color' && disruption.bannedColor === card.color) {
    return false;
  }
  if (stacking.isActive && stacking.totalCardsToDraw > 0) {
    if (!card.drawAmount) return false;
    return card.drawAmount >= stacking.minDrawRequired;
  }
  if (!topDiscard) return true;
  if (card.color === 'wild') return true;
  if (card.color === activeColor) return true;
  if (card.type === 'number' && topDiscard.type === 'number' && card.value === topDiscard.value) return true;
  if (card.type === topDiscard.type && card.type !== 'number') return true;
  return false;
}
