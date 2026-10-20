import { useState } from 'react';
import { COLORS } from '../utils/colors';
import { ColorPicker, GoalPicker } from './HabitFields';

export default function AddHabitForm({ onAdd }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');
    try {
      await onAdd({ name: name.trim(), color, weeklyGoal });
      setName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add habit. Check that the server is running.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit, e.g. Read 20 pages"
          aria-label="New habit name"
          maxLength={60}
          className="input flex-1"
        />
        <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>

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

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
