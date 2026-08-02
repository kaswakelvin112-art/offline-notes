import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons';

interface PromptDialogProps {
  title: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({
  title,
  label,
  initialValue = '',
  placeholder,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

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
        {label && <p className="mt-1 text-sm text-ink-dim">{label}</p>}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder={placeholder}
          className="mt-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-3.5 py-1.5 text-sm font-medium text-ink-dim hover:border-border-strong hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink transition hover:brightness-110"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
