import { db } from '@/db';
import { users } from '@/db/schema';
import { getOrCreateUser } from '@/lib/userService';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await getOrCreateUser(userId);

    // Randomized lucky reward: 50, 100, 150, 200, 250, 500
    const rewards = [75, 100, 125, 150, 200, 250, 500];
    const weights = [30, 25, 20, 12, 8, 4, 1]; // Rare 500 jackpot
    let totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;

    let coinsWon = 100;
    for (let i = 0; i < rewards.length; i++) {
      if (randomNum < weights[i]) {
        coinsWon = rewards[i];
        break;
      }
      randomNum -= weights[i];
    }

    await db.update(users).set({
      coins: user.coins + coinsWon,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    const updatedProfile = await getOrCreateUser(userId);

    return NextResponse.json({
      success: true,
      coinsWon,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error claiming ad spin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
