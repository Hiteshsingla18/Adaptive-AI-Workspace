import type {
  TelemetryMetrics,
  Recommendation,
  Device,
  AnalyticsChartData,
} from '@/types/telemetry';

export const initialMetrics: TelemetryMetrics = {
  healthScore: 82,
  posture: 74,
  fatigueIndex: 31,
  lightingLux: 480,
  focusScore: 78,
  fps: 30,
  stress: 42,
  breakTimerMinutes: 12,
  cameraConnected: false,
  visionOverlay: false,
};

// Sample completed record: every source in this checklist is satisfied,
// showing what a fully-resolved recommendation looks like end to end.
const sampleCompletedChecklist = [
  { id: 'camera', label: 'Camera connected', complete: true },
  { id: 'vision-model', label: 'Vision models loaded', complete: true },
  { id: 'posture-metric', label: 'Posture score sampled below 55%', complete: true },
];

export const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Raise monitor by 2 cm',
    description: 'Your neck angle indicates the monitor is slightly too low. Adjusting it will reduce strain.',
    priority: 'high',
    category: 'posture',
    action: 'Adjust monitor',
    checklist: sampleCompletedChecklist,
    roles: ['user', 'authority'],
  },
  {
    id: 'rec-2',
    title: 'Take a break in 12 min',
    description: 'You have been working continuously for 38 minutes. A short break will restore focus.',
    priority: 'medium',
    category: 'break',
    action: 'Schedule break',
    checklist: [
      { id: 'camera', label: 'Camera connected', complete: true },
      { id: 'break-timer', label: 'Break timer sampled', complete: true },
    ],
    roles: ['user', 'reviewer'],
  },
  {
    id: 'rec-3',
    title: 'Increase ambient lighting',
    description: 'Current lighting is below the recommended 500 lux. Eye strain risk is elevated.',
    priority: 'medium',
    category: 'lighting',
    action: 'Dim lights',
    checklist: [
      { id: 'camera', label: 'Camera connected', complete: true },
      { id: 'lighting-metric', label: 'Lighting sampled below 500 lux', complete: true },
    ],
    roles: ['user', 'admin'],
  },
  {
    id: 'rec-4',
    title: 'Hydrate soon',
    description: 'Based on your break pattern, hydration is overdue. Keep water within reach.',
    priority: 'low',
    category: 'hydration',
    action: 'Remind me',
    checklist: [
      { id: 'break-pattern', label: 'Break pattern sampled', complete: true },
    ],
    roles: ['user'],
  },
  {
    id: 'rec-5',
    title: 'Sit back in your chair',
    description: 'Your shoulders are leaning forward. Recline slightly to support your lower back.',
    priority: 'high',
    category: 'posture',
    action: 'Got it',
    checklist: [
      { id: 'camera', label: 'Camera connected', complete: true },
      { id: 'vision-model', label: 'Vision models loaded', complete: true },
      { id: 'posture-metric', label: 'Shoulder position sampled', complete: true },
    ],
    roles: ['user', 'authority'],
  },
];

export const devices: Device[] = [
  {
    id: 'dev-chair',
    name: 'Smart Chair',
    type: 'chair',
    status: 'disconnected',
    description: 'Posture-sensing ergonomic chair with lumbar adjustment.',
    icon: 'Armchair',
    metrics: [
      { label: 'Recline', value: '110°' },
      { label: 'Pressure', value: 'Balanced' },
    ],
  },
  {
    id: 'dev-monitor',
    name: 'Adaptive Monitor',
    type: 'monitor',
    status: 'disconnected',
    description: 'Height-aware display that nudges posture corrections.',
    icon: 'Monitor',
    metrics: [
      { label: 'Height', value: 'Auto' },
      { label: 'Blue light', value: 'On' },
    ],
  },
  {
    id: 'dev-desk',
    name: 'Standing Desk',
    type: 'desk',
    status: 'coming-soon',
    description: 'Sit-stand desk with scheduled height transitions.',
    icon: 'Table',
    metrics: [
      { label: 'Position', value: 'Seated' },
      { label: 'Schedule', value: 'Active' },
    ],
  },
  {
    id: 'dev-lights',
    name: 'Ambient Lights',
    type: 'lights',
    status: 'coming-soon',
    description: 'Circadian lighting tuned to focus and fatigue levels.',
    icon: 'Lightbulb',
    metrics: [
      { label: 'Brightness', value: '480 lux' },
      { label: 'Temperature', value: '4000K' },
    ],
  },
  {
    id: 'dev-watch',
    name: 'Wellness Watch',
    type: 'watch',
    status: 'disconnected',
    description: 'Wearable tracking heart rate, stress, and movement.',
    icon: 'Watch',
    metrics: [
      { label: 'Heart rate', value: '72 bpm' },
      { label: 'Steps', value: '4,210' },
    ],
  },
];

export const analyticsChartData: AnalyticsChartData = {
  dailyPosture: [
    { day: 'Mon', score: 78 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 71 },
    { day: 'Thu', score: 85 },
    { day: 'Fri', score: 80 },
    { day: 'Sat', score: 88 },
    { day: 'Sun', score: 84 },
  ],
  weeklyProductivity: [
    { day: 'Mon', focus: 72, breaks: 4 },
    { day: 'Tue', focus: 80, breaks: 5 },
    { day: 'Wed', focus: 65, breaks: 3 },
    { day: 'Thu', focus: 88, breaks: 6 },
    { day: 'Fri', focus: 76, breaks: 4 },
    { day: 'Sat', focus: 90, breaks: 7 },
    { day: 'Sun', focus: 70, breaks: 3 },
  ],
  fatigueTrend: [
    { hour: '9 AM', fatigue: 18 },
    { hour: '11 AM', fatigue: 35 },
    { hour: '1 PM', fatigue: 52 },
    { hour: '3 PM', fatigue: 64 },
    { hour: '5 PM', fatigue: 71 },
    { hour: '7 PM', fatigue: 58 },
  ],
  focusTrend: [
    { hour: '9 AM', focus: 88 },
    { hour: '11 AM', focus: 76 },
    { hour: '1 PM', focus: 60 },
    { hour: '3 PM', focus: 48 },
    { hour: '5 PM', focus: 55 },
    { hour: '7 PM', focus: 72 },
  ],
  lightingHistory: [
    { day: 'Mon', lux: 420 },
    { day: 'Tue', lux: 510 },
    { day: 'Wed', lux: 380 },
    { day: 'Thu', lux: 540 },
    { day: 'Fri', lux: 490 },
    { day: 'Sat', lux: 600 },
    { day: 'Sun', lux: 470 },
  ],
};

export const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { label: 'Reports', path: '/reports', icon: 'FileText' },
  { label: 'Devices', path: '/devices', icon: 'Cpu' },
  { label: 'History', path: '/history', icon: 'History' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const;
