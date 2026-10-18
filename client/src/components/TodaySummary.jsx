import { todayStr } from '../utils/streak';

export default function TodaySummary({ habits }) {
  const today = todayStr();
  const total = habits.length;
  const done = habits.filter((h) => h.completedDates.includes(today)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-medium text-stone-700">
          Today: <span className="text-stone-900">{done} / {total}</span> done
        </p>
        <span className="text-sm font-semibold text-orange-500">{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
