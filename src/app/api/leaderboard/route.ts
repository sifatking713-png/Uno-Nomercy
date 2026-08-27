import { db } from '@/db';
import { leaderboard } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Seed rival players for vibrant competitive leaderboard with cosmetic profiles
const SEEDED_RIVALS = [
  { username: 'OverkillKing', avatar: 'avatar_apex_overkill_sovereign', banner: 'banner_god_of_mercy_gold', title: '« GOD OF NO MERCY »', trophies: 2450, level: 28, wins: 142 },
  { username: 'Draw10Demon', avatar: 'avatar_infernal_fiend', banner: 'banner_volcanic_magma', title: 'Overkill Specialist', trophies: 2280, level: 25, wins: 120 },
  { username: 'ViperQueen', avatar: 'avatar_venom_viper', banner: 'banner_toxic_biohazard', title: 'Hand Thief (7-Master)', trophies: 2110, level: 23, wins: 98 },
  { username: 'CyberRonin', avatar: 'avatar_cyber_blade', banner: 'banner_cyber_overdrive', title: 'Stacking Maestro', trophies: 1890, level: 20, wins: 84 },
  { username: 'ChaosVortex', avatar: 'avatar_god_of_chaos', banner: 'banner_rainbow_chroma_supernova', title: '« RAINBOW CHAOS DEITY »', trophies: 1740, level: 18, wins: 76 },
  { username: 'MercyNullifier', avatar: 'avatar_void_monarch', banner: 'banner_storm_matrix', title: 'Mercy Denier', trophies: 1610, level: 16, wins: 65 },
  { username: 'StackBaron', avatar: 'avatar_solar_phoenix', banner: 'banner_hex_matrix', title: 'Ruthless Executioner', trophies: 1450, level: 15, wins: 59 },
  { username: 'ShadowPhantom', avatar: 'avatar_shadow_fang', banner: 'banner_crimson_crest', title: 'Hand Thief (7-Master)', trophies: 1320, level: 13, wins: 48 },
  { username: 'BlazeStriker', avatar: 'avatar_crimson_ronin', banner: 'banner_volcanic_magma', title: 'Rookie Stacker', trophies: 1180, level: 11, wins: 41 },
  { username: 'NeonSpectre', avatar: 'avatar_neon_phantom', banner: 'banner_neon_grid', title: 'Card Shuffler', trophies: 950, level: 9, wins: 33 },
];

export async function GET(req: NextRequest) {
  try {
    const dbEntries = await db.select().from(leaderboard).orderBy(desc(leaderboard.trophies)).limit(50);

    // Merge db players with seeded rivals and sort descending by trophies
    const combined = [
      ...dbEntries.map((e) => ({
        id: e.userId,
        username: e.username,
        avatar: e.avatar,
        banner: e.banner || 'banner_slate_clean',
        title: e.title,
        trophies: e.trophies,
        level: e.level,
        wins: e.wins,
        isRealPlayer: true,
      })),
      ...SEEDED_RIVALS.map((r, idx) => ({
        id: `seed_${idx}`,
        username: r.username,
        avatar: r.avatar,
        banner: r.banner,
        title: r.title,
        trophies: r.trophies,
        level: r.level,
        wins: r.wins,
        isRealPlayer: false,
      })),
    ];

    // Remove duplicates by username
    const seen = new Set<string>();
    const unique = combined.filter((p) => {
      if (seen.has(p.username)) return false;
      seen.add(p.username);
      return true;
    });

    unique.sort((a, b) => b.trophies - a.trophies);

    // Rank 1 to N
    const rankedList = unique.slice(0, 50).map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    return NextResponse.json({
      success: true,
      season: 1,
      seasonEndsInDays: 14,
      leaderboard: rankedList,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
