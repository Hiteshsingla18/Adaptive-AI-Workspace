# Adaptive AI Workspace

An adaptive, camera-powered workspace-wellness app. It watches posture, focus, fatigue, and ambient lighting in real time using on-device computer vision, turns those readings into a live health score and actionable recommendations, and lets you track trends and export accountable "review packets" for the tasks it flags.

Built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Supabase, with all vision inference running client-side via MediaPipe.

## Bounty coverage

Built for a wellbeing/healthcare-track bounty structured as Core / Advanced / Elite around a "task record" concept. Here, the task record is a **recommendation** — a flagged wellbeing action (posture, break, lighting, focus, hydration) generated from live telemetry, with a checklist, roles, and notes, exportable as a review packet.

| Tier | Ask | Status | Where |
|---|---|---|---|
| **Core** — source checklist | Each task has required inputs with a completion indicator and saved state | ✅ Done | `recommendation_checklists` table (Supabase, per-user, persisted); checklist UI on the Dashboard with per-item toggles |
| **Advanced** — role-aware task filters | List scoped by role (user/admin/authority/hospital/investigator/reviewer), with visible counts | ⚠️ Partial | `DashboardPage.tsx` — role tabs filter recommendations by a `roles` tag, with a count per tab. **This is a client-side UI filter, not database-enforced access control.** Every account only ever sees its own rows regardless of selected role (`recommendation_checklists` RLS is a flat `auth.uid() = user_id` for all roles) — there's no `profiles`-style table and no policy that widens visibility for oversight roles across other users' data. If a demo needs "role A cannot see role B's records, role C can see both," this isn't there yet: it would need a roles column on a profile, an RLS policy that checks it, and a second test account to prove the scoping actually happens in Postgres rather than the browser. |
| **Elite** — structured review packet | Export with validation warnings and missing fields | ✅ Done | `src/lib/reviewPacket.ts` — plain-text export per recommendation with summary, source checklist, completion status, explicit "missing" warnings for incomplete items, and reviewer notes |

If closing the Advanced gap matters for the submission, the shortest path is: add a `role` column to a user-scoped table (or a `profiles` table), write an RLS policy that grants oversight roles `select` across all rows instead of just their own, and demo with two accounts — same query, different role, different result set, decided in Postgres, not in `DashboardPage.tsx`.

## How it works

1. **Camera capture** — the browser's webcam feed is piped into two MediaPipe Tasks Vision models running fully on-device (no video ever leaves the browser):
   - **Face Landmarker** — face blendshapes for gaze direction, blink/eye-closure, and brow/eye tension.
   - **Pose Landmarker (lite)** — shoulder and ear keypoints for neck angle and forward-head lean.
2. **Metric derivation** (`src/hooks/useVisionMetrics.ts`) — inference runs on a throttled loop (~4.5 fps) and derives:
   - **Posture** — from forward-lean and neck angle between ears and shoulders.
   - **Focus score** — from gaze deviation across all eye-look blendshapes.
   - **Fatigue index** — a PERCLOS-style measure computed from a rolling window of eye-closure readings.
   - **Stress** — a proxy combining brow furrow and eye squint.
   - **Lighting** — average frame luminance sampled from a downscaled canvas (relative brightness, not a calibrated lux sensor).
   - **Health score** — a weighted blend of the above (posture 30%, focus 25%, fatigue 20%, lighting 10%, stress 15%).
   Readings are exponentially smoothed to keep the UI stable rather than jittery.
3. **Recommendations & checklists** — metrics that cross thresholds surface as prioritized recommendations (posture, break, lighting, focus, hydration), each with a completable checklist and a set of relevant roles (`user`, `admin`, `authority`, `hospital`, `investigator`, `reviewer`).
4. **Review packets** — any recommendation's checklist can be exported as a plain-text "review packet" (`src/lib/reviewPacket.ts`) containing the task summary, validation checklist, missing-item warnings, and reviewer notes — useful for accountability/audit-style workflows around workplace wellness.
5. **Persistence** — snapshots, events, and checklist state are stored in Supabase (Postgres) under row-level security, scoped per authenticated user, so history and analytics survive across sessions.

