const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#f97316' },
    // stored as YYYY-MM-DD strings so the client's local date is what counts
    completedDates: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
