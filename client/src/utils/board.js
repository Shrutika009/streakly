import { CATEGORIES } from './categories.js';

// Ways to split the board into columns, like Todoist's priority columns.
export const GROUPINGS = {
  category: {
    label: 'Category',
    columns: (habits) =>
      CATEGORIES.filter((c) => habits.some((h) => (h.category || 'other') === c.id)).map((c) => ({
        id: c.id,
        title: c.label,
        habits: habits.filter((h) => (h.category || 'other') === c.id),
        preset: { initialCategory: c.id },
      })),
  },
  goal: {
    label: 'Weekly goal',
    columns: (habits) =>
      [
        { id: 'daily', title: 'Every day', test: (g) => g === 7, preset: 7 },
        { id: 'most', title: '5–6× a week', test: (g) => g >= 5 && g <= 6, preset: 5 },
        { id: 'some', title: '3–4× a week', test: (g) => g >= 3 && g <= 4, preset: 3 },
        { id: 'few', title: '1–2× a week', test: (g) => g <= 2, preset: 2 },
      ].map((col) => ({
        id: col.id,
        title: col.title,
        habits: habits.filter((h) => col.test(h.weeklyGoal || 7)),
        preset: { initialGoal: col.preset },
      })),
  },
};
