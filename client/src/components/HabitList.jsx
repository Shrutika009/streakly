import { useState } from 'react';
import HabitCard from './HabitCard';
import { getWeekDays } from '../utils/streak';

export default function HabitList({ habits, onToggle, onEdit, onDelete }) {
  const [weekOffset, setWeekOffset] = useState(0);

  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center">
        <p className="font-medium text-stone-600">No habits yet. Add your first one!</p>
        <p className="mt-1 text-sm text-stone-400">Start small, one tick a day is enough.</p>
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
          <span className="font-semibold text-stone-800">{weekTitle}</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-500">{dateRangeStr}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="mr-1 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              Current week
            </button>
          )}
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            aria-label="Previous week"
            title="Previous week"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 hover:text-stone-900"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {habits.map((habit) => (
          <li key={habit._id}>
            <HabitCard
              habit={habit}
              weekOffset={weekOffset}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
