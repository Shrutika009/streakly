import dayjs from 'dayjs';

export default function Header() {
  return (
    <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Streak<span className="text-orange-500">ly</span>
        </h1>
        <p className="text-sm text-stone-500">Small ticks, big streaks</p>
      </div>
      <p className="text-sm font-medium text-stone-600">{dayjs().format('ddd, D MMM YYYY')}</p>
    </header>
  );
}
