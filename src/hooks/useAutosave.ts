import { useCallback, useEffect, useRef } from 'react';

// Debounced autosave. `value` is the latest value being edited; `save` is
// called with the freshest value after the user goes quiet for `delay` ms,
// and also once on unmount if there are unsaved changes. This is what stops
// the sync queue from getting one row per keystroke.
export function useAutosave<T>(value: T, delay: number, save: (value: T) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  const saveRef = useRef(save);
  const dirtyRef = useRef(false);

  useEffect(() => {
    valueRef.current = value;
    saveRef.current = save;
  }, [value, save]);

  const doSave = useCallback(() => {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    saveRef.current(valueRef.current);
  }, []);

  const schedule = useCallback(() => {
    dirtyRef.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      doSave();
    }, delay);
  }, [delay, doSave]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (dirtyRef.current) saveRef.current(valueRef.current);
    };
  }, []);

  return { schedule, flush: doSave };
}
