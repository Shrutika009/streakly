import dayjs from 'dayjs';

export function greeting(hour = dayjs().hour()) {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

const QUOTES = [
  ['We are what we repeatedly do. Excellence, then, is not an act, but a habit.', 'Will Durant'],
  ['Small daily improvements over time lead to stunning results.', 'Robin Sharma'],
  ['Motivation is what gets you started. Habit is what keeps you going.', 'Jim Ryun'],
  ["You'll never change your life until you change something you do daily.", 'John C. Maxwell'],
  ['Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier'],
  ['The secret of getting ahead is getting started.', 'Mark Twain'],
  ['A journey of a thousand miles begins with a single step.', 'Lao Tzu'],
  ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
  [
    'Discipline is choosing between what you want now and what you want most.',
    'Abraham Lincoln (attributed)',
  ],
  ['First forget inspiration. Habit is more dependable.', 'Octavia Butler'],
  ['Every action you take is a vote for the type of person you wish to become.', 'James Clear'],
  ['Done is better than perfect.', 'Sheryl Sandberg'],
];

// Same quote all day, a different one tomorrow.
export function quoteOfTheDay(date = dayjs()) {
  const dayNumber = Math.floor(date.startOf('day').valueOf() / 86_400_000);
  const [text, author] = QUOTES[((dayNumber % QUOTES.length) + QUOTES.length) % QUOTES.length];
  return { text, author };
}

// A short nudge based on how today is going.
export function todayMessage(done, total) {
  if (!total) return 'Add your first habit to get going.';
  if (done === total) return 'Everything done today. Enjoy the rest of your day!';
  const left = total - done;
  if (done === 0) return `${left} ${left === 1 ? 'habit' : 'habits'} waiting for you today.`;
  return `${left} to go. You're on your way.`;
}
