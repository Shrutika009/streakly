import ThemeToggle from './ThemeToggle';

// Top bar for signed-out visitors. Once signed in, the sidebar takes over.
export default function Header({ theme, onThemeChange, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur-md dark:border-stone-800/70 dark:bg-stone-950/80">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-3 px-4">
        <a href="/" aria-label="Streakly home">
          <span className="heading text-2xl font-bold tracking-tight">
            Streak<span className="text-orange-500">ly</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <button type="button" onClick={onOpenAuth} className="btn-primary px-3.5 py-1.5 text-xs">
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
