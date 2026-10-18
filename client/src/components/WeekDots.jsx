import dayjs from 'dayjs';
import { getWeekDays } from '../utils/streak';

export default function WeekDots({ dates, color, onToggle, weekOffset = 0 }) {
  const today = dayjs().format('YYYY-MM-DD');
  const days = getWeekDays(weekOffset);

  return (
    <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2">
      {days.map((day) => {
        const date = day.format('YYYY-MM-DD');
        const done = dates.includes(date);
        const isToday = date === today;
        const isFuture = date > today;

        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <span
              className={`text-xs ${isToday ? 'font-bold text-stone-900' : 'text-stone-400'}`}
            >
              {day.format('dd').charAt(0)}
            </span>
            <button
              onClick={() => onToggle(date)}
              disabled={isFuture}
              title={day.format('ddd, D MMM')}
              aria-label={`${day.format('dddd')} ${done ? 'done' : 'not done'}`}
              className={`h-8 w-8 rounded-full border-2 transition sm:h-9 sm:w-9 ${
                isFuture ? 'cursor-not-allowed opacity-30' : 'hover:scale-110'
              } ${isToday ? 'ring-2 ring-stone-300 ring-offset-2' : ''}`}
              style={{
                borderColor: color,
                backgroundColor: done ? color : 'transparent',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
