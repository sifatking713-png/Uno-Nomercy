export type CardColor = 'crimson' | 'cobalt' | 'emerald' | 'sunburst' | 'wild';

export type CardType = 
  | 'number' 
  | 'skip' 
  | 'reverse' 
  | 'draw_two' 
  | 'draw_four' 
  | 'discard_all' 
  | 'skip_everyone'
  | 'wild_reverse_draw_four' 
  | 'wild_draw_six' 
  | 'wild_draw_ten' 
  | 'wild_color_roulette';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for numbers
  isSpecialPass?: boolean; // 0 = Pass Hand
  isSpecialSwap?: boolean; // 7 = Swap Hand
  drawAmount?: number; // 2, 4, 6, 10
  name: string;
  description: string;
  scoreValue: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  cardBack: string;
  title: string;
  coins: number;
  trophies: number;
  level: number;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'ruthless';
  hand: Card[];
  isEliminated: boolean;
  eliminationRank?: number; // 4th, 3rd, 2nd, 1st
  eliminationReason?: string;
  calledLastCard: boolean; // Called "NO MERCY" / 1-card
  lastCardCallTime?: number;
  canBeCalledOut: boolean;
  afkCount: number;
}

export type PlayDirection = 1 | -1; // 1 = Clockwise, -1 = Counter-Clockwise

export interface Disruption {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorTheme: string;
  durationSeconds: number;
  type: 
    | 'banned_color' 
    | 'double_penalty' 
    | 'turbo_turns' 
    | 'swap_roulette' 
    | 'color_chaos' 
    | 'stack_immunity';
  bannedColor?: CardColor;
}

export interface StackingState {
  isActive: boolean;
  totalCardsToDraw: number;
  stackChain: {
    playerId: string;
    card: Card;
  }[];
  minDrawRequired: number; // Stacking requires equal or higher draw card
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'play' | 'draw' | 'stack' | 'elimination' | 'swap' | 'pass' | 'disruption' | 'last_card' | 'victory';
  playerId?: string;
  card?: Card;
}

export interface LobbyTier {
  id: string;
  name: string;
  icon: string;
  entryFee: number;
  minLevel: number;
  payouts: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
  xpRewards: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
  trophyRewards: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
  bgGradient: string;
  badge: string;
}

export type TurnPhase = 
  | 'playing' 
  | 'choose_color' 
  | 'choose_swap_target' 
  | 'roulette_spinning' 
  | 'stack_resolving' 
  | 'elimination_anim' 
  | 'game_over';

export interface GameState {
  roomId: string;
  tierId: string;
  deck: Card[];
  discardPile: Card[];
  players: Player[];
  currentTurnIndex: number;
  direction: PlayDirection;
  activeColor: CardColor;
  turnPhase: TurnPhase;
  turnTimeRemaining: number;
  stacking: StackingState;
  activeDisruption: Disruption | null;
  disruptionTimeRemaining: number;
  nextDisruptionCountdown: number;
  logs: GameLogEntry[];
  winnerId: string | null;
  placements: string[]; // [1st, 2nd, 3rd, 4th player ids]
  pendingColorChoicePlayerId?: string;
  pendingSwapChoicePlayerId?: string;
  rouletteActiveColor?: CardColor;
  rouletteSpinning: boolean;
  gameStartTime: number;
  turnCount: number;
}
