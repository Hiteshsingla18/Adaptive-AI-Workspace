import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { TelemetryMetrics, TelemetryEvent, Recommendation, ChecklistItem, AgentRole } from '@/types/telemetry';
import { recommendations as initialRecs } from '@/data/dummyData';
import { useVisionMetrics } from '@/hooks/useVisionMetrics';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

interface TelemetryContextValue {
  metrics: TelemetryMetrics;
  recommendations: Recommendation[];
  toggleCamera: () => void;
  toggleVisionOverlay: () => void;
  isLive: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  cameraError: string | null;
  cameraConnecting: boolean;
  modelsLoading: boolean;
  modelError: string | null;
  personDetected: boolean;
  fetchEvents: () => Promise<TelemetryEvent[]>;
  fetchNotes: () => Promise<Record<string, string>>;
  saveNote: (recommendationId: string, note: string) => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextValue | undefined>(
  undefined
);

const SNAPSHOT_INTERVAL_MS = 10000;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecs);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [visionOverlay, setVisionOverlay] = useState(false);
  const [breakTimerMinutes, setBreakTimerMinutes] = useState(12);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraConnecting, setCameraConnecting] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // The <video> element is only mounted once cameraConnected flips true, so
  // videoRef.current doesn't exist yet at the point toggleCamera resolves.
  // Attaching the stream here (after that render has committed) instead of
  // inline in toggleCamera is what actually gets frames onto the screen.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const { metrics: vision, modelsLoading, modelError } = useVisionMetrics(
    videoRef,
    cameraConnected
  );

  const metrics: TelemetryMetrics = {
    healthScore: vision.healthScore,
    posture: vision.posture,
    fatigueIndex: vision.fatigueIndex,
    lightingLux: vision.lightingLux,
    focusScore: vision.focusScore,
    fps: vision.fps,
    stress: vision.stress,
    breakTimerMinutes,
    cameraConnected,
    visionOverlay,
  };

  const metricsRef = useRef(metrics);
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const modelsLoadingRef = useRef(modelsLoading);
  useEffect(() => {
    modelsLoadingRef.current = modelsLoading;
  }, [modelsLoading]);

  // Kept in sync every render so the stable interval effect below always
  // calls the current persistChecklists closure (which itself closes over
  // the current `user`) without needing to be recreated.
  const persistChecklistsRef = useRef<(recs: Recommendation[]) => void>(() => {});

  // Generate client-side dynamic recommendations from live metrics on a fixed
  // interval — NOT a debounce keyed to the metrics themselves. Metrics change
  // every ~220ms while the camera is on, so a debounce restarted on every
  // metric change would never actually get a quiet moment to fire; it'd stay
  // permanently reset and the recommendations would never update. Reading
  // through refs here means this effect never needs to re-run either.
  useEffect(() => {
    const persistChecklistsNow = (recs: Recommendation[]) => persistChecklistsRef.current(recs);

    const recompute = () => {
      const m = metricsRef.current;
      const modelsLoadingNow = modelsLoadingRef.current;
      const dyn: Recommendation[] = [];

      // Every recommendation carries a checklist of the real inputs/sources
      // that had to be available for it to be generated, so its provenance
      // is visible instead of a black box.
      const cameraItem: ChecklistItem = { id: 'camera', label: 'Camera connected', complete: m.cameraConnected };
      const modelItem: ChecklistItem = { id: 'vision-model', label: 'Vision models loaded', complete: !modelsLoadingNow };

      // Which roles a task is relevant to: routine self-care always reaches
      // 'user'; environment issues route to the facility 'admin'; urgent
      // ergonomic risk escalates to 'authority'; severe health readings
      // escalate to 'hospital'; missing/anomalous data flags 'investigator'.
      const rolesFor = (
        category: Recommendation['category'],
        priority: Recommendation['priority']
      ): AgentRole[] => {
        const roles = new Set<AgentRole>(['user']);
        if (category === 'lighting') roles.add('admin');
        if (category === 'break') roles.add('reviewer');
        if ((category === 'posture' || category === 'focus') && priority === 'high') roles.add('authority');
        if (m.fatigueIndex > 75 || m.stress > 75) roles.add('hospital');
        if (!m.cameraConnected) roles.add('investigator');
        return Array.from(roles);
      };

      if (m.posture < 55) {
        dyn.push({
          id: 'dyn-posture',
          title: 'Raise monitor / adjust posture',
          description: 'Forward head or slumped shoulders detected — raise the monitor or sit back to reduce neck strain.',
          priority: 'high',
          category: 'posture',
          action: 'Adjust monitor',
          checklist: [
            cameraItem,
            modelItem,
            { id: 'posture-metric', label: `Posture score sampled (${m.posture}% < 55%)`, complete: true },
          ],
          roles: rolesFor('posture', 'high'),
        });
      }

      if (m.fatigueIndex > 60) {
        dyn.push({
          id: 'dyn-fatigue',
          title: 'Take a short break',
          description: 'High fatigue detected. A 5–10 minute break can restore focus.',
          priority: 'high',
          category: 'break',
          action: 'Take break',
          checklist: [
            cameraItem,
            modelItem,
            { id: 'fatigue-metric', label: `Fatigue index sampled (${m.fatigueIndex}% > 60%)`, complete: true },
          ],
          roles: rolesFor('break', 'high'),
        });
      }

      if (m.lightingLux < 500) {
        dyn.push({
          id: 'dyn-lighting',
          title: 'Increase lighting',
          description: 'Ambient light is below recommended levels — increase brightness to reduce eye strain.',
          priority: 'medium',
          category: 'lighting',
          action: 'Adjust lights',
          checklist: [
            cameraItem,
            { id: 'lighting-metric', label: `Lighting sampled (${m.lightingLux} < 500)`, complete: true },
          ],
          roles: rolesFor('lighting', 'medium'),
        });
      }

      if (m.focusScore < 50) {
        dyn.push({
          id: 'dyn-focus',
          title: 'Reduce distractions',
          description: 'Focus score is low. Consider closing unrelated tabs or enabling focus mode.',
          priority: 'medium',
          category: 'focus',
          action: 'Enable focus mode',
          checklist: [
            cameraItem,
            modelItem,
            { id: 'focus-metric', label: `Focus score sampled (${m.focusScore}% < 50%)`, complete: true },
          ],
          roles: rolesFor('focus', 'medium'),
        });
      }

      if (m.breakTimerMinutes <= 2) {
        dyn.push({
          id: 'dyn-break-immediate',
          title: 'Break now',
          description: 'Your next scheduled break is due. Stand up and stretch for a minute.',
          priority: 'high',
          category: 'break',
          action: 'Start break',
          checklist: [
            { id: 'break-timer', label: 'Break timer sampled', complete: true },
          ],
          roles: rolesFor('break', 'high'),
        });
      }

      if (!m.cameraConnected) {
        // If camera is disconnected, fall back to gentle hydration reminder.
        dyn.push({
          id: 'dyn-hydrate',
          title: 'Stay hydrated',
          description: 'No camera data available — remember to take periodic sips of water.',
          priority: 'low',
          category: 'hydration',
          action: 'Remind me',
          checklist: [cameraItem],
          roles: rolesFor('hydration', 'low'),
        });
      }

      // If we produced any dynamic recs, surface them; otherwise keep initial suggestions.
      const next = dyn.length ? dyn : initialRecs;
      setRecommendations(next);
      persistChecklistsNow(next);
    };

    recompute();
    const interval = setInterval(recompute, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Real-time break countdown (decrements with actual elapsed seconds).
  useEffect(() => {
    if (!cameraConnected) return;
    const interval = setInterval(() => {
      setBreakTimerMinutes((prev) => (prev <= 0 ? 20 : Math.max(0, prev - 1 / 60)));
    }, 1000);
    return () => clearInterval(interval);
  }, [cameraConnected]);

  // Persist a telemetry snapshot every ~10s while connected and signed in.
  useEffect(() => {
    const configError = getSupabaseConfigError();
    if (!cameraConnected || !user || !supabase || configError) return;

    const client = supabase;
    const interval = setInterval(() => {
      const m = metricsRef.current;
      void client
        .from('telemetry_snapshots')
        .insert({
          user_id: user.id,
          health_score: m.healthScore,
          posture: m.posture,
          fatigue_index: m.fatigueIndex,
          lighting_lux: m.lightingLux,
          focus_score: m.focusScore,
          stress: m.stress,
        })
        .then(({ error }) => {
          if (error) console.error('Failed to save telemetry snapshot:', error.message);
        });
    }, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [cameraConnected, user]);

  // Saved state for the source checklist: upserted per (user, recommendation)
  // so the "which inputs backed this suggestion" record survives reloads.
  const persistChecklists = (recs: Recommendation[]) => {
    if (!user || !supabase || getSupabaseConfigError()) return;
    const rows = recs.map((rec) => ({
      user_id: user.id,
      recommendation_id: rec.id,
      title: rec.title,
      checklist: rec.checklist,
      complete_count: rec.checklist.filter((c) => c.complete).length,
      total_count: rec.checklist.length,
      is_complete: rec.checklist.every((c) => c.complete),
      roles: rec.roles,
    }));
    void supabase
      .from('recommendation_checklists')
      .upsert(rows, { onConflict: 'user_id,recommendation_id' })
      .then(({ error }) => {
        if (error) console.error('Failed to save recommendation checklist:', error.message);
      });
  };

  useEffect(() => {
    persistChecklistsRef.current = persistChecklists;
  });

  const logEvent = (event: string, detail: string, status: 'good' | 'warning' | 'critical') => {
    if (!user || !supabase || getSupabaseConfigError()) return;
    void supabase
      .from('telemetry_events')
      .insert({ user_id: user.id, event, detail, status })
      .then(({ error }) => {
        if (error) console.error('Failed to save telemetry event:', error.message);
      });
  };

  const toggleCamera = async () => {
    if (cameraConnected) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraStream(null);
      setCameraConnected(false);
      logEvent('Camera disconnected', 'Vision tracking stopped.', 'warning');
      return;
    }

    setCameraError(null);
    setCameraConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraConnected(true);
      const fps = stream.getVideoTracks()[0]?.getSettings().frameRate;
      logEvent(
        'Camera connected',
        `Vision tracking activated${fps ? ` at ${Math.round(fps)} FPS` : ''}.`,
        'good'
      );
    } catch (err) {
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Could not access the camera. Check your browser permissions.'
      );
    } finally {
      setCameraConnecting(false);
    }
  };

  const toggleVisionOverlay = () => setVisionOverlay((prev) => !prev);

  const fetchEvents = async (): Promise<TelemetryEvent[]> => {
    if (!user || !supabase || getSupabaseConfigError()) return [];
    const { data, error } = await supabase
      .from('telemetry_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Failed to fetch telemetry events:', error.message);
      return [];
    }
    return data ?? [];
  };

  // Reviewer notes are saved to the same checklist row from bounty 1, so a
  // review packet can bundle sections + validation + notes for one task.
  const fetchNotes = async (): Promise<Record<string, string>> => {
    if (!user || !supabase || getSupabaseConfigError()) return {};
    const { data, error } = await supabase
      .from('recommendation_checklists')
      .select('recommendation_id, notes')
      .eq('user_id', user.id);
    if (error) {
      console.error('Failed to fetch notes:', error.message);
      return {};
    }
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      if (row.notes) map[row.recommendation_id as string] = row.notes as string;
    }
    return map;
  };

  const saveNote = async (recommendationId: string, note: string): Promise<void> => {
    if (!user || !supabase || getSupabaseConfigError()) return;
    const { error } = await supabase
      .from('recommendation_checklists')
      .update({ notes: note })
      .eq('user_id', user.id)
      .eq('recommendation_id', recommendationId);
    if (error) console.error('Failed to save note:', error.message);
  };

  return (
    <TelemetryContext.Provider
      value={{
        metrics,
        recommendations,
        toggleCamera,
        toggleVisionOverlay,
        isLive: cameraConnected,
        videoRef,
        cameraError,
        cameraConnecting,
        modelsLoading,
        modelError,
        personDetected: vision.personDetected,
        fetchEvents,
        fetchNotes,
        saveNote,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return ctx;
}
