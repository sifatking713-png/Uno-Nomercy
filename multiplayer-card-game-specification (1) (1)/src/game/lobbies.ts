import { LobbyTier } from './types';

export const LOBBY_TIERS: LobbyTier[] = [
  {
    id: 'free_practice',
    name: 'Practice Dojo',
    icon: '🥋',
    entryFee: 0,
    minLevel: 1,
    payouts: {
      first: 25,
      second: 15,
      third: 10,
      fourth: 5,
    },
    xpRewards: {
      first: 60,
      second: 40,
      third: 25,
      fourth: 10,
    },
    trophyRewards: {
      first: 15,
      second: 8,
      third: 0,
      fourth: -5,
    },
    bgGradient: 'from-slate-800 via-zinc-900 to-black',
    badge: 'FREE PLAY',
  },
  {
    id: 'rookie_10',
    name: 'Rookie Arena',
    icon: '🥉',
    entryFee: 10,
    minLevel: 1,
    payouts: {
      first: 20, // 2.0x
      second: 15, // 1.5x
      third: 10, // 1.0x (refund)
      fourth: 0,
    },
    xpRewards: {
      first: 100,
      second: 70,
      third: 40,
      fourth: 20,
    },
    trophyRewards: {
      first: 25,
      second: 12,
      third: 0,
      fourth: -10,
    },
    bgGradient: 'from-amber-950/70 via-stone-900 to-black',
    badge: '10 COINS',
  },
  {
    id: 'gladiator_50',
    name: 'Gladiator Ring',
    icon: '🥈',
    entryFee: 50,
    minLevel: 3,
    payouts: {
      first: 100, // 2.0x
      second: 75, // 1.5x
      third: 50, // 1.0x
      fourth: 0,
    },
    xpRewards: {
      first: 200,
      second: 140,
      third: 80,
      fourth: 30,
    },
    trophyRewards: {
      first: 35,
      second: 18,
      third: -5,
      fourth: -18,
    },
    bgGradient: 'from-blue-950/70 via-slate-900 to-black',
    badge: '50 COINS',
  },
  {
    id: 'high_stakes_200',
    name: 'High Stakes Pit',
    icon: '🥇',
    entryFee: 200,
    minLevel: 5,
    payouts: {
      first: 400, // 2.0x
      second: 300, // 1.5x
      third: 200, // 1.0x
      fourth: 0,
    },
    xpRewards: {
      first: 400,
      second: 280,
      third: 160,
      fourth: 60,
    },
    trophyRewards: {
      first: 50,
      second: 25,
      third: -10,
      fourth: -25,
    },
    bgGradient: 'from-purple-950/70 via-zinc-900 to-black',
    badge: '200 COINS',
  },
  {
    id: 'champions_1000',
    name: 'Overkill Champions',
    icon: '👑',
    entryFee: 1000,
    minLevel: 10,
    payouts: {
      first: 2000, // 2.0x
      second: 1500, // 1.5x
      third: 1000, // 1.0x
      fourth: 0,
    },
    xpRewards: {
      first: 1000,
      second: 700,
      third: 400,
      fourth: 150,
    },
    trophyRewards: {
      first: 75,
      second: 35,
      third: -15,
      fourth: -40,
    },
    bgGradient: 'from-rose-950/80 via-red-950/40 to-black',
    badge: '1,000 COINS',
  },
];

export function getTierById(tierId: string): LobbyTier {
  return LOBBY_TIERS.find(t => t.id === tierId) || LOBBY_TIERS[0];
}

export function getRankDetails(trophies: number): {
  tierName: string;
  division: string;
  badgeIcon: string;
  color: string;
  nextTierTrophies: number;
} {
  if (trophies < 300) {
    return { tierName: 'Bronze', division: `${Math.floor(trophies / 100) + 1}`, badgeIcon: '🥉', color: 'text-amber-600', nextTierTrophies: 300 };
  } else if (trophies < 700) {
    return { tierName: 'Silver', division: `${Math.floor((trophies - 300) / 133) + 1}`, badgeIcon: '🥈', color: 'text-slate-300', nextTierTrophies: 700 };
  } else if (trophies < 1200) {
    return { tierName: 'Gold', division: `${Math.floor((trophies - 700) / 166) + 1}`, badgeIcon: '🥇', color: 'text-yellow-400', nextTierTrophies: 1200 };
  } else if (trophies < 2000) {
    return { tierName: 'Platinum', division: `${Math.floor((trophies - 1200) / 266) + 1}`, badgeIcon: '💎', color: 'text-cyan-400', nextTierTrophies: 2000 };
  } else {
    return { tierName: 'Merciless Legend', division: 'Top Tier', badgeIcon: '👑', color: 'text-rose-500', nextTierTrophies: 5000 };
  }
}
