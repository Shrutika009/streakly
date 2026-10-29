import { forwardRef, useState } from 'react';
import { COLORS } from '../utils/colors';
import { TEMPLATES } from '../utils/templates';
import { CategoryPicker, ColorPicker, GoalPicker, IconPicker, ReminderInput } from './HabitFields';

const AddHabitForm = forwardRef(function AddHabitForm(
  {
    onAdd,
    existingNames = [],
    initialCategory = 'other',
    initialGoal = 7,
    onDone,
    className = 'card p-5',
    autoFocus = false,
  },
  inputRef,
) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(initialGoal);
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [reminderTime, setReminderTime] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const taken = new Set(existingNames.map((n) => n.toLowerCase()));
  const ideas = TEMPLATES.filter((t) => !taken.has(t.name.toLowerCase())).slice(0, 6);

  function applyTemplate(t) {
    setName(t.name);
    setIcon(t.icon);
    setCategory(t.category);
    setWeeklyGoal(t.weeklyGoal);
    setColor(t.color);
    inputRef?.current?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');
    try {
      await onAdd({ name: name.trim(), color, weeklyGoal, icon, category, reminderTime });
      setName('');
      setIcon('');
      setReminderTime('');
      onDone?.();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not add habit. Check that the server is running.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          {icon && (
            <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
              {icon}
            </span>
          )}
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New habit, e.g. Read 20 pages"
            aria-label="New habit name"
            maxLength={60}
            className={`input ${icon ? 'pl-11' : ''}`}
          />
        </div>
        <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
          {saving ? 'Adding...' : 'Add habit'}
        </button>
      </div>

      {!name && ideas.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="muted mr-1 text-xs">Need ideas?</span>
          {ideas.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 transition hover:bg-orange-100 hover:text-orange-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-orange-500/15 dark:hover:text-orange-300"
            >
              <span aria-hidden="true" className="mr-1">
                {t.icon}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="muted mr-1 text-sm">Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div className="flex items-center gap-2">
          <span className="muted mr-1 text-sm">Goal</span>
          <GoalPicker value={weeklyGoal} onChange={setWeeklyGoal} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((prev) => !prev)}
        aria-expanded={showMore}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
      >
        <svg
          className={`h-3 w-3 transition-transform ${showMore ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
        {showMore ? 'Fewer options' : 'Icon, category & reminder'}
      </button>

      {showMore && (
        <div className="animate-fade-in mt-4 space-y-4 border-t border-stone-100 pt-4 dark:border-stone-800">
          <div>
            <span className="label mb-2">Icon</span>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div>
            <span className="label mb-2">Category</span>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>
          <div>
            <label htmlFor="add-reminder" className="label mb-2">
              Daily reminder <span className="muted font-normal">(optional)</span>
            </label>
            <ReminderInput id="add-reminder" value={reminderTime} onChange={setReminderTime} />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
});

export default AddHabitForm;
