import { PERF_TELEMETRY_ENABLED } from './envFlags';
import { initWebVitals } from '../lib/web-vitals';

export type PerfMetric =
  | { type: 'http'; name: 'http_duration'; value: number; ts: number; meta: Record<string, unknown> }
  | { type: 'webvital'; name: string; value: number; ts: number; meta: Record<string, unknown> }
  | { type: 'app'; name: 'hydration_time'; value: number; ts: number; meta: Record<string, unknown> };

const buffer: PerfMetric[] = [];
const subscribers = new Set<(m: PerfMetric) => void>();

function push(m: PerfMetric) {
  buffer.push(m);
  if (buffer.length > 500) buffer.splice(0, buffer.length - 500);
  for (const sub of subscribers) {
    try {
      sub(m);
    } catch {
      // ignore
    }
  }
}

export function onPerfMetric(handler: (m: PerfMetric) => void): () => void {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export function getPerfMetrics(): PerfMetric[] {
  return [...buffer];
}

let installed = false;

export function initPerformanceTelemetry() {
  if (!PERF_TELEMETRY_ENABLED) return;
  if (installed) return;
  installed = true;

  // Collect web-vitals into our buffer (no external sending).
  initWebVitals((metric) => {
    push({
      type: 'webvital',
      name: metric.name,
      value: metric.value,
      ts: Date.now(),
      meta: { rating: metric.rating, delta: metric.delta, id: metric.id },
    });
  });
}

export function recordHttpDuration(meta: {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  retryAttempt: number;
  duration: number;
}) {
  if (!PERF_TELEMETRY_ENABLED) return;
  push({
    type: 'http',
    name: 'http_duration',
    value: meta.duration,
    ts: Date.now(),
    meta: {
      endpoint: meta.endpoint,
      method: meta.method,
      status: meta.status,
      success: meta.success,
      retryAttempt: meta.retryAttempt,
    },
  });
}

export function recordHydrationTime(ms: number) {
  if (!PERF_TELEMETRY_ENABLED) return;
  push({
    type: 'app',
    name: 'hydration_time',
    value: ms,
    ts: Date.now(),
    meta: {},
  });
}

