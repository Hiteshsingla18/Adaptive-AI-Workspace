import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import type { MetricStatus } from '@/types/telemetry';
import {
  Activity,
  Armchair,
  BatteryLow,
  Brain,
  Eye,
  Lightbulb,
  Moon,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
  status: MetricStatus;
  description: string;
  index?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Armchair,
  BatteryLow,
  Brain,
  Eye,
  Lightbulb,
  Moon,
  Timer,
  Zap,
};

const barColor: Record<MetricStatus, string> = {
  good: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-rose-400',
};

const barTrack: Record<MetricStatus, string> = {
  good: 'bg-emerald-400/15',
  warning: 'bg-amber-400/15',
  critical: 'bg-rose-400/15',
};

export function MetricCard({
  label,
  value,
  unit,
  icon,
  status,
  description,
  index = 0,
}: MetricCardProps) {
  const Icon = iconMap[icon] ?? Activity;
  const pct = Math.min(100, Math.max(0, value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-lg border border-zinc-800/80 bg-card p-4 transition-colors duration-200 hover:border-zinc-700/80"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </p>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <AnimatedCounter
          value={value}
          decimals={0}
          className="font-heading text-2xl font-bold tracking-tight text-zinc-100"
        />
        <span className="text-xs font-medium text-zinc-500">{unit}</span>
      </div>
      <div className={cn('mt-2.5 h-1 w-full overflow-hidden rounded-full', barTrack[status])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor[status])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-normal text-zinc-400">{description}</p>
    </motion.div>
  );
}
