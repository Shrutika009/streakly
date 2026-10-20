import { useState } from 'react';
import HabitCard from './HabitCard';
import { getWeekDays } from '../utils/streak';

export default function HabitList({ habits, onToggle, onEdit, onDelete, onArchive, onMove }) {
  const [weekOffset, setWeekOffset] = useState(0);

  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center dark:border-stone-800">
        <p className="font-medium text-stone-600 dark:text-stone-300">
          No habits yet. Add your first one!
        </p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Start small, one tick a day is enough.
        </p>
      </div>
    );
  }

  const days = getWeekDays(weekOffset);
  const start = days[0];
  const end = days[6];
  const isSameYear = start.year() === end.year();
  const dateRangeStr = isSameYear
    ? `${start.format('D MMM')} – ${end.format('D MMM')}`
    : `${start.format('D MMM YYYY')} – ${end.format('D MMM YYYY')}`;

  const weekTitle =
    weekOffset === 0
      ? 'This week'
      : weekOffset === -1
        ? 'Last week'
        : `${Math.abs(weekOffset)} weeks ago`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="heading font-semibold">{weekTitle}</span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="muted">{dateRangeStr}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="btn-ghost mr-1 text-xs font-medium"
            >
              Current week
            </button>
          )}
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            aria-label="Previous week"
            title="Previous week"
            className="icon-btn"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
            disabled={weekOffset >= 0}
            aria-label="Next week"
            title="Next week"
            className="icon-btn"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {habits.map((habit, index) => (
          <li key={habit._id}>
            <HabitCard
              habit={habit}
              weekOffset={weekOffset}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onMove={onMove}
              canMoveUp={index > 0}
              canMoveDown={index < habits.length - 1}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
