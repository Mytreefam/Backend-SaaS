/**
 * Shared HTTP wrapper for the backend response envelope.
 *
 * Backend contract:
 * { success: boolean, data?: any, error?: string }
 *
 * This wrapper:
 * - Returns an axios-like response object
 * - Attaches Authorization header automatically (unless skipAuth)
 * - Throws Error(message) when success === false
 * - On HTTP 401: attempts POST /auth/refresh once (credentials: 'include'), retries original request once
 * - Prevents infinite refresh loops
 */
import { buildUrl, clearAuthToken, getAuthToken, setAuthToken } from '../../config/api.config';
import { logHttpEvent } from '../../observability/httpLogger';
import { trackError, getSafeUserId } from '../../observability/errorTracker';
import { HTTP_RETRY_ENABLED } from '../../observability/envFlags';
import { dispatchAuthExpired } from '../../observability/authExpiry';
import { recordHttpDuration } from '../../observability/performanceTelemetry';

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AxiosLikeResponse<TData> = {
  data: TData;
  status: number;
  statusText: string;
  headers: Headers;
  config: {
    url: string;
    method: string;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
  } & Record<string, unknown>;
  request: {
    url: string;
    init: RequestInit;
  };
};

export type EnvelopedFetchInit = RequestInit & {
  /**
   * If true, does not attach Authorization header automatically.
   */
  skipAuth?: boolean;

  /**
   * Response parsing mode.
   *
   * - 'json' (default): expects backend envelope JSON
   * - 'blob': reads binary body and wraps as { success: true, data: Blob }
   * - 'text': reads text body and wraps as { success: true, data: string }
   * - 'none': reads no body and wraps as { success: true, data: undefined }
   */
  responseType?: 'json' | 'blob' | 'text' | 'none';
};

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function resolveUrl(input: string): string {
  // Allow passing either a full URL or a backend-relative path (e.g. "/auth/login")
  return isAbsoluteUrl(input) ? input : buildUrl(input);
}

