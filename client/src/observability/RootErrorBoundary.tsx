import { useCallback } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CrashFallback } from './CrashFallback';
import { trackError } from './errorTracker';

type Props = {
  children: React.ReactNode;
};

/**
 * Root wrapper to:
 * - capture React component-tree errors
 * - log structured error context
 * - provide a crash recovery UI
 */
export function RootErrorBoundary({ children }: Props) {
  const handleError = useCallback((error: Error, errorInfo: any) => {
    trackError(error, {
      source: 'react',
      // include component stack in the error stack for debugging
    });

    // keep original ErrorBoundary console logging intact
    void errorInfo;
  }, []);

  const handleGoToLogin = useCallback(() => {
    // Crash-safe recovery: clear session hints and hard reload.
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={<CrashFallback onRetry={() => window.location.reload()} onGoToLogin={handleGoToLogin} />}
    >
      {children}
    </ErrorBoundary>
  );
}

