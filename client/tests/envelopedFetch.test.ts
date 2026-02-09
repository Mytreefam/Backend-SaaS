import { describe, it, expect, beforeEach, vi } from 'vitest';
import { envelopedFetch } from '../src/services/http/envelopedFetch';

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('envelopedFetch', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('unwraps success payload into response.data.data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ success: true, data: { ok: true } }),
    );
    (globalThis as any).fetch = fetchMock;

    const res = await envelopedFetch<{ ok: boolean }>('/health');
    expect(res.data.success).toBe(true);
    expect(res.data.data).toEqual({ ok: true });
  });

  it('throws Error(response.data.error) when success is false', async () => {
    (globalThis as any).fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: false, error: 'NOPE' }, { status: 400 }));

    await expect(envelopedFetch('/x')).rejects.toThrowError('NOPE');
  });

  it('attaches Authorization header when token exists', async () => {
    localStorage.setItem('auth_token', 't123');

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { ok: true } }));
    (globalThis as any).fetch = fetchMock;

    await envelopedFetch('/x');

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer t123');
  });

  it('does not attach Authorization when skipAuth is true', async () => {
    localStorage.setItem('auth_token', 't123');

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { ok: true } }));
    (globalThis as any).fetch = fetchMock;

    await envelopedFetch('/x', { skipAuth: true });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('on 401: refreshes once and retries original request once', async () => {
    localStorage.setItem('auth_token', 'expired');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    const fetchMock = vi.fn()
      // original request -> 401
      .mockResolvedValueOnce(jsonResponse({ success: false, error: 'UNAUTHORIZED' }, { status: 401 }))
      // refresh -> returns new token
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { token: 'new-token' } }, { status: 200 }))
      // retry original -> success
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { value: 42 } }, { status: 200 }));

    (globalThis as any).fetch = fetchMock;

    const res = await envelopedFetch<{ value: number }>('/protected');
    expect(res.data.data).toEqual({ value: 42 });

    expect(fetchMock).toHaveBeenCalledTimes(3);

    // Retry request should include new Authorization header
    const [, retryInit] = fetchMock.mock.calls[2];
    const retryHeaders = new Headers(retryInit.headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');
  });

  it('if refresh fails, clears auth storage and throws', async () => {
    localStorage.setItem('auth_token', 'expired');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    localStorage.setItem('currentUser', JSON.stringify({ id: 1 }));

    const fetchMock = vi.fn()
      // original request -> 401
      .mockResolvedValueOnce(jsonResponse({ success: false, error: 'UNAUTHORIZED' }, { status: 401 }))
      // refresh -> fails (envelope)
      .mockResolvedValueOnce(jsonResponse({ success: false, error: 'INVALID_REFRESH' }, { status: 200 }));

    (globalThis as any).fetch = fetchMock;

    await expect(envelopedFetch('/protected')).rejects.toThrowError('INVALID_REFRESH');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('throws safe fallback error on invalid JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('not-json', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    (globalThis as any).fetch = fetchMock;

    await expect(envelopedFetch('/x')).rejects.toThrowError('Respuesta inválida del servidor');
  });
});

