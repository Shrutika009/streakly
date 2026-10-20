import dayjs from 'dayjs';

const FORMAT = 'YYYY-MM-DD';

export function todayStr() {
  return dayjs().format(FORMAT);
}

export function getWeekDays(offset = 0) {
  const target = dayjs().add(offset, 'week');
  // dayjs weeks start on Sunday, we want Monday
  const monday = target.subtract((target.day() + 6) % 7, 'day');
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'));
}

// If today isn't ticked yet the streak is still alive, so we start from yesterday.
export function currentStreak(dates, today = todayStr()) {
  const done = new Set(dates);
  let day = dayjs(today);
  if (!done.has(day.format(FORMAT))) day = day.subtract(1, 'day');

  let count = 0;
  while (done.has(day.format(FORMAT))) {
    count++;
    day = day.subtract(1, 'day');
  }
  return count;
}

export function longestStreak(dates) {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let prev = null;

  for (const d of sorted) {
    const cur = dayjs(d);
    run = prev && cur.diff(prev, 'day') === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

// How many of the dates fall in the Mon–Sun week `offset` weeks from now.
export function weekCount(dates, offset = 0) {
  const days = new Set(getWeekDays(offset).map((d) => d.format(FORMAT)));
  return dates.filter((d) => days.has(d)).length;
}
