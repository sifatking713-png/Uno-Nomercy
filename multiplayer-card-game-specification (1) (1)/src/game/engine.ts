import { CARD_COLORS, generateFullDeck, isCardPlayable, shuffleDeck } from './cards';
import { getRandomDisruption } from './disruptions';
import { Card, CardColor, Disruption, GameLogEntry, GameState, Player, StackingState, TurnPhase } from './types';

export const MERCY_RULE_CARD_LIMIT = 25;
export const DEFAULT_TURN_TIME = 15;

/**
 * Initializes a new 4-player game state.
 */
export function createInitialGameState(
  roomId: string,
  tierId: string,
  humanPlayer: {
    id: string;
    name: string;
    avatar: string;
    banner: string;
    cardBack: string;
    title: string;
    coins: number;
    trophies: number;
    level: number;
  },
  botNames: string[] = ['ShadowFang', 'CyberVolt', 'ViperQueen']
): GameState {
  let deck = generateFullDeck();

  // Pick 3 bot profiles from expanded cosmetic catalog
  const botAvatars = ['avatar_infernal_fiend', 'avatar_cyber_blade', 'avatar_venom_viper', 'avatar_void_monarch', 'avatar_solar_phoenix'];
  const botBanners = ['banner_cyber_overdrive', 'banner_volcanic_magma', 'banner_hex_matrix', 'banner_storm_matrix'];
  const botCardBacks = ['cardback_dragon_scales', 'cardback_cyber_matrix', 'cardback_rainbow_prism'];
  const botTitles = ['Hand Thief (7-Master)', 'Stacking Maestro', 'Ruthless Executioner', 'Overkill Specialist'];

  const players: Player[] = [
    {
      ...humanPlayer,
      isBot: false,
      hand: [],
      isEliminated: false,
      calledLastCard: false,
      canBeCalledOut: false,
      afkCount: 0,
    },
    ...botNames.map((name, i) => ({
      id: `bot_${i + 1}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatar: botAvatars[i % botAvatars.length],
      banner: botBanners[i % botBanners.length],
      cardBack: botCardBacks[i % botCardBacks.length],
      title: botTitles[i % botTitles.length],
      coins: Math.floor(Math.random() * 400) + 100,
      trophies: Math.max(0, humanPlayer.trophies + (Math.floor(Math.random() * 40) - 15)),
      level: Math.max(1, humanPlayer.level + (Math.floor(Math.random() * 2) - 1)),
      isBot: true,
      botDifficulty: 'ruthless' as const,
      hand: [],
      isEliminated: false,
      calledLastCard: false,
      canBeCalledOut: false,
      afkCount: 0,
    })),
  ];

  // Deal 7 cards to each player
  for (let round = 0; round < 7; round++) {
    players.forEach((player) => {
      const card = deck.pop();
      if (card) player.hand.push(card);
    });
  }

  // Flip the first card for the discard pile (must be a clean number card)
  let topDiscard: Card | undefined;
  while (!topDiscard || topDiscard.color === 'wild' || topDiscard.type !== 'number' || topDiscard.value === 0 || topDiscard.value === 7) {
    if (topDiscard) {
      deck.unshift(topDiscard);
      deck = shuffleDeck(deck);
    }
    topDiscard = deck.pop();
  }

  const activeColor: CardColor = topDiscard.color;

  const initialDisruption = Math.random() < 0.6 ? getRandomDisruption() : null;

  return {
    roomId,
    tierId,
    deck,
    discardPile: [topDiscard],
    players,
    currentTurnIndex: 0,
    direction: 1,
    activeColor,
    turnPhase: 'playing',
    turnTimeRemaining: initialDisruption?.type === 'turbo_turns' ? 6 : DEFAULT_TURN_TIME,
    stacking: {
      isActive: false,
      totalCardsToDraw: 0,
      stackChain: [],
      minDrawRequired: 0,
    },
    activeDisruption: initialDisruption,
    disruptionTimeRemaining: initialDisruption ? initialDisruption.durationSeconds : 0,
    nextDisruptionCountdown: initialDisruption ? 0 : 25,
    logs: [
      {
        id: `log_${Date.now()}_start`,
        timestamp: Date.now(),
        message: `Match started! First card is ${topDiscard.name}.`,
        type: 'play',
        card: topDiscard,
      },
    ],
    winnerId: null,
    placements: [],
    rouletteSpinning: false,
    gameStartTime: Date.now(),
    turnCount: 1,
  };
}

/**
 * Advances the active turn to the next non-eliminated player.
 */
export function advanceTurn(state: GameState, skipCount: number = 1): GameState {
  const numPlayers = state.players.length;
  let nextIndex = state.currentTurnIndex;

  for (let s = 0; s < skipCount; s++) {
    do {
      nextIndex = (nextIndex + state.direction + numPlayers) % numPlayers;
    } while (state.players[nextIndex].isEliminated);
  }

  const isTurbo = state.activeDisruption?.type === 'turbo_turns';
  const turnTime = isTurbo ? 6 : DEFAULT_TURN_TIME;

  return {
    ...state,
    currentTurnIndex: nextIndex,
    turnPhase: 'playing',
    turnTimeRemaining: turnTime,
    turnCount: state.turnCount + 1,
  };
}

/**
 * Draws cards from deck (reshuffles discard pile if deck is exhausted).
 */
export function drawCardsFromDeck(state: GameState, count: number): { cards: Card[]; newDeck: Card[]; newDiscard: Card[] } {
  let deck = [...state.deck];
  let discard = [...state.discardPile];
  const drawn: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length <= 1) {
        // Regenerate deck if completely dry
        deck = generateFullDeck();
      } else {
        const top = discard.pop()!;
        deck = shuffleDeck(discard);
        discard = [top];
      }
    }
    const card = deck.pop();
    if (card) {
      drawn.push(card);
    }
  }

  return { cards: drawn, newDeck: deck, newDiscard: discard };
}

/**
 * Check and handle the 25-card Mercy Rule elimination for all active players.
 */
export function evaluateMercyRule(state: GameState): GameState {
  let modifiedState = { ...state };
  const eliminatedNow: Player[] = [];

  const updatedPlayers = modifiedState.players.map((player) => {
    if (!player.isEliminated && player.hand.length >= MERCY_RULE_CARD_LIMIT) {
      eliminatedNow.push(player);
      return {
        ...player,
        isEliminated: true,
        eliminationRank: 4 - modifiedState.placements.length,
        eliminationReason: `Eliminated by 25+ Card Mercy Rule! (${player.hand.length} cards)`,
      };
    }
    return player;
  });

  if (eliminatedNow.length > 0) {
    const newPlacements = [...modifiedState.placements];
    const newLogs = [...modifiedState.logs];

    eliminatedNow.forEach((p) => {
      newPlacements.push(p.id);
      newLogs.unshift({
        id: `log_mercy_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        message: `💥 MERCY RULE! ${p.name} was ELIMINATED with ${p.hand.length} cards in hand!`,
        type: 'elimination',
        playerId: p.id,
      });
    });

    modifiedState = {
      ...modifiedState,
      players: updatedPlayers,
      placements: newPlacements,
      logs: newLogs,
    };

    // Check if only 1 survivor remains
    const activeRemaining = modifiedState.players.filter((p) => !p.isEliminated);
    if (activeRemaining.length === 1) {
      const winner = activeRemaining[0];
      modifiedState.winnerId = winner.id;
      modifiedState.turnPhase = 'game_over';
      modifiedState.placements.unshift(winner.id);
      modifiedState.logs.unshift({
        id: `log_win_${Date.now()}`,
        timestamp: Date.now(),
        message: `👑 ${winner.name} is the LAST PLAYER STANDING and WINS THE MATCH!`,
        type: 'victory',
        playerId: winner.id,
      });
      return modifiedState;
    }
  }

  return modifiedState;
}

