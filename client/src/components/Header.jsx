import ThemeToggle from './ThemeToggle';
import HabitMenu from './HabitMenu';

// Text wordmark, same as the original header.
function Logo() {
  return (
    <a href="/" aria-label="Streakly home">
      <span className="heading text-2xl font-bold tracking-tight">
        Streak<span className="text-orange-500">ly</span>
      </span>
    </a>
  );
}

function ViewTabs({ views, view, onChange, className = '' }) {
  return (
    <nav
      className={`flex gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800/70 ${className}`}
      aria-label="Views"
    >
      {views.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onChange(v.id)}
          aria-current={view === v.id ? 'page' : undefined}
          className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            view === v.id
              ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100'
              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-stone-700 to-stone-900 text-xs font-semibold text-white dark:from-stone-200 dark:to-stone-400 dark:text-stone-900">
      {initials || '?'}
    </span>
  );
}

// Sticky top bar: logo, view tabs (when signed in), theme and the account menu.
export default function Header({
  user,
  theme,
  onThemeChange,
  views,
  view,
  onViewChange,
  onOpenAuth,
  onOpenSettings,
  onOpenShortcuts,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur-md dark:border-stone-800/70 dark:bg-stone-950/80">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-3 px-4">
        <Logo />

        {user && (
          <ViewTabs views={views} view={view} onChange={onViewChange} className="hidden sm:flex" />
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onChange={onThemeChange} />

          {user ? (
            <HabitMenu
              label="Account menu"
              buttonClassName="rounded-full transition hover:ring-2 hover:ring-orange-300 focus-visible:ring-2 focus-visible:ring-orange-400 outline-none"
              width="w-56"
              header={
                <div className="border-b border-stone-100 px-3.5 pb-2 pt-1.5 dark:border-stone-700">
                  <p className="heading truncate text-sm font-semibold">{user.name}</p>
                  <p className="muted truncate text-xs">{user.email}</p>
                </div>
              }
              items={[
                { label: 'Account settings', icon: '⚙️', onClick: onOpenSettings },
                { label: 'Keyboard shortcuts', icon: '⌨️', onClick: onOpenShortcuts },
                { label: 'Sign out', icon: '↪', onClick: onLogout, danger: true },
              ]}
            >
              <Avatar name={user.name} />
            </HabitMenu>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-primary px-3.5 py-1.5 text-xs"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* on phones the tabs get their own row under the bar */}
      {user && (
        <div className="mx-auto max-w-2xl px-4 pb-3 sm:hidden">
          <ViewTabs views={views} view={view} onChange={onViewChange} />
        </div>
      )}
    </header>
  );
}
