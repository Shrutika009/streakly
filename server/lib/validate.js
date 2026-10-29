const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const MAX_NAME_LENGTH = 60;
const MAX_ICON_LENGTH = 8;
// keep in sync with CATEGORIES in client/src/utils/categories.js
const CATEGORIES = ['health', 'fitness', 'mind', 'learning', 'work', 'home', 'social', 'other'];
const MAX_IMPORT_HABITS = 500;

// Checks the format and that the day actually exists (no 2026-02-30).
function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function isValidColor(value) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}

function isValidWeeklyGoal(value) {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

// Validates the editable habit fields. With `partial`, missing fields are skipped
// (for PUT); without it, name is required (for POST and import).
// Returns { error } or { values }.
function parseHabitFields(body, { partial = false } = {}) {
  const { name, color, weeklyGoal, archived, icon, category, reminderTime } = body || {};
  const values = {};

  if (name !== undefined || !partial) {
    if (typeof name !== 'string' || !name.trim()) {
      return { error: partial ? 'Name cannot be empty' : 'Name is required' };
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return { error: `Name must be ${MAX_NAME_LENGTH} characters or less` };
    }
    values.name = name.trim();
  }

  if (color !== undefined) {
    if (!isValidColor(color)) {
      return { error: 'Color must be a valid hex code (e.g. #f97316)' };
    }
    values.color = color;
  }

  if (weeklyGoal !== undefined) {
    if (!isValidWeeklyGoal(weeklyGoal)) {
      return { error: 'Weekly goal must be a whole number from 1 to 7' };
    }
    values.weeklyGoal = weeklyGoal;
  }

  if (archived !== undefined) {
    if (typeof archived !== 'boolean') {
      return { error: 'archived must be true or false' };
    }
    values.archived = archived;
  }

  // icon and reminderTime accept '' or null to clear them
  if (icon !== undefined) {
    if (icon !== null && typeof icon !== 'string') {
      return { error: 'Icon must be text, like an emoji' };
    }
    const trimmed = (icon || '').trim();
    if ([...trimmed].length > MAX_ICON_LENGTH) {
      return { error: 'Icon must be a single emoji' };
    }
    values.icon = trimmed;
  }

  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) {
      return { error: `Category must be one of: ${CATEGORIES.join(', ')}` };
    }
    values.category = category;
  }

  if (reminderTime !== undefined) {
    if (reminderTime !== null && reminderTime !== '' && !TIME_RE.test(reminderTime)) {
      return { error: 'Reminder time must be HH:mm in 24-hour time (e.g. 07:30)' };
    }
    values.reminderTime = reminderTime || '';
  }

  return { values };
}

// Turns an exported file back into habit documents, dropping bad dates
// instead of rejecting the whole file. Returns { error } or { habits }.
function parseImport(body) {
  const list = body?.habits;
  if (!Array.isArray(list) || list.length === 0) {
    return { error: 'File has no habits to import' };
  }
  if (list.length > MAX_IMPORT_HABITS) {
    return { error: `You can import at most ${MAX_IMPORT_HABITS} habits at once` };
  }

  const habits = [];
  for (const [i, item] of list.entries()) {
    const { error, values } = parseHabitFields(item);
    if (error) return { error: `Habit ${i + 1}: ${error}` };

    const dates = Array.isArray(item.completedDates) ? item.completedDates : [];
    values.completedDates = [...new Set(dates.filter(isValidDate))].sort();
    habits.push(values);
  }
  return { habits };
}

module.exports = {
  CATEGORIES,
  HEX_COLOR_RE,
  MAX_NAME_LENGTH,
  MAX_IMPORT_HABITS,
  isValidDate,
  isValidColor,
  isValidWeeklyGoal,
  parseHabitFields,
  parseImport,
};
