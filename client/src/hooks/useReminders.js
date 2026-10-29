import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

const FIRED_KEY = 'streakly_reminders_fired';
const CHECK_EVERY = 20_000; // ms

function readFired(today) {
  try {
    const data = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
    return data.date === today ? new Set(data.ids) : new Set();
  } catch {
    return new Set();
  }
}

function saveFired(today, fired) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, ids: [...fired] }));
  } catch {
    // not remembering just means a reminder might repeat after a reload
  }
}

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Reminds about habits whose reminder time has passed and that aren't done
// yet today. Only works while Streakly is open in a tab: there's no push
// server. Uses a system notification when allowed, otherwise `onFallback`
// (an in-app toast). Each habit reminds at most once a day.
export default function useReminders(habits, onFallback) {
  const latest = useRef({ habits, onFallback });
  useEffect(() => {
    latest.current = { habits, onFallback };
  });

  useEffect(() => {
    function check() {
      const now = dayjs();
      const today = now.format('YYYY-MM-DD');
      const time = now.format('HH:mm');
      const fired = readFired(today);
      let changed = false;

      for (const habit of latest.current.habits) {
        if (habit.archived || !habit.reminderTime) continue;
        if (habit.reminderTime > time) continue; // not yet
        if (fired.has(habit._id)) continue;

        fired.add(habit._id);
        changed = true;
        if (habit.completedDates.includes(today)) continue; // already done, stay quiet

        const title = `${habit.icon || '⏰'} Time for "${habit.name}"`;
        const body = 'Tick it off in Streakly to keep your streak going.';
        if (notificationsSupported() && Notification.permission === 'granted') {
          new Notification(title, { body, tag: `streakly-${habit._id}` });
        } else {
          latest.current.onFallback(title);
        }
      }

      if (changed) saveFired(today, fired);
    }

    check();
    const timer = setInterval(check, CHECK_EVERY);
    return () => clearInterval(timer);
  }, []);
}
