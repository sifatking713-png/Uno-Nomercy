import { pgTable, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  crazygamesId: text('crazygames_id'),
  username: text('username').notNull().default('RookieHero'),
  avatar: text('avatar').notNull().default('avatar_rookie_stacker'),
  banner: text('banner').notNull().default('banner_slate_clean'),
  cardBack: text('card_back').notNull().default('cardback_classic_dark'),
  tableTheme: text('table_theme').notNull().default('table_cyber_arena'),
  soundPack: text('sound_pack').notNull().default('arcade_cyber'),
  title: text('title').notNull().default('Rookie Stacker'),
  
  // Starting values: Level 1, 0 Trophies, 200 Coins starter cushion
  coins: integer('coins').notNull().default(200),
  trophies: integer('trophies').notNull().default(0),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  
  loginStreak: integer('login_streak').notNull().default(1),
  lastLoginDate: text('last_login_date'),
  lastNameChangeDate: timestamp('last_name_change_date'),
  
  // Unlocked item ids stored in JSON array
  unlockedItems: jsonb('unlocked_items').$type<string[]>().notNull().default([
    'avatar_rookie_stacker',
    'banner_slate_clean',
    'cardback_classic_dark',
    'table_cyber_arena',
    'title_rookie',
  ]),
  
  // Stats - all strictly starting at 0
  gamesPlayed: integer('games_played').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  mercyEliminations: integer('mercy_eliminations').notNull().default(0),
  highestStackSurvived: integer('highest_stack_survived').notNull().default(0),
  currentWinStreak: integer('current_win_streak').notNull().default(0),
  bestWinStreak: integer('best_win_streak').notNull().default(0),
  totalDrawsInflicted: integer('total_draws_inflicted').notNull().default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dailyQuests = pgTable('daily_quests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questKey: text('quest_key').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  target: integer('target').notNull(),
  current: integer('current').notNull().default(0),
  rewardCoins: integer('reward_coins').notNull(),
  rewardXp: integer('reward_xp').notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  isClaimed: boolean('is_claimed').notNull().default(false),
  dateKey: text('date_key').notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const matchHistory = pgTable('match_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lobbyTier: text('lobby_tier').notNull(),
  placement: integer('placement').notNull(),
  coinsDelta: integer('coins_delta').notNull(),
  trophiesDelta: integer('trophies_delta').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  eliminationReason: text('elimination_reason'), // 'won', 'mercy_eliminated', 'outplayed'
  turnsPlayed: integer('turns_played').notNull().default(0),
  playedAt: timestamp('played_at').defaultNow().notNull(),
});

export const leaderboard = pgTable('leaderboard', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull(),
  avatar: text('avatar').notNull(),
  banner: text('banner').notNull().default('banner_slate_clean'),
  title: text('title').notNull(),
  trophies: integer('trophies').notNull(),
  level: integer('level').notNull(),
  wins: integer('wins').notNull(),
  season: integer('season').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const activeRooms = pgTable('active_rooms', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  hostId: text('host_id').notNull(),
  tier: text('tier').notNull(),
  maxPlayers: integer('max_players').notNull().default(4),
  players: jsonb('players').$type<any[]>().notNull().default([]),
  status: text('status').notNull().default('waiting'), // 'waiting', 'in_game', 'finished'
  gameState: jsonb('game_state').$type<any>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
