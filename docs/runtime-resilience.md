# Runtime Resilience & Observability

This document describes the **frontend runtime safety** and **observability** layer added on top of the existing networking architecture.

## Goals (non-breaking)

- Centralize error capture (React + global runtime + promise rejections + HTTP wrapper failures)
- Add structured HTTP logging (toggleable)
- Add idempotent retry policy for GET/HEAD (toggleable)
- Add offline status store + hook (UI can opt-in later)
- Add safe auth-expiry handling when refresh fails (single logout event)
- Collect performance telemetry locally (no external sending by default)

## 1) Error boundary flow (React crashes)

### What is installed
- `client/src/observability/RootErrorBoundary.tsx` wraps the app at `src/main.tsx`
- It uses the existing `components/ErrorBoundary` and a root fallback UI:
  - `client/src/observability/CrashFallback.tsx`

### What gets captured
- React render errors (component tree)
- Tracked via `trackError(...)` with:
  - timestamp
  - user id (if available)
  - stack trace
  - browser info

## 2) Global runtime error capture

Installed by `initRuntimeMonitoring()` in `src/main.tsx`:
- `window.error` (uncaught runtime errors)
- `window.unhandledrejection` (unhandled promise rejections)

All are routed through `trackError(...)`.

## 3) HTTP logging policy (service layer)

### Contract
`envelopedFetch` can emit an optional structured event:

```ts
logHttpEvent({
  endpoint,
  method,
  status,
  success,
  duration,
  retryAttempt,
  userId,
});
```

### How it is used
- `envelopedFetch` calls `logHttpEvent(...)` **best-effort**
- Logging failures are swallowed (never block requests)
- Controlled by env flag:
  - `VITE_HTTP_LOGGING_ENABLED`

To attach your logger:
- call `setHttpEventLogger((event) => { ... })` from `client/src/observability/httpLogger.ts`

## 4) Retry policy (GET/HEAD only)

### Scope
- Only idempotent methods:
  - `GET`
  - `HEAD`

### Conditions
- Network failure (fetch throws)
- HTTP 5xx

### Policy
- Max **2** retries
- Exponential backoff (with jitter)
- Never retries:
  - `POST`, `PUT`, `PATCH`, `DELETE`

### Refresh integration
- Existing 401 refresh flow still applies
- Retry policy is designed to not recurse infinitely

Enabled by:
- `VITE_HTTP_RETRY_ENABLED`

## 5) Offline handling

### Store
- `client/src/stores/networkStatus.store.ts` listens to:
  - `navigator.onLine`
  - `window.online` / `window.offline`

### Hook
- `client/src/hooks/useNetworkStatus.ts`

UI can later render a banner using the hook without changing networking.

## 6) Auth expiration UX safety

When refresh fails inside `envelopedFetch`:
- local auth storage is cleared (existing behavior)
- a single global event is dispatched: `auth:expired`
- app root listens and safely transitions to login

Optional (no copy changes enforced here):
- `setAuthExpiryToastHook(fn)` can be set by a UI layer to show a toast using existing texts.

## 7) Performance telemetry (no external sending by default)

Collected locally:
- HTTP duration (from `envelopedFetch`)
- Hydration time (measured at `src/main.tsx`)
- Web Vitals (LCP/FID/CLS/FCP/TTFB) via `initWebVitals(callback)`

Access patterns:
- `getPerfMetrics()` / `onPerfMetric(...)` in `client/src/observability/performanceTelemetry.ts`
- `usePerformanceMetrics()` in `client/src/hooks/usePerformanceMetrics.ts`

### External sending
Disabled by default. If you explicitly want to allow web-vitals to send via `window.gtag`, enable:
- `VITE_PERF_SEND_EXTERNAL_ENABLED=true`

## ENV flags summary

- `VITE_OBSERVABILITY_ENABLED` (default: true)
- `VITE_HTTP_LOGGING_ENABLED` (default: false)
- `VITE_HTTP_RETRY_ENABLED` (default: on for prod build; off in dev)
- `VITE_PERF_TELEMETRY_ENABLED` (default: on for prod build; off in dev)
- `VITE_PERF_SEND_EXTERNAL_ENABLED` (default: false)

