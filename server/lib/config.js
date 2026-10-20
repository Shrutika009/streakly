// Only ever used when NODE_ENV isn't "production", so local setup works out of the box.
const DEV_SECRET = 'streakly-dev-only-secret';
const MIN_SECRET_LENGTH = 32;

// Anyone who knows the secret can sign a token for any user, so production
// must set its own. Throws instead of silently falling back.
function resolveJwtSecret(env = process.env) {
  const secret = env.JWT_SECRET;
  const production = env.NODE_ENV === 'production';

  if (secret) {
    // DEV_SECRET is shorter than this, so it can't slip into production either.
    if (production && secret.length < MIN_SECRET_LENGTH) {
      throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters in production.`);
    }
    return secret;
  }

  if (production) {
    throw new Error('JWT_SECRET is not set. It is required when NODE_ENV=production.');
  }
  return DEV_SECRET;
}

module.exports = { resolveJwtSecret, DEV_SECRET, MIN_SECRET_LENGTH };
