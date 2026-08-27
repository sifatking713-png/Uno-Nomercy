import { Card, CardColor, CardType, Disruption, StackingState } from './types';

export const CARD_COLORS: CardColor[] = ['crimson', 'cobalt', 'emerald', 'sunburst'];

export const COLOR_CONFIG: Record<CardColor, {
  name: string;
  hex: string;
  borderHex: string;
  bgGradient: string;
  glow: string;
  badgeBg: string;
  textColor: string;
}> = {
  crimson: {
    name: 'Crimson Red',
    hex: '#ef4444',
    borderHex: '#b91c1c',
    bgGradient: 'from-red-600 via-rose-600 to-red-800',
    glow: 'rgba(239, 68, 68, 0.6)',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    textColor: 'text-red-400',
  },
  cobalt: {
    name: 'Cobalt Blue',
    hex: '#3b82f6',
    borderHex: '#1d4ed8',
    bgGradient: 'from-blue-600 via-sky-600 to-indigo-800',
    glow: 'rgba(59, 130, 246, 0.6)',
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    textColor: 'text-blue-400',
  },
  emerald: {
    name: 'Emerald Green',
    hex: '#10b981',
    borderHex: '#047857',
    bgGradient: 'from-emerald-600 via-teal-600 to-emerald-800',
    glow: 'rgba(16, 185, 129, 0.6)',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    textColor: 'text-emerald-400',
  },
  sunburst: {
    name: 'Sunburst Yellow',
    hex: '#f59e0b',
    borderHex: '#d97706',
    bgGradient: 'from-amber-500 via-yellow-500 to-amber-700',
    glow: 'rgba(245, 158, 11, 0.6)',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400',
  },
  wild: {
    name: 'Wild Chaos',
    hex: '#a855f7',
    borderHex: '#7e22ce',
    bgGradient: 'from-purple-600 via-fuchsia-600 to-indigo-900',
    glow: 'rgba(168, 85, 247, 0.8)',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    textColor: 'text-purple-400',
  },
};

/**
 * Generates the official 168-card deck for "NO MERCY".
 */
