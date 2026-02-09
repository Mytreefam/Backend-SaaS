
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RootErrorBoundary } from './observability/RootErrorBoundary';
import { initRuntimeMonitoring } from './observability/runtimeMonitoring';
import { initNetworkStatusStore } from './stores/networkStatus.store';
import { initPerformanceTelemetry, recordHydrationTime } from './observability/performanceTelemetry';

// Global runtime safety (does not modify UI pages)
initRuntimeMonitoring();
initNetworkStatusStore();
initPerformanceTelemetry();

// Hydration / first render timing
const hydrationStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);

// Best-effort hydration end mark
queueMicrotask(() => {
  try {
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    recordHydrationTime(end - hydrationStart);
  } catch {
    // ignore
  }
});
  