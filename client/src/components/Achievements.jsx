import { useMemo } from 'react';
import { achievements } from '../utils/achievements';

// Badge shelf for the Stats view. Locked badges show progress toward them.
export default function Achievements({ habits }) {
  const list = useMemo(() => achievements(habits), [habits]);
  const unlocked = list.filter((a) => a.unlocked).length;

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="heading text-sm font-semibold">Achievements</h3>
        <p className="muted text-xs">
          <strong className="text-stone-700 dark:text-stone-200">{unlocked}</strong> of{' '}
          {list.length} unlocked
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {list.map((a) => (
          <li
            key={a.id}
            title={a.text}
            className={`rounded-xl border p-3 transition ${
              a.unlocked
                ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-500/30 dark:from-orange-500/10 dark:to-amber-500/5'
                : 'border-stone-100 dark:border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`text-2xl ${a.unlocked ? '' : 'opacity-30 grayscale'}`}
              >
                {a.emoji}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    a.unlocked ? 'heading' : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {a.title}
                </p>
                <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                  {a.unlocked ? 'Unlocked' : `${a.value} / ${a.target}`}
                </p>
              </div>
            </div>
            {!a.unlocked && (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${(a.value / a.target) * 100}%` }}
                />
              </div>
            )}
            <span className="sr-only">{a.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
