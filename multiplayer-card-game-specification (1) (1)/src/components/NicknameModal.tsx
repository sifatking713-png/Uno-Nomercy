'use client';

import React, { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import { UserProfile } from '@/lib/userService';
import { validateNickname } from '@/game/nickname';
import { AlertCircle, CheckCircle2, Edit3, ShieldAlert, Sparkles, User, X } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  userProfile: UserProfile;
  onClose: () => void;
  onUpdateSuccess: (updatedProfile: UserProfile) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  userProfile,
  onClose,
  onUpdateSuccess,
}) => {
  const [newNickname, setNewNickname] = useState<string>(userProfile.username);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateNickname(newNickname);
    if (!validation.valid || !validation.cleanName) {
      setErrorMsg(validation.error || 'Invalid nickname');
      return;
    }

    if (validation.cleanName === userProfile.username) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_nickname',
          userId: userProfile.id,
          newNickname: validation.cleanName,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setSuccessMsg('Nickname successfully updated!');
        onUpdateSuccess(data.profile);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(data.error || 'Failed to update nickname');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-zinc-700 rounded-3xl p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
          <Edit3 className="w-6 h-6" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Edit Display Name</h2>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          Your public name across all matches and global leaderboards.
        </p>

        {/* Live Preview of Composite PlayerCard */}
        <div className="mb-5 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Live Badge Preview:
          </span>
          <div className="flex justify-center">
            <PlayerCard
              username={newNickname.trim() || userProfile.username}
              avatarId={userProfile.avatar}
              bannerId={userProfile.banner}
              titleId={userProfile.title}
              level={userProfile.level}
              coins={userProfile.coins}
              trophies={userProfile.trophies}
              size="md"
            />
          </div>
        </div>

        {/* Input Field */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase text-zinc-300 block mb-1">
            New Nickname (3–16 Characters)
          </label>
          <input
            type="text"
            maxLength={16}
            value={newNickname}
            onChange={(e) => {
              setNewNickname(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Enter nickname..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
          />
          <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-500">
            <span>Letters, numbers, spaces, and hyphens</span>
            <span>{newNickname.length}/16</span>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Nickname'}
          </button>
        </div>
      </div>
    </div>
  );
};
