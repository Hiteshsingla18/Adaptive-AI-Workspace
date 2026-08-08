import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const reports = [
  {
    id: 'daily',
    title: 'Daily Report',
    description: 'A detailed breakdown of your workspace metrics for today.',
    icon: Calendar,
    period: 'Today',
    stats: [
      { label: 'Posture avg', value: '78%' },
      { label: 'Focus time', value: '6h 12m' },
      { label: 'Breaks taken', value: '5' },
    ],
  },
  {
    id: 'weekly',
    title: 'Weekly Report',
    description: 'Trends and comparisons across your last 7 days.',
    icon: TrendingUp,
    period: 'This week',
    stats: [
      { label: 'Posture avg', value: '80%' },
      { label: 'Focus time', value: '38h 45m' },
      { label: 'Breaks taken', value: '32' },
    ],
  },
  {
    id: 'monthly',
    title: 'Monthly Report',
    description: 'Long-term patterns and habit insights for the month.',
    icon: Clock,
    period: 'This month',
    stats: [
      { label: 'Posture avg', value: '76%' },
      { label: 'Focus time', value: '152h 30m' },
      { label: 'Breaks taken', value: '128' },
    ],
  },
];

export function ReportsPage() {
  const { toast } = useToast();

  const handleDownload = (title: string) => {
    toast({
      title: 'Report generated',
      description: `${title} is being prepared for download.`,
    });
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Download a summary of your workspace performance."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800/80 bg-card p-4 transition-colors duration-200 hover:border-zinc-700/80"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <r.icon className="h-4 w-4" />
              </div>
              <span className="rounded-md border border-zinc-800/80 bg-background/60 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                {r.period}
              </span>
            </div>
            <h3 className="font-heading mt-3 text-base font-semibold tracking-tight text-zinc-100">{r.title}</h3>
            <p className="mt-1 text-sm font-normal text-zinc-400">{r.description}</p>

            <div className="mt-3 space-y-1.5">
              {r.stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-background/40 px-3 py-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{s.label}</span>
                  <span className="font-heading text-sm font-bold text-zinc-100">{s.value}</span>
                </div>
              ))}
            </div>

            <Button
              className="mt-4 w-full"
              variant="outline"
              size="sm"
              onClick={() => handleDownload(r.title)}
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Download PDF
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-zinc-800/80 bg-card/40 p-3 text-sm font-normal text-zinc-400"
      >
        <FileText className="h-4 w-4 shrink-0" />
        Reports are generated from your telemetry history. Connect your camera to start collecting data.
      </motion.div>
    </div>
  );
}
