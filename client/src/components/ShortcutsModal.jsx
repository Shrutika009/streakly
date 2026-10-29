import Modal from './Modal';

const SHORTCUTS = [
  ['n', 'Add a new habit'],
  ['/', 'Search habits'],
  ['h', 'Go to Habits'],
  ['s', 'Go to Stats'],
  ['t', 'Switch theme'],
  ['?', 'Show this list'],
  ['Esc', 'Close a dialog or menu'],
];

export default function ShortcutsModal({ onClose }) {
  return (
    <Modal title="Keyboard shortcuts" onClose={onClose}>
      <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
        {SHORTCUTS.map(([key, text]) => (
          <li key={key} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-stone-600 dark:text-stone-300">{text}</span>
            <kbd className="min-w-7 rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-center font-mono text-xs text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
              {key}
            </kbd>
          </li>
        ))}
      </ul>
      <p className="muted mt-4 text-xs">Shortcuts are paused while you're typing in a field.</p>
    </Modal>
  );
}
