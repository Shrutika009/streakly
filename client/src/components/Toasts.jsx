import { useEffect } from 'react';

const DURATION = 5000;

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-stone-100 dark:text-stone-900">
      <span>{toast.message}</span>
      <div className="flex shrink-0 items-center gap-3">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              onDismiss(toast.id);
            }}
            className="font-semibold text-orange-400 hover:underline dark:text-orange-600"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
          className="text-stone-400 hover:text-white dark:text-stone-500 dark:hover:text-stone-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
