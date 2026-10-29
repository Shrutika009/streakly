import { forwardRef, useState } from 'react';
import HabitCard from './HabitCard';
import { getWeekDays, todayStr } from '../utils/streak';
import { CATEGORIES } from '../utils/categories';

function FilterBar({
  searchRef,
  query,
  onQuery,
  category,
  onCategory,
  todoOnly,
  onTodoOnly,
  usedCategories,
}) {
  const chip = (activeChip) =>
    `shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
      activeChip
        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
    }`;

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search habits"
          aria-label="Search habits"
          className="input py-2 pl-10"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-stone-200 px-1.5 text-[10px] text-stone-400 sm:block dark:border-stone-700">
          /
        </kbd>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onTodoOnly(!todoOnly)}
          aria-pressed={todoOnly}
          className={chip(todoOnly)}
        >
          ⏳ To do today
        </button>
        <span className="mx-1 w-px shrink-0 bg-stone-200 dark:bg-stone-700" aria-hidden="true" />
        <button
          type="button"
          onClick={() => onCategory('all')}
          aria-pressed={category === 'all'}
          className={chip(category === 'all')}
        >
          All
        </button>
        {CATEGORIES.filter((c) => usedCategories.has(c.id)).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onCategory(c.id)}
            aria-pressed={category === c.id}
            className={chip(category === c.id)}
          >
            <span aria-hidden="true" className="mr-1">
              {c.emoji}
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const HabitList = forwardRef(function HabitList(
  { habits, onToggle, onEdit, onDelete, onArchive, onMove },
  searchRef,
) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [todoOnly, setTodoOnly] = useState(false);

  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center dark:border-stone-800">
        <p className="text-3xl" aria-hidden="true">
          🌱
        </p>
        <p className="mt-2 font-medium text-stone-600 dark:text-stone-300">
          No habits yet. Add your first one!
        </p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Start small, one tick a day is enough.
        </p>
      </div>
    );
  }

  const today = todayStr();
  const usedCategories = new Set(habits.map((h) => h.category || 'other'));
  const needle = query.trim().toLowerCase();
  const filtering = Boolean(needle) || category !== 'all' || todoOnly;
  const visible = habits.filter(
    (h) =>
      (!needle || h.name.toLowerCase().includes(needle)) &&
      (category === 'all' || (h.category || 'other') === category) &&
      (!todoOnly || !h.completedDates.includes(today)),
  );

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

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setTodoOnly(false);
  }

  return (
    <div className="space-y-4">
      <FilterBar
        searchRef={searchRef}
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        todoOnly={todoOnly}
        onTodoOnly={setTodoOnly}
        usedCategories={usedCategories}
      />

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

      {visible.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-2xl" aria-hidden="true">
            {todoOnly && !needle && category === 'all' ? '🎉' : '🔍'}
          </p>
          <p className="mt-2 text-sm font-medium text-stone-600 dark:text-stone-300">
            {todoOnly && !needle && category === 'all'
              ? 'Nothing left to do today!'
              : 'No habits match these filters.'}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-ghost mt-2 text-xs font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((habit) => {
            const index = habits.indexOf(habit);
            return (
              <li key={habit._id}>
                <HabitCard
                  habit={habit}
                  weekOffset={weekOffset}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onMove={onMove}
                  // moving swaps with the neighbour in the full list, which is
                  // confusing while some habits are hidden, so it's off then
                  canMoveUp={!filtering && index > 0}
                  canMoveDown={!filtering && index < habits.length - 1}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

export default HabitList;
