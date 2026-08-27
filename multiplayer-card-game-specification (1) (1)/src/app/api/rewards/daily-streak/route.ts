import { db } from '@/db';
import { users } from '@/db/schema';
import { getOrCreateUser } from '@/lib/userService';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const STREAK_REWARDS = [
  { day: 1, coins: 50, special: '50 Coins' },
  { day: 2, coins: 100, special: '100 Coins' },
  { day: 3, coins: 200, special: '200 Coins' },
  { day: 4, coins: 350, special: '350 Coins' },
  { day: 5, coins: 500, special: '500 Coins' },
  { day: 6, coins: 750, special: '750 Coins + Rare Title' },
  { day: 7, coins: 1500, special: '1,500 Coins + God of No Mercy Title' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, doubleWithAd } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await getOrCreateUser(userId);
    const dayIndex = Math.min(7, Math.max(1, user.loginStreak)) - 1;
    const baseReward = STREAK_REWARDS[dayIndex];

    const multiplier = doubleWithAd ? 2 : 1;
    const coinsAwarded = baseReward.coins * multiplier;

    const newUnlocked = [...user.unlockedItems];
    if (dayIndex === 5 && !newUnlocked.includes('title_draw10_master')) {
      newUnlocked.push('title_draw10_master');
    }
    if (dayIndex === 6 && !newUnlocked.includes('title_god_of_mercy')) {
      newUnlocked.push('title_god_of_mercy');
    }

    await db.update(users).set({
      coins: user.coins + coinsAwarded,
      unlockedItems: newUnlocked,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    const updatedProfile = await getOrCreateUser(userId);

    return NextResponse.json({
      success: true,
      coinsAwarded,
      streakDay: dayIndex + 1,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error claiming streak:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
