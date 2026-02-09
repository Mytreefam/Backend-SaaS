/**
 * Service Template (HTTP Contract Compliant)
 *
 * Architecture rules (MANDATORY):
 * - ONLY use `envelopedFetch<T>()` for HTTP calls in services/hooks/api.
 * - NEVER use native fetch, `response.json`, other HTTP clients, or the legacy apiService helper here.
 * - ALWAYS unwrap the backend envelope via: `response.data.data`
 * - ALL errors must come from `Error.message` thrown by `envelopedFetch`.
 * - Preserve existing return shapes and fallback behavior (`[] | null | false`) as-is.
 *
 * Source of truth: `/docs/http-contract.md`
 */

import { toast } from 'sonner';
import { envelopedFetch } from './http/envelopedFetch';

// Replace these with real domain types for your service.
export interface ExampleResource {
  id: string;
  nombre: string;
}

export interface ExampleCreateInput {
  nombre: string;
}

/**
 * Example: list endpoint with [] fallback
 */
export async function listExampleResources(): Promise<ExampleResource[]> {
  try {
    const response = await envelopedFetch<ExampleResource[]>(
      '/example/resources',
      {
        method: 'GET',
      },
    );

    // Always unwrap payload here
    return response.data.data ?? [];
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado';

    // Toast mapping rules: do NOT change copy; use existing patterns.
    // Examples (keep existing behavior in real services):
    if (message.includes('No encontrado') || message.includes('NOT_FOUND')) {
      toast.error('Recurso no encontrado');
      return [];
    }

    toast.error(message);
    return [];
  }
}

/**
 * Example: get-by-id endpoint with null fallback
 */
export async function getExampleResourceById(
  id: string,
): Promise<ExampleResource | null> {
  try {
    const response = await envelopedFetch<ExampleResource>(
      `/example/resources/${id}`,
      {
        method: 'GET',
      },
    );

    return response.data.data ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    toast.error(message);
    return null;
  }
}

/**
 * Example: create endpoint with boolean fallback
 */
export async function createExampleResource(
  input: ExampleCreateInput,
): Promise<boolean> {
  try {
    const response = await envelopedFetch<ExampleResource>(
      '/example/resources',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    );

    // Even if you don’t use the returned resource, keep the unwrap pattern consistent.
    void response.data.data;

    toast.success('Creado correctamente');
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado';

    // Duplicate resource example mapping (keep existing patterns/copy in real services)
    if (message.includes('email') || message.includes('DUPLICATE')) {
      toast.error('Ya existe un recurso con esos datos');
      return false;
    }

    toast.error(message);
    return false;
  }
}

