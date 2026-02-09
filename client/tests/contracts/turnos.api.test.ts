import { describe, it, expect, beforeEach, vi } from 'vitest';

const envelopedFetchMock = vi.fn();
vi.mock('../../src/services/http/envelopedFetch', () => ({
  envelopedFetch: envelopedFetchMock,
}));

describe('turnosApi contract', async () => {
  const { turnosApi } = await import('../../src/services/api/turnos.api');

  beforeEach(() => {
    envelopedFetchMock.mockReset();
  });

  it('getAll returns Turno[]', async () => {
    envelopedFetchMock.mockResolvedValue({ data: { success: true, data: [{ id: 1, numero: 'T1', estado: 'en_cola', clienteId: 1, pedidoId: 1 }] } });
    const res = await turnosApi.getAll();
    expect(res[0].id).toBe(1);
  });

  it('getById returns null on error', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('NOT_FOUND'));
    const res = await turnosApi.getById(1);
    expect(res).toBeNull();
  });

  it('delete returns false on error', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('SERVER_ERROR'));
    const res = await turnosApi.delete(1);
    expect(res).toBe(false);
  });
});

