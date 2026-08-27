'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardColor, GameState, Player } from '@/game/types';
import { soundManager } from '@/game/audio';
import { crazyGamesSDK } from '@/game/sdk';
import { evaluateBotMove } from '@/game/botAI';
import {
  callLastCardAction,
  calloutOpponentAction,
  createInitialGameState,
  drawCardAction,
  playCardAction,
  tickGameState,
} from '@/game/engine';
import { CosmeticItem } from '@/game/cosmetics';
import { UserProfile } from '@/lib/userService';

import { GameBoard } from '@/components/GameBoard';
import { LobbyView } from '@/components/LobbyView';
import { ShopView } from '@/components/ShopView';
import { QuestsView } from '@/components/QuestsView';
import { LeaderboardView } from '@/components/LeaderboardView';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { ColorPickerModal } from '@/components/ColorPickerModal';
import { SwapTargetModal } from '@/components/SwapTargetModal';
import { RouletteModal } from '@/components/RouletteModal';
import { GameOverModal } from '@/components/GameOverModal';
import { AdOverlay } from '@/components/AdOverlay';
import { NicknameModal } from '@/components/NicknameModal';

import {
  Coins,
  Crown,
  Flame,
  HelpCircle,
  Layers,
  Palette,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'lobby' | 'game' | 'shop' | 'quests' | 'leaderboard'>('lobby');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Modals & Overlays
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showSwapTarget, setShowSwapTarget] = useState<boolean>(false);
  const [showRoulette, setShowRoulette] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showAdOverlay, setShowAdOverlay] = useState<boolean>(false);
  const [adOverlayType, setAdOverlayType] = useState<'midgame' | 'rewarded'>('midgame');

  // Pending card choices
  const [pendingCardToPlay, setPendingCardToPlay] = useState<Card | null>(null);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User identification (persisted locally)
  const [userId, setUserId] = useState<string>('player_local');

  // Reference for game loop timer
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize Profile & CrazyGames SDK
  useEffect(() => {
    let savedId = localStorage.getItem('no_mercy_user_id');
    if (!savedId) {
      savedId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('no_mercy_user_id', savedId);
    }
    setUserId(savedId);

    // Initialize CrazyGames SDK
    crazyGamesSDK.init().then(() => {
      crazyGamesSDK.getUser().then((cgUser) => {
        loadUserProfile(savedId!, cgUser?.username || 'MercilessHero');
      });
    });

    const handleMockAdShow = (e: any) => {
      setAdOverlayType(e.detail?.type || 'midgame');
      setShowAdOverlay(true);
    };
    const handleMockAdFinish = () => {
      setShowAdOverlay(false);
    };

    window.addEventListener('cg_mock_ad_show', handleMockAdShow);
    window.addEventListener('cg_mock_ad_finish', handleMockAdFinish);

    return () => {
      window.removeEventListener('cg_mock_ad_show', handleMockAdShow);
      window.removeEventListener('cg_mock_ad_finish', handleMockAdFinish);
    };
  }, []);

  const loadUserProfile = async (id: string, defaultName?: string) => {
    try {
      const url = defaultName
        ? `/api/profile?userId=${id}&username=${encodeURIComponent(defaultName)}`
        : `/api/profile?userId=${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUserProfile(data.profile);
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  // 2. Start a Match
  const handleStartMatch = (tierId: string) => {
    if (!userProfile) return;

    soundManager.playClick();
    crazyGamesSDK.gameplayStart();

    const humanData = {
      id: userProfile.id,
      name: userProfile.username,
      avatar: userProfile.avatar,
      banner: userProfile.banner,
      cardBack: userProfile.cardBack,
      title: userProfile.title,
      coins: userProfile.coins,
      trophies: userProfile.trophies,
      level: userProfile.level,
    };

    const newGame = createInitialGameState(`room_${Date.now()}`, tierId, humanData);
    setGameState(newGame);
    setActiveTab('game');
    setShowGameOver(false);
  };

  // 3. Game Tick Timer
  useEffect(() => {
    if (activeTab !== 'game' || !gameState || gameState.turnPhase === 'game_over') {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      return;
    }

    gameTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.turnPhase === 'game_over') return prev;

        const updated = tickGameState(prev);

        // Check if turn timer ran out
        if (updated.turnTimeRemaining <= 0) {
          const activePlayer = updated.players[updated.currentTurnIndex];
          if (activePlayer && !activePlayer.isEliminated) {
            soundManager.playCardDraw();
            return drawCardAction(updated, activePlayer.id);
          }
        }

        return updated;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [activeTab, gameState?.turnPhase, gameState?.currentTurnIndex]);

  // 4. Bot Turn Logic Loop
  useEffect(() => {
    if (activeTab !== 'game' || !gameState || gameState.turnPhase === 'game_over') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isBot || currentPlayer.isEliminated) return;

    // Trigger Bot Move after 1.2s delay for natural pacing
    if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);

    botTurnTimeoutRef.current = setTimeout(() => {
      setGameState((currentState) => {
        if (!currentState || currentState.turnPhase === 'game_over') return currentState;

        const bot = currentState.players[currentState.currentTurnIndex];
        if (!bot || !bot.isBot || bot.isEliminated) return currentState;

        const topDiscard = currentState.discardPile[currentState.discardPile.length - 1] || null;
        const decision = evaluateBotMove(
          bot,
          currentState.players,
          topDiscard,
          currentState.activeColor,
          currentState.stacking,
          currentState.activeDisruption
        );

        if (decision.action === 'callout' && decision.targetCalloutPlayerId) {
          soundManager.playLastCardAlarm();
          return calloutOpponentAction(currentState, bot.id, decision.targetCalloutPlayerId);
        }

        if (decision.action === 'draw' || !decision.card) {
          soundManager.playCardDraw();
          return drawCardAction(currentState, bot.id);
        }

        // Execute bot card play
        soundManager.playCardPlay(decision.card.color === 'wild' || !!decision.card.drawAmount);

        // Check Wild Roulette trigger
        if (decision.card.type === 'wild_color_roulette') {
          setShowRoulette(true);
        }

        if (decision.card.drawAmount) {
          soundManager.playStackAlert((currentState.stacking.totalCardsToDraw || 0) + decision.card.drawAmount);
        }

        return playCardAction(
          currentState,
          bot.id,
          decision.card.id,
          decision.chosenColor,
          decision.swapTargetPlayerId
        );
      });
    }, 1300);

    return () => {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
    };
  }, [gameState?.currentTurnIndex, gameState?.turnPhase, activeTab]);

  // 5. Check Game Over & Submit Match Results
  useEffect(() => {
    if (gameState?.turnPhase === 'game_over' && gameState.winnerId && !showGameOver) {
      crazyGamesSDK.gameplayStop();
      setShowGameOver(true);

      // Record match results on server
      const localRank =
        gameState.winnerId === userId
          ? 1
          : gameState.placements.indexOf(userId) !== -1
          ? gameState.placements.indexOf(userId) + 1
          : 4;

      fetch('/api/match/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tierId: gameState.tierId,
          placement: localRank,
          mercyEliminationsCaused: gameState.players.filter(
            (p) => p.isEliminated && p.eliminationReason?.includes('Mercy')
          ).length,
          stacksMade: 1,
          turnsPlayed: gameState.turnCount,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setUserProfile(data.profile);
          }
        })
        .catch(console.error);
    }
  }, [gameState?.turnPhase, gameState?.winnerId]);

  // Player Actions: Play Card
  const handleLocalPlayCard = (card: Card) => {
    if (!gameState || !userProfile) return;

    if (card.color === 'wild') {
      setPendingCardToPlay(card);
      setShowColorPicker(true);
      return;
    }

    if (card.isSpecialSwap) {
      setPendingCardToPlay(card);
      setShowSwapTarget(true);
      return;
    }

    // Direct play
    soundManager.playCardPlay(!!card.drawAmount);
    if (card.drawAmount) {
      soundManager.playStackAlert((gameState.stacking.totalCardsToDraw || 0) + card.drawAmount);
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return playCardAction(prev, userProfile.id, card.id);
    });
  };

  // Color selection resolved
  const handleSelectWildColor = (chosenColor: CardColor) => {
    setShowColorPicker(false);
    if (!gameState || !userProfile || !pendingCardToPlay) return;

    soundManager.playCardPlay(true);
    if (pendingCardToPlay.type === 'wild_color_roulette') {
      setShowRoulette(true);
    }
    if (pendingCardToPlay.drawAmount) {
      soundManager.playStackAlert((gameState.stacking.totalCardsToDraw || 0) + pendingCardToPlay.drawAmount);
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return playCardAction(prev, userProfile.id, pendingCardToPlay.id, chosenColor);
    });
    setPendingCardToPlay(null);
  };

  // 7-Swap target selected
  const handleSelectSwapTarget = (targetPlayerId: string) => {
    setShowSwapTarget(false);
    if (!gameState || !userProfile || !pendingCardToPlay) return;

    soundManager.playSwapHand();
    setGameState((prev) => {
      if (!prev) return prev;
      return playCardAction(prev, userProfile.id, pendingCardToPlay.id, undefined, targetPlayerId);
    });
    setPendingCardToPlay(null);
  };

  // Draw Card
  const handleLocalDrawCard = () => {
    if (!gameState || !userProfile) return;
    soundManager.playCardDraw();
    setGameState((prev) => {
      if (!prev) return prev;
      return drawCardAction(prev, userProfile.id);
    });
  };

  // Call "LAST CARD / NO MERCY"
  const handleLocalCallLastCard = () => {
    if (!gameState || !userProfile) return;
    soundManager.playLastCardAlarm();
    setGameState((prev) => {
      if (!prev) return prev;
      return callLastCardAction(prev, userProfile.id);
    });
  };

  // Callout an opponent
  const handleCalloutOpponent = (targetId: string) => {
    if (!gameState || !userProfile) return;
    soundManager.playLastCardAlarm();
    setGameState((prev) => {
      if (!prev) return prev;
      return calloutOpponentAction(prev, userProfile.id, targetId);
    });
  };

  // Cosmetics Equip
  const handleEquipCosmetic = async (item: CosmeticItem) => {
    if (!userProfile) return;
    try {
      const payload: any = { action: 'equip', userId: userProfile.id };
      if (item.type === 'avatar') payload.avatar = item.id;
      if (item.type === 'banner') payload.banner = item.id;
      if (item.type === 'card_back') payload.cardBack = item.id;
      if (item.type === 'table_theme') payload.tableTheme = item.id;
      if (item.type === 'title') payload.title = item.name;

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cosmetics Buy
  const handleBuyCosmetic = async (item: CosmeticItem) => {
    if (!userProfile) return;
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy',
          userId: userProfile.id,
          itemId: item.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile(data.profile);
        alert(`Successfully unlocked ${item.name}!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowRewardedAd = async (): Promise<boolean> => {
    return await crazyGamesSDK.requestAd('rewarded');
  };

  if (!userProfile) {
    return (
      <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Flame className="w-12 h-12 text-yellow-400 animate-bounce mb-3" />
        <h1 className="text-2xl font-black uppercase tracking-widest">SHOW NO MERCY</h1>
        <p className="text-xs text-zinc-400 mt-1">Bootstrapping Chaos Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      {/* GLOBAL TOP NAVIGATION (WHEN NOT IN MATCH) */}
      {activeTab !== 'game' && (
        <nav className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 shadow-lg flex items-center justify-between">
          {/* Logo & Game Title */}
          <div
            onClick={() => setActiveTab('lobby')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg uppercase tracking-tight text-white block leading-none">
                NO MERCY
              </span>
              <span className="text-[9px] font-black tracking-widest text-yellow-400 uppercase">
                CHAOS CARDS
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'lobby', label: 'Arena', icon: Play },
              { id: 'shop', label: 'Shop', icon: Palette },
              { id: 'quests', label: 'Quests', icon: Target },
              { id: 'leaderboard', label: 'Ranks', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-105'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Currency Pill & Rules Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-black text-amber-400">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{userProfile.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="How To Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}

      {/* ACTIVE SCREEN CONTENT */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'lobby' && (
          <LobbyView
            userProfile={userProfile}
            onStartMatch={handleStartMatch}
            onOpenRules={() => setShowRulesModal(true)}
            onOpenQuests={() => setActiveTab('quests')}
            onOpenNicknameModal={() => setShowNicknameModal(true)}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            userProfile={userProfile}
            onEquipItem={handleEquipCosmetic}
            onBuyItem={handleBuyCosmetic}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsView
            userProfile={userProfile}
            onRefreshProfile={() => loadUserProfile(userId)}
            onShowRewardedAd={handleShowRewardedAd}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView userProfile={userProfile} />
        )}

        {activeTab === 'game' && gameState && (
          <GameBoard
            gameState={gameState}
            localPlayerId={userProfile.id}
            onPlayCard={handleLocalPlayCard}
            onDrawCard={handleLocalDrawCard}
            onCallLastCard={handleLocalCallLastCard}
            onCalloutOpponent={handleCalloutOpponent}
            onOpenRules={() => setShowRulesModal(true)}
            onLeaveGame={() => {
              if (confirm('Are you sure you want to forfeit this match?')) {
                crazyGamesSDK.gameplayStop();
                setActiveTab('lobby');
              }
            }}
          />
        )}
      </main>

      {/* MODALS */}
      <HowToPlayModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <NicknameModal
        isOpen={showNicknameModal}
        userProfile={userProfile}
        onClose={() => setShowNicknameModal(false)}
        onUpdateSuccess={(updated) => setUserProfile(updated)}
      />

      <ColorPickerModal
        isOpen={showColorPicker}
        onSelectColor={handleSelectWildColor}
        bannedColor={
          gameState?.activeDisruption?.type === 'banned_color'
            ? gameState.activeDisruption.bannedColor
            : undefined
        }
      />

      <SwapTargetModal
        isOpen={showSwapTarget}
        players={gameState?.players || []}
        localPlayerId={userProfile.id}
        onSelectTarget={handleSelectSwapTarget}
      />

      <RouletteModal
        isOpen={showRoulette}
        activeColor={gameState?.rouletteActiveColor || 'crimson'}
        onFinish={() => setShowRoulette(false)}
      />

      {gameState && (
        <GameOverModal
          isOpen={showGameOver}
          tierId={gameState.tierId}
          players={gameState.players}
          winnerId={gameState.winnerId}
          placements={gameState.placements}
          localPlayerId={userProfile.id}
          onPlayAgain={() => handleStartMatch(gameState.tierId)}
          onBackToLobby={() => {
            setShowGameOver(false);
            setActiveTab('lobby');
          }}
          onWatchRewardedAdForDouble={async () => {
            await crazyGamesSDK.requestAd('rewarded');
          }}
          userProfile={userProfile}
        />
      )}

      <AdOverlay
        isOpen={showAdOverlay}
        adType={adOverlayType}
        onComplete={() => setShowAdOverlay(false)}
      />
    </div>
  );
}
