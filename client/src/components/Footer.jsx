const YEAR = new Date().getFullYear();

export default function Footer({ user, onOpenShortcuts }) {
  return (
    <footer className="mt-16 border-t border-stone-200/70 dark:border-stone-800/70">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="heading font-semibold">
            Streak<span className="text-orange-500">ly</span>
          </p>
          <p className="muted text-xs">Small ticks, big streaks.</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
          {user && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="flex items-center gap-1.5 hover:text-stone-800 dark:hover:text-stone-200"
            >
              <kbd className="rounded border border-stone-300 px-1.5 font-sans text-[10px] dark:border-stone-600">
                ?
              </kbd>
              Keyboard shortcuts
            </button>
          )}
          <span>Your habits are private to your account</span>
          <span>© {YEAR} Streakly</span>
        </div>
      </div>
    </footer>
  );
}
