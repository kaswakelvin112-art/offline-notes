import { useEffect } from 'react';
import type { ToastState } from '../types';
import { CloseIcon, UndoIcon } from './icons';

interface ToastProps {
  toast: ToastState;
  onClose: (id: number) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border-strong bg-surface-2 px-4 py-2 shadow-xl shadow-black/40"
    >
      {toast.onAction && <UndoIcon className="h-4 w-4 text-accent" />}
      <span className="text-sm text-ink">{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          onClick={() => {
            toast.onAction?.();
            onClose(toast.id);
          }}
          className="text-sm font-semibold text-accent hover:underline"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss"
        className="ml-1 rounded p-0.5 text-ink-faint hover:text-ink"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
