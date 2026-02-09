import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

type Props = {
  onRetry?: () => void;
  onGoToLogin?: () => void;
};

/**
 * Root-level crash recovery screen.
 * This is NOT a page; it is only rendered by the root ErrorBoundary.
 */
export function CrashFallback({ onRetry, onGoToLogin }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">La app se ha detenido</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Ocurrió un error inesperado. Puedes intentar recuperarte sin perder tu sesión.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button onClick={onRetry} variant="default" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>

            <Button onClick={onGoToLogin} variant="outline" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Ir a login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

