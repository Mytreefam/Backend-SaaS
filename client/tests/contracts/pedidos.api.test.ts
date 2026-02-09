import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastMock } from './toast.mock';

vi.mock('sonner@2.0.3', () => ({ toast: toastMock }));

const envelopedFetchMock = vi.fn();
vi.mock('../../src/services/http/envelopedFetch', () => ({
  envelopedFetch: envelopedFetchMock,
}));

describe('pedidosApi contract', async () => {
  const { pedidosApi } = await import('../../src/services/api/pedidos.api');

  beforeEach(() => {
    envelopedFetchMock.mockReset();
    toastMock.error.mockReset();
    toastMock.success.mockReset();
  });

  it('getAll returns [] on error and shows toast', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('SERVER_ERROR'));
    const res = await pedidosApi.getAll();
    expect(res).toEqual([]);
    expect(toastMock.error).toHaveBeenCalledWith('Error al cargar pedidos');
  });

  it('getById returns null and shows "Pedido no encontrado" when not found', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('No encontrado'));
    const res = await pedidosApi.getById(1);
    expect(res).toBeNull();
    expect(toastMock.error).toHaveBeenCalledWith('Pedido no encontrado');
  });

  it('create returns Pedido and shows success toast', async () => {
    envelopedFetchMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 1,
          clienteId: 1,
          fecha: '2020-01-01',
          estado: 'pendiente',
          total: 10,
          items: [],
        },
      },
    });

    const res = await pedidosApi.create({ clienteId: 1, total: 10, items: [] });
    expect(res?.id).toBe(1);
    expect(toastMock.success).toHaveBeenCalledWith('Pedido creado correctamente');
  });
});

