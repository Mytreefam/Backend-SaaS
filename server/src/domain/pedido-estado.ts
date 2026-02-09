export const PEDIDO_ESTADOS = [
  // Cliente UI / tracking
  'pendiente',
  'recibido',
  'preparacion',
  'enviado',
  'en-carretera',
  'completado',

  // Delivery/integraciones / otros estados presentes en frontend
  'nuevo',
  'aceptado',
  'en_preparacion',
  'listo',
  'entregado',
  'cancelado',
] as const;

export type PedidoEstado = (typeof PEDIDO_ESTADOS)[number];

export function isPedidoEstado(value: unknown): value is PedidoEstado {
  return typeof value === 'string' && (PEDIDO_ESTADOS as readonly string[]).includes(value);
}

/**
 * Normaliza estados "equivalentes" a una forma aceptada.
 * No cambia el significado; sólo evita valores fuera del set permitido.
 */
export function coercePedidoEstado(value: unknown): PedidoEstado {
  if (isPedidoEstado(value)) return value;
  if (typeof value !== 'string') return 'pendiente';

  const v = value.trim().toLowerCase();
  const map: Record<string, PedidoEstado> = {
    'en carreta': 'en-carretera',
    'en carretera': 'en-carretera',
    'en_carretera': 'en-carretera',
    'en-carretera': 'en-carretera',
    'en preparacion': 'en_preparacion',
    'en preparación': 'en_preparacion',
  };

  return map[v] ?? 'pendiente';
}

