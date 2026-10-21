const mongoose = require('mongoose');
const { HEX_COLOR_RE } = require('../lib/validate');

const habitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // keep in sync with COLORS[0] in client/src/utils/colors.js
    color: {
      type: String,
      default: '#f97316',
      match: [HEX_COLOR_RE, 'Color must be a valid hex code (e.g. #f97316)'],
    },
    // how many days a week the user is aiming for (7 = every day)
    weeklyGoal: { type: Number, default: 7, min: 1, max: 7 },
    // stored as YYYY-MM-DD strings so the client's local date is what counts
    completedDates: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
    // lower comes first; new habits get the lowest so they land on top
    order: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
