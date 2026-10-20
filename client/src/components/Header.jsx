import dayjs from 'dayjs';
import ThemeToggle from './ThemeToggle';

export default function Header({ user, theme, onThemeChange, onOpenAuth, onOpenSettings, onLogout }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="heading text-3xl font-bold tracking-tight">
          Streak<span className="text-orange-500">ly</span>
        </h1>
        <p className="muted text-sm">Small ticks, big streaks</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="muted hidden text-sm font-medium sm:block">
          {dayjs().format('ddd, D MMM YYYY')}
        </p>

        <ThemeToggle theme={theme} onChange={onThemeChange} />

        {user ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenSettings}
              title="Account settings"
              className="btn-ghost text-sm font-medium text-stone-700 dark:text-stone-200"
            >
              {user.name}
            </button>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <button type="button" onClick={onLogout} className="btn-ghost px-2 text-xs font-medium">
              Sign out
            </button>
          </div>
        ) : (
          <button type="button" onClick={onOpenAuth} className="btn-primary px-3.5 py-1.5 text-xs">
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
