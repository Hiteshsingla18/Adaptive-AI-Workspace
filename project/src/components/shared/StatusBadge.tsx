import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MetricStatus } from '@/types/telemetry';

interface StatusBadgeProps {
  status: MetricStatus | 'live' | 'offline' | 'connected' | 'disconnected' | 'coming-soon';
  label?: string;
  className?: string;
}

const config: Record<
  string,
  { dot: string; text: string; bg: string; defaultLabel: string }
> = {
  good: { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/10', defaultLabel: 'Good' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-500/10', defaultLabel: 'Warning' },
  critical: { dot: 'bg-rose-400', text: 'text-rose-300', bg: 'bg-rose-500/10', defaultLabel: 'Critical' },
  live: { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/10', defaultLabel: 'Live' },
  offline: { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/10', defaultLabel: 'Offline' },
  connected: { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/10', defaultLabel: 'Connected' },
  disconnected: { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/10', defaultLabel: 'Disconnected' },
  'coming-soon': { dot: 'bg-blue-400', text: 'text-blue-300', bg: 'bg-blue-500/10', defaultLabel: 'Coming Soon' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const c = config[status] ?? config.offline;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        c.bg,
        c.text,
        className
      )}
    >
      <motion.span
        className={cn('h-1.5 w-1.5 rounded-full', c.dot)}
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {label ?? c.defaultLabel}
    </span>
  );
}
