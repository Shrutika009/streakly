import { useCallback, useEffect, useState } from 'react';
import * as api from './api/habits';
import * as authApi from './api/auth';
import Header from './components/Header';
import TodaySummary from './components/TodaySummary';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import EditHabitModal from './components/EditHabitModal';
import AuthModal from './components/AuthModal';

function errorMessage(err, fallback) {
  return err.response?.data?.error || fallback;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('streakly_token')));
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getHabits();
      setHabits(data);
      setError('');
    } catch {
      setError("Couldn't reach the server. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('streakly_token');
    if (!token) return;

    authApi
      .getMe()
      .then((res) => {
        setUser(res.user);
        return loadHabits();
      })
      .catch(() => {
        localStorage.removeItem('streakly_token');
        setUser(null);
        setLoading(false);
      });
  }, [loadHabits]);

  function handleAuthSuccess(loggedInUser) {
    setUser(loggedInUser);
    loadHabits();
  }

  function handleLogout() {
    localStorage.removeItem('streakly_token');
    setUser(null);
    setHabits([]);
  }

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
        <Header user={user} onOpenAuth={() => setAuthOpen(true)} onLogout={handleLogout} />

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
        ) : user ? (
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
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-100">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">Your personal daily habit tracker</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
              Sign in or create a free account to track your private habits, build streaks, and stay consistent.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>

      {editing && (
        <EditHabitModal habit={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
