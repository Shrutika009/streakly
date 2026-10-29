import Modal from './Modal';
import AddHabitForm from './AddHabitForm';

// "Add habit" as a dialog, opened from the sidebar, the Today list and board
// columns. `preset` can start it on a category or weekly goal.
export default function AddHabitModal({ preset, existingNames, onAdd, onClose }) {
  return (
    <Modal title="Add habit" onClose={onClose} wide>
      <AddHabitForm
        onAdd={onAdd}
        onDone={onClose}
        existingNames={existingNames}
        initialCategory={preset?.initialCategory}
        initialGoal={preset?.initialGoal}
        className="mt-4"
        autoFocus
      />
    </Modal>
  );
}
