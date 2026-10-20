import { useCallback, useEffect, useState } from 'react';
import * as api from './api/habits';
import * as authApi from './api/auth';
import useTheme from './hooks/useTheme';
import Header from './components/Header';
import TodaySummary from './components/TodaySummary';
import AddHabitForm from './components/AddHabitForm';
import HabitList from './components/HabitList';
import ArchivedList from './components/ArchivedList';
import StatsView from './components/StatsView';
import EditHabitModal from './components/EditHabitModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import Toasts from './components/Toasts';
import useToasts from './hooks/useToasts';

function errorMessage(err, fallback) {
  return err.response?.data?.error || fallback;
}

const VIEWS = [
  { id: 'habits', label: 'Habits' },
  { id: 'stats', label: 'Stats' },
];

export default function App() {
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('streakly_token')));
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('habits');
  const { toasts, show: showToast, dismiss: dismissToast } = useToasts();

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);

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
    setView('habits');
    setSettingsOpen(false);
  }

  function handleAccountDeleted() {
    handleLogout();
    showToast('Your account has been deleted.');
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
    const habit = habits.find((h) => h._id === id);
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      if (habit) showToast(`Deleted "${habit.name}".`);
    } catch (err) {
      setError(errorMessage(err, 'Could not delete habit.'));
    }
  }

  async function handleSave(id, changes) {
    const updated = await api.updateHabit(id, changes);
    setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    setEditing(null);
  }

  async function handleArchive(id, makeArchived) {
    const habit = habits.find((h) => h._id === id);
    if (!habit) return;

    const set = (value) =>
      setHabits((prev) => prev.map((h) => (h._id === id ? { ...h, archived: value } : h)));

    set(makeArchived);
    try {
      const updated = await api.updateHabit(id, { archived: makeArchived });
      setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
      if (makeArchived) {
        showToast(`Archived "${habit.name}".`, {
          label: 'Undo',
          onClick: () => handleArchive(id, false),
        });
      } else {
        showToast(`Restored "${habit.name}".`);
      }
    } catch (err) {
      set(!makeArchived);
      setError(errorMessage(err, 'Could not update habit.'));
    }
  }

  // Moves an active habit one place up (-1) or down (+1).
  async function handleMove(id, direction) {
    const index = active.findIndex((h) => h._id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= active.length) return;

    const reordered = [...active];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const next = [...reordered, ...archived];
    const previous = habits;

    setHabits(next);
    try {
      const saved = await api.reorderHabits(next.map((h) => h._id));
      setHabits(saved);
    } catch (err) {
      setHabits(previous);
      setError(errorMessage(err, 'Could not reorder habits.'));
    }
  }

  function handleImported(imported) {
    setHabits((prev) => [...imported, ...prev]);
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <main className="mx-auto max-w-2xl space-y-6">
        <Header
          user={user}
          theme={theme}
          onThemeChange={setTheme}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={handleLogout}
        />

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-medium hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <p className="py-16 text-center text-stone-400 dark:text-stone-500">Loading habits...</p>
        ) : user ? (
          <>
            <TodaySummary habits={active} />

            <nav
              className="flex gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-900"
              aria-label="Views"
            >
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id ? 'page' : undefined}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition ${
                    view === v.id
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </nav>

            {view === 'habits' ? (
              <>
                <AddHabitForm onAdd={handleAdd} />
                <HabitList
                  habits={active}
                  onToggle={handleToggle}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onMove={handleMove}
                />
                <ArchivedList
                  habits={archived}
                  onRestore={(id) => handleArchive(id, false)}
                  onDelete={handleDelete}
                />
              </>
            ) : (
              <StatsView habits={active} />
            )}
          </>
        ) : (
          <div className="card p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="heading mt-4 text-xl font-bold">Your personal daily habit tracker</h2>
            <p className="muted mx-auto mt-2 max-w-sm text-sm">
              Sign in or create a free account to track your private habits, build streaks, and stay consistent.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary px-6">
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>

      {editing && (
        <EditHabitModal habit={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}

      {settingsOpen && user && (
        <SettingsModal
          user={user}
          onClose={() => setSettingsOpen(false)}
          onUserUpdated={setUser}
          onImported={handleImported}
          onAccountDeleted={handleAccountDeleted}
        />
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