/**
 * Plays a card from the current player's hand.
 */
export function playCardAction(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenWildColor?: CardColor,
  swapTargetPlayerId?: string
): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentTurnIndex) return state;

  const player = state.players[playerIndex];
  const cardToPlay = player.hand.find((c) => c.id === cardId);
  if (!cardToPlay) return state;

  const topDiscard = state.discardPile[state.discardPile.length - 1] || null;
  if (!isCardPlayable(cardToPlay, topDiscard, state.activeColor, state.stacking, state.activeDisruption)) {
    return state;
  }

  let newHand = player.hand.filter((c) => c.id !== cardId);
  let newDiscard = [...state.discardPile, cardToPlay];
  let newLogs: GameLogEntry[] = [
    {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      message: `${player.name} played ${cardToPlay.name}`,
      type: 'play',
      playerId: player.id,
      card: cardToPlay,
    },
    ...state.logs,
  ];

  let nextColor: CardColor = cardToPlay.color === 'wild' ? (chosenWildColor || 'crimson') : cardToPlay.color;
  let nextDirection = state.direction;
  let nextStacking: StackingState = { ...state.stacking };
  let nextPhase: TurnPhase = 'playing';

  // Check Discard All effect
  if (cardToPlay.type === 'discard_all') {
    const extraSameColor = newHand.filter((c) => c.color === cardToPlay.color);
    if (extraSameColor.length > 0) {
      newHand = newHand.filter((c) => c.color !== cardToPlay.color);
      newDiscard = [...newDiscard, ...extraSameColor];
      newLogs.unshift({
        id: `log_discardall_${Date.now()}`,
        timestamp: Date.now(),
        message: `🔥 ${player.name} dumped ALL ${extraSameColor.length + 1} ${cardToPlay.color.toUpperCase()} cards!`,
        type: 'play',
        playerId: player.id,
      });
    }
  }

  // Handle Stacking draw cards (+2, +4, +6, +10, Wild Reverse +4)
  if (cardToPlay.drawAmount) {
    const multiplier = state.activeDisruption?.type === 'double_penalty' ? 2 : 1;
    const addedPenalty = cardToPlay.drawAmount * multiplier;
    nextStacking = {
      isActive: true,
      totalCardsToDraw: (state.stacking.totalCardsToDraw || 0) + addedPenalty,
      stackChain: [...state.stacking.stackChain, { playerId: player.id, card: cardToPlay }],
      minDrawRequired: cardToPlay.drawAmount,
    };

    newLogs.unshift({
      id: `log_stack_${Date.now()}`,
      timestamp: Date.now(),
      message: `⚡ MERCILESS STACK! Penalty increased to +${nextStacking.totalCardsToDraw} CARDS!`,
      type: 'stack',
      playerId: player.id,
    });
  }

  // 0 = Pass Hand
  if (cardToPlay.isSpecialPass) {
    newLogs.unshift({
      id: `log_pass0_${Date.now()}`,
      timestamp: Date.now(),
      message: `🌪️ 0-PASS! Everyone passes their whole hand ${state.direction === 1 ? 'Clockwise' : 'Counter-Clockwise'}!`,
      type: 'pass',
      playerId: player.id,
    });
  }

  // 7 = Swap Hand
  if (cardToPlay.isSpecialSwap && swapTargetPlayerId) {
    const target = state.players.find((p) => p.id === swapTargetPlayerId);
    if (target) {
      newLogs.unshift({
        id: `log_swap7_${Date.now()}`,
        timestamp: Date.now(),
        message: `🔀 7-SWAP! ${player.name} swapped hands with ${target.name}!`,
        type: 'swap',
        playerId: player.id,
      });
    }
  }

  // Wild Reverse +4 or normal Reverse
  if (cardToPlay.type === 'reverse' || cardToPlay.type === 'wild_reverse_draw_four') {
    nextDirection = (state.direction * -1) as -1 | 1;
    newLogs.unshift({
      id: `log_rev_${Date.now()}`,
      timestamp: Date.now(),
      message: `🔄 Play direction reversed to ${nextDirection === 1 ? 'Clockwise' : 'Counter-Clockwise'}!`,
      type: 'play',
      playerId: player.id,
    });
  }

  // Check Wild Color Roulette
  let rouletteSpinning = false;
  let rouletteColor: CardColor | undefined = undefined;
  if (cardToPlay.type === 'wild_color_roulette') {
    rouletteSpinning = true;
    const colors: CardColor[] = ['crimson', 'cobalt', 'emerald', 'sunburst'];
    rouletteColor = colors[Math.floor(Math.random() * colors.length)];
    nextColor = rouletteColor;
    newLogs.unshift({
      id: `log_roulette_${Date.now()}`,
      timestamp: Date.now(),
      message: `🎰 WILD COLOR ROULETTE spun to ${CARD_COLORS.find((c) => c === rouletteColor)?.toUpperCase()}!`,
      type: 'play',
      playerId: player.id,
    });
  }

  // Check 1-card last card state
  let canBeCalledOut = false;
  let calledLastCard = player.calledLastCard;
  if (newHand.length === 1) {
    canBeCalledOut = true; // Can be caught if not called
  } else {
    calledLastCard = false;
  }

  // Check empty hand win
  if (newHand.length === 0) {
    const updatedPlayers = state.players.map((p, idx) =>
      idx === playerIndex ? { ...p, hand: newHand } : p
    );
    const newPlacements = [player.id, ...state.placements];
    return {
      ...state,
      players: updatedPlayers,
      discardPile: newDiscard,
      winnerId: player.id,
      turnPhase: 'game_over',
      placements: newPlacements,
      logs: [
        {
          id: `log_win_empty_${Date.now()}`,
          timestamp: Date.now(),
          message: `🏆 ${player.name} EMPTIED THEIR HAND AND WINS 1ST PLACE!`,
          type: 'victory',
          playerId: player.id,
        },
        ...newLogs,
      ],
    };
  }

  // Update players list with new hand
  let updatedPlayers = state.players.map((p, idx) => {
    if (idx === playerIndex) {
      return {
        ...p,
        hand: newHand,
        canBeCalledOut,
        calledLastCard,
      };
    }
    return p;
  });

  // Apply 0-Pass Hand Rotation
  if (cardToPlay.isSpecialPass) {
    const nonEliminated = updatedPlayers.filter((p) => !p.isEliminated);
    const hands = nonEliminated.map((p) => p.hand);
    const shiftedHands = nextDirection === 1
      ? [hands[hands.length - 1], ...hands.slice(0, hands.length - 1)]
      : [...hands.slice(1), hands[0]];

    let shiftedIndex = 0;
    updatedPlayers = updatedPlayers.map((p) => {
      if (!p.isEliminated) {
        const newH = shiftedHands[shiftedIndex++];
        return { ...p, hand: newH };
      }
      return p;
    });
  }

  // Apply 7-Swap Hand Exchange
  if (cardToPlay.isSpecialSwap && swapTargetPlayerId) {
    const targetIdx = updatedPlayers.findIndex((p) => p.id === swapTargetPlayerId);
    if (targetIdx !== -1 && !updatedPlayers[targetIdx].isEliminated) {
      const playerHand = [...updatedPlayers[playerIndex].hand];
      const targetHand = [...updatedPlayers[targetIdx].hand];
      updatedPlayers[playerIndex].hand = targetHand;
      updatedPlayers[targetIdx].hand = playerHand;
    }
  }

  let nextState: GameState = {
    ...state,
    players: updatedPlayers,
    discardPile: newDiscard,
    activeColor: nextColor,
    direction: nextDirection,
    stacking: nextStacking,
    turnPhase: nextPhase,
    rouletteSpinning,
    rouletteActiveColor: rouletteColor,
    logs: newLogs,
  };

  // Evaluate 25-card Mercy Rule
  nextState = evaluateMercyRule(nextState);
  if (nextState.winnerId) return nextState;

  // Determine skip advancement:
  // - Skip Everyone: skips everyone and returns to playerIndex
  // - Skip: skips 2 steps
  // - Others: skips 1 step
  let skipSteps = 1;
  if (cardToPlay.type === 'skip_everyone') {
    // Return immediately to current player
    const isTurbo = nextState.activeDisruption?.type === 'turbo_turns';
    return {
      ...nextState,
      turnPhase: 'playing',
      turnTimeRemaining: isTurbo ? 6 : DEFAULT_TURN_TIME,
    };
  } else if (cardToPlay.type === 'skip') {
    skipSteps = 2;
  }

  return advanceTurn(nextState, skipSteps);
}

