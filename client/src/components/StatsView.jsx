import { useMemo, useState } from 'react';
import { dailyShare, habitRows, lastDays, overview, weekdayRates } from '../utils/stats';
import YearHeatmap from './YearHeatmap';
import { goalLabel } from '../utils/goals';

const ACCENT = 'var(--color-orange-500)'; // the app's accent, see index.css
const pct = (rate) => `${Math.round(rate * 100)}%`;

export default function StatsView({ habits }) {
  const stats = useMemo(() => {
    const year = lastDays(371);
    return {
      overview: overview(habits),
      share: dailyShare(habits, year),
      weekdays: weekdayRates(habits, lastDays(84)),
      rows: habitRows(habits),
    };
  }, [habits]);

  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center dark:border-stone-800">
        <p className="font-medium text-stone-600 dark:text-stone-300">No stats yet</p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Add a habit and tick a few days to see your progress here.
        </p>
      </div>
    );
  }

  const { overview: o, share, weekdays, rows } = stats;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Done, last 30 days" value={pct(o.rate30)} note={`${o.checkIns30} check-ins`} />
        <StatTile label="Perfect days" value={o.perfect30} note="all done, last 30 days" />
        <StatTile
          label="Top streak"
          value={o.topStreak ? o.topStreak.days : 0}
          note={o.topStreak ? o.topStreak.name : 'tick today to start one'}
        />
        <StatTile label="Active habits" value={o.activeHabits} note="excl. archived" />
      </div>

      <section className="card p-5">
        <h3 className="heading mb-3 text-sm font-semibold">All habits, last year</h3>
        <YearHeatmap
          color={ACCENT}
          legend
          getLevel={(date) => share.get(date) || 0}
          tooltip={(day, level) =>
            `${day.format('ddd, D MMM YYYY')} · ${share.has(day.format('YYYY-MM-DD')) ? `${pct(level)} of habits done` : 'no habits yet'}`
          }
        />
      </section>

      <WeekdayChart rates={weekdays} />

      <HabitTable rows={rows} />
    </div>
  );
}

function StatTile({ label, value, note }) {
  return (
    <div className="card p-4">
      <p className="muted text-xs font-medium">{label}</p>
      <p className="heading mt-1 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500" title={note}>
        {note}
      </p>
    </div>
  );
}

// Completion by day of week. Hover or focus a bar to read its value;
// otherwise the caption names the strongest day.
function WeekdayChart({ rates }) {
  const [active, setActive] = useState(null);
  const withData = rates.filter((r) => r.possible > 0);
  const best = withData.reduce((a, b) => (!a || b.rate > a.rate ? b : a), null);
  const shown = active !== null ? rates[active] : best;

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="heading text-sm font-semibold">By day of the week</h3>
        <p className="muted text-xs" aria-live="polite">
          {shown
            ? shown.possible
              ? `${active === null ? 'Best: ' : ''}${shown.label} · ${pct(shown.rate)} (${shown.done} of ${shown.possible})`
              : `${shown.label} · no data yet`
            : 'Last 12 weeks'}
        </p>
      </div>

      <div className="relative h-32">
        {/* recessive gridlines at 0 / 50 / 100% */}
        {[0, 50, 100].map((line) => (
          <div
            key={line}
            className="absolute inset-x-0 border-t border-stone-100 dark:border-stone-800"
            style={{ bottom: `${line}%` }}
          >
            <span className="absolute -top-2 right-0 bg-white pl-1 text-[9px] text-stone-400 dark:bg-stone-900 dark:text-stone-500">
              {line}%
            </span>
          </div>
        ))}

        <div className="absolute inset-0 right-8 flex items-end justify-around gap-2">
          {rates.map((r, i) => (
            <button
              key={r.label}
              type="button"
              aria-label={`${r.label}: ${r.possible ? pct(r.rate) : 'no data'}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              // the hit area is the full column, wider and taller than the bar
              className="group flex h-full w-full max-w-10 items-end justify-center outline-none"
            >
              <span
                className={`block w-full max-w-7 rounded-t-[4px] bg-orange-500 transition-opacity ${
                  active !== null && active !== i ? 'opacity-40' : ''
                } group-focus-visible:ring-2 group-focus-visible:ring-orange-300`}
                style={{ height: r.possible ? `max(${r.rate * 100}%, 2px)` : 0 }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mr-8 mt-2 flex justify-around gap-2 text-[11px] text-stone-400 dark:text-stone-500">
        {rates.map((r) => (
          <span key={r.label} className="w-full max-w-10 text-center">
            {r.label.charAt(0)}
          </span>
        ))}
      </div>
    </section>
  );
}

function HabitTable({ rows }) {
  return (
    <section className="card overflow-hidden">
      <h3 className="heading px-5 pt-5 text-sm font-semibold">Per habit</h3>
      <div className="overflow-x-auto">
        <table className="mt-3 w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
              <th className="px-5 py-2 font-medium">Habit</th>
              <th className="px-2 py-2 text-right font-medium">Streak</th>
              <th className="px-2 py-2 text-right font-medium">Best</th>
              <th className="px-2 py-2 font-medium">Last 30 days</th>
              <th className="px-5 py-2 text-right font-medium">Goal weeks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ habit, current, best, rate30, goal }) => (
              <tr
                key={habit._id}
                className="border-b border-stone-50 last:border-0 dark:border-stone-800/60"
              >
                <td className="max-w-[180px] px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: habit.color }}
                      aria-hidden="true"
                    />
                    <span className="heading truncate">{habit.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-300">
                  {current}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-stone-700 dark:text-stone-300">
                  {best}
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: pct(rate30), backgroundColor: habit.color }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400">
                      {pct(rate30)}
                    </span>
                  </div>
                </td>
                <td
                  className="px-5 py-2.5 text-right text-xs tabular-nums text-stone-500 dark:text-stone-400"
                  title={`Goal: ${goalLabel(habit.weeklyGoal || 7)}. Full weeks in the last 12 where it was met.`}
                >
                  {goal.weeks ? `${goal.met} / ${goal.weeks}` : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
