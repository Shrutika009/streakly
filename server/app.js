const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
// import files with a few years of history can go past the 100kb default
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// catches things like malformed JSON bodies
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
