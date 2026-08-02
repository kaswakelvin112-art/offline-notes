import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './icons';

interface ConfirmDialogProps {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl shadow-black/40"
      >
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute right-3 top-3 rounded-md p-1 text-ink-faint hover:bg-white/5 hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {message && <div className="mt-2 text-sm leading-relaxed text-ink-dim">{message}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium text-ink-dim hover:border-border-strong hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={
              danger
                ? 'rounded-lg bg-danger px-3.5 py-1.5 text-sm font-semibold text-danger-ink transition hover:brightness-110'
                : 'rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink transition hover:brightness-110'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
