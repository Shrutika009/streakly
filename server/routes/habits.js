const express = require('express');
const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { isValidDate, parseHabitFields, parseImport } = require('../lib/validate');

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  next();
});

// Require authentication for all habit routes
router.use(auth);

// The order value that puts a new habit above everything the user already has.
async function topOrder(userId) {
  const first = await Habit.findOne({ user: userId }).sort({ order: 1 }).select('order');
  return first ? first.order - 1 : 0;
}

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { error, values } = parseHabitFields(req.body);
    if (error) return res.status(400).json({ error });

    const habit = await Habit.create({
      ...values,
      order: await topOrder(req.user.id),
      user: req.user.id,
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Body { ids: [...] } with the user's habit ids in their new order.
// Declared before /:id so "reorder" isn't treated as an id.
router.put('/reorder', async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(mongoose.isValidObjectId)) {
      return res.status(400).json({ error: 'ids must be a non-empty list of habit ids' });
    }
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ error: 'ids must not contain duplicates' });
    }

    const owned = await Habit.countDocuments({ _id: { $in: ids }, user: req.user.id });
    if (owned !== ids.length) {
      return res.status(404).json({ error: 'One or more habits were not found' });
    }

    await Habit.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id, user: req.user.id }, update: { order: index } },
      }))
    );

    const habits = await Habit.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Everything needed to rebuild the user's habits, without ids or owner.
router.get('/export', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json({
      app: 'streakly',
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: habits.map((h) => ({
        name: h.name,
        color: h.color,
        weeklyGoal: h.weeklyGoal,
        archived: h.archived,
        completedDates: [...h.completedDates].sort(),
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adds the habits from an export file. Existing habits are left alone,
// so importing the same file twice gives you duplicates, not overwrites.
router.post('/import', async (req, res) => {
  try {
    const { error, habits } = parseImport(req.body);
    if (error) return res.status(400).json({ error });

    // Keep the file's order, all above the user's current habits.
    const start = (await topOrder(req.user.id)) - habits.length + 1;
    const created = await Habit.insertMany(
      habits.map((h, i) => ({ ...h, order: start + i, user: req.user.id }))
    );
    res.status(201).json({ imported: created.length, habits: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { error, values } = parseHabitFields(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      values,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json({ message: 'Deleted', id: habit._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const { date } = req.body || {};
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'date must be a real day in YYYY-MM-DD format' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    if (habit.completedDates.includes(date)) {
      habit.completedDates = habit.completedDates.filter((d) => d !== date);
    } else {
      habit.completedDates.push(date);
    }
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