/**
 * Draws card(s) on a turn (either normal 1 card draw or taking stacked penalty barrage).
 */
export function drawCardAction(state: GameState, playerId: string): GameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== state.currentTurnIndex) return state;

  const player = state.players[playerIndex];
  const isStackPenalty = state.stacking.isActive && state.stacking.totalCardsToDraw > 0;
  const drawAmount = isStackPenalty ? state.stacking.totalCardsToDraw : 1;

  const { cards: drawn, newDeck, newDiscard } = drawCardsFromDeck(state, drawAmount);
  const newHand = [...player.hand, ...drawn];

  const newLogs: GameLogEntry[] = [
    {
      id: `log_draw_${Date.now()}_${playerId}`,
      timestamp: Date.now(),
      message: isStackPenalty
        ? `💀 ${player.name} SUFFERED THE +${drawAmount} STACK BARRAGE!`
        : `${player.name} drew a card.`,
      type: 'draw',
      playerId: player.id,
    },
    ...state.logs,
  ];

  const updatedPlayers = state.players.map((p, idx) =>
    idx === playerIndex
      ? {
          ...p,
          hand: newHand,
          canBeCalledOut: false,
        }
      : p
  );

  let nextState: GameState = {
    ...state,
    deck: newDeck,
    discardPile: newDiscard,
    players: updatedPlayers,
    stacking: {
      isActive: false,
      totalCardsToDraw: 0,
      stackChain: [],
      minDrawRequired: 0,
    },
    logs: newLogs,
  };

  // Evaluate Mercy Rule for 25+ cards
  nextState = evaluateMercyRule(nextState);
  if (nextState.winnerId) return nextState;

  return advanceTurn(nextState, 1);
}

