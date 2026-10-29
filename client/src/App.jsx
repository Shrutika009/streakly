import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api/habits';
import * as authApi from './api/auth';
import useTheme from './hooks/useTheme';
import Header from './components/Header';
import HabitList from './components/HabitList';
import ArchivedList from './components/ArchivedList';
import StatsView from './components/StatsView';
import EditHabitModal from './components/EditHabitModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import Toasts from './components/Toasts';
import useToasts from './hooks/useToasts';
import useShortcuts from './hooks/useShortcuts';
import useReminders from './hooks/useReminders';
import Footer from './components/Footer';
import Achievements from './components/Achievements';
import ShortcutsModal from './components/ShortcutsModal';
import { newlyUnlocked } from './utils/achievements';
import { fireConfetti } from './utils/confetti';
import { todayStr } from './utils/streak';
import NoteModal from './components/NoteModal';
import WeeklyRecap from './components/WeeklyRecap';
import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import BoardView from './components/BoardView';
import AddHabitModal from './components/AddHabitModal';
import Icon from './components/Icon';
import { GROUPINGS } from './utils/board';
import { categoryFor } from './utils/categories';
import dayjs from 'dayjs';

function errorMessage(err, fallback) {
  return err.response?.data?.error || fallback;
}

const VIEW_TITLES = {
  today: 'Today',
  habits: 'All habits',
  board: 'Board',
  stats: 'Stats',
  archived: 'Archived',
};

// small per-browser preferences (sidebar open, board grouping)
function readPref(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function writePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // not remembered, that's fine
  }
}

const NEXT_THEME = { light: 'dark', dark: 'system', system: 'light' };

