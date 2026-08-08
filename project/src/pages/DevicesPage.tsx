import { motion } from 'framer-motion';
import {
  Armchair,
  Monitor,
  Table,
  Lightbulb,
  Watch,
  Plus,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { devices } from '@/data/dummyData';
import type { Device } from '@/types/telemetry';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Armchair,
  Monitor,
  Table,
  Lightbulb,
  Watch,
};

const statusPill: Record<Device['status'], string> = {
  connected: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  disconnected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  'coming-soon': 'border-zinc-600/40 bg-zinc-700/20 text-zinc-400',
};

const statusLabel: Record<Device['status'], string> = {
  connected: 'Connected',
  disconnected: 'Offline',
  'coming-soon': 'Soon',
};

function DeviceCard({ device, index }: { device: Device; index: number }) {
  const Icon = iconMap[device.icon] ?? Monitor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className="group flex flex-col rounded-lg border border-zinc-800/80 bg-card p-4 transition-colors duration-200 hover:border-zinc-700/80"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider',
          statusPill[device.status]
        )}>
          <span className={cn(
            'h-1.5 w-1.5 rounded-full',
            device.status === 'connected' ? 'bg-emerald-400' : device.status === 'disconnected' ? 'bg-rose-400' : 'bg-zinc-500'
          )} />
          {statusLabel[device.status]}
        </span>
      </div>
      <h3 className="font-heading mt-3 text-sm font-semibold tracking-tight text-zinc-100">{device.name}</h3>
      <p className="mt-1 text-xs font-normal text-zinc-400">{device.description}</p>

      {device.metrics && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {device.metrics.map((m) => (
            <div key={m.label} className="rounded-md border border-zinc-800/80 bg-background/40 px-2.5 py-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{m.label}</p>
              <p className="font-heading mt-0.5 text-sm font-bold text-zinc-100">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {device.status === 'disconnected' && (
          <Button size="sm" variant="outline" className="flex-1">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reconnect
          </Button>
        )}
        {device.status === 'coming-soon' && (
          <Button size="sm" variant="ghost" className="flex-1" disabled>
            Notify me
          </Button>
        )}
        {device.status === 'connected' && (
          <Button size="sm" variant="outline" className="flex-1">
            Manage
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function DevicesPage() {
  return (
    <div>
      <PageHeader
        title="Smart Devices"
        subtitle="Connect and manage your workspace hardware."
      >
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add device
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((d, i) => (
          <DeviceCard key={d.id} device={d} index={i} />
        ))}
      </div>
    </div>
  );
}
