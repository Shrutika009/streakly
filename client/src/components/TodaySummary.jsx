import { todayStr } from '../utils/streak';

export default function TodaySummary({ habits }) {
  const today = todayStr();
  const total = habits.length;
  const done = habits.filter((h) => h.completedDates.includes(today)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-medium text-stone-700 dark:text-stone-300">
          Today:{' '}
          <span className="heading">
            {done} / {total}
          </span>{' '}
          done
          {total > 0 && done === total && <span className="ml-2">🎉</span>}
        </p>
        <span className="text-sm font-semibold text-orange-500">{percent}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Habits done today"
      >
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
