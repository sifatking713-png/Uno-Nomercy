import { db } from '@/db';
import { dailyQuests, leaderboard, matchHistory, users } from '@/db/schema';
import { getTierById } from '@/game/lobbies';
import { getOrCreateUser, getXpRequiredForLevel } from '@/lib/userService';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      tierId,
      placement, // 1, 2, 3, 4
      mercyEliminationsCaused = 0,
      stacksMade = 0,
      swapsMade = 0,
      turnsPlayed = 0,
      eliminationReason = 'standard',
    } = body;

    if (!userId || !tierId || !placement) {
      return NextResponse.json({ success: false, error: 'Missing match details' }, { status: 400 });
    }

    const tier = getTierById(tierId);
    const user = await getOrCreateUser(userId);

    // Calculate payouts & XP
    let coinsWon = 0;
    let xpWon = 0;
    let trophiesDelta = 0;

    if (placement === 1) {
      coinsWon = tier.payouts.first;
      xpWon = tier.xpRewards.first;
      trophiesDelta = tier.trophyRewards.first;
    } else if (placement === 2) {
      coinsWon = tier.payouts.second;
      xpWon = tier.xpRewards.second;
      trophiesDelta = tier.trophyRewards.second;
    } else if (placement === 3) {
      coinsWon = tier.payouts.third;
      xpWon = tier.xpRewards.third;
      trophiesDelta = tier.trophyRewards.third;
    } else {
      coinsWon = tier.payouts.fourth;
      xpWon = tier.xpRewards.fourth;
      trophiesDelta = tier.trophyRewards.fourth;
    }

    // Net coin change
    const netCoinsDelta = coinsWon - tier.entryFee;
    const newCoins = Math.max(0, user.coins + netCoinsDelta);
    const newTrophies = Math.max(0, user.trophies + trophiesDelta);

    // Handle XP and Level Up
    let newXp = user.xp + xpWon;
    let newLevel = user.level;
    let xpReq = getXpRequiredForLevel(newLevel);

    while (newXp >= xpReq) {
      newXp -= xpReq;
      newLevel += 1;
      xpReq = getXpRequiredForLevel(newLevel);
    }

    const isWin = placement === 1;
    const newWinStreak = isWin ? user.currentWinStreak + 1 : 0;
    const newBestWinStreak = Math.max(user.bestWinStreak, newWinStreak);

    // Update user record
    await db.update(users).set({
      coins: newCoins,
      trophies: newTrophies,
      level: newLevel,
      xp: newXp,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      mercyEliminations: user.mercyEliminations + mercyEliminationsCaused,
      currentWinStreak: newWinStreak,
      bestWinStreak: newBestWinStreak,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    // Update leaderboard entry
    await db.update(leaderboard).set({
      trophies: newTrophies,
      level: newLevel,
      wins: user.gamesWon + (isWin ? 1 : 0),
      updatedAt: new Date(),
    }).where(eq(leaderboard.userId, userId));

    // Insert match history
    await db.insert(matchHistory).values({
      id: `match_${Date.now()}_${userId}`,
      userId,
      lobbyTier: tierId,
      placement,
      coinsDelta: netCoinsDelta,
      trophiesDelta,
      xpEarned: xpWon,
      eliminationReason,
      turnsPlayed,
    });

    // Update daily quests
    const todayStr = new Date().toISOString().split('T')[0];
    const userQuests = await db
      .select()
      .from(dailyQuests)
      .where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.dateKey, todayStr)));

    for (const q of userQuests) {
      if (!q.isCompleted) {
        let increment = 0;
        if (q.questKey === 'play_3_matches') increment = 1;
        if (q.questKey === 'win_1_match' && isWin) increment = 1;
        if (q.questKey === 'mercy_eliminate' && mercyEliminationsCaused > 0) increment = mercyEliminationsCaused;
        if (q.questKey === 'stack_draw_card' && stacksMade > 0) increment = stacksMade;
        if (q.questKey === 'swap_hands' && swapsMade > 0) increment = swapsMade;

        if (increment > 0) {
          const newCurrent = Math.min(q.target, q.current + increment);
          const isNowCompleted = newCurrent >= q.target;
          await db
            .update(dailyQuests)
            .set({ current: newCurrent, isCompleted: isNowCompleted })
            .where(eq(dailyQuests.id, q.id));
        }
      }
    }

    const updatedProfile = await getOrCreateUser(userId);

    return NextResponse.json({
      success: true,
      placement,
      coinsWon,
      netCoinsDelta,
      xpWon,
      trophiesDelta,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error finishing match:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