export function generateFullDeck(): Card[] {
  const deck: Card[] = [];
  let cardSeq = 1;

  const makeId = (prefix: string) => `${prefix}_${cardSeq++}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Number cards for each color
  CARD_COLORS.forEach((color) => {
    // 0 = Pass Hand (1 per color)
    deck.push({
      id: makeId(`${color}_num_0`),
      color,
      type: 'number',
      value: 0,
      isSpecialPass: true,
      name: `${COLOR_CONFIG[color].name} 0 (PASS HAND)`,
      description: 'Everyone passes their entire hand in the current direction!',
      scoreValue: 0,
    });

    // 1-9 (2 of each per color)
    for (let val = 1; val <= 9; val++) {
      for (let copy = 0; copy < 2; copy++) {
        const isSwap = val === 7;
        deck.push({
          id: makeId(`${color}_num_${val}_c${copy}`),
          color,
          type: 'number',
          value: val,
          isSpecialSwap: isSwap,
          name: isSwap ? `${COLOR_CONFIG[color].name} 7 (SWAP HAND)` : `${COLOR_CONFIG[color].name} ${val}`,
          description: isSwap 
            ? 'Swap your entire hand with ANY player of your choice!' 
            : `Standard ${COLOR_CONFIG[color].name} number card`,
          scoreValue: val,
        });
      }
    }

    // 2. Color Action Cards
    // Skip: 3 per color
    for (let c = 0; c < 3; c++) {
      deck.push({
        id: makeId(`${color}_skip_c${c}`),
        color,
        type: 'skip',
        name: `${COLOR_CONFIG[color].name} Skip`,
        description: 'Next player misses their turn',
        scoreValue: 20,
      });
    }

    // Reverse: 3 per color
    for (let c = 0; c < 3; c++) {
      deck.push({
        id: makeId(`${color}_reverse_c${c}`),
        color,
        type: 'reverse',
        name: `${COLOR_CONFIG[color].name} Reverse`,
        description: 'Reverses the direction of play',
        scoreValue: 20,
      });
    }

    // Draw Two (+2): 3 per color
    for (let c = 0; c < 3; c++) {
      deck.push({
        id: makeId(`${color}_draw2_c${c}`),
        color,
        type: 'draw_two',
        drawAmount: 2,
        name: `${COLOR_CONFIG[color].name} +2`,
        description: 'Next player draws 2 cards or stacks an equal/higher draw card',
        scoreValue: 20,
      });
    }

    // Draw Four (+4): 2 per color
    for (let c = 0; c < 2; c++) {
      deck.push({
        id: makeId(`${color}_draw4_c${c}`),
        color,
        type: 'draw_four',
        drawAmount: 4,
        name: `${COLOR_CONFIG[color].name} +4`,
        description: 'Next player draws 4 cards or stacks an equal/higher draw card',
        scoreValue: 30,
      });
    }

    // Discard All: 2 per color
    for (let c = 0; c < 2; c++) {
      deck.push({
        id: makeId(`${color}_discard_all_c${c}`),
        color,
        type: 'discard_all',
        name: `${COLOR_CONFIG[color].name} Discard All`,
        description: 'Immediately discard ALL cards of this color from your hand!',
        scoreValue: 30,
      });
    }

    // Skip Everyone: 2 per color
    for (let c = 0; c < 2; c++) {
      deck.push({
        id: makeId(`${color}_skip_all_c${c}`),
        color,
        type: 'skip_everyone',
        name: `${COLOR_CONFIG[color].name} Skip Everyone`,
        description: 'Skips all players and gives you another turn immediately!',
        scoreValue: 30,
      });
    }
  });

  // 3. Wild Cards (32 cards total, 8 of each)
  // Wild Reverse Draw 4 (8 cards)
  for (let c = 0; c < 8; c++) {
    deck.push({
      id: makeId(`wild_rev_draw4_c${c}`),
      color: 'wild',
      type: 'wild_reverse_draw_four',
      drawAmount: 4,
      name: 'Wild Reverse +4',
      description: 'Reverses play direction and forces next player to draw 4 or stack!',
      scoreValue: 50,
    });
  }

  // Wild Draw 6 (8 cards)
  for (let c = 0; c < 8; c++) {
    deck.push({
      id: makeId(`wild_draw6_c${c}`),
      color: 'wild',
      type: 'wild_draw_six',
      drawAmount: 6,
      name: 'Wild Draw +6',
      description: 'Forces next player to draw 6 cards or stack an equal/higher draw card!',
      scoreValue: 50,
    });
  }

  // Wild Draw 10 (8 cards - The Ultimate Merciless Card)
  for (let c = 0; c < 8; c++) {
    deck.push({
      id: makeId(`wild_draw10_c${c}`),
      color: 'wild',
      type: 'wild_draw_ten',
      drawAmount: 10,
      name: 'Wild Draw +10 (OVERKILL)',
      description: 'Devastating attack! Next player draws 10 cards or stacks a +10!',
      scoreValue: 60,
    });
  }

  // Wild Color Roulette (8 cards)
  for (let c = 0; c < 8; c++) {
    deck.push({
      id: makeId(`wild_roulette_c${c}`),
      color: 'wild',
      type: 'wild_color_roulette',
      name: 'Wild Color Roulette',
      description: 'Spins the roulette wheel to randomize the active color for everyone!',
      scoreValue: 40,
    });
  }

  return shuffleDeck(deck);
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Checks if a card is legally playable given top discard, active color, stacking status, and disruptions.
 */
export function isCardPlayable(
  card: Card,
  topDiscard: Card | null,
  activeColor: CardColor,
  stacking: StackingState,
  disruption: Disruption | null
): boolean {
  // Check banned color disruption
  if (disruption && disruption.type === 'banned_color' && disruption.bannedColor) {
    if (card.color === disruption.bannedColor) {
      return false;
    }
  }

  // 1. If we are in an active stacking chain (+2, +4, +6, +10)
  if (stacking.isActive && stacking.totalCardsToDraw > 0) {
    // Only cards with equal or higher draw amount can be stacked
    if (!card.drawAmount) return false;
    return card.drawAmount >= stacking.minDrawRequired;
  }

  // 2. If no top discard (shouldn't happen except initialization), wild or any color matches
  if (!topDiscard) return true;

  // 3. Wild cards are always playable anytime (unless wild disruption prohibits, which doesn't happen)
  if (card.color === 'wild') return true;

  // 4. Color match against active color
  if (card.color === activeColor) return true;

  // 5. Number match (e.g., Red 7 on Cobalt 7)
  if (card.type === 'number' && topDiscard.type === 'number' && card.value === topDiscard.value) {
    return true;
  }

  // 6. Action type match (e.g., Crimson Skip on Emerald Skip, Sunburst +2 on Cobalt +2)
  if (card.type === topDiscard.type && card.type !== 'number') {
    return true;
  }

  return false;
}

/**
 * Gets all playable cards from a hand.
 */
export function getPlayableCards(
  hand: Card[],
  topDiscard: Card | null,
  activeColor: CardColor,
  stacking: StackingState,
  disruption: Disruption | null
): Card[] {
  return hand.filter(card => isCardPlayable(card, topDiscard, activeColor, stacking, disruption));
}
