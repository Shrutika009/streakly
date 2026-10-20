require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const { resolveJwtSecret } = require('./lib/config');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

try {
  resolveJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set, using the development secret. Never do this in production.');
}

const app = require('./app');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
