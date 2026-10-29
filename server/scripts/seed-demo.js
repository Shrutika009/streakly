// Creates (or resets) a demo account with about a year of habit history,
// so the heatmaps, stats and achievements have something to show.
// Running it again wipes the demo account's habits and rebuilds them.
//
// Usage: npm run seed-demo
//        npm run seed-demo -- other@example.com
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Habit = require('../models/Habit');
const User = require('../models/User');

const EMAIL = (process.argv[2] || 'demo@streakly.local').trim().toLowerCase();
const PASSWORD = 'demo1234';
const NAME = 'Demo';

// Same "random" history on every run, so the demo always looks the same.
let seed = 7;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// YYYY-MM-DD for `n` days ago, in local time like the client.
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

// Each day in the last `days` (not today) is ticked with chance `p`.
function history(p, days) {
  const dates = [];
  for (let i = 1; i < days; i++) if (random() < p) dates.push(daysAgo(i));
  return dates;
}

// `from` to `to` days ago, every day.
function run(from, to) {
  const dates = [];
  for (let i = from; i <= to; i++) dates.push(daysAgo(i));
  return dates;
}

// Some are already ticked today and some aren't, so the Today view has both lists.
const HABITS = [
  {
    name: 'Drink 2L of water', icon: '💧', category: 'health', color: '#3b82f6', weeklyGoal: 7,
    reminderTime: '09:00', dates: [...history(0.8, 330), ...run(0, 12)],
    notes: { 0: 'Finished the bottle before lunch', 3: 'Hot day, had 3L' },
  },
  {
    name: 'Meditate 10 minutes', icon: '🧘', category: 'mind', color: '#a855f7', weeklyGoal: 7,
    dates: [...history(0.75, 200), ...run(1, 23)],
  },
  {
    name: 'Read 20 pages', icon: '📚', category: 'learning', color: '#22c55e', weeklyGoal: 5,
    reminderTime: '21:30', dates: [...history(0.65, 300), daysAgo(0)],
    notes: { 2: 'Started Atomic Habits' },
  },
  {
    name: 'Morning run', icon: '🏃', category: 'fitness', color: '#f97316', weeklyGoal: 3,
    dates: history(0.45, 220), notes: { 1: 'Ran 5k in the rain' },
  },
  {
    name: 'Learn Spanish', icon: '🗣️', category: 'learning', color: '#eab308', weeklyGoal: 4,
    dates: history(0.55, 120),
  },
  {
    name: 'Call family', icon: '📞', category: 'social', color: '#ec4899', weeklyGoal: 2,
    dates: history(0.3, 150),
  },
  {
    name: 'Tidy the desk', icon: '🧹', category: 'home', color: '#14b8a6', weeklyGoal: 5,
    dates: [...history(0.6, 90), daysAgo(0)],
  },
  {
    name: 'No sugar', icon: '🍬', category: 'health', color: '#ef4444', weeklyGoal: 7, archived: true,
    dates: history(0.5, 60).filter((d) => d < daysAgo(20)),
  },
];

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    let user = await User.findOne({ email: EMAIL });
    if (!user) {
      user = await User.create({ name: NAME, email: EMAIL, password: await bcrypt.hash(PASSWORD, 10) });
    }

    await Habit.deleteMany({ user: user._id });
    await Habit.insertMany(
      HABITS.map((h, i) => ({
        name: h.name,
        icon: h.icon,
        category: h.category,
        color: h.color,
        weeklyGoal: h.weeklyGoal,
        reminderTime: h.reminderTime || '',
        archived: Boolean(h.archived),
        completedDates: [...new Set(h.dates)].sort(),
        notes: Object.fromEntries(Object.entries(h.notes || {}).map(([n, text]) => [daysAgo(n), text])),
        order: i,
        user: user._id,
      }))
    );

    console.log(`Demo ready: ${HABITS.length} habits for ${EMAIL}`);
    console.log(`Sign in with ${EMAIL} / ${PASSWORD}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
