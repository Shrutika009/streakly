const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveJwtSecret, DEV_SECRET } = require('../lib/config');

const STRONG = 'a'.repeat(48);

test('development falls back to the dev secret', () => {
  assert.equal(resolveJwtSecret({}), DEV_SECRET);
  assert.equal(resolveJwtSecret({ NODE_ENV: 'development' }), DEV_SECRET);
});

test('an explicit secret is always used', () => {
  assert.equal(resolveJwtSecret({ JWT_SECRET: 'short' }), 'short');
  assert.equal(resolveJwtSecret({ JWT_SECRET: STRONG, NODE_ENV: 'production' }), STRONG);
});

test('production refuses a missing, short or dev secret', () => {
  assert.throws(() => resolveJwtSecret({ NODE_ENV: 'production' }), /not set/);
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: 'short' }),
    /at least 32/
  );
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: DEV_SECRET }),
    /at least 32/
  );
});
