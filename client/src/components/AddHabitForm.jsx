import { useState } from 'react';
import { COLORS } from '../utils/colors';

export default function AddHabitForm({ onAdd }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');
    try {
      await onAdd({ name: name.trim(), color });
      setName('');
    } catch {
      setError('Could not add habit. Check that the server is running.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New habit, e.g. Read 20 pages"
          maxLength={60}
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-xl bg-stone-900 px-5 py-2.5 font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 text-sm text-stone-500">Color</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Pick color ${c}`}
            className={`h-7 w-7 rounded-full transition ${
              color === c ? 'ring-2 ring-stone-900 ring-offset-2' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
