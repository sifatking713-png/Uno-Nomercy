import { isCardPlayable } from './cards';
import { Card, CardColor, Disruption, Player, StackingState } from './types';

export interface BotDecision {
  action: 'play' | 'draw' | 'callout';
  card?: Card;
  chosenColor?: CardColor;
  swapTargetPlayerId?: string;
  targetCalloutPlayerId?: string;
}

export function evaluateBotMove(
  bot: Player,
  allPlayers: Player[],
  topDiscard: Card | null,
  activeColor: CardColor,
  stacking: StackingState,
  disruption: Disruption | null
): BotDecision {
  // Check if any opponent is vulnerable to Callout (has 1 card and forgot to declare!)
  const vulnerableOpponent = allPlayers.find(
    (p) => p.id !== bot.id && !p.isEliminated && p.hand.length === 1 && p.canBeCalledOut
  );
  if (vulnerableOpponent && Math.random() < 0.75) {
    return {
      action: 'callout',
      targetCalloutPlayerId: vulnerableOpponent.id,
    };
  }

  // Find all playable cards in bot's hand
  const playableCards = bot.hand.filter((c) =>
    isCardPlayable(c, topDiscard, activeColor, stacking, disruption)
  );

  if (playableCards.length === 0) {
    return { action: 'draw' };
  }

  // If in an active stacking chain (+2, +4, +6, +10)
  if (stacking.isActive && stacking.totalCardsToDraw > 0) {
    // Pick the lowest valid stacking card to save bigger bombs if possible, unless looking for lethal
    playableCards.sort((a, b) => (a.drawAmount || 0) - (b.drawAmount || 0));
    const chosenCard = playableCards[0];

    // Determine chosen color if it's wild
    let chosenColor: CardColor = activeColor;
    if (chosenCard.color === 'wild') {
      chosenColor = chooseBestColor(bot.hand, disruption);
    }

    return {
      action: 'play',
      card: chosenCard,
      chosenColor,
    };
  }

  // Normal turn decision:
  // 1. Check if we have 7-Swap and someone is close to winning (1-3 cards) while we have more
  const swapCard = playableCards.find((c) => c.isSpecialSwap);
  const leadingOpponents = allPlayers
    .filter((p) => p.id !== bot.id && !p.isEliminated && p.hand.length < bot.hand.length)
    .sort((a, b) => a.hand.length - b.hand.length);

  if (swapCard && leadingOpponents.length > 0 && bot.hand.length >= 4) {
    const target = leadingOpponents[0];
    return {
      action: 'play',
      card: swapCard,
      swapTargetPlayerId: target.id,
    };
  }

  // 2. Check for Discard All card if bot has multiple cards of that color
  const discardAllCard = playableCards.find((c) => c.type === 'discard_all');
  if (discardAllCard) {
    const matchingColorCount = bot.hand.filter((c) => c.color === discardAllCard.color).length;
    if (matchingColorCount >= 2) {
      return {
        action: 'play',
        card: discardAllCard,
      };
    }
  }

  // 3. Check for Skip Everyone / Skip cards if next opponent is at low cards
  const skipCard = playableCards.find((c) => c.type === 'skip_everyone' || c.type === 'skip');
  if (skipCard) {
    return {
      action: 'play',
      card: skipCard,
      chosenColor: skipCard.color === 'wild' ? chooseBestColor(bot.hand, disruption) : undefined,
    };
  }

  // 4. Check for High Draw bombs (+10, +6, +4)
  const drawBombs = playableCards
    .filter((c) => (c.drawAmount || 0) >= 4)
    .sort((a, b) => (b.drawAmount || 0) - (a.drawAmount || 0));
  if (drawBombs.length > 0) {
    const chosenCard = drawBombs[0];
    return {
      action: 'play',
      card: chosenCard,
      chosenColor: chosenCard.color === 'wild' ? chooseBestColor(bot.hand, disruption) : undefined,
    };
  }

  // 5. Prefer matching numbers/colors over valuable wild cards
  const nonWilds = playableCards.filter((c) => c.color !== 'wild');
  const cardToPlay = nonWilds.length > 0 ? nonWilds[Math.floor(Math.random() * nonWilds.length)] : playableCards[0];

  const chosenColor = cardToPlay.color === 'wild' ? chooseBestColor(bot.hand, disruption) : undefined;

  // If playing 7-swap, target player with lowest cards
  let swapTargetPlayerId: string | undefined;
  if (cardToPlay.isSpecialSwap && leadingOpponents.length > 0) {
    swapTargetPlayerId = leadingOpponents[0].id;
  }

  return {
    action: 'play',
    card: cardToPlay,
    chosenColor,
    swapTargetPlayerId,
  };
}

/**
 * Determines the best color for the bot to call based on card frequency in hand.
 */
export function chooseBestColor(hand: Card[], disruption: Disruption | null): CardColor {
  const counts: Record<CardColor, number> = {
    crimson: 0,
    cobalt: 0,
    emerald: 0,
    sunburst: 0,
    wild: 0,
  };

  hand.forEach((card) => {
    if (card.color !== 'wild') {
      counts[card.color]++;
    }
  });

  // Exclude banned color if disruption active
  const banned = disruption?.type === 'banned_color' ? disruption.bannedColor : null;
  const colors: CardColor[] = ['crimson', 'cobalt', 'emerald', 'sunburst'];
  const validColors = colors.filter((c) => c !== banned);

  validColors.sort((a, b) => counts[b] - counts[a]);
  return validColors[0] || 'crimson';
}
