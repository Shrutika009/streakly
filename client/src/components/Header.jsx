import dayjs from 'dayjs';

export default function Header({ user, onOpenAuth, onLogout }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Streak<span className="text-orange-500">ly</span>
        </h1>
        <p className="text-sm text-stone-500">Small ticks, big streaks</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="hidden text-sm font-medium text-stone-500 sm:block">
          {dayjs().format('ddd, D MMM YYYY')}
        </p>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-700">{user.name}</span>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-stone-700"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