/**
 * Player declares "LAST CARD!" (NO MERCY call).
 */
export function callLastCardAction(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hand.length !== 1) return state;

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId
      ? {
          ...p,
          calledLastCard: true,
          canBeCalledOut: false,
          lastCardCallTime: Date.now(),
        }
      : p
  );

  return {
    ...state,
    players: updatedPlayers,
    logs: [
      {
        id: `log_lastcard_${Date.now()}_${playerId}`,
        timestamp: Date.now(),
        message: `📢 ${player.name} CALLED: "NO MERCY!" (1 CARD REMAINING)!`,
        type: 'last_card',
        playerId: player.id,
      },
      ...state.logs,
    ],
  };
}

/**
 * Calls out an opponent who failed to declare 1 card.
 */
export function calloutOpponentAction(state: GameState, callerId: string, targetId: string): GameState {
  const caller = state.players.find((p) => p.id === callerId);
  const target = state.players.find((p) => p.id === targetId);
  if (!caller || !target || !target.canBeCalledOut || target.calledLastCard) return state;

  // Target draws 2 penalty cards!
  const { cards: drawn, newDeck, newDiscard } = drawCardsFromDeck(state, 2);
  const newTargetHand = [...target.hand, ...drawn];

  const updatedPlayers = state.players.map((p) =>
    p.id === targetId
      ? {
          ...p,
          hand: newTargetHand,
          canBeCalledOut: false,
        }
      : p
  );

  let nextState: GameState = {
    ...state,
    deck: newDeck,
    discardPile: newDiscard,
    players: updatedPlayers,
    logs: [
      {
        id: `log_callout_${Date.now()}_${targetId}`,
        timestamp: Date.now(),
        message: `🚨 ${caller.name} CAUGHT ${target.name} NOT CALLING 1 CARD! +2 Penalty!`,
        type: 'last_card',
        playerId: callerId,
      },
      ...state.logs,
    ],
  };

  return evaluateMercyRule(nextState);
}

