import { CARD_COLORS } from './cards';
import { CardColor, Disruption } from './types';

export const DISRUPTIONS_POOL: Omit<Disruption, 'id'>[] = [
  {
    name: 'Yellow Cards Banned!',
    description: 'Sunburst Yellow cards cannot be played for the duration!',
    icon: '🚫',
    colorTheme: 'from-amber-600 to-yellow-800',
    durationSeconds: 35,
    type: 'banned_color',
    bannedColor: 'sunburst',
  },
  {
    name: 'Red Cards Banned!',
    description: 'Crimson Red cards are locked and forbidden!',
    icon: '⛔',
    colorTheme: 'from-red-600 to-rose-900',
    durationSeconds: 35,
    type: 'banned_color',
    bannedColor: 'crimson',
  },
  {
    name: 'Blue Cards Banned!',
    description: 'Cobalt Blue cards are submerged and unusable!',
    icon: '🧊',
    colorTheme: 'from-blue-600 to-indigo-900',
    durationSeconds: 35,
    type: 'banned_color',
    bannedColor: 'cobalt',
  },
  {
    name: 'Green Cards Banned!',
    description: 'Emerald Green cards are corrupted and unusable!',
    icon: '☣️',
    colorTheme: 'from-emerald-600 to-teal-900',
    durationSeconds: 35,
    type: 'banned_color',
    bannedColor: 'emerald',
  },
  {
    name: 'Double Penalty Overdrive!',
    description: 'All Draw penalties inflicted during this period are multiplied x2!',
    icon: '⚡',
    colorTheme: 'from-purple-600 to-red-600',
    durationSeconds: 40,
    type: 'double_penalty',
  },
  {
    name: 'Turbo Speed Round!',
    description: 'Turn timers cut down to 6 seconds! Act fast or auto-draw!',
    icon: '⏱️',
    colorTheme: 'from-orange-500 to-red-700',
    durationSeconds: 30,
    type: 'turbo_turns',
  },
  {
    name: 'Color Vortex!',
    description: 'Active color rotates every single turn!',
    icon: '🌀',
    colorTheme: 'from-fuchsia-600 to-cyan-600',
    durationSeconds: 35,
    type: 'color_chaos',
  },
];

export function getRandomDisruption(): Disruption {
  const template = DISRUPTIONS_POOL[Math.floor(Math.random() * DISRUPTIONS_POOL.length)];
  return {
    ...template,
    id: `disrupt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
}
