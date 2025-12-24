/**
 * Error Boundary Component
 * 
 * Captura errores de React que ocurren en el árbol de componentes hijo
 * y muestra un fallback UI en lugar de crashear toda la aplicación.
 * 
 * Uso:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { isDevelopment } from '../lib/env-utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente renderizado muestre el fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Puedes enviar el error a un servicio de logging aquí
    console.error('❌ Error capturado por Error Boundary:', error);
    console.error('📋 Info del error:', errorInfo);

    this.setState({ errorInfo });

    // Callback personalizado (ej: enviar a Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Integrar con servicio de logging en producción
    // if (isProduction) {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center">
              {/* Icono de error */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Oops! Algo salió mal
              </h1>

              {/* Descripción */}
              <p className="text-gray-600 mb-6 max-w-md">
                Ha ocurrido un error inesperado en la aplicación. 
                No te preocupes, tu información está segura.
              </p>

              {/* Detalles del error (solo en desarrollo) */}
              {isDevelopment && this.state.error && (
                <div className="w-full mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="text-xs font-mono text-gray-600">
                      <summary className="cursor-pointer hover:text-gray-900">
                        Ver stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Intentar de nuevo
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </Button>
              </div>

              {/* Mensaje de ayuda */}
              <p className="text-sm text-gray-500 mt-6">
                Si el problema persiste, contacta con soporte técnico.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para lanzar errores manualmente (útil para testing)
 * 
 * Uso:
 * const throwError = useErrorHandler();
 * throwError(new Error('Algo salió mal'));
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
