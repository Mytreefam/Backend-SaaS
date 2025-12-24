/**
 * 🎣 HOOK - useApi
 * 
 * Hook personalizado para hacer peticiones a la API
 * con manejo de estados (loading, error, data)
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

// ============================================================================
// HOOK
// ============================================================================

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await apiCall();
        
        setState({ data, loading: false, error: null });

        // Callback de éxito
        if (options.onSuccess) {
          options.onSuccess(data);
        }

        // Toast de éxito
        if (options.showSuccessToast && options.successMessage) {
          toast.success(options.successMessage);
        }

        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error desconocido');
        
        setState({ data: null, loading: false, error: err });

        // Callback de error
        if (options.onError) {
          options.onError(err);
        }

        // Toast de error
        if (options.showErrorToast !== false) {
          toast.error(err.message || 'Error al realizar la operación');
        }

        throw err;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// ============================================================================
// HOOK PARA QUERIES (GET)
// ============================================================================

export function useQuery<T = any>(
  queryFn: () => Promise<T>,
  options: UseApiOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...apiOptions } = options;
  const api = useApi<T>(apiOptions);

  const [initialized, setInitialized] = useState(false);

  // Auto-ejecutar en mount si está enabled
  useState(() => {
    if (enabled && !initialized) {
      api.execute(queryFn).catch(() => {});
      setInitialized(true);
    }
  });

  const refetch = useCallback(() => {
    return api.execute(queryFn);
  }, [queryFn, api]);

  return {
    ...api,
    refetch,
    isLoading: api.loading,
    isError: !!api.error,
  };
}

// ============================================================================
// HOOK PARA MUTATIONS (POST, PUT, DELETE)
// ============================================================================

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions = {}
) {
  const api = useApi<TData>(options);

  const mutate = useCallback(
    async (variables: TVariables) => {
      return api.execute(() => mutationFn(variables));
    },
    [mutationFn, api]
  );

  return {
    ...api,
    mutate,
    isLoading: api.loading,
    isError: !!api.error,
    isSuccess: !!api.data && !api.loading && !api.error,
  };
}
