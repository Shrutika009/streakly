import { useState } from 'react';
import { longestStreak } from '../utils/streak';

// Collapsible list of archived habits with restore and delete.
export default function ArchivedList({ habits, onRestore, onDelete, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  if (!habits.length) return null;

  function confirmDelete(habit) {
    if (window.confirm(`Delete "${habit.name}" and all its history? This can't be undone.`)) {
      onDelete(habit._id);
    }
  }

  return (
    <section className="pt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="muted flex items-center gap-1.5 px-1 text-sm font-medium hover:text-stone-800 dark:hover:text-stone-200"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Archived ({habits.length})
      </button>

      {open && (
        <ul className="card mt-3 divide-y divide-stone-100 dark:divide-stone-800">
          {habits.map((habit) => (
            <li key={habit._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full opacity-60"
                  style={{ backgroundColor: habit.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-stone-600 dark:text-stone-300">
                    {habit.name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {habit.completedDates.length} days done · best streak{' '}
                    {longestStreak(habit.completedDates)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 text-sm">
                <button type="button" onClick={() => onRestore(habit._id)} className="btn-ghost">
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(habit)}
                  className="btn-ghost hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
