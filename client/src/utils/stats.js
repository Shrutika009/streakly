import dayjs from 'dayjs';
import { currentStreak, longestStreak, todayStr } from './streak.js';

const FORMAT = 'YYYY-MM-DD';
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// The first day a habit "existed": whichever is earlier, the day it was created
// or its first tick (imported habits can have ticks from before createdAt).
export function habitStart(habit) {
  const created = habit.createdAt ? dayjs(habit.createdAt).format(FORMAT) : null;
  const first = habit.completedDates.length ? [...habit.completedDates].sort()[0] : null;
  if (!created) return first;
  if (!first) return created;
  return first < created ? first : created;
}

// The `count` days ending on `today`, oldest first, as YYYY-MM-DD strings.
export function lastDays(count, today = todayStr()) {
  const end = dayjs(today);
  return Array.from({ length: count }, (_, i) => end.subtract(count - 1 - i, 'day').format(FORMAT));
}

// Share of possible check-ins actually done over `days`. A day only counts
// as possible for a habit once the habit exists. Returns { done, possible, rate }.
export function completion(habits, days) {
  let done = 0;
  let possible = 0;
  for (const habit of habits) {
    const start = habitStart(habit);
    const ticks = new Set(habit.completedDates);
    for (const day of days) {
      if (!start || day < start) continue;
      possible++;
      if (ticks.has(day)) done++;
    }
  }
  return { done, possible, rate: possible ? done / possible : 0 };
}

// Map of date -> share of habits done that day (0..1), for the overall heatmap.
// Days before any habit existed are left out.
export function dailyShare(habits, days) {
  const share = new Map();
  for (const day of days) {
    const { done, possible } = completion(habits, [day]);
    if (possible) share.set(day, done / possible);
  }
  return share;
}

// Completion rate for each weekday, Monday first.
export function weekdayRates(habits, days) {
  const buckets = WEEKDAYS.map(() => []);
  for (const day of days) {
    buckets[(dayjs(day).day() + 6) % 7].push(day);
  }
  return buckets.map((bucket, i) => ({ label: WEEKDAYS[i], ...completion(habits, bucket) }));
}

// Days where every habit that existed was ticked.
export function perfectDays(habits, days) {
  return days.filter((day) => {
    const { done, possible } = completion(habits, [day]);
    return possible > 0 && done === possible;
  }).length;
}

// How many of the last `weeks` full weeks (Mon–Sun, not counting this one) met the goal.
// Weeks before the habit existed don't count. Returns { met, weeks }.
export function goalWeeks(habit, weeks = 12, today = todayStr()) {
  const goal = habit.weeklyGoal || 7;
  const start = habitStart(habit);
  const ticks = new Set(habit.completedDates);
  const thisMonday = dayjs(today).subtract((dayjs(today).day() + 6) % 7, 'day');

  let met = 0;
  let counted = 0;
  for (let w = 1; w <= weeks; w++) {
    const monday = thisMonday.subtract(w, 'week');
    const sunday = monday.add(6, 'day').format(FORMAT);
    if (!start || sunday < start) continue;

    counted++;
    let count = 0;
    for (let d = 0; d < 7; d++) {
      if (ticks.has(monday.add(d, 'day').format(FORMAT))) count++;
    }
    if (count >= goal) met++;
  }
  return { met, weeks: counted };
}

// One row per habit for the stats table.
export function habitRows(habits, today = todayStr()) {
  const last30 = lastDays(30, today);
  return habits.map((habit) => ({
    habit,
    current: currentStreak(habit.completedDates, today),
    best: longestStreak(habit.completedDates),
    total: habit.completedDates.length,
    rate30: completion([habit], last30).rate,
    goal: goalWeeks(habit, 12, today),
  }));
}

// Headline numbers for the stat tiles.
export function overview(habits, today = todayStr()) {
  const last30 = lastDays(30, today);
  const { done, rate } = completion(habits, last30);
  const rows = habitRows(habits, today);
  const top = rows.reduce((best, row) => (!best || row.current > best.current ? row : best), null);

  return {
    activeHabits: habits.length,
    checkIns30: done,
    rate30: rate,
    perfect30: perfectDays(habits, last30),
    topStreak: top && top.current > 0 ? { name: top.habit.name, days: top.current } : null,
  };
}
