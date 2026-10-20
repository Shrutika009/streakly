import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { getWeekDays } from '../utils/streak';

const WEEKS = 53;
const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
// Share of the color mixed into the cell for each level, light to full.
const STEPS = [30, 55, 78, 100];

function cellStyle(level, color) {
  if (!level) return undefined;
  const step = STEPS[Math.min(STEPS.length - 1, Math.ceil(level * STEPS.length) - 1)];
  return { backgroundColor: `color-mix(in srgb, ${color} ${step}%, transparent)` };
}

// GitHub-style grid of the last year. `getLevel(date)` returns 0..1
// (0 = nothing done), `tooltip(date, level)` the hover text.
export default function YearHeatmap({ getLevel, color, summary, tooltip, legend = false }) {
  const scrollRef = useRef(null);
  const today = dayjs().format('YYYY-MM-DD');

  // Oldest week first, so the current week ends up on the right like GitHub.
  const weeks = Array.from({ length: WEEKS }, (_, i) => getWeekDays(i - (WEEKS - 1)));

  // Start scrolled to today on narrow screens.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div>
      {summary && <p className="muted mb-2 text-xs">{summary}</p>}

      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]">
          <div className="mr-1 grid grid-rows-[auto_repeat(7,10px)] gap-[3px] text-[9px] leading-[10px] text-stone-400 dark:text-stone-500">
            <span className="h-3" />
            {ROW_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {weeks.map((days, w) => {
            // Label the first week that contains the 1st of a month.
            const monthStart = w === 0 ? null : days.find((d) => d.date() === 1);

            return (
              <div
                key={days[0].format('YYYY-MM-DD')}
                className="grid grid-rows-[auto_repeat(7,10px)] gap-[3px]"
              >
                <span className="h-3 whitespace-nowrap text-[9px] leading-3 text-stone-400 dark:text-stone-500">
                  {monthStart ? monthStart.format('MMM') : ''}
                </span>
                {days.map((day) => {
                  const date = day.format('YYYY-MM-DD');
                  const isFuture = date > today;
                  const level = isFuture ? 0 : getLevel(date);

                  return (
                    <span
                      key={date}
                      title={isFuture ? undefined : tooltip(day, level)}
                      className={`h-[10px] w-[10px] rounded-[2px] ${
                        isFuture ? 'invisible' : level ? '' : 'bg-stone-100 dark:bg-stone-800'
                      } ${date === today ? 'ring-1 ring-stone-400 dark:ring-stone-500' : ''}`}
                      style={cellStyle(level, color)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {legend && (
        <div className="muted mt-2 flex items-center justify-end gap-1 text-[10px]">
          <span className="mr-1">Less</span>
          <span className="h-[10px] w-[10px] rounded-[2px] bg-stone-100 dark:bg-stone-800" />
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={cellStyle((i + 1) / STEPS.length, color)}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      )}
    </div>
  );
}
