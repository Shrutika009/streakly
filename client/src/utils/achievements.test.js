import { test } from 'node:test';
import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import { achievements, newlyUnlocked, unlockedIds } from './achievements.js';
import { greeting, quoteOfTheDay, todayMessage } from './greeting.js';

const TODAY = '2026-10-20';
const days = (n) =>
  Array.from({ length: n }, (_, i) => dayjs(TODAY).subtract(i, 'day').format('YYYY-MM-DD'));
const habit = (dates) => ({ name: 'H', completedDates: dates, createdAt: '2026-01-01T00:00:00' });

test('no habits unlocks nothing', () => {
  assert.deepEqual(unlockedIds([], TODAY), []);
});

test('streak and total badges unlock at their targets', () => {
  const ids = unlockedIds([habit(days(7))], TODAY);
  assert.ok(ids.includes('first-tick'));
  assert.ok(ids.includes('streak-3'));
  assert.ok(ids.includes('streak-7'));
  assert.ok(!ids.includes('streak-14'));
});

test('progress is capped at the target', () => {
  const streak3 = achievements([habit(days(10))], TODAY).find((a) => a.id === 'streak-3');
  assert.deepEqual([streak3.value, streak3.target, streak3.unlocked], [3, 3, true]);
});

test('perfect week needs every habit done', () => {
  const a = habit(days(7));
  assert.ok(unlockedIds([a], TODAY).includes('perfect-7'));
  assert.ok(!unlockedIds([a, habit(days(3))], TODAY).includes('perfect-7'));
});

test('newlyUnlocked reports only fresh badges', () => {
  const before = [habit(days(2))];
  const after = [habit(days(3))];
  assert.deepEqual(
    newlyUnlocked(before, after, TODAY).map((a) => a.id),
    ['streak-3']
  );
  assert.deepEqual(newlyUnlocked(after, after, TODAY), []);
});

test('greeting follows the hour', () => {
  assert.equal(greeting(3), 'Up late');
  assert.equal(greeting(9), 'Good morning');
  assert.equal(greeting(14), 'Good afternoon');
  assert.equal(greeting(19), 'Good evening');
  assert.equal(greeting(23), 'Good night');
});

test('quote is stable within a day', () => {
  const morning = quoteOfTheDay(dayjs('2026-10-20T07:00:00'));
  const evening = quoteOfTheDay(dayjs('2026-10-20T22:00:00'));
  assert.deepEqual(morning, evening);
  assert.ok(morning.text && morning.author);
});

test('todayMessage', () => {
  assert.match(todayMessage(0, 0), /first habit/);
  assert.match(todayMessage(0, 1), /1 habit waiting/);
  assert.match(todayMessage(1, 3), /2 to go/);
  assert.match(todayMessage(3, 3), /Everything done/);
});
