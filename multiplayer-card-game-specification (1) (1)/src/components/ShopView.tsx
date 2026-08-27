'use client';

import React, { useState } from 'react';
import { COSMETICS_CATALOG, CosmeticItem, CosmeticTier } from '@/game/cosmetics';
import { UserProfile } from '@/lib/userService';
import { PlayerCard } from './PlayerCard';
import { Check, Coins, Flame, Palette, Shield, Sparkles, Wand2 } from 'lucide-react';

interface ShopViewProps {
  userProfile: UserProfile;
  onEquipItem: (item: CosmeticItem) => Promise<void>;
  onBuyItem: (item: CosmeticItem) => Promise<void>;
}

export const ShopView: React.FC<ShopViewProps> = ({
  userProfile,
  onEquipItem,
  onBuyItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<'avatar' | 'banner' | 'title' | 'card_back' | 'table_theme'>('avatar');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | CosmeticTier>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter items by category and tier
  const filteredItems = COSMETICS_CATALOG.filter((item) => {
    if (item.type !== activeCategory) return false;
    if (selectedTierFilter !== 'all' && item.rarity !== selectedTierFilter) return false;
    return true;
  });

  const isEquipped = (item: CosmeticItem) => {
    if (item.type === 'avatar') return userProfile.avatar === item.id;
    if (item.type === 'banner') return userProfile.banner === item.id;
    if (item.type === 'card_back') return userProfile.cardBack === item.id;
    if (item.type === 'table_theme') return userProfile.tableTheme === item.id;
    if (item.type === 'title') return userProfile.title === item.name || userProfile.title === item.id;
    return false;
  };

  const isOwned = (item: CosmeticItem) => {
    return userProfile.unlockedItems.includes(item.id) || item.price === 0;
  };

  const handleAction = async (item: CosmeticItem) => {
    setIsLoading(true);
    try {
      if (isOwned(item)) {
        await onEquipItem(item);
      } else {
        if (userProfile.coins < item.price) {
          alert(`You need ${item.price.toLocaleString()} coins to unlock this!`);
          return;
        }
        await onBuyItem(item);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityBadge = (rarity: CosmeticTier) => {
    switch (rarity) {
      case 'godly':
        return { text: 'GODLY RAINBOW', color: 'rainbow-animated-text font-black' };
      case 'legendary':
        return { text: 'LEGENDARY', color: 'bg-amber-500 text-black font-black' };
      case 'epic':
        return { text: 'EPIC ANIMATED', color: 'bg-purple-900/90 text-purple-300 border border-purple-500/50' };
      case 'rare':
        return { text: 'RARE', color: 'bg-blue-900/90 text-blue-300 border border-blue-500/50' };
      default:
        return { text: 'COMMON', color: 'bg-zinc-800 text-zinc-400' };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col gap-5 animate-fadeIn font-sans">
      {/* HEADER WITH LIVE PROFILE BADGE & COIN BALANCE */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <PlayerCard
            username={userProfile.username}
            avatarId={userProfile.avatar}
            bannerId={userProfile.banner}
            titleId={userProfile.title}
            coins={userProfile.coins}
            level={userProfile.level}
            size="md"
          />
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/90 border border-zinc-800 px-4 py-2.5 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 text-amber-400">
            <Coins className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-zinc-400">Available Coins</div>
              <div className="text-lg sm:text-xl font-black">{userProfile.coins.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-800">
        {[
          { id: 'avatar', label: 'Avatars (20+)', icon: Sparkles },
          { id: 'banner', label: 'Banners (Animated)', icon: Shield },
          { id: 'title', label: 'Titles (Rainbow)', icon: Palette },
          { id: 'card_back', label: 'Card Backs', icon: Wand2 },
          { id: 'table_theme', label: 'Table Themes', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                isActive
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-102'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TIER FILTER BAR (Common, Rare, Epic, Legendary, Godly) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1 shrink-0">Filter Tier:</span>
        {(['all', 'common', 'rare', 'epic', 'legendary', 'godly'] as const).map((tier) => {
          const isSelected = selectedTierFilter === tier;

          return (
            <button
              key={tier}
              onClick={() => setSelectedTierFilter(tier)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                isSelected
                  ? tier === 'godly'
                    ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white shadow'
                    : 'bg-zinc-200 text-black font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              {tier}
            </button>
          );
        })}
      </div>

      {/* COSMETICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredItems.map((item) => {
          const owned = isOwned(item);
          const equipped = isEquipped(item);
          const rarityBadge = getRarityBadge(item.rarity);

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl border-2 p-4 flex flex-col justify-between gap-3 transition-all duration-200 bg-zinc-900/70 hover:bg-zinc-900 ${
                equipped
                  ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_25px_rgba(250,204,21,0.25)]'
                  : owned
                  ? 'border-zinc-700'
                  : 'border-zinc-800 opacity-90'
              }`}
            >
              {/* Top info badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rarityBadge.color}`}>
                  {rarityBadge.text}
                </span>

                {equipped && (
                  <span className="text-[9px] font-black uppercase text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> EQUIPPED
                  </span>
                )}
              </div>

              {/* Preview Box */}
              <div className="h-28 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center p-2 overflow-hidden relative">
                {item.type === 'avatar' && (
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${item.gradient} border-2 ${
                      item.borderClass || 'border-white/30'
                    } flex items-center justify-center text-2xl shadow-lg ${item.glowClass || ''}`}
                  >
                    {item.characterArtEmoji ? item.characterArtEmoji : item.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {item.type === 'banner' && (
                  <div
                    className={`w-full h-16 rounded-lg bg-gradient-to-r ${item.gradient} border border-white/20 flex items-center justify-center font-black text-xs text-white uppercase ${
                      item.glowClass || ''
                    }`}
                  >
                    {item.name}
                  </div>
                )}

                {item.type === 'title' && (
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                      Title Style Preview
                    </span>
                    <span className={item.textEffectClass || 'text-sm font-black text-white'}>
                      {item.name}
                    </span>
                  </div>
                )}

                {item.type === 'card_back' && (
                  <div
                    className={`w-12 h-18 rounded-lg bg-gradient-to-br ${item.gradient} border-2 border-white/30 flex items-center justify-center text-[9px] font-black text-white shadow-md ${
                      item.glowClass || ''
                    }`}
                  >
                    NO MERCY
                  </div>
                )}

                {item.type === 'table_theme' && (
                  <div
                    className={`w-full h-20 rounded-xl bg-gradient-to-tr ${item.gradient} border border-white/20 flex items-center justify-center text-xs font-black text-white ${
                      item.glowClass || ''
                    }`}
                  >
                    {item.name}
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="font-black text-sm sm:text-base text-white">{item.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-tight">{item.description}</p>
              </div>

              {/* Action Button */}
              <div>
                {equipped ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-400 font-black text-xs uppercase cursor-default"
                  >
                    Equipped
                  </button>
                ) : owned ? (
                  <button
                    onClick={() => handleAction(item)}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase tracking-wider border border-zinc-600 transition-colors"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(item)}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Unlock ({item.price.toLocaleString()} Coins)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
