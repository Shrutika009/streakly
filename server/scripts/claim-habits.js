// Gives habits that have no owner (created before accounts existed) to one user.
// This used to happen automatically on every login, which handed old data to
// whoever signed in first. Now it's a deliberate, one-off step.
//
// Usage: npm run claim-habits -- you@example.com
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const User = require('../models/User');

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run claim-habits -- <email>');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user with email ${email}.`);
      process.exitCode = 1;
      return;
    }

    const { modifiedCount } = await Habit.updateMany(
      { $or: [{ user: { $exists: false } }, { user: null }] },
      { user: user._id }
    );
    console.log(`Gave ${modifiedCount} ownerless habit(s) to ${email}.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
