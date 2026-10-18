import { useEffect, useState } from 'react';
import * as api from './api/habits';
import Header from './components/Header';
import TodaySummary from './components/TodaySummary';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import EditHabitModal from './components/EditHabitModal';

function errorMessage(err, fallback) {
  return err.response?.data?.error || fallback;
}

export default function App() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api
      .getHabits()
      .then(setHabits)
      .catch(() => setError("Couldn't reach the server. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(habit) {
    const created = await api.createHabit(habit);
    setHabits((prev) => [created, ...prev]);
    setError('');
  }

  async function handleToggle(id, date) {
    const flip = (prev) =>
      prev.map((h) => {
        if (h._id !== id) return h;
        const has = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        };
      });

    setHabits(flip);
    try {
      const updated = await api.toggleHabit(id, date);
      setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    } catch (err) {
      setHabits(flip); // undo
      setError(errorMessage(err, 'Could not update that day, try again.'));
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setError(errorMessage(err, 'Could not delete habit.'));
    }
  }

  async function handleSave(id, changes) {
    const updated = await api.updateHabit(id, changes);
    setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    setEditing(null);
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <main className="mx-auto max-w-2xl space-y-6">
        <Header />

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-medium hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-stone-400">Loading habits...</p>
        ) : (
          <>
            <TodaySummary habits={habits} />
            <AddHabitForm onAdd={handleAdd} />
            <HabitList
              habits={habits}
              onToggle={handleToggle}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>

      {editing && (
        <EditHabitModal habit={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
