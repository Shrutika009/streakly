// Round "tick today" button, ringed in the habit's color (like a to-do checkbox).
export default function HabitCheck({ habit, done, onToggle, size = 'h-6 w-6' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      aria-label={`${habit.name}: ${done ? 'done today, click to undo' : 'mark done for today'}`}
      className={`group flex shrink-0 items-center justify-center rounded-full border-2 transition hover:scale-110 active:scale-90 ${size}`}
      style={{ borderColor: habit.color, backgroundColor: done ? habit.color : 'transparent' }}
    >
      <svg
        className={`h-3.5 w-3.5 transition ${done ? 'text-white' : 'opacity-0 group-hover:opacity-60'}`}
        style={done ? undefined : { color: habit.color }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}
