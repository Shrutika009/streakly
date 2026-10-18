import HabitCard from './HabitCard';

export default function HabitList({ habits, onToggle, onEdit, onDelete }) {
  if (!habits.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center">
        <p className="font-medium text-stone-600">No habits yet. Add your first one!</p>
        <p className="mt-1 text-sm text-stone-400">Start small, one tick a day is enough.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {habits.map((habit) => (
        <li key={habit._id}>
          <HabitCard habit={habit} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
