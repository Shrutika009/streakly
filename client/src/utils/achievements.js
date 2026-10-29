import { longestStreak, todayStr } from './streak.js';
import { habitStart, lastDays } from './stats.js';

// Each badge reads one measure (see measures below) and unlocks once
// that measure reaches its target.
const BADGES = [
  {
    id: 'first-tick',
    emoji: '🌱',
    title: 'First step',
    text: 'Tick off a habit for the first time',
    target: 1,
    measure: 'total',
  },
  {
    id: 'streak-3',
    emoji: '🔥',
    title: 'Warming up',
    text: 'Reach a 3-day streak',
    target: 3,
    measure: 'streak',
  },
  {
    id: 'streak-7',
    emoji: '⚡',
    title: 'One week strong',
    text: 'Reach a 7-day streak',
    target: 7,
    measure: 'streak',
  },
  {
    id: 'streak-14',
    emoji: '💪',
    title: 'Fortnight',
    text: 'Reach a 14-day streak',
    target: 14,
    measure: 'streak',
  },
  {
    id: 'streak-30',
    emoji: '🏅',
    title: 'Habit formed',
    text: 'Reach a 30-day streak',
    target: 30,
    measure: 'streak',
  },
  {
    id: 'streak-100',
    emoji: '💯',
    title: 'Centurion',
    text: 'Reach a 100-day streak',
    target: 100,
    measure: 'streak',
  },
  {
    id: 'streak-365',
    emoji: '👑',
    title: 'Year of you',
    text: 'Reach a 365-day streak',
    target: 365,
    measure: 'streak',
  },
  {
    id: 'total-50',
    emoji: '✅',
    title: 'Fifty ticks',
    text: 'Complete 50 check-ins in total',
    target: 50,
    measure: 'total',
  },
  {
    id: 'total-250',
    emoji: '🎯',
    title: 'Dedicated',
    text: 'Complete 250 check-ins in total',
    target: 250,
    measure: 'total',
  },
  {
    id: 'total-1000',
    emoji: '🚀',
    title: 'Unstoppable',
    text: 'Complete 1,000 check-ins in total',
    target: 1000,
    measure: 'total',
  },
  {
    id: 'perfect-7',
    emoji: '🌟',
    title: 'Perfect week',
    text: 'Finish every habit 7 days in a row',
    target: 7,
    measure: 'perfectRun',
  },
  {
    id: 'habits-5',
    emoji: '🧩',
    title: 'Collector',
    text: 'Track 5 habits at once',
    target: 5,
    measure: 'habits',
  },
];

// Longest run of consecutive days (in the last year) where every habit was done.
// This runs on every tick, so the date sets are built once up front.
function perfectRun(habits, today) {
  const prepared = habits.map((h) => ({ start: habitStart(h), ticks: new Set(h.completedDates) }));
  let best = 0;
  let run = 0;
  for (const day of lastDays(365, today)) {
    const existing = prepared.filter((h) => h.start && day >= h.start);
    const perfect = existing.length > 0 && existing.every((h) => h.ticks.has(day));
    run = perfect ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

function measures(habits, today) {
  return {
    total: habits.reduce((sum, h) => sum + h.completedDates.length, 0),
    streak: habits.reduce((best, h) => Math.max(best, longestStreak(h.completedDates)), 0),
    perfectRun: habits.length ? perfectRun(habits, today) : 0,
    habits: habits.length,
  };
}

// All badges with their progress, unlocked ones first.
export function achievements(habits, today = todayStr()) {
  const m = measures(habits, today);
  return BADGES.map((badge) => {
    const value = Math.min(m[badge.measure], badge.target);
    return { ...badge, value, unlocked: value >= badge.target };
  });
}

export function unlockedIds(habits, today = todayStr()) {
  return achievements(habits, today)
    .filter((a) => a.unlocked)
    .map((a) => a.id);
}

// Badges unlocked in `after` that weren't in `before`.
export function newlyUnlocked(before, after, today = todayStr()) {
  const had = new Set(unlockedIds(before, today));
  return achievements(after, today).filter((a) => a.unlocked && !had.has(a.id));
}