export default function App() {
  const [theme, setTheme] = useTheme();
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('streakly_token')));
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('today');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sidebarHidden, setSidebarHidden] = useState(
    () => readPref('streakly_sidebar', 'open') === 'hidden',
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [groupBy, setGroupBy] = useState(() =>
    GROUPINGS[readPref('streakly_board_group', '')]
      ? readPref('streakly_board_group', '')
      : 'category',
  );
  const [addPreset, setAddPreset] = useState(null); // null = closed, {} = open
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null); // { habitId, date }
  const { toasts, show: showToast, dismiss: dismissToast } = useToasts();
  const searchRef = useRef(null);

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);

  useReminders(habits, showToast);

  function navigate(next) {
    setView(next);
    setCategoryFilter('all');
    setMobileNav(false);
  }

  function selectCategory(id) {
    setView('habits');
    setCategoryFilter(id);
    setMobileNav(false);
  }

  function openSearch() {
    setView('habits');
    setMobileNav(false);
    setTimeout(() => searchRef.current?.focus(), 0);
  }

  function openAdd(preset = {}) {
    setMobileNav(false);
    setAddPreset(preset);
  }

  function toggleSidebar() {
    setSidebarHidden((prev) => {
      writePref('streakly_sidebar', prev ? 'open' : 'hidden');
      return !prev;
    });
  }

  function changeGroupBy(value) {
    setGroupBy(value);
    writePref('streakly_board_group', value);
  }

  useShortcuts(
    {
      n: () => openAdd(),
      '/': openSearch,
      1: () => navigate('today'),
      2: () => navigate('habits'),
      3: () => navigate('board'),
      4: () => navigate('stats'),
      '[': toggleSidebar,
      t: () => setTheme(NEXT_THEME[theme]),
      '?': () => setShortcutsOpen(true),
    },
    Boolean(user),
  );

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
    setView('today');
    setCategoryFilter('all');
    setMobileNav(false);
    setSettingsOpen(false);
    setShortcutsOpen(false);
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

    // celebrate new badges, and finishing every habit for today
    const before = habits.filter((h) => !h.archived);
    const after = flip(habits).filter((h) => !h.archived);
    const badges = newlyUnlocked(before, after);
    const today = todayStr();
    const allDone = (list) =>
      list.length > 0 && list.every((h) => h.completedDates.includes(today));
    const finishedDay = date === today && !allDone(before) && allDone(after);

    setHabits(flip);
    if (badges.length || finishedDay) fireConfetti();
    for (const badge of badges) showToast(`${badge.emoji} Achievement unlocked: ${badge.title}`);
    if (finishedDay) showToast('🎉 Every habit done for today. Nice work!');

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

  async function handleSaveNote(id, date, text) {
    const updated = await api.saveNote(id, date, text);
    setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
    showToast(text ? 'Note saved.' : 'Note deleted.');
  }

  function handleImported(imported) {
    setHabits((prev) => [...imported, ...prev]);
  }

  const today = todayStr();
  const counts = {
    todo: active.filter((h) => !h.completedDates.includes(today)).length,
    active: active.length,
    archived: archived.length,
  };
  const categoryCounts = active.reduce((acc, h) => {
    const id = h.category || 'other';
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const openNote = (habit, date) => setNoteTarget({ habitId: habit._id, date });

  const errorBanner = error && (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      <span>{error}</span>
      <button onClick={() => setError('')} className="font-medium hover:underline">
        Dismiss
      </button>
    </div>
  );

  let page = null;
  if (user && !loading) {
    const title =
      view === 'habits' && categoryFilter !== 'all'
        ? categoryFor(categoryFilter).label
        : VIEW_TITLES[view];
    const subtitle = {
      today: dayjs().format('dddd, D MMMM'),
      habits: `${active.length} active ${active.length === 1 ? 'habit' : 'habits'}`,
      board: 'Tick off today right from the board',
      stats: 'How you are doing over time',
      archived: 'Paused habits keep their history',
    }[view];

    page = (
      <>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="muted mt-1 text-sm">{subtitle}</p>
          </div>
          {view === 'board' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="muted">Group by</span>
              <div className="flex gap-1 rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800">
                {Object.entries(GROUPINGS).map(([id, g]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => changeGroupBy(id)}
                    aria-pressed={groupBy === id}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      groupBy === id
                        ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100'
                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {view !== 'board' && view !== 'archived' && (
            <button type="button" onClick={() => openAdd()} className="btn-primary hidden sm:block">
              + Add habit
            </button>
          )}
        </div>

        <div className="space-y-6">
          {errorBanner}

          {view === 'today' && (
            <TodayView
              habits={active}
              userName={user.name}
              onToggle={handleToggle}
              onEdit={setEditing}
              onOpenNote={openNote}
              onAddHabit={() => openAdd()}
            />
          )}

          {view === 'habits' && (
            <HabitList
              ref={searchRef}
              habits={active}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onToggle={handleToggle}
              onEdit={setEditing}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onMove={handleMove}
              onOpenNote={openNote}
            />
          )}

          {view === 'board' && (
            <BoardView
              habits={active}
              groupBy={groupBy}
              onToggle={handleToggle}
              onEdit={setEditing}
              onAddHabit={openAdd}
            />
          )}

          {view === 'stats' && (
            <div className="space-y-4">
              <WeeklyRecap habits={active} userName={user.name} onShared={showToast} />
              <StatsView habits={active} />
              <Achievements habits={active} />
            </div>
          )}

          {view === 'archived' &&
            (archived.length ? (
              <ArchivedList
                habits={archived}
                defaultOpen
                onRestore={(id) => handleArchive(id, false)}
                onDelete={handleDelete}
              />
            ) : (
              <p className="muted py-10 text-center text-sm">
                Nothing archived. Use ⋯ → Archive on a habit to pause it.
              </p>
            ))}
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      {user && !loading && (!sidebarHidden || mobileNav) && (
        <Sidebar
          user={user}
          theme={theme}
          onThemeChange={setTheme}
          view={view}
          category={categoryFilter}
          counts={counts}
          categoryCounts={categoryCounts}
          onNavigate={navigate}
          onSelectCategory={selectCategory}
          onAddHabit={() => openAdd()}
          onSearch={openSearch}
          onOpenSettings={() => {
            setMobileNav(false);
            setSettingsOpen(true);
          }}
          onOpenShortcuts={() => {
            setMobileNav(false);
            setShortcutsOpen(true);
          }}
          onLogout={handleLogout}
          onCollapse={toggleSidebar}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {user && !loading ? (
          // phones: slim bar with the menu button; desktop: a button to bring the sidebar back
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-200/70 bg-stone-50/80 px-4 backdrop-blur-md lg:static lg:h-auto lg:border-0 lg:bg-transparent lg:px-8 lg:pt-5 lg:backdrop-blur-none dark:border-stone-800/70 dark:bg-stone-950/80 lg:dark:bg-transparent">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
              className="icon-btn lg:hidden"
            >
              <Icon name="menu" className="h-4 w-4" />
            </button>
            {sidebarHidden && (
              <button
                type="button"
                onClick={toggleSidebar}
                title="Show sidebar ( [ )"
                aria-label="Show sidebar"
                className="icon-btn hidden lg:flex"
              >
                <Icon name="sidebar" className="h-4 w-4" />
              </button>
            )}
            <span className="heading text-lg font-bold tracking-tight lg:hidden">
              Streak<span className="text-orange-500">ly</span>
            </span>
            <button
              type="button"
              onClick={() => openAdd()}
              aria-label="Add habit"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm lg:hidden"
            >
              <Icon name="plus" className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <Header theme={theme} onThemeChange={setTheme} onOpenAuth={() => setAuthOpen(true)} />
        )}

        <main
          className={`w-full flex-1 px-4 py-6 sm:py-8 ${
            user && view === 'board' ? 'sm:px-8' : 'mx-auto max-w-2xl'
          }`}
        >
          {loading ? (
            <p className="py-16 text-center text-stone-400 dark:text-stone-500">
              Loading habits...
            </p>
          ) : user ? (
            page
          ) : (
            <div className="space-y-6">
              {errorBanner}
              <div className="card p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="heading mt-4 text-xl font-bold">
                  Your personal daily habit tracker
                </h2>
                <p className="muted mx-auto mt-2 max-w-sm text-sm">
                  Sign in or create a free account to track your private habits, build streaks, and
                  stay consistent.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="btn-primary px-6"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer user={user} onOpenShortcuts={() => setShortcutsOpen(true)} />
      </div>

      {addPreset && (
        <AddHabitModal
          preset={addPreset}
          existingNames={habits.map((h) => h.name)}
          onAdd={handleAdd}
          onClose={() => setAddPreset(null)}
        />
      )}

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

      {noteTarget && habits.some((h) => h._id === noteTarget.habitId) && (
        <NoteModal
          habit={habits.find((h) => h._id === noteTarget.habitId)}
          date={noteTarget.date}
          onSave={handleSaveNote}
          onClose={() => setNoteTarget(null)}
        />
      )}

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
