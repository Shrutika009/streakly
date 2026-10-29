import { currentStreak, todayStr, weekCount } from '../utils/streak';
import { categoryFor } from '../utils/categories';
import HabitCheck from './HabitCheck';
import TodaySummary from './TodaySummary';

function Row({ habit, done, onToggle, onEdit, onOpenNote }) {
  const today = todayStr();
  const streak = currentStreak(habit.completedDates);
  const goal = habit.weeklyGoal || 7;
  const note = habit.notes?.[today];

  return (
    <li className="group flex items-start gap-3 border-b border-stone-200/70 py-3 last:border-0 dark:border-stone-800">
      <div className="pt-0.5">
        <HabitCheck habit={habit} done={done} onToggle={() => onToggle(habit._id, today)} />
      </div>

      <button type="button" onClick={() => onEdit(habit)} className="min-w-0 flex-1 text-left">
        <p
          className={`truncate text-[15px] ${
            done ? 'text-stone-400 line-through dark:text-stone-500' : 'heading'
          }`}
        >
          {habit.icon && (
            <span aria-hidden="true" className="mr-1.5">
              {habit.icon}
            </span>
          )}
          {habit.name}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-stone-400 dark:text-stone-500">
          <span>{categoryFor(habit.category).label}</span>
          {habit.reminderTime && <span>at {habit.reminderTime}</span>}
          <span>
            {weekCount(habit.completedDates)}/{goal} this week
          </span>
          {note && <span className="truncate italic">“{note}”</span>}
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenNote(habit, today)}
          className="btn-ghost px-2 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          {note ? 'Edit note' : 'Note'}
        </button>
        {streak > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
            style={{
              color: habit.color,
              backgroundColor: `color-mix(in srgb, ${habit.color} 14%, transparent)`,
            }}
            title={`${streak}-day streak`}
          >
            {streak}d
          </span>
        )}
      </div>
    </li>
  );
}

// The default page after signing in: today's list, split into to do / done.
export default function TodayView({ habits, userName, onToggle, onEdit, onOpenNote, onAddHabit }) {
  const today = todayStr();
  const todo = habits.filter((h) => !h.completedDates.includes(today));
  const done = habits.filter((h) => h.completedDates.includes(today));

  return (
    <div className="space-y-6">
      <TodaySummary habits={habits} userName={userName} />

      {habits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center dark:border-stone-800">
          <p className="font-medium text-stone-600 dark:text-stone-300">No habits yet</p>
          <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
            Start small, one tick a day is enough.
          </p>
          <button type="button" onClick={onAddHabit} className="btn-primary mt-4">
            Add your first habit
          </button>
        </div>
      ) : (
        <>
          <section>
            <h2 className="heading mb-1 flex items-baseline gap-2 text-sm font-semibold">
              To do <span className="font-normal text-stone-400">{todo.length}</span>
            </h2>
            {todo.length ? (
              <ul>
                {todo.map((h) => (
                  <Row
                    key={h._id}
                    habit={h}
                    done={false}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onOpenNote={onOpenNote}
                  />
                ))}
              </ul>
            ) : (
              <p className="muted py-4 text-sm">All done for today. 🎉</p>
            )}
            <button
              type="button"
              onClick={onAddHabit}
              className="mt-2 flex items-center gap-2.5 py-2 text-sm text-stone-500 transition hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400"
            >
              <span className="text-lg leading-none text-orange-500">+</span> Add habit
            </button>
          </section>

          {done.length > 0 && (
            <section>
              <h2 className="heading mb-1 flex items-baseline gap-2 text-sm font-semibold">
                Done today <span className="font-normal text-stone-400">{done.length}</span>
              </h2>
              <ul>
                {done.map((h) => (
                  <Row
                    key={h._id}
                    habit={h}
                    done
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onOpenNote={onOpenNote}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
