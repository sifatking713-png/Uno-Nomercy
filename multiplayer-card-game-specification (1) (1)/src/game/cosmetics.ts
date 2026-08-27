export type CosmeticTier = 'common' | 'rare' | 'epic' | 'legendary' | 'godly';

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'avatar' | 'banner' | 'card_back' | 'table_theme' | 'sound_pack' | 'title';
  rarity: CosmeticTier;
  price: number;
  gradient?: string;
  accentColor?: string;
  isAnimated?: boolean;
  glowClass?: string;
  borderClass?: string;
  textEffectClass?: string;
  description: string;
  characterArtEmoji?: string; // High-contrast character aesthetic icon/symbol
}

export const COSMETICS_CATALOG: CosmeticItem[] = [
  // ==========================================
  // AVATARS (20+ DISTINCT AVATARS ON TIER LADDER)
  // ==========================================

  // COMMON (0 - 450 coins) - Static clean art
  {
    id: 'avatar_rookie_stacker',
    name: 'Rookie Stacker',
    type: 'avatar',
    rarity: 'common',
    price: 0,
    gradient: 'from-slate-700 to-zinc-900',
    characterArtEmoji: '🧢',
    description: 'Starting avatar for aspiring card duelists.',
  },
  {
    id: 'avatar_pixel_scout',
    name: 'Pixel Scout',
    type: 'avatar',
    rarity: 'common',
    price: 250,
    gradient: 'from-blue-700 to-cyan-900',
    characterArtEmoji: '🤖',
    description: 'A nimble cyber reconnaissance drone.',
  },
  {
    id: 'avatar_iron_cadet',
    name: 'Iron Cadet',
    type: 'avatar',
    rarity: 'common',
    price: 350,
    gradient: 'from-zinc-600 to-stone-900',
    characterArtEmoji: '🛡️',
    description: 'Trained to withstand regular +2 draws.',
  },
  {
    id: 'avatar_copper_knight',
    name: 'Copper Knight',
    type: 'avatar',
    rarity: 'common',
    price: 450,
    gradient: 'from-amber-700 to-orange-950',
    characterArtEmoji: '⚔️',
    description: 'Stalwart warrior with a burnished copper helm.',
  },

  // RARE (600 - 1,400 coins) - Higher quality artwork
  {
    id: 'avatar_cyber_blade',
    name: 'Cyber Ninja',
    type: 'avatar',
    rarity: 'rare',
    price: 700,
    gradient: 'from-cyan-500 via-sky-700 to-blue-950',
    characterArtEmoji: '🥷',
    borderClass: 'border-cyan-400',
    description: 'Silent anime blade fighter with precision hand swaps.',
  },
  {
    id: 'avatar_neon_phantom',
    name: 'Neon Phantom',
    type: 'avatar',
    rarity: 'rare',
    price: 900,
    gradient: 'from-teal-400 via-emerald-700 to-zinc-950',
    characterArtEmoji: '👻',
    borderClass: 'border-teal-400',
    description: 'Ethereal operative that haunts high-tier lobbies.',
  },
  {
    id: 'avatar_crimson_ronin',
    name: 'Crimson Ronin',
    type: 'avatar',
    rarity: 'rare',
    price: 1100,
    gradient: 'from-red-600 via-rose-800 to-black',
    characterArtEmoji: '👺',
    borderClass: 'border-rose-400',
    description: 'A masterless samurai forged in brutal draw exchanges.',
  },
  {
    id: 'avatar_shadow_fang',
    name: 'Shadow Fang',
    type: 'avatar',
    rarity: 'rare',
    price: 1350,
    gradient: 'from-indigo-600 via-purple-900 to-black',
    characterArtEmoji: '🐺',
    borderClass: 'border-indigo-400',
    description: 'Lupine predator who pounces on 1-card vulnerabilities.',
  },

  // EPIC (1,800 - 2,800 coins) - Subtle animation, glow pulses, particle drift
  {
    id: 'avatar_infernal_fiend',
    name: 'Infernal Fiend',
    type: 'avatar',
    rarity: 'epic',
    price: 1900,
    gradient: 'from-orange-600 via-red-700 to-amber-950',
    characterArtEmoji: '🔥',
    isAnimated: true,
    glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse',
    borderClass: 'border-orange-500',
    description: 'Horned demon radiating embers of Mercy Rule eliminations.',
  },
  {
    id: 'avatar_venom_viper',
    name: 'Venom Viper',
    type: 'avatar',
    rarity: 'epic',
    price: 2200,
    gradient: 'from-emerald-500 via-teal-700 to-green-950',
    characterArtEmoji: '🐍',
    isAnimated: true,
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse',
    borderClass: 'border-emerald-400',
    description: 'Venomous cyber serpent with toxic stacking potency.',
  },
  {
    id: 'avatar_thunder_valkyrie',
    name: 'Thunder Valkyrie',
    type: 'avatar',
    rarity: 'epic',
    price: 2500,
    gradient: 'from-yellow-400 via-blue-700 to-indigo-950',
    characterArtEmoji: '⚡',
    isAnimated: true,
    glowClass: 'shadow-[0_0_22px_rgba(250,204,21,0.6)] animate-pulse',
    borderClass: 'border-yellow-400',
    description: 'Lightning-imbued winged maiden commanding storm penalties.',
  },
  {
    id: 'avatar_frost_warden',
    name: 'Frost Warden',
    type: 'avatar',
    rarity: 'epic',
    price: 2800,
    gradient: 'from-sky-300 via-blue-600 to-slate-950',
    characterArtEmoji: '❄️',
    isAnimated: true,
    glowClass: 'shadow-[0_0_22px_rgba(56,189,248,0.7)] animate-pulse',
    borderClass: 'border-sky-300',
    description: 'Glacial sentinel chilling opponent momentum.',
  },

  // LEGENDARY (3,500 - 5,500 coins) - Full animation, motion, energy aura
  {
    id: 'avatar_solar_phoenix',
    name: 'Solar Phoenix',
    type: 'avatar',
    rarity: 'legendary',
    price: 3600,
    gradient: 'from-amber-400 via-rose-600 to-red-950',
    characterArtEmoji: '🦅',
    isAnimated: true,
    glowClass: 'shadow-[0_0_28px_rgba(251,146,60,0.85)] ring-2 ring-amber-400 animate-pulse',
    borderClass: 'border-amber-300',
    description: 'Reborn from the ashes of a 24-card near-elimination hand.',
  },
  {
    id: 'avatar_void_monarch',
    name: 'Void Monarch',
    type: 'avatar',
    rarity: 'legendary',
    price: 4200,
    gradient: 'from-purple-500 via-indigo-800 to-black',
    characterArtEmoji: '👑',
    isAnimated: true,
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.85)] ring-2 ring-purple-400 animate-pulse',
    borderClass: 'border-purple-400',
    description: 'Sovereign of the void realm where discards disappear forever.',
  },
  {
    id: 'avatar_cyber_shogun',
    name: 'Cyber Shogun',
    type: 'avatar',
    rarity: 'legendary',
    price: 4800,
    gradient: 'from-rose-500 via-red-800 to-zinc-950',
    characterArtEmoji: '⚔️',
    isAnimated: true,
    glowClass: 'shadow-[0_0_32px_rgba(244,63,94,0.9)] ring-2 ring-rose-400 animate-pulse',
    borderClass: 'border-rose-400',
    description: 'Warlord wielding twin digital katanas of +10 Overkill.',
  },
  {
    id: 'avatar_abyssal_kraken',
    name: 'Abyssal Leviathan',
    type: 'avatar',
    rarity: 'legendary',
    price: 5400,
    gradient: 'from-cyan-400 via-blue-900 to-black',
    characterArtEmoji: '🐙',
    isAnimated: true,
    glowClass: 'shadow-[0_0_32px_rgba(6,182,212,0.9)] ring-2 ring-cyan-400 animate-pulse',
    borderClass: 'border-cyan-400',
    description: 'Tentacled behemoth dragging opponents under 25 cards.',
  },

  // GODLY (6,500 - 12,000 coins) - Full animation + Rainbow color-cycling effect!
  {
    id: 'avatar_god_of_chaos',
    name: 'God of Chaos',
    type: 'avatar',
    rarity: 'godly',
    price: 7500,
    gradient: 'from-fuchsia-600 via-purple-600 to-amber-500',
    characterArtEmoji: '🌌',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_35px_rgba(217,70,239,0.95)]',
    borderClass: 'border-transparent',
    description: 'A transcendent deity manipulating the random draws of fate.',
  },
  {
    id: 'avatar_celestial_seraph',
    name: 'Celestial Seraph',
    type: 'avatar',
    rarity: 'godly',
    price: 9000,
    gradient: 'from-yellow-300 via-pink-500 to-indigo-600',
    characterArtEmoji: '✨',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_40px_rgba(250,204,21,0.95)]',
    borderClass: 'border-transparent',
    description: 'Six-winged angel of judgment that grants no mercy.',
  },
  {
    id: 'avatar_rainbow_prism_lord',
    name: 'Rainbow Prism Lord',
    type: 'avatar',
    rarity: 'godly',
    price: 11000,
    gradient: 'from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600',
    characterArtEmoji: '💎',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_45px_rgba(236,72,153,1)]',
    borderClass: 'border-transparent',
    description: 'The pinnacle of prestige. Cycles continuously through all prism spectra.',
  },
  {
    id: 'avatar_apex_overkill_sovereign',
    name: 'Apex Overkill Sovereign',
    type: 'avatar',
    rarity: 'godly',
    price: 15000,
    gradient: 'from-red-600 via-yellow-500 to-fuchsia-600',
    characterArtEmoji: '🔱',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_50px_rgba(239,68,68,1)]',
    borderClass: 'border-transparent',
    description: 'The definitive champion of 168-card chaos.',
  },

  // ==========================================
  // BANNERS (WITH ANIMATIONS & RAINBOW EFFECTS)
  // ==========================================

  // Common
  {
    id: 'banner_slate_clean',
    name: 'Slate Minimal',
    type: 'banner',
    rarity: 'common',
    price: 0,
    gradient: 'from-zinc-900 via-slate-900 to-zinc-950',
    description: 'Clean dark slate backdrop frame.',
  },
  {
    id: 'banner_neon_grid',
    name: 'Neon Gridline',
    type: 'banner',
    rarity: 'common',
    price: 300,
    gradient: 'from-indigo-950 via-slate-900 to-zinc-950',
    description: 'Retro synthwave horizon gridline.',
  },

  // Rare
  {
    id: 'banner_hex_matrix',
    name: 'Cobalt Hextech',
    type: 'banner',
    rarity: 'rare',
    price: 850,
    gradient: 'from-blue-950 via-cyan-950 to-zinc-950',
    borderClass: 'border-b-2 border-cyan-500/60',
    description: 'Interlocking cyan honeycomb shield pattern.',
  },
  {
    id: 'banner_crimson_crest',
    name: 'Crimson Crest',
    type: 'banner',
    rarity: 'rare',
    price: 1200,
    gradient: 'from-red-950 via-rose-950 to-black',
    borderClass: 'border-b-2 border-rose-500/60',
    description: 'Deep blood-red samurai battle standard.',
  },

  // Epic (Animated scanning glow)
  {
    id: 'banner_cyber_overdrive',
    name: 'Cyber Overdrive [Animated]',
    type: 'banner',
    rarity: 'epic',
    price: 2200,
    gradient: 'from-blue-900 via-purple-950 to-zinc-950',
    isAnimated: true,
    glowClass: 'border-b-2 border-cyan-400 animate-pulse',
    description: 'Pulsing cyber circuits with scanning blue laser streams.',
  },
  {
    id: 'banner_toxic_biohazard',
    name: 'Biohazard Surge [Animated]',
    type: 'banner',
    rarity: 'epic',
    price: 2600,
    gradient: 'from-emerald-950 via-teal-900 to-black',
    isAnimated: true,
    glowClass: 'border-b-2 border-emerald-400 animate-pulse',
    description: 'Surging neon venom radiation across the nameplate.',
  },

  // Legendary (Full animated magma & thunder surges)
  {
    id: 'banner_volcanic_magma',
    name: 'Molten Magma Surge [Animated]',
    type: 'banner',
    rarity: 'legendary',
    price: 4500,
    gradient: 'from-red-950 via-amber-900 to-black',
    isAnimated: true,
    glowClass: 'magma-flow-banner border-b-2 border-amber-500',
    description: 'Animated flowing liquid lava with flying ember sparks.',
  },
  {
    id: 'banner_storm_matrix',
    name: 'Electric Tempest [Animated]',
    type: 'banner',
    rarity: 'legendary',
    price: 5200,
    gradient: 'from-indigo-950 via-purple-900 to-cyan-950',
    isAnimated: true,
    glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.7)] border-b-2 border-purple-400',
    description: 'Cascading violet lightning bolts that discharge along the frame.',
  },

  // Godly (Full Rainbow animated Chroma cycle)
  {
    id: 'banner_rainbow_chroma_supernova',
    name: 'Rainbow Chroma Supernova [Godly Animated]',
    type: 'banner',
    rarity: 'godly',
    price: 8500,
    gradient: 'from-purple-950 via-fuchsia-950 to-pink-950',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_25px_rgba(236,72,153,0.8)]',
    description: 'Continuous spectral rainbow wave cycling across a celestial starfield.',
  },
  {
    id: 'banner_god_of_mercy_gold',
    name: 'Crown of No Mercy [Godly Animated]',
    type: 'banner',
    rarity: 'godly',
    price: 12000,
    gradient: 'from-yellow-950 via-amber-900 to-black',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_30px_rgba(250,204,21,0.9)]',
    description: 'Pure 24K gilded dragon filigree with flashing prism coronas.',
  },

  // ==========================================
  // TITLES (WITH ANIMATED GLOW & COLOR-CYCLING)
  // ==========================================

  // Common
  {
    id: 'title_rookie',
    name: 'Rookie Stacker',
    type: 'title',
    rarity: 'common',
    price: 0,
    description: 'Just taking your first steps in the merciless arena.',
  },
  {
    id: 'title_card_shuffler',
    name: 'Card Shuffler',
    type: 'title',
    rarity: 'common',
    price: 250,
    description: 'Always keeps hands clean and shuffled.',
  },

  // Rare
  {
    id: 'title_hand_thief',
    name: 'Hand Thief (7-Master)',
    type: 'title',
    rarity: 'rare',
    price: 800,
    borderClass: 'text-amber-400 font-bold',
    description: 'Famous for stealing 1-card winning hands.',
  },
  {
    id: 'title_draw10_master',
    name: 'Overkill Specialist',
    type: 'title',
    rarity: 'rare',
    price: 1200,
    borderClass: 'text-rose-400 font-bold',
    description: 'Drops +10 Overkill bombs without remorse.',
  },

  // Epic (Animated glow pulses)
  {
    id: 'title_stacking_maestro',
    name: 'Stacking Maestro',
    type: 'title',
    rarity: 'epic',
    price: 2200,
    isAnimated: true,
    textEffectClass: 'text-cyan-400 animate-pulse font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    description: 'Chains +2 and +4 cards indefinitely.',
  },
  {
    id: 'title_mercy_denier',
    name: 'Mercy Denier',
    type: 'title',
    rarity: 'epic',
    price: 2800,
    isAnimated: true,
    textEffectClass: 'text-rose-500 animate-pulse font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]',
    description: 'Pushes opponents straight past 25 cards.',
  },

  // Legendary (Blazing energy animated fire text)
  {
    id: 'title_ruthless_executioner',
    name: 'Ruthless Executioner',
    type: 'title',
    rarity: 'legendary',
    price: 4500,
    isAnimated: true,
    textEffectClass: 'text-amber-300 font-black animate-pulse drop-shadow-[0_0_14px_rgba(251,191,36,0.9)] tracking-wider',
    description: 'Feared in every high-stakes 1,000-coin lobby.',
  },
  {
    id: 'title_void_harbinger',
    name: 'Void Harbinger',
    type: 'title',
    rarity: 'legendary',
    price: 5500,
    isAnimated: true,
    textEffectClass: 'text-purple-300 font-black animate-pulse drop-shadow-[0_0_14px_rgba(192,132,252,0.9)] tracking-wider',
    description: 'Calls upon the eternal dark discard abyss.',
  },

  // Godly (Top-tier Rainbow color-cycling continuous animation!)
  {
    id: 'title_god_of_mercy',
    name: '« GOD OF NO MERCY »',
    type: 'title',
    rarity: 'godly',
    price: 9500,
    isAnimated: true,
    textEffectClass: 'rainbow-animated-text font-black tracking-widest text-sm',
    description: 'Vibrant rainbow color-cycling animated text. The ultimate status symbol.',
  },
  {
    id: 'title_rainbow_chaos_deity',
    name: '« RAINBOW CHAOS DEITY »',
    type: 'title',
    rarity: 'godly',
    price: 14000,
    isAnimated: true,
    textEffectClass: 'rainbow-animated-text font-black tracking-widest text-sm drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]',
    description: 'Supreme prismatic ruler of all 168 Chaos Cards.',
  },

  // ==========================================
  // CARD BACKS
  // ==========================================
  {
    id: 'cardback_classic_dark',
    name: 'Obsidian Hex',
    type: 'card_back',
    rarity: 'common',
    price: 0,
    gradient: 'from-neutral-900 via-neutral-950 to-black',
    accentColor: '#6366f1',
    description: 'The standard dark obsidian card back with neon geometric lines.',
  },
  {
    id: 'cardback_dragon_scales',
    name: 'Crimson Dragon',
    type: 'card_back',
    rarity: 'rare',
    price: 1000,
    gradient: 'from-red-900 via-rose-950 to-black',
    accentColor: '#ef4444',
    description: 'Etched with fiery crimson dragon scales.',
  },
  {
    id: 'cardback_cyber_matrix',
    name: 'Cyber Matrix [Animated]',
    type: 'card_back',
    rarity: 'epic',
    price: 2500,
    gradient: 'from-emerald-950 via-teal-950 to-black',
    accentColor: '#10b981',
    isAnimated: true,
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.7)]',
    description: 'Glowing green neon matrix streams on carbon weave.',
  },
  {
    id: 'cardback_rainbow_prism',
    name: 'Prismatic Aurora [Godly]',
    type: 'card_back',
    rarity: 'godly',
    price: 7500,
    gradient: 'from-indigo-600 via-fuchsia-600 to-amber-500',
    accentColor: '#ec4899',
    isAnimated: true,
    glowClass: 'rainbow-animated-border shadow-[0_0_20px_rgba(236,72,153,0.8)]',
    description: 'Continuously shimmering iridescent prismatic card back.',
  },

  // ==========================================
  // TABLE THEMES
  // ==========================================
  {
    id: 'table_cyber_arena',
    name: 'Cyber Underground',
    type: 'table_theme',
    rarity: 'common',
    price: 0,
    gradient: 'from-slate-900 via-zinc-950 to-black',
    description: 'High-tech subterranean holographic table.',
  },
  {
    id: 'table_crimson_volcano',
    name: 'Inferno Arena',
    type: 'table_theme',
    rarity: 'rare',
    price: 1200,
    gradient: 'from-red-950 via-stone-950 to-black',
    accentColor: '#dc2626',
    description: 'Floating arena surrounded by flowing magma rivers.',
  },
  {
    id: 'table_deep_space',
    name: 'Cosmic Nebula [Epic]',
    type: 'table_theme',
    rarity: 'epic',
    price: 3000,
    gradient: 'from-indigo-950 via-purple-950 to-black',
    accentColor: '#8b5cf6',
    isAnimated: true,
    description: 'Play amongst celestial stars and swirling purple nebulas.',
  },
  {
    id: 'table_rainbow_celestial',
    name: 'Prismatic Pantheon [Godly]',
    type: 'table_theme',
    rarity: 'godly',
    price: 8500,
    gradient: 'from-purple-950 via-pink-950 to-indigo-950',
    accentColor: '#f43f5e',
    isAnimated: true,
    glowClass: 'rainbow-animated-border',
    description: 'The golden championship table of the gods with rainbow neon rim.',
  },
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETICS_CATALOG.find((item) => item.id === id);
}

export function getCosmeticByTypeAndName(type: CosmeticItem['type'], name: string): CosmeticItem | undefined {
  return COSMETICS_CATALOG.find((item) => item.type === type && item.name === name);
}
