import { useState } from 'react';
import dayjs from 'dayjs';
import Modal from './Modal';

const MAX = 280;

// Write, edit or delete the note for one habit on one day.
export default function NoteModal({ habit, date, onSave, onClose }) {
  const existing = habit.notes?.[date] || '';
  const [text, setText] = useState(existing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(value) {
    setSaving(true);
    setError('');
    try {
      await onSave(habit._id, date, value);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the note. Please try again.');
      setSaving(false);
    }
  }

  const isToday = date === dayjs().format('YYYY-MM-DD');

  return (
    <Modal title={existing ? 'Edit note' : 'Add a note'} onClose={onClose}>
      <p className="muted mt-1 text-sm">
        <span className="font-medium text-stone-700 dark:text-stone-200">{habit.name}</span> ·{' '}
        {isToday ? 'Today' : dayjs(date).format('ddd, D MMM YYYY')}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(text);
        }}
        className="mt-4 space-y-3"
      >
        <label htmlFor="note-text" className="sr-only">
          Note
        </label>
        <textarea
          id="note-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          rows={4}
          autoFocus
          placeholder="How did it go? e.g. Ran 5k in the rain, felt great."
          className="input resize-none"
        />
        <p className="text-right text-xs text-stone-400 dark:text-stone-500">
          {text.length} / {MAX}
        </p>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          {existing ? (
            <button
              type="button"
              onClick={() => save('')}
              disabled={saving}
              className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Delete note
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !text.trim() || text.trim() === existing}
              className="btn-primary py-2"
            >
              {saving ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
