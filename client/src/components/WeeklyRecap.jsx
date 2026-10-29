import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { overview, weekComparison } from '../utils/stats';
import { currentStreak } from '../utils/streak';
import { drawShareCard, shareOrDownload } from '../utils/shareImage';

const pct = (rate) => `${Math.round(rate * 100)}%`;

// "This week vs last week" panel at the top of Stats, with the share button.
export default function WeeklyRecap({ habits, userName, onShared }) {
  const [sharing, setSharing] = useState(false);
  const recap = useMemo(() => weekComparison(habits), [habits]);

  if (!habits.length) return null;

  const { thisWeek, lastWeek, change, best, days } = recap;
  const up = change !== null && change > 0;
  const down = change !== null && change < 0;

  async function share() {
    setSharing(true);
    try {
      const o = overview(habits);
      const blob = await drawShareCard({
        name: userName?.split(' ')[0],
        rate30: o.rate30,
        checkIns30: o.checkIns30,
        perfect30: o.perfect30,
        topStreak: o.topStreak?.days || 0,
        weekChange: change,
        habits: habits
          .map((h) => ({ name: h.name, color: h.color, current: currentStreak(h.completedDates) }))
          .sort((a, b) => b.current - a.current),
      });
      const result = await shareOrDownload(blob, `streakly-${dayjs().format('YYYY-MM-DD')}.png`);
      if (result === 'downloaded') onShared('Progress image downloaded.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="heading text-sm font-semibold">This week so far</h3>
          <p className="muted text-xs">
            {days === 7 ? 'Mon to Sun' : `First ${days} ${days === 1 ? 'day' : 'days'}`}, compared
            with the same days last week
          </p>
        </div>
        <button
          type="button"
          onClick={share}
          disabled={sharing}
          className="btn-secondary shrink-0 py-1.5 text-xs"
        >
          {sharing ? 'Preparing...' : 'Share progress'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <p className="heading text-4xl font-bold tabular-nums">{pct(thisWeek.rate)}</p>
          <p className="muted text-xs">
            {thisWeek.done} of {thisWeek.possible} check-ins
          </p>
        </div>

        <div className="pb-1">
          {change === null ? (
            <p className="muted text-sm">Nothing to compare with yet</p>
          ) : (
            <p
              className={`text-sm font-semibold ${
                up
                  ? 'text-green-600 dark:text-green-400'
                  : down
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {up ? '▲' : down ? '▼' : '='} {Math.abs(change)} pts{' '}
              <span className="font-normal text-stone-500 dark:text-stone-400">
                vs {pct(lastWeek.rate)} last week
              </span>
            </p>
          )}
          {best && best.rate > 0 && (
            <p className="muted mt-0.5 text-xs">
              Strongest:{' '}
              <span className="font-medium text-stone-700 dark:text-stone-200">{best.name}</span> (
              {pct(best.rate)})
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
