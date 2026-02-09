import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastMock } from './toast.mock';

vi.mock('sonner@2.0.3', () => ({ toast: toastMock }));

const envelopedFetchMock = vi.fn();
vi.mock('../../src/services/http/envelopedFetch', () => ({
  envelopedFetch: envelopedFetchMock,
}));

describe('clientesApi contract', async () => {
  const { clientesApi } = await import('../../src/services/api/clientes.api');

  beforeEach(() => {
    envelopedFetchMock.mockReset();
    toastMock.error.mockReset();
    toastMock.success.mockReset();
  });

  it('getAll returns Cliente[] from response.data.data', async () => {
    envelopedFetchMock.mockResolvedValue({
      data: { success: true, data: [{ id: 1, nombre: 'A', email: 'a@a.com', role: 'cliente', creadoEn: 'x' }] },
    });
    const res = await clientesApi.getAll();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe(1);
  });

  it('getAll returns [] and toasts on error', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('SERVER_ERROR'));
    const res = await clientesApi.getAll();
    expect(res).toEqual([]);
    expect(toastMock.error).toHaveBeenCalledWith('Error al cargar clientes');
  });

  it('getById returns null and shows "Cliente no encontrado" on not-found message', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('NOT_FOUND'));
    const res = await clientesApi.getById(123);
    expect(res).toBeNull();
    expect(toastMock.error).toHaveBeenCalledWith('Cliente no encontrado');
  });

  it('create returns null and shows "Email ya registrado" on duplicate-like message', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));
    const res = await clientesApi.create({ nombre: 'A', email: 'a@a.com', password: 'secret' });
    expect(res).toBeNull();
    expect(toastMock.error).toHaveBeenCalledWith('Email ya registrado');
  });

  it('getTurnoActivo returns null for empty object data', async () => {
    envelopedFetchMock.mockResolvedValue({ data: { success: true, data: {} } });
    const res = await clientesApi.getTurnoActivo(1);
    expect(res).toBeNull();
  });
});

