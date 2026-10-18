import { currentStreak, longestStreak } from '../utils/streak';
import WeekDots from './WeekDots';

export default function HabitCard({ habit, onToggle, onEdit, onDelete, weekOffset = 0 }) {
  const current = currentStreak(habit.completedDates);
  const best = longestStreak(habit.completedDates);

  function confirmDelete() {
    if (window.confirm(`Delete "${habit.name}"? This can't be undone.`)) {
      onDelete(habit._id);
    }
  }

  return (
    <article
      className="rounded-2xl border-l-4 bg-white p-5 shadow-sm ring-1 ring-stone-100"
      style={{ borderLeftColor: habit.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-stone-900">{habit.name}</h2>
          <div className="mt-1 flex gap-4 text-sm text-stone-500">
            <span>
              Streak <strong style={{ color: habit.color }}>{current}</strong>{' '}
              {current === 1 ? 'day' : 'days'}
            </span>
            <span>
              Best <strong className="text-stone-700">{best}</strong>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1 text-sm">
          <button
            onClick={() => onEdit(habit)}
            className="rounded-lg px-2.5 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            Edit
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-lg px-2.5 py-1 text-stone-500 hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <WeekDots
        dates={habit.completedDates}
        color={habit.color}
        weekOffset={weekOffset}
        onToggle={(date) => onToggle(habit._id, date)}
      />
    </article>
  );
}
