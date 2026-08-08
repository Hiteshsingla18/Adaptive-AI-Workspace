import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTelemetry } from '@/contexts/TelemetryContext';
import { useAuth } from '@/contexts/AuthContext';
import type { TelemetryEvent } from '@/types/telemetry';

export function HistoryPage() {
  const { fetchEvents } = useTelemetry();
  const { user } = useAuth();
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setLoading(true);
      const nextEvents = await fetchEvents();
      if (isMounted) {
        setEvents(nextEvents);
        setLoading(false);
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [fetchEvents, user?.id]);

  const formatTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Just now';
    }
    return parsed.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="A timeline of your workspace events and corrections."
      />

      <div className="relative">
        <div className="absolute left-[15px] top-2 h-full w-px bg-zinc-800/80 md:left-[19px]" />
        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-zinc-800/80 bg-card p-10 text-sm text-zinc-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading your history…
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-zinc-800/80 bg-card p-10 text-center text-sm text-zinc-400">
            No history yet. Connect the camera or trigger an event to start populating this timeline.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="relative flex items-start gap-4 pl-1"
              >
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800/80 bg-card ${
                  event.status === 'good' ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {event.status === 'good' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1 rounded-lg border border-zinc-800/80 bg-card p-4 transition-colors duration-200 hover:border-zinc-700/80">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-zinc-100">{event.event}</p>
                    <span className="flex items-center gap-1 text-xs font-normal text-zinc-400">
                      <Clock className="h-3 w-3" /> {formatTime(event.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-normal text-zinc-400">{event.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
