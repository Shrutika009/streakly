import { COLORS } from '../utils/colors';
import { goalLabel } from '../utils/goals';

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
      <span className="muted ml-2 hidden whitespace-nowrap text-xs sm:inline">{goalLabel(value)}</span>
    </div>
  );
}
