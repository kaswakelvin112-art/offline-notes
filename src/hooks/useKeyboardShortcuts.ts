import { useEffect, useRef } from 'react';

export interface ShortcutHandlers {
  onNewNote: () => void;
  onNewFolder: () => void;
  onFocusSearch: () => void;
  onTogglePreview: () => void;
  onEscape: () => void;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        handlersRef.current.onEscape();
        return;
      }

      if (isTypingTarget(e.target) && e.key !== 'Escape') return;

      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (e.shiftKey) handlersRef.current.onNewFolder();
        else handlersRef.current.onNewNote();
      } else if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlersRef.current.onFocusSearch();
      } else if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handlersRef.current.onTogglePreview();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
