import { useState } from 'react';
import dayjs from 'dayjs';
import { currentStreak, longestStreak, weekCount } from '../utils/streak';
import WeekDots from './WeekDots';
import YearHeatmap from './YearHeatmap';
import HabitMenu from './HabitMenu';
import { goalLabel } from '../utils/goals';

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

  function confirmDelete() {
    if (window.confirm(`Delete "${habit.name}"? This can't be undone.`)) {
      onDelete(habit._id);
    }
  }

  const done = new Set(habit.completedDates);
  const yearStart = dayjs().subtract(52, 'week').format('YYYY-MM-DD');
  const yearTotal = habit.completedDates.filter((d) => d >= yearStart).length;

  return (
    <article className="card border-l-4 p-5" style={{ borderLeftColor: habit.color }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="heading truncate text-lg font-semibold">{habit.name}</h2>
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

        <div className="flex shrink-0 items-center gap-1 text-sm">
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
            className={`btn-ghost ${showHistory ? 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100' : ''}`}
          >
            History
          </button>
          <button onClick={() => onEdit(habit)} className="btn-ghost">
            Edit
          </button>
          <HabitMenu
            label={`More actions for ${habit.name}`}
            items={[
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
