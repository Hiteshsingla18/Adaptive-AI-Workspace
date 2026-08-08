import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

export interface VisionMetrics {
  healthScore: number;
  posture: number;
  fatigueIndex: number;
  lightingLux: number;
  focusScore: number;
  stress: number;
  fps: number;
  personDetected: boolean;
}

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// Throttle inference instead of running it on every video frame — keeps CPU
// usage reasonable. The visible <video> preview is unaffected and stays at
// native camera framerate.
const INFERENCE_INTERVAL_MS = 220;
// Rolling window (in inference ticks) used for the PERCLOS-style fatigue read.
const BLINK_HISTORY_LENGTH = 150;

const defaultMetrics: VisionMetrics = {
  healthScore: 0,
  posture: 0,
  fatigueIndex: 0,
  lightingLux: 0,
  focusScore: 0,
  stress: 0,
  fps: 30,
  personDetected: false,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cameraFps(video: HTMLVideoElement | null): number {
  const stream = video?.srcObject as MediaStream | null | undefined;
  const settings = stream?.getVideoTracks()[0]?.getSettings();
  return settings?.frameRate ? Math.round(settings.frameRate) : 30;
}

export function useVisionMetrics(videoRef: RefObject<HTMLVideoElement>, active: boolean) {
  const [metrics, setMetrics] = useState<VisionMetrics>(defaultMetrics);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastInferenceRef = useRef(0);
  const blinkHistoryRef = useRef<number[]>([]);
  const smoothedRef = useRef<VisionMetrics>(defaultMetrics);
  const hasReadingRef = useRef(false);

  // Load / tear down models when the camera is (dis)connected.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function init() {
      setModelsLoading(true);
      setModelError(null);
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

        const createFace = (delegate: 'GPU' | 'CPU') =>
          FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        const createPose = (delegate: 'GPU' | 'CPU') =>
          PoseLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate },
            runningMode: 'VIDEO',
            numPoses: 1,
          });

        let face: FaceLandmarker;
        let pose: PoseLandmarker;
        try {
          [face, pose] = await Promise.all([createFace('GPU'), createPose('GPU')]);
        } catch {
          [face, pose] = await Promise.all([createFace('CPU'), createPose('CPU')]);
        }

        if (cancelled) {
          face.close();
          pose.close();
          return;
        }

        faceLandmarkerRef.current = face;
        poseLandmarkerRef.current = pose;
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        canvasRef.current = canvas;
      } catch (err) {
        if (!cancelled) {
          setModelError(
            err instanceof Error ? err.message : 'Failed to load vision models.'
          );
        }
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;
      poseLandmarkerRef.current = null;
      canvasRef.current = null;
      blinkHistoryRef.current = [];
      smoothedRef.current = defaultMetrics;
      hasReadingRef.current = false;
      setMetrics(defaultMetrics);
    };
  }, [active]);

  // Inference loop.
  useEffect(() => {
    if (!active) return;

    const loop = (time: number) => {
      rafRef.current = requestAnimationFrame(loop);

      const video = videoRef.current;
      const face = faceLandmarkerRef.current;
      const pose = poseLandmarkerRef.current;
      const canvas = canvasRef.current;
      if (!video || !face || !pose || !canvas || video.readyState < 2) return;
      if (time - lastInferenceRef.current < INFERENCE_INTERVAL_MS) return;
      lastInferenceRef.current = time;

      const faceResult = face.detectForVideo(video, time);
      const poseResult = pose.detectForVideo(video, time);

      // Lighting: real average luminance sampled from a downscaled frame.
      // This is a relative brightness reading, not a calibrated lux sensor.
      let lightingLux = smoothedRef.current.lightingLux;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const avgLuminance = sum / (data.length / 4);
        lightingLux = clamp((avgLuminance / 255) * 1000, 0, 1000);
      }

      // Posture: neck angle + forward-head offset from shoulder/ear keypoints.
      let posture = smoothedRef.current.posture;
      const landmarks = poseResult.landmarks[0];
      if (landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        if (leftShoulder && rightShoulder && leftEar && rightEar) {
          const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
          const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
          const earMidX = (leftEar.x + rightEar.x) / 2;
          const earMidY = (leftEar.y + rightEar.y) / 2;
          const shoulderWidth = dist(leftShoulder, rightShoulder) || 0.001;

          const forwardLean = Math.abs(earMidX - shoulderMidX) / shoulderWidth;
          const neckAngleDeg =
            (Math.atan2(earMidX - shoulderMidX, shoulderMidY - earMidY) * 180) / Math.PI;

          posture = clamp(100 - forwardLean * 140 - Math.abs(neckAngleDeg) * 1.1);
        }
      }

      // Face-derived: focus (gaze deviation), fatigue (PERCLOS-style blink), stress (brow/eye tension proxy).
      let focusScore = smoothedRef.current.focusScore;
      let fatigueIndex = smoothedRef.current.fatigueIndex;
      let stress = smoothedRef.current.stress;
      let personDetected = false;

      const blendshapes = faceResult.faceBlendshapes[0]?.categories;
      if (blendshapes) {
        personDetected = true;
        const score = (name: string) =>
          blendshapes.find((c) => c.categoryName === name)?.score ?? 0;

        const gazeDeviation =
          (score('eyeLookOutLeft') +
            score('eyeLookOutRight') +
            score('eyeLookInLeft') +
            score('eyeLookInRight') +
            score('eyeLookUpLeft') +
            score('eyeLookUpRight') +
            score('eyeLookDownLeft') +
            score('eyeLookDownRight')) /
          8;
        focusScore = clamp(100 - gazeDeviation * 220);

        const eyeClosure = (score('eyeBlinkLeft') + score('eyeBlinkRight')) / 2;
        blinkHistoryRef.current.push(eyeClosure);
        if (blinkHistoryRef.current.length > BLINK_HISTORY_LENGTH) {
          blinkHistoryRef.current.shift();
        }
        const perclos =
          blinkHistoryRef.current.filter((v) => v > 0.45).length /
          blinkHistoryRef.current.length;
        fatigueIndex = clamp(perclos * 180);

        const browFurrow = (score('browDownLeft') + score('browDownRight')) / 2;
        const eyeSquint = (score('eyeSquintLeft') + score('eyeSquintRight')) / 2;
        stress = clamp(browFurrow * 70 + eyeSquint * 50);
      } else {
        // No face in frame: gently decay focus rather than snapping to 0.
        focusScore = clamp(smoothedRef.current.focusScore - 4);
      }

      const healthScore = clamp(
        posture * 0.3 +
          focusScore * 0.25 +
          (100 - fatigueIndex) * 0.2 +
          clamp((lightingLux / 1000) * 100) * 0.1 +
          (100 - stress) * 0.15
      );

      const next: VisionMetrics = {
        healthScore: Math.round(healthScore),
        posture: Math.round(posture),
        fatigueIndex: Math.round(fatigueIndex),
        lightingLux: Math.round(lightingLux),
        focusScore: Math.round(focusScore),
        stress: Math.round(stress),
        fps: cameraFps(video),
        personDetected,
      };

      // Apply exponential smoothing to reduce jitter in the UI while keeping
      // inference frequency high for responsiveness. The very first reading
      // after connecting snaps straight in — smoothedRef starts at all-zero
      // defaultMetrics, and blending against that would otherwise make every
      // metric visibly ramp up from 0 over the first couple of seconds.
      const alpha = 0.6; // smoothing factor (0 = fully stable, 1 = no smoothing) — light touch, mostly the newest reading
      const prev = smoothedRef.current;
      const smoothed = !hasReadingRef.current
        ? next
        : {
            healthScore: Math.round(prev.healthScore * (1 - alpha) + next.healthScore * alpha),
            posture: Math.round(prev.posture * (1 - alpha) + next.posture * alpha),
            fatigueIndex: Math.round(prev.fatigueIndex * (1 - alpha) + next.fatigueIndex * alpha),
            lightingLux: Math.round(prev.lightingLux * (1 - alpha) + next.lightingLux * alpha),
            focusScore: Math.round(prev.focusScore * (1 - alpha) + next.focusScore * alpha),
            stress: Math.round(prev.stress * (1 - alpha) + next.stress * alpha),
            // Keep camera FPS and personDetected immediate so status feels responsive.
            fps: next.fps,
            personDetected: next.personDetected,
          };

      hasReadingRef.current = true;
      smoothedRef.current = smoothed;
      setMetrics(smoothed);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, videoRef]);

  return { metrics, modelsLoading, modelError };
}
