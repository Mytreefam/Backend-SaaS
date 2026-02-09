import { describe, it, expect, beforeEach, vi } from 'vitest';

const envelopedFetchMock = vi.fn();
vi.mock('../../src/services/http/envelopedFetch', () => ({
  envelopedFetch: envelopedFetchMock,
}));

describe('citasAPIService contract', async () => {
  const { citasAPIService } = await import('../../src/services/citasAPI.service');

  beforeEach(() => {
    envelopedFetchMock.mockReset();
  });

  it('obtenerCitas preserves query params and maps through transformarCita', async () => {
    envelopedFetchMock.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 10,
            clienteId: 2,
            cliente: { nombre: 'Cliente X', telefono: '1', email: 'a@a.com' },
            estado: 'en_progreso',
            motivo: 'Test',
            fecha: '2026-01-01',
            hora: '10:00',
          },
        ],
      },
    });

    const res = await citasAPIService.obtenerCitas({ estado: 'confirmada', clienteId: 2, mes: 1, anio: 2026 });
    expect(envelopedFetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = envelopedFetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/citas?');
    expect(calledUrl).toContain('estado=confirmada');
    expect(calledUrl).toContain('clienteId=2');
    expect(calledUrl).toContain('mes=1');
    expect(calledUrl).toContain('anio=2026');

    // mapping check
    expect(res[0].id).toBe('10');
    expect(res[0].clienteNombre).toBe('Cliente X');
    expect(res[0].estado).toBe('en-progreso');
  });

  it('obtenerCitas returns [] when data is not an array', async () => {
    envelopedFetchMock.mockResolvedValue({ data: { success: true, data: { not: 'array' } } });
    const res = await citasAPIService.obtenerCitas();
    expect(res).toEqual([]);
  });

  it('eliminarCita returns false on error', async () => {
    envelopedFetchMock.mockRejectedValue(new Error('SERVER_ERROR'));
    const res = await citasAPIService.eliminarCita(1);
    expect(res).toBe(false);
  });
});

