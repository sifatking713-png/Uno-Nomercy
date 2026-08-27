import { db } from '@/db';
import { dailyQuests, leaderboard, matchHistory, users } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface UserProfile {
  id: string;
  crazygamesId: string | null;
  username: string;
  avatar: string;
  banner: string;
  cardBack: string;
  tableTheme: string;
  soundPack: string;
  title: string;
  coins: number;
  trophies: number;
  level: number;
  xp: number;
  loginStreak: number;
  lastLoginDate: string | null;
  lastNameChangeDate: Date | null;
  unlockedItems: string[];
  gamesPlayed: number;
  gamesWon: number;
  mercyEliminations: number;
  highestStackSurvived: number;
  currentWinStreak: number;
  bestWinStreak: number;
  totalDrawsInflicted: number;
}

export function getXpRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

const DEFAULT_QUESTS_POOL = [
  {
    key: 'play_3_matches',
    title: 'Arena Gladiator',
    description: 'Play 3 matches in any tier',
    icon: '⚔️',
    target: 3,
    rewardCoins: 100,
    rewardXp: 150,
  },
  {
    key: 'stack_draw_card',
    title: 'Stacking Master',
    description: 'Stack a draw penalty card (+2, +4, +6, or +10)',
    icon: '⚡',
    target: 2,
    rewardCoins: 150,
    rewardXp: 200,
  },
  {
    key: 'win_1_match',
    title: 'Ruthless Victor',
    description: 'Win 1st place in any match',
    icon: '👑',
    target: 1,
    rewardCoins: 250,
    rewardXp: 300,
  },
  {
    key: 'mercy_eliminate',
    title: 'No Mercy Executioner',
    description: 'Eliminate an opponent via the 25-card Mercy Rule',
    icon: '💥',
    target: 1,
    rewardCoins: 300,
    rewardXp: 350,
  },
  {
    key: 'swap_hands',
    title: 'Master Thief',
    description: 'Play a 7-Swap card to take an opponent’s hand',
    icon: '🔀',
    target: 2,
    rewardCoins: 120,
    rewardXp: 180,
  },
];

import { validateNickname } from '@/game/nickname';
export { validateNickname };

export async function getOrCreateUser(userId: string, defaultName: string = 'RookieHero'): Promise<UserProfile> {
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  const todayStr = new Date().toISOString().split('T')[0];

  if (existing.length > 0) {
    const user = existing[0];
    
    // Check login streak
    let currentStreak = user.loginStreak;
    let shouldUpdateStreak = false;

    if (user.lastLoginDate !== todayStr) {
      if (user.lastLoginDate) {
        const lastDate = new Date(user.lastLoginDate);
        const today = new Date(todayStr);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          currentStreak = (currentStreak % 7) + 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      shouldUpdateStreak = true;
    }

    if (shouldUpdateStreak) {
      await db.update(users).set({
        loginStreak: currentStreak,
        lastLoginDate: todayStr,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
    }

    await ensureDailyQuests(userId, todayStr);

    return {
      ...user,
      loginStreak: currentStreak,
      lastLoginDate: todayStr,
      lastNameChangeDate: user.lastNameChangeDate,
      unlockedItems: (user.unlockedItems as string[]) || [
        'avatar_rookie_stacker',
        'banner_slate_clean',
        'cardback_classic_dark',
        'table_cyber_arena',
        'title_rookie',
      ],
    };
  }

  // Fresh user initialization strictly starts at zero stats with starter cushion (200 coins)
  const newUser = {
    id: userId,
    crazygamesId: null,
    username: defaultName,
    avatar: 'avatar_rookie_stacker',
    banner: 'banner_slate_clean',
    cardBack: 'cardback_classic_dark',
    tableTheme: 'table_cyber_arena',
    soundPack: 'arcade_cyber',
    title: 'Rookie Stacker',
    coins: 200, // Small starter grant as specified
    trophies: 0, // Strictly 0
    level: 1, // Strictly Level 1
    xp: 0, // Strictly 0
    loginStreak: 1,
    lastLoginDate: todayStr,
    lastNameChangeDate: null,
    unlockedItems: [
      'avatar_rookie_stacker',
      'banner_slate_clean',
      'cardback_classic_dark',
      'table_cyber_arena',
      'title_rookie',
    ],
    gamesPlayed: 0, // 0
    gamesWon: 0, // 0
    mercyEliminations: 0, // 0
    highestStackSurvived: 0, // 0
    currentWinStreak: 0, // 0
    bestWinStreak: 0, // 0
    totalDrawsInflicted: 0, // 0
  };

  await db.insert(users).values(newUser);

  // Add to leaderboard
  await db.insert(leaderboard).values({
    id: `lb_${userId}`,
    userId,
    username: newUser.username,
    avatar: newUser.avatar,
    banner: newUser.banner,
    title: newUser.title,
    trophies: newUser.trophies,
    level: newUser.level,
    wins: newUser.gamesWon,
    season: 1,
  });

  await ensureDailyQuests(userId, todayStr);

  return newUser;
}

export async function ensureDailyQuests(userId: string, dateKey: string) {
  const existingQuests = await db
    .select()
    .from(dailyQuests)
    .where(sql`${dailyQuests.userId} = ${userId} AND ${dailyQuests.dateKey} = ${dateKey}`);

  if (existingQuests.length === 0) {
    const shuffled = [...DEFAULT_QUESTS_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const q of shuffled) {
      await db.insert(dailyQuests).values({
        id: `quest_${userId}_${q.key}_${dateKey}`,
        userId,
        questKey: q.key,
        title: q.title,
        description: q.description,
        icon: q.icon,
        target: q.target,
        current: 0,
        rewardCoins: q.rewardCoins,
        rewardXp: q.rewardXp,
        isCompleted: false,
        isClaimed: false,
        dateKey,
      });
    }
  }
}
