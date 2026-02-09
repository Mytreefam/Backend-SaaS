import { useEffect, useState } from 'react';
import {
  getPerfMetrics,
  onPerfMetric,
  type PerfMetric,
} from '../observability/performanceTelemetry';

/**
 * Read-only hook to consume in-app performance telemetry.
 * Does NOT send metrics externally.
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerfMetric[]>(() => getPerfMetrics());

  useEffect(() => {
    return onPerfMetric(() => {
      setMetrics(getPerfMetrics());
    });
  }, []);

  return metrics;
}

