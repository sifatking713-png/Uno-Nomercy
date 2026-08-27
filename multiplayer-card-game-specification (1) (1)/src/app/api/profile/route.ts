import { db } from '@/db';
import { leaderboard, users } from '@/db/schema';
import { COSMETICS_CATALOG } from '@/game/cosmetics';
import { getOrCreateUser, validateNickname } from '@/lib/userService';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'player_default';
    const username = searchParams.get('username') || 'RookieHero';

    const profile = await getOrCreateUser(userId, username);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, itemId, newNickname, avatar, banner, cardBack, tableTheme, soundPack, title } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const profile = await getOrCreateUser(userId);

    // 1. Change Nickname Action
    if (action === 'change_nickname') {
      const validation = validateNickname(newNickname);
      if (!validation.valid || !validation.cleanName) {
        return NextResponse.json({ success: false, error: validation.error || 'Invalid nickname' }, { status: 400 });
      }

      // Check cooldown (7 days, optional cooldown skip for first change if never changed)
      if (profile.lastNameChangeDate) {
        const lastChange = new Date(profile.lastNameChangeDate);
        const now = new Date();
        const diffMs = now.getTime() - lastChange.getTime();
        const cooldownMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (diffMs < cooldownMs) {
          const daysLeft = Math.ceil((cooldownMs - diffMs) / (1000 * 60 * 60 * 24));
          return NextResponse.json({
            success: false,
            error: `Nickname can only be changed once every 7 days. Please wait ${daysLeft} more day(s).`,
          }, { status: 429 });
        }
      }

      await db.update(users).set({
        username: validation.cleanName,
        lastNameChangeDate: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      // Synchronize to leaderboard
      await db.update(leaderboard).set({
        username: validation.cleanName,
        updatedAt: new Date(),
      }).where(eq(leaderboard.userId, userId));

      const updatedProfile = await getOrCreateUser(userId);
      return NextResponse.json({ success: true, profile: updatedProfile, message: 'Nickname successfully updated!' });
    }

    // 2. Equip cosmetic items
    if (action === 'equip') {
      const updates: Partial<typeof users.$inferInsert> = {};
      if (avatar && profile.unlockedItems.includes(avatar)) updates.avatar = avatar;
      if (banner && profile.unlockedItems.includes(banner)) updates.banner = banner;
      if (cardBack && profile.unlockedItems.includes(cardBack)) updates.cardBack = cardBack;
      if (tableTheme && profile.unlockedItems.includes(tableTheme)) updates.tableTheme = tableTheme;
      if (soundPack && profile.unlockedItems.includes(soundPack)) updates.soundPack = soundPack;
      if (title && profile.unlockedItems.includes(title)) updates.title = title;

      await db.update(users).set({
        ...updates,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      // Update leaderboard entry
      await db.update(leaderboard).set({
        avatar: updates.avatar || profile.avatar,
        banner: updates.banner || profile.banner,
        title: updates.title || profile.title,
        updatedAt: new Date(),
      }).where(eq(leaderboard.userId, userId));

      const updatedProfile = await getOrCreateUser(userId);
      return NextResponse.json({ success: true, profile: updatedProfile });
    }

    // 3. Buy cosmetic item with coins
    if (action === 'buy') {
      if (!itemId) {
        return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
      }

      if (profile.unlockedItems.includes(itemId)) {
        return NextResponse.json({ success: false, error: 'Item already owned' }, { status: 400 });
      }

      const item = COSMETICS_CATALOG.find((c) => c.id === itemId);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
      }

      if (profile.coins < item.price) {
        return NextResponse.json({ success: false, error: 'Insufficient coins' }, { status: 400 });
      }

      const newUnlocked = [...profile.unlockedItems, itemId];
      const newCoins = profile.coins - item.price;

      await db.update(users).set({
        coins: newCoins,
        unlockedItems: newUnlocked,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      const updatedProfile = await getOrCreateUser(userId);
      return NextResponse.json({ success: true, profile: updatedProfile, boughtItem: item });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
