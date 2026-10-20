import { useCallback, useRef, useState } from 'react';

// Keeps a short stack of messages. Each can carry one action, like "Undo".
export default function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, action) => {
    const id = nextId.current++;
    // keep at most 3 on screen
    setToasts((prev) => [...prev.slice(-2), { id, message, action }]);
  }, []);

  return { toasts, show, dismiss };
}
