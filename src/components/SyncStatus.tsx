import { CheckCircleIcon, CloudOffIcon } from './icons';

interface SyncStatusProps {
  pendingCount: number;
}

export default function SyncStatus({ pendingCount }: SyncStatusProps) {
  if (pendingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-ink-dim">
        <CheckCircleIcon className="h-4 w-4 text-accent" />
        <span>Saved locally</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs text-ink-dim">
      <CloudOffIcon className="h-4 w-4 text-warn" />
      <span>
        <span className="font-semibold text-warn">{pendingCount}</span> pending sync
      </span>
    </div>
  );
}
