import { useState } from 'react';
import dayjs from 'dayjs';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// One month of a habit. Click a past day to tick or untick it; days with a
// note get a small dot, and the notes for the month are listed underneath.
export default function MonthCalendar({ habit, onToggle, onOpenNote }) {
  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month...
  const month = dayjs().startOf('month').add(offset, 'month');
  const today = dayjs().format('YYYY-MM-DD');
  const done = new Set(habit.completedDates);
  const notes = habit.notes || {};

  // Monday-first grid: blanks before the 1st, then each day of the month
  const leading = (month.day() + 6) % 7;
  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, i) => month.add(i, 'day')),
  ];

  const prefix = month.format('YYYY-MM');
  const doneThisMonth = habit.completedDates.filter((d) => d.startsWith(prefix)).length;
  const monthNotes = Object.entries(notes)
    .filter(([date]) => date.startsWith(prefix))
    .sort(([a], [b]) => (a < b ? 1 : -1));

  return (
    <div>
      <div className="mb-3 flex max-w-sm items-center justify-between">
        <p className="text-sm">
          <span className="heading font-semibold">{month.format('MMMM YYYY')}</span>
          <span className="muted ml-2 text-xs">
            {doneThisMonth} {doneThisMonth === 1 ? 'day' : 'days'} done
          </span>
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setOffset((prev) => prev - 1)}
            aria-label="Previous month"
            className="icon-btn h-7 w-7"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOffset((prev) => Math.min(0, prev + 1))}
            disabled={offset >= 0}
            aria-label="Next month"
            className="icon-btn h-7 w-7"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid max-w-sm grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] text-stone-400 dark:text-stone-500">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (!day) return <span key={`blank-${i}`} />;
          const date = day.format('YYYY-MM-DD');
          const isDone = done.has(date);
          const isFuture = date > today;
          const hasNote = Boolean(notes[date]);

          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              onClick={() => onToggle(habit._id, date)}
              title={`${day.format('ddd, D MMM')}${isDone ? ' · done' : ''}${hasNote ? ` · ${notes[date]}` : ''}`}
              aria-label={`${day.format('D MMMM')} ${isDone ? 'done' : 'not done'}${hasNote ? ', has a note' : ''}`}
              aria-pressed={isDone}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition ${
                isFuture
                  ? 'cursor-not-allowed text-stone-300 dark:text-stone-700'
                  : isDone
                    ? 'text-white hover:opacity-90'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
              } ${date === today ? 'ring-2 ring-stone-300 dark:ring-stone-600' : ''}`}
              style={isDone ? { backgroundColor: habit.color } : undefined}
            >
              {day.date()}
              {hasNote && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${isDone ? 'bg-white' : 'bg-stone-400'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {monthNotes.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {monthNotes.map(([date, text]) => (
            <li key={date}>
              <button
                type="button"
                onClick={() => onOpenNote(habit, date)}
                className="flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <span className="w-12 shrink-0 text-xs font-medium text-stone-400 dark:text-stone-500">
                  {dayjs(date).format('D MMM')}
                </span>
                <span className="text-stone-600 dark:text-stone-300">{text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
