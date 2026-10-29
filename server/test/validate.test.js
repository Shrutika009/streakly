const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidDate,
  isValidColor,
  parseHabitFields,
  parseImport,
  MAX_IMPORT_HABITS,
} = require('../lib/validate');

test('isValidDate accepts real days only', () => {
  assert.equal(isValidDate('2026-10-20'), true);
  assert.equal(isValidDate('2024-02-29'), true); // leap year
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('2026-13-01'), false);
  assert.equal(isValidDate('2026-1-5'), false);
  assert.equal(isValidDate(20261020), false);
  assert.equal(isValidDate(undefined), false);
});

test('isValidColor accepts 3 and 6 digit hex', () => {
  assert.equal(isValidColor('#f97316'), true);
  assert.equal(isValidColor('#FFF'), true);
  assert.equal(isValidColor('f97316'), false);
  assert.equal(isValidColor('#f9731'), false);
  assert.equal(isValidColor('red'), false);
});

test('parseHabitFields requires a name unless partial', () => {
  assert.deepEqual(parseHabitFields({}), { error: 'Name is required' });
  assert.deepEqual(parseHabitFields({ name: '   ' }), { error: 'Name is required' });
  assert.deepEqual(parseHabitFields({}, { partial: true }), { values: {} });
  assert.deepEqual(parseHabitFields({ name: '' }, { partial: true }), {
    error: 'Name cannot be empty',
  });
});

test('parseHabitFields trims and keeps valid fields', () => {
  const { values } = parseHabitFields({
    name: '  Read  ',
    color: '#22c55e',
    weeklyGoal: 5,
    archived: true,
  });
  assert.deepEqual(values, { name: 'Read', color: '#22c55e', weeklyGoal: 5, archived: true });
});

test('parseHabitFields rejects bad values', () => {
  assert.match(parseHabitFields({ name: 'x'.repeat(61) }).error, /60 characters/);
  assert.match(parseHabitFields({ name: 'Read', color: 'blue' }).error, /hex/);
  assert.match(parseHabitFields({ name: 'Read', weeklyGoal: 0 }).error, /1 to 7/);
  assert.match(parseHabitFields({ name: 'Read', weeklyGoal: 8 }).error, /1 to 7/);
  assert.match(parseHabitFields({ name: 'Read', weeklyGoal: 2.5 }).error, /1 to 7/);
  assert.match(parseHabitFields({ name: 'Read', archived: 'yes' }).error, /true or false/);
});

test('parseImport cleans dates and reports the bad habit', () => {
  const { habits } = parseImport({
    habits: [
      {
        name: 'Run',
        completedDates: ['2026-10-02', '2026-10-01', '2026-10-01', 'nope', '2026-02-30'],
      },
    ],
  });
  assert.deepEqual(habits, [
    { name: 'Run', completedDates: ['2026-10-01', '2026-10-02'], notes: {} },
  ]);

  assert.match(parseImport({ habits: [{ name: 'A' }, { name: '' }] }).error, /^Habit 2:/);
  assert.match(parseImport({}).error, /no habits/);
  assert.match(parseImport({ habits: [] }).error, /no habits/);

  const tooMany = Array.from({ length: MAX_IMPORT_HABITS + 1 }, () => ({ name: 'x' }));
  assert.match(parseImport({ habits: tooMany }).error, /at most/);
});

test('parseHabitFields handles icon, category and reminder time', () => {
  const { values } = parseHabitFields({
    name: 'Yoga',
    icon: ' 🧘‍♀️ ',
    category: 'fitness',
    reminderTime: '07:30',
  });
  assert.deepEqual(values, { name: 'Yoga', icon: '🧘‍♀️', category: 'fitness', reminderTime: '07:30' });

  // empty or null clears icon and reminder
  assert.deepEqual(parseHabitFields({ icon: null, reminderTime: '' }, { partial: true }).values, {
    icon: '',
    reminderTime: '',
  });

  assert.match(parseHabitFields({ name: 'A', icon: 'way too long' }).error, /single emoji/);
  assert.match(parseHabitFields({ name: 'A', icon: 5 }).error, /Icon must be text/);
  assert.match(parseHabitFields({ name: 'A', category: 'sports' }).error, /Category must be/);
  assert.match(parseHabitFields({ name: 'A', reminderTime: '24:00' }).error, /HH:mm/);
  assert.match(parseHabitFields({ name: 'A', reminderTime: '7:30' }).error, /HH:mm/);
});

test('parseNote validates the day and trims the text', () => {
  const { parseNote, cleanNotes, MAX_NOTE_LENGTH } = require('../lib/validate');
  assert.deepEqual(parseNote({ date: '2026-10-29', text: '  Ran 5k  ' }), {
    date: '2026-10-29',
    text: 'Ran 5k',
  });
  assert.deepEqual(parseNote({ date: '2026-10-29', text: '' }), { date: '2026-10-29', text: '' });
  assert.match(parseNote({ date: '2026-02-30', text: 'x' }).error, /real day/);
  assert.match(parseNote({ date: '2026-10-29' }).error, /string/);
  assert.match(parseNote({ date: '2026-10-29', text: 'x'.repeat(MAX_NOTE_LENGTH + 1) }).error, /or less/);

  assert.deepEqual(cleanNotes({ '2026-10-29': ' ok ', bad: 'x', '2026-10-28': '', '2026-10-27': 5 }), {
    '2026-10-29': 'ok',
  });
  assert.deepEqual(cleanNotes(['a']), {});
});
