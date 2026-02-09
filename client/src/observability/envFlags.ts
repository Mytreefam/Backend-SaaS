function readEnvValue(name: string): unknown {
  // Vite-style
  try {
    const v = (import.meta as any)?.env?.[name];
    if (v !== undefined) return v;
  } catch {
    // ignore
  }

  // Node-style (tests)
  try {
    const v = (globalThis as any)?.process?.env?.[name];
    if (v !== undefined) return v;
  } catch {
    // ignore
  }

  return undefined;
}

export function envBoolean(name: string, defaultValue: boolean): boolean {
  const raw = readEnvValue(name);
  if (raw == null) return defaultValue;
  const s = String(raw).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return defaultValue;
}

export function isProdBuild(): boolean {
  // Prefer Vite build flag
  try {
    const prod = (import.meta as any)?.env?.PROD;
    if (typeof prod === 'boolean') return prod;
    if (typeof prod === 'string') return prod === 'true';
  } catch {
    // ignore
  }

  // Fallback for tests/Node
  try {
    const nodeEnv = (globalThis as any)?.process?.env?.NODE_ENV;
    if (nodeEnv) return String(nodeEnv) === 'production';
  } catch {
    // ignore
  }

  // Default: unknown => treat as non-prod (safer for tests/dev)
  return false;
}

export const OBSERVABILITY_ENABLED = envBoolean('VITE_OBSERVABILITY_ENABLED', true);
export const HTTP_LOGGING_ENABLED = envBoolean('VITE_HTTP_LOGGING_ENABLED', false);
export const HTTP_RETRY_ENABLED = envBoolean('VITE_HTTP_RETRY_ENABLED', isProdBuild());
export const PERF_TELEMETRY_ENABLED = envBoolean('VITE_PERF_TELEMETRY_ENABLED', isProdBuild());
export const PERF_SEND_EXTERNAL_ENABLED = envBoolean('VITE_PERF_SEND_EXTERNAL_ENABLED', false);