## Features

- **Live dashboard** — real-time camera preview with health score, posture, focus, fatigue, stress, and lighting readouts, plus a break timer.
- **Analytics** — historical charts for daily posture, weekly productivity (focus vs. breaks), fatigue trend, focus trend, and lighting history (Recharts).
- **Reports** — generated summaries built from stored telemetry events and recommendation completion.
- **Devices** — a device-status panel (chair, monitor, desk, lights, watch) with connected / disconnected / coming-soon states, laying groundwork for future smart-desk integrations.
- **History** — a chronological log of telemetry events with status (`good` / `warning` / `critical`).
- **Settings & Auth** — Supabase-backed email authentication with protected routes for all app pages; a public landing page for unauthenticated visitors.
- **Review packets** — exportable `.txt` accountability reports per recommendation.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling / UI | Tailwind CSS, shadcn/ui, Radix primitives, Framer Motion |
| Routing | React Router v7 |
| Charts | Recharts |
| Forms / validation | React Hook Form + Zod |
| Computer vision | `@mediapipe/tasks-vision` (Face Landmarker + Pose Landmarker, on-device) |
| Backend / auth / storage | Supabase (Postgres, Auth, Row-Level Security) |
| Deployment | Vercel |

## Project structure

```
project/
├── src/
│   ├── components/
│   │   ├── auth/         # ProtectedRoute, auth-related UI
│   │   ├── layout/        # AppLayout (nav/sidebar shell)
│   │   ├── shared/         # Shared/reusable components
│   │   └── ui/              # shadcn/ui component library
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Supabase auth session state
│   │   └── TelemetryContext.tsx   # Global camera/telemetry state
│   ├── hooks/
│   │   ├── useVisionMetrics.ts    # Core CV inference + metric derivation
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client init
│   │   ├── reviewPacket.ts   # Review packet generation/export
│   │   └── utils.ts
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── DevicesPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/telemetry.ts    # Shared TypeScript types
│   └── data/dummyData.ts      # Sample/mock data for local dev
├── supabase/
│   └── schema.sql             # Postgres schema + RLS policies
├── public/
└── vercel.json                 # SPA rewrite rules for Vercel
```

## Database schema

Defined in `project/supabase/schema.sql`, run in the Supabase SQL editor:

- **`telemetry_snapshots`** — periodic metric snapshots (health score, posture, fatigue, lighting, focus, stress) per user.
- **`telemetry_events`** — discrete logged events with a status (`good` / `warning` / `critical`).
- **`recommendation_checklists`** — per-user checklist state per recommendation, including which roles it's relevant to and free-text reviewer notes used in exported review packets.

All three tables have row-level security enabled, with policies restricting reads/writes to the owning `auth.uid()`.

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (for auth + data persistence)
- A webcam-enabled browser (for the vision features)

### Setup

```bash
cd project
npm install
```

Create a `.env.local` file in `project/` with your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then, in the Supabase SQL editor, run the contents of `project/supabase/schema.sql` to create the required tables and policies.

### Run locally

```bash
npm run dev
```

### Other scripts

```bash
npm run build       # Type-check and build for production
npm run preview      # Preview the production build locally
npm run lint         # Lint with ESLint
npm run typecheck    # TypeScript type-check only
```

## Notes & limitations

- Vision metrics are heuristic approximations (e.g. lighting is relative frame luminance, not a calibrated lux reading; fatigue is a PERCLOS-style estimate, not a clinical measurement) and are best treated as directional wellness signals rather than medical-grade data.
- All video processing happens client-side in the browser; no video frames are uploaded or stored — only derived numeric metrics are persisted to Supabase.
- The app falls back from GPU to CPU delegate for the MediaPipe models automatically if GPU inference is unavailable.

## License

No license file is currently included in this repository. Add one (e.g. MIT) if you intend for others to use or contribute to this project.
