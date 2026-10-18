const express = require('express');
const mongoose = require('mongoose');
const Habit = require('../models/Habit');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
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
    const habit = await Habit.create({ name, color });
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
      updates.name = name;
    }
    if (color !== undefined) updates.color = color;

    const habit = await Habit.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!habit) return res.status(404).json({ error: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
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

    const habit = await Habit.findById(req.params.id);
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
