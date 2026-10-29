import { currentStreak, todayStr } from '../utils/streak';
import { greeting, quoteOfTheDay, todayMessage } from '../utils/greeting';

const RING = 2 * Math.PI * 34; // circumference of the progress ring (r = 34)

// The welcome panel at the top: greeting, today's progress ring, a few
// quick numbers and the quote of the day.
export default function TodaySummary({ habits, userName }) {
  const today = todayStr();
  const total = habits.length;
  const done = habits.filter((h) => h.completedDates.includes(today)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  const bestStreak = habits.reduce((best, h) => Math.max(best, currentStreak(h.completedDates)), 0);
  const quote = quoteOfTheDay();
  const firstName = userName?.split(' ')[0];

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      {/* soft accent glow in the corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(249_115_22/0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,rgb(249_115_22/0.10),transparent_55%)]"
      />

      <div className="relative flex items-center gap-5">
        <div
          className="relative h-20 w-20 shrink-0"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Habits done today"
        >
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="8"
              className="stroke-stone-100 dark:stroke-stone-800"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={`transition-[stroke-dashoffset] duration-700 ${allDone ? 'stroke-green-500' : 'stroke-orange-500'}`}
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - percent / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {allDone ? (
              <span className="text-2xl" aria-hidden="true">
                🎉
              </span>
            ) : (
              <span className="heading text-lg font-bold tabular-nums">{percent}%</span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="muted text-sm">
            {greeting()}
            {firstName ? `, ${firstName}` : ''} 👋
          </p>
          <p className="heading mt-0.5 text-xl font-bold">
            {done} of {total} done today
          </p>
          <p className="muted mt-1 text-sm">{todayMessage(done, total)}</p>
        </div>

        {bestStreak > 0 && (
          <div className="hidden shrink-0 rounded-xl bg-orange-50 px-3 py-2 text-center sm:block dark:bg-orange-500/10">
            <p className="text-xl font-bold text-orange-600 tabular-nums dark:text-orange-400">
              🔥 {bestStreak}
            </p>
            <p className="text-[11px] font-medium text-orange-700/70 dark:text-orange-300/70">
              top streak
            </p>
          </div>
        )}
      </div>

      <figure className="relative mt-5 border-t border-stone-100 pt-4 dark:border-stone-800">
        <blockquote className="text-sm italic text-stone-600 dark:text-stone-300">
          “{quote.text}”
        </blockquote>
        <figcaption className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          {quote.author}
        </figcaption>
      </figure>
    </section>
  );
}
