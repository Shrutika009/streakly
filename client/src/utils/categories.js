// keep ids in sync with CATEGORIES in server/lib/validate.js
export const CATEGORIES = [
  { id: 'health', label: 'Health', emoji: '💧' },
  { id: 'fitness', label: 'Fitness', emoji: '🏃' },
  { id: 'mind', label: 'Mind', emoji: '🧘' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'social', label: 'Social', emoji: '💬' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

export function categoryFor(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

// A curated set for the icon picker; any single emoji is accepted by the API.
// prettier-ignore
export const ICONS = [
  '💧', '🥗', '🍎', '💊', '😴', '🦷',
  '🏃', '🚴', '🏋️', '🧘', '🚶', '🏊',
  '📚', '✍️', '🎸', '🧠', '🌍', '💻',
  '💼', '📧', '🧹', '🌱', '💰', '📵',
  '☀️', '🙏', '❤️', '📞', '🎨', '⭐',
];
