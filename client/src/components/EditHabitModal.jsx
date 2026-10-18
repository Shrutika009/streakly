// TODO: finish this modal (assigned to the team, see README "Remaining work").
// It already receives everything it needs from App:
//   habit   - the habit being edited ({ _id, name, color, ... })
//   onSave  - call onSave(habit._id, { name, color }); it returns a promise and closes the modal on success
//   onClose - closes without saving
// Should have: name input, the same color swatches as AddHabitForm (COLORS in utils/colors.js),
// Save / Cancel buttons, close on Escape or backdrop click, and show an error if saving fails.

export default function EditHabitModal({ habit, onClose }) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Edit "{habit.name}"</h2>
        <p className="mt-2 text-sm text-stone-500">Editing isn't built yet.</p>
        <button onClick={onClose} className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-white">
          Close
        </button>
      </div>
    </div>
  );
}
