import { currentStreak, todayStr, weekCount } from '../utils/streak';
import { GROUPINGS } from '../utils/board';
import HabitCheck from './HabitCheck';

function BoardCard({ habit, onToggle, onEdit }) {
  const today = todayStr();
  const done = habit.completedDates.includes(today);
  const streak = currentStreak(habit.completedDates);
  const goal = habit.weeklyGoal || 7;

  return (
    <li className="card flex items-start gap-3 p-3.5 transition-shadow hover:shadow-md">
      <div className="pt-0.5">
        <HabitCheck
          habit={habit}
          done={done}
          onToggle={() => onToggle(habit._id, today)}
          size="h-5 w-5"
        />
      </div>
      <button type="button" onClick={() => onEdit(habit)} className="min-w-0 flex-1 text-left">
        <p
          className={`text-[15px] ${done ? 'text-stone-400 line-through dark:text-stone-500' : 'heading'}`}
        >
          {habit.icon && (
            <span aria-hidden="true" className="mr-1.5">
              {habit.icon}
            </span>
          )}
          {habit.name}
        </p>
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-400 dark:text-stone-500">
          <span style={{ color: streak ? habit.color : undefined }}>
            {streak} {streak === 1 ? 'day' : 'days'} streak
          </span>
          <span>
            {weekCount(habit.completedDates)}/{goal} this week
          </span>
          {habit.reminderTime && <span>at {habit.reminderTime}</span>}
        </p>
      </button>
    </li>
  );
}

// Habits as columns of cards. Scrolls sideways when there are many columns.
export default function BoardView({ habits, groupBy, onToggle, onEdit, onAddHabit }) {
  const columns = GROUPINGS[groupBy].columns(habits);

  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center dark:border-stone-800">
        <p className="font-medium text-stone-600 dark:text-stone-300">Your board is empty</p>
        <button type="button" onClick={() => onAddHabit({})} className="btn-primary mt-4">
          Add a habit
        </button>
      </div>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-8 sm:px-8">
      <div className="flex items-start gap-5">
        {columns.map((col) => (
          <section key={col.id} className="w-72 shrink-0" aria-label={col.title}>
            <h2 className="heading mb-3 flex items-baseline gap-2 px-1 text-[15px] font-semibold">
              {col.title}
              <span className="text-sm font-normal text-stone-400">{col.habits.length}</span>
            </h2>
            <ul className="space-y-2.5">
              {col.habits.map((h) => (
                <BoardCard key={h._id} habit={h} onToggle={onToggle} onEdit={onEdit} />
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onAddHabit(col.preset)}
              className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-orange-600 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-orange-400"
            >
              <span className="text-lg leading-none text-orange-500">+</span> Add habit
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
