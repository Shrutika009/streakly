import { useEffect, useRef } from 'react';

// Single-key shortcuts, e.g. { n: fn, '?': fn }. Ignored while typing in a
// field or when a modifier key is held, so they never fight the browser.
export default function useShortcuts(bindings, enabled = true) {
  // keep the latest handlers without re-adding the listener each render
  const ref = useRef(bindings);
  useEffect(() => {
    ref.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;

    function handleKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if (typing) return;
      // don't act behind an open dialog
      if (document.querySelector('[role="dialog"]')) return;

      const handler = ref.current[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled]);
}
