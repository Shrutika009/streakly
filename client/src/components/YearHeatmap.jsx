import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { getWeekDays } from '../utils/streak';

const WEEKS = 53;
const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export default function YearHeatmap({ dates, color }) {
  const scrollRef = useRef(null);
  const done = new Set(dates);
  const today = dayjs().format('YYYY-MM-DD');

  // Oldest week first, so the current week ends up on the right like GitHub.
  const weeks = Array.from({ length: WEEKS }, (_, i) => getWeekDays(i - (WEEKS - 1)));
  const firstDay = weeks[0][0].format('YYYY-MM-DD');
  const total = dates.filter((d) => d >= firstDay && d <= today).length;

  // Start scrolled to today on narrow screens.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div className="mt-4 border-t border-stone-100 pt-4">
      <p className="mb-2 text-xs text-stone-500">
        <strong className="text-stone-700">{total}</strong> {total === 1 ? 'day' : 'days'} done in
        the last year
      </p>

      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]">
          <div className="mr-1 grid grid-rows-[auto_repeat(7,10px)] gap-[3px] text-[9px] leading-[10px] text-stone-400">
            <span className="h-3" />
            {ROW_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {weeks.map((days, w) => {
            const monday = days[0];
            // Label the first week that contains the 1st of a month.
            const monthStart = days.find((d) => d.date() === 1);
            const showMonth = w === 0 ? null : monthStart;

            return (
              <div key={monday.format('YYYY-MM-DD')} className="grid grid-rows-[auto_repeat(7,10px)] gap-[3px]">
                <span className="h-3 whitespace-nowrap text-[9px] leading-3 text-stone-400">
                  {showMonth ? showMonth.format('MMM') : ''}
                </span>
                {days.map((day) => {
                  const date = day.format('YYYY-MM-DD');
                  const isDone = done.has(date);
                  const isFuture = date > today;

                  return (
                    <span
                      key={date}
                      title={`${day.format('ddd, D MMM YYYY')}${isDone ? ' · done' : ''}`}
                      className={`h-[10px] w-[10px] rounded-[2px] ${
                        isFuture ? 'invisible' : isDone ? '' : 'bg-stone-100'
                      } ${date === today ? 'ring-1 ring-stone-400' : ''}`}
                      style={isDone ? { backgroundColor: color } : undefined}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
