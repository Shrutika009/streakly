import { COLORS } from '../utils/colors';
import { goalLabel } from '../utils/goals';
import { CATEGORIES, ICONS } from '../utils/categories';

// Pickers shared by the add form and the edit modal.

export function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Pick color ${c}`}
          aria-pressed={value === c}
          className={`h-7 w-7 rounded-full transition ${
            value === c
              ? 'ring-2 ring-stone-900 ring-offset-2 dark:ring-stone-100 dark:ring-offset-stone-900'
              : 'hover:scale-110'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

export function GoalPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Weekly goal">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          title={goalLabel(n)}
          onClick={() => onChange(n)}
          className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition ${
            value === n
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="muted ml-2 hidden whitespace-nowrap text-xs sm:inline">
        {goalLabel(value)}
      </span>
    </div>
  );
}

export function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Icon">
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        onClick={() => onChange('')}
        title="No icon"
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs transition ${
          !value
            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
            : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
        }`}
      >
        None
      </button>
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          role="radio"
          aria-checked={value === icon}
          aria-label={`Icon ${icon}`}
          onClick={() => onChange(icon)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
            value === icon
              ? 'bg-orange-100 ring-2 ring-orange-400 dark:bg-orange-500/20'
              : 'hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

export function CategoryPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          onClick={() => onChange(c.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            value === c.id
              ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
              : 'border-stone-200 text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-500'
          }`}
        >
          <span aria-hidden="true" className="mr-1">
            {c.emoji}
          </span>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function ReminderInput({ value, onChange, id }) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-36 py-2"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="btn-ghost text-xs">
          Clear
        </button>
      )}
    </div>
  );
}
