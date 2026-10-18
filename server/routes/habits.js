const express = require('express');
const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  next();
});

// Require authentication for all habit routes
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (color !== undefined && (typeof color !== 'string' || !HEX_COLOR_RE.test(color))) {
      return res.status(400).json({ error: 'Color must be a valid hex code (e.g. #f97316)' });
    }
    const habit = await Habit.create({
      name: name.trim(),
      ...(color ? { color } : {}),
      user: req.user.id,
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body || {};
    const updates = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
      updates.name = name.trim();
    }
    if (color !== undefined) {
      if (typeof color !== 'string' || !HEX_COLOR_RE.test(color)) {
        return res.status(400).json({ error: 'Color must be a valid hex code (e.g. #f97316)' });
      }
      updates.color = color;
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
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
    if (!date || !DATE_RE.test(date)) {
      return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
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
