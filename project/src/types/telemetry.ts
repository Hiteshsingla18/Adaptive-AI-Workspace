export interface TelemetryMetrics {
  healthScore: number;
  posture: number;
  fatigueIndex: number;
  lightingLux: number;
  focusScore: number;
  fps: number;
  stress: number;
  breakTimerMinutes: number;
  cameraConnected: boolean;
  visionOverlay: boolean;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'posture' | 'break' | 'lighting' | 'focus' | 'hydration';

export type AgentRole = 'user' | 'admin' | 'authority' | 'hospital' | 'investigator' | 'reviewer';

export const AGENT_ROLES: AgentRole[] = ['user', 'admin', 'authority', 'hospital', 'investigator', 'reviewer'];

export interface ChecklistItem {
  id: string;
  label: string;
  complete: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  action: string;
  checklist: ChecklistItem[];
  roles: AgentRole[];
}

export type DeviceStatus = 'connected' | 'disconnected' | 'coming-soon';

export interface Device {
  id: string;
  name: string;
  type: 'chair' | 'monitor' | 'desk' | 'lights' | 'watch';
  status: DeviceStatus;
  description: string;
  icon: string;
  metrics?: { label: string; value: string }[];
}

export interface AnalyticsChartData {
  dailyPosture: { day: string; score: number }[];
  weeklyProductivity: { day: string; focus: number; breaks: number }[];
  fatigueTrend: { hour: string; fatigue: number }[];
  focusTrend: { hour: string; focus: number }[];
  lightingHistory: { day: string; lux: number }[];
}

export type MetricStatus = 'good' | 'warning' | 'critical';

export interface TelemetryEvent {
  id: number;
  user_id: string;
  created_at: string;
  event: string;
  detail: string;
  status: MetricStatus;
}

export interface MetricMeta {
  label: string;
  value: number;
  unit: string;
  status: MetricStatus;
  icon: string;
  description: string;
}
