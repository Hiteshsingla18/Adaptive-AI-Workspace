import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetry } from '@/contexts/TelemetryContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { downloadReviewPacket } from '@/lib/reviewPacket';
import {
  Video,
  VideoOff,
  Eye,
  Armchair,
  Lightbulb,
  Brain,
  Timer,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react';
import { AGENT_ROLES, type AgentRole, type MetricStatus, type RecommendationPriority, type MetricMeta } from '@/types/telemetry';

function statusFor(value: number, good: number, warn: number): MetricStatus {
  if (value >= good) return 'good';
  if (value >= warn) return 'warning';
  return 'critical';
}

const priorityConfig: Record<RecommendationPriority, { border: string; dot: string; label: string }> = {
  high: { border: 'border-l-rose-500', dot: 'bg-rose-500', label: 'High' },
  medium: { border: 'border-l-amber-500', dot: 'bg-amber-500', label: 'Medium' },
  low: { border: 'border-l-blue-500', dot: 'bg-blue-500', label: 'Low' },
};

const categoryIcon: Record<string, LucideIcon> = {
  posture: Armchair,
  break: Timer,
  lighting: Lightbulb,
  focus: Brain,
  hydration: Zap,
};

export function DashboardPage() {
  const {
    metrics,
    recommendations,
    toggleCamera,
    toggleVisionOverlay,
    isLive,
    videoRef,
    cameraError,
    cameraConnecting,
    modelsLoading,
    modelError,
    personDetected,
    fetchNotes,
    saveNote,
  } = useTelemetry();

  const [roleFilter, setRoleFilter] = useState<AgentRole | 'all'>('all');
  const visibleRecommendations =
    roleFilter === 'all' ? recommendations : recommendations.filter((rec) => rec.roles.includes(roleFilter));

  // Reviewer notes for the review-packet export (bounty 3). Loaded once on
  // mount, not on every telemetry re-render — fetchNotes is a fresh closure
  // each render since it lives in TelemetryProvider, which re-renders
  // constantly while the camera is on.
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  useEffect(() => {
    void fetchNotes().then(setNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metricCards: MetricMeta[] = [
    { label: 'Workspace Health', value: metrics.healthScore, unit: '/100', icon: 'Activity', status: statusFor(metrics.healthScore, 80, 60), description: 'Overall workspace condition' },
    { label: 'Posture', value: metrics.posture, unit: '%', icon: 'Armchair', status: statusFor(metrics.posture, 75, 55), description: 'Spine alignment quality' },
    { label: 'Fatigue Index', value: metrics.fatigueIndex, unit: '%', icon: 'BatteryLow', status: metrics.fatigueIndex < 40 ? 'good' : metrics.fatigueIndex < 70 ? 'warning' : 'critical', description: 'Accumulated tiredness' },
    { label: 'Lighting', value: metrics.lightingLux, unit: 'lux', icon: 'Lightbulb', status: statusFor(metrics.lightingLux, 500, 300), description: 'Ambient brightness' },
    { label: 'Focus Score', value: metrics.focusScore, unit: '%', icon: 'Brain', status: statusFor(metrics.focusScore, 70, 50), description: 'Concentration level' },
    { label: 'Stress Level', value: metrics.stress, unit: '%', icon: 'Zap', status: metrics.stress < 40 ? 'good' : metrics.stress < 65 ? 'warning' : 'critical', description: 'Detected tension' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="What your workspace looks like right now."
      >
        <StatusBadge status={isLive ? 'live' : 'offline'} label={isLive ? 'Streaming' : 'Idle'} />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left + center column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Camera card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-lg border border-zinc-800/80 bg-card transition-colors duration-200 hover:border-zinc-700/80"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Live Camera</p>
                  <p className="text-xs font-normal text-zinc-400">
                    {metrics.cameraConnected ? `${metrics.fps} FPS` : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-xs font-normal text-zinc-400">Overlay</span>
                  <Switch
                    checked={metrics.visionOverlay}
                    onCheckedChange={toggleVisionOverlay}
                    disabled={!metrics.cameraConnected}
                  />
                </div>
                <Button
                  variant={metrics.cameraConnected ? 'destructive' : 'default'}
                  size="sm"
                  onClick={toggleCamera}
                  disabled={cameraConnecting}
                >
                  {metrics.cameraConnected ? (
                    <><VideoOff className="mr-1.5 h-3.5 w-3.5" /> Disconnect</>
                  ) : cameraConnecting ? (
                    'Connecting…'
                  ) : (
                    <><Video className="mr-1.5 h-3.5 w-3.5" /> Connect</>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative h-[320px] bg-background">
              <div className="grid-bg absolute inset-0 opacity-50" />
              {/* Status badge top-right */}
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/80 px-2 py-1 text-[10px] font-mono uppercase text-zinc-400 backdrop-blur">
                <span className={`h-1.5 w-1.5 rounded-full ${metrics.cameraConnected && !modelsLoading ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                {metrics.cameraConnected ? `${metrics.fps} FPS` : 'Idle'} · MediaPipe{' '}
                {modelsLoading ? 'loading' : metrics.cameraConnected ? 'active' : 'inactive'}
              </div>

              {metrics.cameraConnected ? (
                <div className="relative h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full scale-x-[-1] object-cover"
                  />
                  {modelsLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 text-center backdrop-blur-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
                      />
                      <p className="mt-3 text-sm font-medium text-zinc-100">Loading vision model…</p>
                      <p className="mt-1 text-xs font-normal text-zinc-400">
                        One-time download, cached after this.
                      </p>
                    </div>
                  )}
                  {modelError && !modelsLoading && (
                    <div className="absolute inset-x-3 top-3 z-10 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                      Vision models failed to load: {modelError}
                    </div>
                  )}
                  {metrics.visionOverlay && !modelsLoading && (
                    <div className="absolute inset-8 rounded-md border-2 border-primary/40">
                      <div className="absolute -top-3 left-3 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        {personDetected ? 'Person detected' : 'No person detected'}
                      </div>
                      <div className="absolute -bottom-3 right-3 rounded bg-primary/80 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Posture {metrics.posture}%
                      </div>
                    </div>
                  )}
                </div>
              ) : cameraConnecting ? (
                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 border-t-primary"
                  />
                  <p className="mt-4 text-sm font-medium text-zinc-100">Requesting camera access…</p>
                  <p className="mt-1 max-w-xs text-xs font-normal text-zinc-400">
                    Allow camera access in the browser prompt to continue.
                  </p>
                </div>
              ) : (
                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/40"
                  >
                    <VideoOff className="h-6 w-6 text-zinc-500" />
                  </motion.div>
                  <p className="mt-4 text-sm font-medium text-zinc-100">Camera Not Connected</p>
                  <p className="mt-1 max-w-xs text-xs font-normal text-zinc-400">
                    {cameraError ?? 'Connect your camera to start posture and focus tracking.'}
                  </p>
                  <Button size="sm" className="mt-4" onClick={toggleCamera}>
                    <Video className="mr-1.5 h-3.5 w-3.5" /> Connect camera
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Metric cards */}
          <div>
            <h2 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              AI Metrics
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metricCards.map((m, i) => (
                <MetricCard key={m.label} index={i} {...m} />
              ))}
            </div>
          </div>

          {/* Break timer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-card p-4 transition-colors duration-200 hover:border-zinc-700/80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Next Break</p>
                <p className="text-xs font-normal text-zinc-400">Stand up and stretch</p>
              </div>
            </div>
            <div className="text-right">
              <AnimatedCounter
                value={metrics.breakTimerMinutes}
                decimals={0}
                className="font-heading text-2xl font-bold tracking-tight text-zinc-100"
              />
              <span className="ml-1 text-sm font-normal text-zinc-400">min</span>
            </div>
          </motion.div>
        </div>

        {/* Right column: Recommendations */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-500">
                AI Recommendations
              </h2>
            </div>
            <span className="text-[11px] font-normal text-zinc-500">
              {visibleRecommendations.length} of {recommendations.length}
            </span>
          </div>

          {/* Role filter tabs — scopes the list below to tasks relevant to that role */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(['all', ...AGENT_ROLES] as const).map((role) => {
              const count =
                role === 'all' ? recommendations.length : recommendations.filter((r) => r.roles.includes(role)).length;
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-zinc-800/80 bg-card text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {role} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-card">
            {visibleRecommendations.length === 0 && (
              <div className="p-6 text-center text-xs font-normal text-zinc-500">
                No tasks for this role right now.
              </div>
            )}
            <AnimatePresence>
              {visibleRecommendations.map((rec, i) => {
                const Icon = categoryIcon[rec.category] ?? Sparkles;
                const pc = priorityConfig[rec.priority];
                const completeCount = rec.checklist.filter((c) => c.complete).length;
                const isChecklistComplete = completeCount === rec.checklist.length;
                return (
                  <motion.div
                    key={rec.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className={`group flex items-start gap-3 border-l-2 ${pc.border} border-b border-zinc-800/60 px-4 py-3 transition-colors duration-200 last:border-b-0 hover:bg-zinc-800/30`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-100">{rec.title}</p>
                          <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-500">
                            <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                            {pc.label}
                          </span>
                        </div>
                        <span
                          className={`flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-mono ${
                            isChecklistComplete
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-zinc-700/60 bg-zinc-800/40 text-zinc-400'
                          }`}
                          title="Sources backing this recommendation"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {completeCount}/{rec.checklist.length}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-normal text-zinc-400">{rec.description}</p>

                      <ul className="mt-2 space-y-1">
                        {rec.checklist.map((item) => (
                          <li key={item.id} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                            {item.complete ? (
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                            ) : (
                              <Circle className="h-3 w-3 shrink-0 text-zinc-600" />
                            )}
                            <span className={item.complete ? 'text-zinc-400' : 'text-zinc-600'}>{item.label}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2 flex items-center gap-3">
                        <button className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80">
                          {rec.action}
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </button>
                        <button
                          onClick={() => setOpenNoteId(openNoteId === rec.id ? null : rec.id)}
                          className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                          <NotebookPen className="h-3 w-3" />
                          {notes[rec.id] ? 'Edit note' : 'Add note'}
                        </button>
                        <button
                          onClick={() => downloadReviewPacket(rec, notes[rec.id] ?? '')}
                          className="ml-auto flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                          title="Export review packet"
                        >
                          <Download className="h-3 w-3" />
                          Export
                        </button>
                      </div>

                      {openNoteId === rec.id && (
                        <div className="mt-2">
                          <Textarea
                            value={notes[rec.id] ?? ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [rec.id]: e.target.value }))}
                            onBlur={() => void saveNote(rec.id, notes[rec.id] ?? '')}
                            placeholder="Reviewer notes for this task — included in the exported packet…"
                            className="min-h-[60px] border-zinc-800/80 bg-background/60 text-xs text-zinc-100"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
