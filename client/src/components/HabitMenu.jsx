import { useEffect, useRef, useState } from 'react';

// A small dropdown menu. `items` is a list of
// { label, onClick, disabled?, danger?, icon?, className? }. Pass `children` to replace
// the default "⋯" trigger, and `header` for content above the items.
export default function HabitMenu({
  items,
  label = 'More actions',
  children,
  header,
  buttonClassName = 'btn-ghost px-2',
  width = 'w-40',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={buttonClassName}
      >
        {children || (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`animate-pop-in absolute right-0 z-40 mt-1 ${width} origin-top-right overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700`}
        >
          {header}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`${item.className || ''} flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                  : 'text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {item.icon && (
                <span aria-hidden="true" className="w-4 text-center">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
