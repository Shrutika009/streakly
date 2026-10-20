// Run with: npm test (uses Node's built-in test runner, no extra deps)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak, longestStreak } from './streak.js';
import {
  completion,
  dailyShare,
  goalWeeks,
  habitStart,
  lastDays,
  overview,
  perfectDays,
  weekdayRates,
} from './stats.js';

// 2026-10-20 is a Tuesday.
const TODAY = '2026-10-20';

function habit(dates, createdAt = '2026-10-01T09:00:00', extra = {}) {
  return { name: 'Test', completedDates: dates, createdAt, ...extra };
}

test('currentStreak survives an unticked today', () => {
  assert.equal(currentStreak(['2026-10-18', '2026-10-19'], TODAY), 2);
  assert.equal(currentStreak(['2026-10-18', '2026-10-19', TODAY], TODAY), 3);
  assert.equal(currentStreak(['2026-10-17', '2026-10-19'], TODAY), 1);
  assert.equal(currentStreak(['2026-10-17'], TODAY), 0);
});

test('longestStreak ignores duplicates and order', () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(longestStreak(['2026-10-03', '2026-10-01', '2026-10-02', '2026-10-02']), 3);
  assert.equal(longestStreak(['2026-12-31', '2027-01-01', '2027-01-05']), 2);
});

test('habitStart picks the earlier of createdAt and first tick', () => {
  assert.equal(habitStart(habit(['2026-10-05'])), '2026-10-01');
  assert.equal(habitStart(habit(['2026-09-20', '2026-10-05'])), '2026-09-20');
  assert.equal(habitStart(habit([], null)), null);
});

test('lastDays ends on today, oldest first', () => {
  assert.deepEqual(lastDays(3, TODAY), ['2026-10-18', '2026-10-19', '2026-10-20']);
});

test('completion skips days before the habit existed', () => {
  const h = habit(['2026-10-19', '2026-10-20'], '2026-10-19T08:00:00');
  const result = completion([h], lastDays(7, TODAY));
  assert.deepEqual(result, { done: 2, possible: 2, rate: 1 });
});

test('dailyShare and perfectDays across two habits', () => {
  const a = habit(['2026-10-19', '2026-10-20']);
  const b = habit(['2026-10-20']);
  const days = lastDays(2, TODAY);
  const share = dailyShare([a, b], days);
  assert.equal(share.get('2026-10-19'), 0.5);
  assert.equal(share.get('2026-10-20'), 1);
  assert.equal(perfectDays([a, b], days), 1);
});

test('weekdayRates buckets by Monday-first weekday', () => {
  const h = habit(['2026-10-19'], '2026-10-01T00:00:00'); // a Monday
  const rates = weekdayRates([h], lastDays(14, TODAY));
  assert.equal(rates[0].label, 'Mon');
  assert.deepEqual([rates[0].done, rates[0].possible], [1, 2]);
  assert.equal(rates[2].done, 0);
});

test('goalWeeks counts full past weeks that hit the goal', () => {
  // Week of Oct 12–18: 3 ticks. Week of Oct 5–11: 1 tick.
  const dates = ['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-06'];
  const h = habit(dates, '2026-10-05T00:00:00', { weeklyGoal: 3 });
  assert.deepEqual(goalWeeks(h, 4, TODAY), { met: 1, weeks: 2 });
});

test('overview picks the longest current streak', () => {
  const a = habit(['2026-10-19', '2026-10-20'], '2026-10-01T00:00:00', { name: 'Read' });
  const b = habit(['2026-10-20'], '2026-10-01T00:00:00', { name: 'Run' });
  const o = overview([a, b], TODAY);
  assert.equal(o.activeHabits, 2);
  assert.equal(o.checkIns30, 3);
  assert.deepEqual(o.topStreak, { name: 'Read', days: 2 });
  assert.equal(overview([], TODAY).topStreak, null);
});
