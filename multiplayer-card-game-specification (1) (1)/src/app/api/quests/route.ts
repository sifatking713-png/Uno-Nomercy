import { db } from '@/db';
import { dailyQuests, users } from '@/db/schema';
import { ensureDailyQuests, getOrCreateUser, getXpRequiredForLevel } from '@/lib/userService';
import { and, eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'player_default';
    const todayStr = new Date().toISOString().split('T')[0];

    await getOrCreateUser(userId);
    await ensureDailyQuests(userId, todayStr);

    const userQuests = await db
      .select()
      .from(dailyQuests)
      .where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.dateKey, todayStr)));

    return NextResponse.json({ success: true, quests: userQuests });
  } catch (error: any) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, questId, doubleWithAd } = body;

    if (!userId || !questId) {
      return NextResponse.json({ success: false, error: 'User ID and Quest ID required' }, { status: 400 });
    }

    const questRecords = await db
      .select()
      .from(dailyQuests)
      .where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.id, questId)))
      .limit(1);

    if (questRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Quest not found' }, { status: 404 });
    }

    const quest = questRecords[0];
    if (quest.isClaimed) {
      return NextResponse.json({ success: false, error: 'Quest reward already claimed' }, { status: 400 });
    }
    if (quest.current < quest.target) {
      return NextResponse.json({ success: false, error: 'Quest is not yet completed' }, { status: 400 });
    }

    const multiplier = doubleWithAd ? 2 : 1;
    const coinsWon = quest.rewardCoins * multiplier;
    const xpWon = quest.rewardXp * multiplier;

    // Mark as claimed
    await db.update(dailyQuests).set({ isClaimed: true, isCompleted: true }).where(eq(dailyQuests.id, questId));

    // Update user coins and XP
    const user = await getOrCreateUser(userId);
    let newXp = user.xp + xpWon;
    let newLevel = user.level;
    let xpReq = getXpRequiredForLevel(newLevel);

    while (newXp >= xpReq) {
      newXp -= xpReq;
      newLevel += 1;
      xpReq = getXpRequiredForLevel(newLevel);
    }

    const newCoins = user.coins + coinsWon;

    await db.update(users).set({
      coins: newCoins,
      xp: newXp,
      level: newLevel,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    const updatedProfile = await getOrCreateUser(userId);

    return NextResponse.json({
      success: true,
      coinsWon,
      xpWon,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error claiming quest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
