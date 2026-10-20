import { useState } from 'react';
import { COLORS } from '../utils/colors';
import Modal from './Modal';
import { ColorPicker, GoalPicker } from './HabitFields';

export default function EditHabitModal({ habit, onSave, onClose }) {
  const [name, setName] = useState(habit?.name || '');
  const [color, setColor] = useState(habit?.color || COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(habit?.weeklyGoal || 7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setError('');
    try {
      await onSave(habit._id, { name: trimmed, color, weeklyGoal });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update habit. Please try again.');
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Habit" onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="edit-habit-name" className="label">
            Name
          </label>
          <input
            id="edit-habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            maxLength={60}
            autoFocus
            className="input mt-1.5"
          />
        </div>

        <div>
          <span className="label">Color</span>
          <div className="mt-2">
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        <div>
          <span className="label">Weekly goal</span>
          <div className="mt-2">
            <GoalPicker value={weeklyGoal} onChange={setWeeklyGoal} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name.trim()} className="btn-primary py-2">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
