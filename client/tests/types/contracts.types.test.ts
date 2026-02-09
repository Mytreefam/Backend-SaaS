import { describe, it, expectTypeOf } from 'vitest';
import type { Cliente } from '../../src/services/api/clientes.api';
import type { Pedido } from '../../src/services/api/pedidos.api';
import type { Turno } from '../../src/services/api/turnos.api';
import type { Cita } from '../../src/types/cita.types';

describe('type contracts', async () => {
  const { clientesApi } = await import('../../src/services/api/clientes.api');
  const { pedidosApi } = await import('../../src/services/api/pedidos.api');
  const { turnosApi } = await import('../../src/services/api/turnos.api');
  const { citasAPIService } = await import('../../src/services/citasAPI.service');

  it('clientesApi signatures', () => {
    expectTypeOf(clientesApi.getAll).toEqualTypeOf<() => Promise<Cliente[]>>();
    expectTypeOf(clientesApi.getById).toEqualTypeOf<(id: string | number) => Promise<Cliente | null>>();
  });

  it('pedidosApi signatures', () => {
    expectTypeOf(pedidosApi.getAll).toEqualTypeOf<() => Promise<Pedido[]>>();
    expectTypeOf(pedidosApi.getById).toEqualTypeOf<(id: string | number) => Promise<Pedido | null>>();
  });

  it('turnosApi signatures', () => {
    expectTypeOf(turnosApi.getAll).toEqualTypeOf<() => Promise<Turno[]>>();
    expectTypeOf(turnosApi.getById).toEqualTypeOf<(id: number) => Promise<Turno | null>>();
  });

  it('citasAPIService signatures', () => {
    expectTypeOf(citasAPIService.obtenerCitas).toEqualTypeOf<(filtros?: any) => Promise<Cita[]>>();
    expectTypeOf(citasAPIService.obtenerCita).toEqualTypeOf<(id: number | string) => Promise<Cita | null>>();
    expectTypeOf(citasAPIService.eliminarCita).toEqualTypeOf<(id: number | string) => Promise<boolean>>();
  });
});