/**
 * Updates disruption timers and game clock ticks.
 */
export function tickGameState(state: GameState): GameState {
  if (state.winnerId || state.turnPhase === 'game_over') return state;

  let modified = { ...state };

  // 1. Tick turn timer
  if (modified.turnTimeRemaining > 0) {
    modified.turnTimeRemaining -= 1;
  }

  // 2. Tick active disruption
  if (modified.activeDisruption) {
    modified.disruptionTimeRemaining -= 1;
    if (modified.disruptionTimeRemaining <= 0) {
      modified.logs = [
        {
          id: `log_disrupt_end_${Date.now()}`,
          timestamp: Date.now(),
          message: `✨ Disruption [${modified.activeDisruption.name}] has expired.`,
          type: 'disruption',
        },
        ...modified.logs,
      ];
      modified.activeDisruption = null;
      modified.nextDisruptionCountdown = Math.floor(Math.random() * 20) + 20;
    }
  } else {
    // 3. Tick countdown to next disruption
    modified.nextDisruptionCountdown -= 1;
    if (modified.nextDisruptionCountdown <= 0) {
      const nextDisrupt = getRandomDisruption();
      modified.activeDisruption = nextDisrupt;
      modified.disruptionTimeRemaining = nextDisrupt.durationSeconds;
      modified.logs = [
        {
          id: `log_disrupt_start_${Date.now()}`,
          timestamp: Date.now(),
          message: `🚨 ARENA DISRUPTION: ${nextDisrupt.name} — ${nextDisrupt.description}`,
          type: 'disruption',
        },
        ...modified.logs,
      ];
    }
  }

  return modified;
}