function buildHeaders(
  initHeaders: HeadersInit | undefined,
  skipAuth: boolean,
  body: RequestInit['body'] | undefined,
  responseType: EnvelopedFetchInit['responseType'] | undefined,
): Headers {
  const headers = new Headers(initHeaders || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', responseType === 'json' || responseType == null ? 'application/json' : '*/*');
  }

  /**
   * Only set Content-Type when there is a request body.
   *
   * Important: Setting Content-Type on GET/HEAD can introduce CORS preflights and
   * break non-API requests (e.g. HEAD to image URLs).
   */
  if (!headers.has('Content-Type') && body != null) {
    // FormData must manage its own boundary
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // no-op
    } else if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    } else {
      // Default to JSON for typical service usage (caller can override)
      headers.set('Content-Type', 'application/json');
    }
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function safeLogoutCleanup() {
  clearAuthToken();
  localStorage.removeItem('user');
  localStorage.removeItem('currentUser');
}

function withStatus(error: Error, status: number): Error {
  (error as any).status = status;
  return error;
}

function nowMs(): number {
  try {
    return performance.now();
  } catch {
    return Date.now();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  // attempt: 0 -> first retry wait, 1 -> second retry wait
  const base = 250;
  const exp = base * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return exp + jitter;
}

async function parseEnvelope<T>(
  response: Response,
  responseType: EnvelopedFetchInit['responseType'] | undefined,
): Promise<ApiEnvelope<T>> {
  const mode: NonNullable<EnvelopedFetchInit['responseType']> = responseType ?? 'json';

  if (mode === 'none') {
    return { success: true, data: undefined };
  }

  if (mode === 'blob') {
    if (!response.ok) throw withStatus(new Error(`Error HTTP ${response.status}`), response.status);
    const blob = await response.blob();
    return { success: true, data: blob as unknown as T };
  }

  if (mode === 'text') {
    if (!response.ok) throw withStatus(new Error(`Error HTTP ${response.status}`), response.status);
    const text = await response.text();
    return { success: true, data: text as unknown as T };
  }

  // 204/empty bodies should not throw (some endpoints may still reply with no content)
  if (response.status === 204) {
    return { success: true, data: undefined };
  }

  const text = await response.text();
  if (!text) {
    // Treat empty as success with no data
    return { success: true, data: undefined };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }

  // If server does not match envelope, treat as invalid (we will migrate callers)
  if (!parsed || typeof parsed.success !== 'boolean') {
    throw new Error('Respuesta inválida del servidor');
  }

  return parsed as ApiEnvelope<T>;
}

async function refreshOnce(): Promise<string> {
  const refreshUrl = resolveUrl('/auth/refresh');

  const res = await fetch(refreshUrl, {
    method: 'POST',
    headers: buildHeaders(undefined, true, undefined, 'json'), // no Authorization needed
    credentials: 'include',
  });

  const envelope = await parseEnvelope<{ token?: string }>(res, 'json');

  if (!envelope.success) {
    throw new Error(envelope.error || 'No se pudo refrescar la sesión');
  }

  const token = envelope.data?.token;
  if (!token) {
    throw new Error('No se pudo refrescar la sesión');
  }

  // Persist refresh-based tokens in localStorage for stability
  setAuthToken(token, true);
  return token;
}

async function requestInternal<T>(
  urlInput: string,
  init: EnvelopedFetchInit,
  state: { attemptedRefresh: boolean; attemptedRetry: boolean; retryAttempt: number },
): Promise<AxiosLikeResponse<ApiEnvelope<T>>> {
  const url = resolveUrl(urlInput);
  const method = (init.method || 'GET').toUpperCase();
  const skipAuth = Boolean(init.skipAuth);
  const responseType = init.responseType ?? 'json';

  const headers = buildHeaders(init.headers, skipAuth, init.body, responseType);
  const requestInit: RequestInit = {
    ...init,
    method,
    headers,
  };

  const canRetry = HTTP_RETRY_ENABLED && (method === 'GET' || method === 'HEAD');
  const maxRetries = 2;

  let response: Response;
  let lastDurationMs = 0;
  while (true) {
    const attemptStart = nowMs();

    try {
      response = await fetch(url, requestInit);
    } catch (e) {
      // Network failure
      if (canRetry && state.retryAttempt < maxRetries) {
        logHttpEvent({
          endpoint: urlInput,
          method,
          status: 0,
          success: false,
          duration: nowMs() - attemptStart,
          retryAttempt: state.retryAttempt,
          userId: getSafeUserId(),
        });
        recordHttpDuration({
          endpoint: urlInput,
          method,
          status: 0,
          success: false,
          duration: nowMs() - attemptStart,
          retryAttempt: state.retryAttempt,
        });
        await sleep(backoffMs(state.retryAttempt));
        state.retryAttempt += 1;
        continue;
      }

      trackError(e, { source: 'http', endpoint: urlInput, method, status: 0, retryAttempt: state.retryAttempt });
      throw e;
    }

    lastDurationMs = nowMs() - attemptStart;

    // Retry idempotent requests for 5xx
    if (canRetry && response.status >= 500 && state.retryAttempt < maxRetries) {
      logHttpEvent({
        endpoint: urlInput,
        method,
        status: response.status,
        success: false,
        duration: lastDurationMs,
        retryAttempt: state.retryAttempt,
        userId: getSafeUserId(),
      });
      recordHttpDuration({
        endpoint: urlInput,
        method,
        status: response.status,
        success: false,
        duration: lastDurationMs,
        retryAttempt: state.retryAttempt,
      });
      await sleep(backoffMs(state.retryAttempt));
      state.retryAttempt += 1;
      continue;
    }

    // log success/failure later (after parsing), so break here
    break;
  }

  // Handle 401 with a single refresh + retry
  if (response.status === 401 && !state.attemptedRefresh) {
    state.attemptedRefresh = true;
    try {
      await refreshOnce();
    } catch (e) {
      safeLogoutCleanup();
      dispatchAuthExpired({
        reason: 'refresh_failed',
        message: e instanceof Error ? e.message : 'Sesión expirada',
      });
      const message = e instanceof Error ? e.message : 'Sesión expirada';
      throw new Error(message);
    }

    if (!state.attemptedRetry) {
      state.attemptedRetry = true;
      state.retryAttempt += 1;
      return requestInternal<T>(urlInput, init, state);
    }
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await parseEnvelope<T>(response, responseType);
  } catch (e) {
    logHttpEvent({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
      userId: getSafeUserId(),
    });
    recordHttpDuration({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
    });
    trackError(e, {
      source: 'http',
      endpoint: urlInput,
      method,
      status: response.status,
      retryAttempt: state.retryAttempt,
    });
    throw e;
  }

  // If backend says failure, throw using backend message
  if (envelope.success === false) {
    const err = withStatus(new Error(envelope.error || 'Error en la petición'), response.status);
    logHttpEvent({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
      userId: getSafeUserId(),
    });
    recordHttpDuration({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
    });
    throw err;
  }

  // If HTTP not ok but success true (shouldn't happen), still treat as error
  if (!response.ok) {
    const err = withStatus(new Error(envelope.error || `Error HTTP ${response.status}`), response.status);
    logHttpEvent({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
      userId: getSafeUserId(),
    });
    recordHttpDuration({
      endpoint: urlInput,
      method,
      status: response.status,
      success: false,
      duration: lastDurationMs,
      retryAttempt: state.retryAttempt,
    });
    throw err;
  }

  // Successful request event
  logHttpEvent({
    endpoint: urlInput,
    method,
    status: response.status,
    success: true,
    duration: lastDurationMs,
    retryAttempt: state.retryAttempt,
    userId: getSafeUserId(),
  });
  recordHttpDuration({
    endpoint: urlInput,
    method,
    status: response.status,
    success: true,
    duration: lastDurationMs,
    retryAttempt: state.retryAttempt,
  });

  return {
    data: envelope,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config: {
      url,
      method,
      headers: init.headers,
      credentials: init.credentials,
    },
    request: {
      url,
      init: requestInit,
    },
  };
}

/**
 * Enveloped fetch.
 *
 * Usage:
 * const response = await envelopedFetch<MyType>("/pedidos");
 * const value = response.data.data; // <- required unwrap
 */
export async function envelopedFetch<T>(
  url: string,
  init: EnvelopedFetchInit = {},
): Promise<AxiosLikeResponse<ApiEnvelope<T>>> {
  return requestInternal<T>(url, init, { attemptedRefresh: false, attemptedRetry: false, retryAttempt: 0 });
}

