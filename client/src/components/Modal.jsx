import { useEffect } from 'react';

// Shared shell for dialogs: dark backdrop, closes on Escape or backdrop click.
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    // stop the page behind from scrolling while the dialog is open
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`card max-h-[90vh] w-full overflow-y-auto p-6 shadow-xl ${wide ? 'max-w-lg' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          {typeof title === 'string' ? (
            <h2 className="heading text-lg font-semibold">{title}</h2>
          ) : (
            title
          )}
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      aria-label="Close"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
