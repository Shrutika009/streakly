import { useState } from 'react';
import dayjs from 'dayjs';
import { currentStreak, longestStreak, weekCount } from '../utils/streak';
import WeekDots from './WeekDots';
import YearHeatmap from './YearHeatmap';
import HabitMenu from './HabitMenu';
import { goalLabel } from '../utils/goals';
import { categoryFor } from '../utils/categories';

export default function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onMove,
  canMoveUp,
  canMoveDown,
  weekOffset = 0,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const current = currentStreak(habit.completedDates);
  const best = longestStreak(habit.completedDates);
  const goal = habit.weeklyGoal || 7;
  const thisWeek = weekCount(habit.completedDates, weekOffset);
  const goalMet = thisWeek >= goal;
  const category = categoryFor(habit.category);

  function confirmDelete() {
    if (window.confirm(`Delete "${habit.name}"? This can't be undone.`)) {
      onDelete(habit._id);
    }
  }

  const done = new Set(habit.completedDates);
  const yearStart = dayjs().subtract(52, 'week').format('YYYY-MM-DD');
  const yearTotal = habit.completedDates.filter((d) => d >= yearStart).length;

  return (
    <article
      className="card border-l-4 p-5 transition-shadow hover:shadow-md"
      style={{ borderLeftColor: habit.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `color-mix(in srgb, ${habit.color} 15%, transparent)` }}
          >
            {habit.icon || category.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="heading truncate text-lg font-semibold">{habit.name}</h2>
              {current >= 3 && (
                <span
                  className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                  title={`${current}-day streak`}
                >
                  🔥 {current}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-stone-400 dark:text-stone-500">
              <span>{category.label}</span>
              {habit.reminderTime && <span title="Daily reminder">🔔 {habit.reminderTime}</span>}
            </div>
            <div className="muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>
                Streak <strong style={{ color: habit.color }}>{current}</strong>{' '}
                {current === 1 ? 'day' : 'days'}
              </span>
              <span>
                Best <strong className="text-stone-700 dark:text-stone-200">{best}</strong>
              </span>
              <span title={`Goal: ${goalLabel(goal)}`}>
                {weekOffset === 0 ? 'This week' : 'That week'}{' '}
                <strong className="text-stone-700 dark:text-stone-200">
                  {thisWeek}/{goal}
                </strong>
                {goalMet && (
                  <span className="ml-1 text-green-600 dark:text-green-400" aria-label="goal met">
                    ✓
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-sm">
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
            className={`btn-ghost hidden sm:block ${showHistory ? 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100' : ''}`}
          >
            History
          </button>
          <button onClick={() => onEdit(habit)} className="btn-ghost hidden sm:block">
            Edit
          </button>
          <HabitMenu
            label={`More actions for ${habit.name}`}
            items={[
              // on phones these replace the History / Edit buttons
              {
                label: showHistory ? 'Hide history' : 'Show history',
                onClick: () => setShowHistory((prev) => !prev),
                className: 'sm:hidden',
              },
              { label: 'Edit', onClick: () => onEdit(habit), className: 'sm:hidden' },
              { label: 'Move up', onClick: () => onMove(habit._id, -1), disabled: !canMoveUp },
              { label: 'Move down', onClick: () => onMove(habit._id, 1), disabled: !canMoveDown },
              { label: 'Archive', onClick: () => onArchive(habit._id, true) },
              { label: 'Delete', onClick: confirmDelete, danger: true },
            ]}
          />
        </div>
      </div>

      <WeekDots
        dates={habit.completedDates}
        color={habit.color}
        weekOffset={weekOffset}
        onToggle={(date) => onToggle(habit._id, date)}
      />

      {showHistory && (
        <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
          <YearHeatmap
            color={habit.color}
            getLevel={(date) => (done.has(date) ? 1 : 0)}
            tooltip={(day, level) => `${day.format('ddd, D MMM YYYY')}${level ? ' · done' : ''}`}
            summary={
              <>
                <strong className="text-stone-700 dark:text-stone-200">{yearTotal}</strong>{' '}
                {yearTotal === 1 ? 'day' : 'days'} done in the last year
              </>
            }
          />
        </div>
      )}
    </article>
  );
}
