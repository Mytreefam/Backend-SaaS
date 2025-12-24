// Base de datos de Pedidos a Proveedores - Udar Edge Sistema 360
// Sistema de pedidos y recepciones de material

export interface LineaPedido {
  id: string;
  articuloId: string;
  articuloNombre: string;
  cantidad: number;
  unidad: 'kg' | 'litros' | 'unidades';
  precioUnitario: number;
  subtotal: number;
  cantidadRecibida?: number; // Para tracking de recepciones
}

export interface PedidoProveedor {
  id: string;
  numero: string; // Número de pedido (ej: PED-2024-001)
  proveedorId: string;
  proveedorNombre: string;
  fecha: Date;
  fechaEntregaEsperada: Date;
  estado: 'pendiente' | 'confirmado' | 'parcial' | 'completado' | 'cancelado';
  lineas: LineaPedido[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
  creadoPor: string;
  pdvDestino: string; // 'tiana' | 'badalona'
  numeroAlbaran?: string; // Se rellena cuando se recibe
  fechaRecepcion?: Date; // Fecha de recepción real
}

// Mock data - Pedidos realizados
export const pedidosProveedores: PedidoProveedor[] = [
  {
    id: 'PED-001',
    numero: 'PED-2024-001',
    proveedorId: 'PROV-001',
    proveedorNombre: 'Molinos del Sur',
    fecha: new Date('2024-11-20'),
    fechaEntregaEsperada: new Date('2024-11-22'),
    estado: 'completado',
    lineas: [
      {
        id: 'LP-001',
        articuloId: 'ING-001',
        articuloNombre: 'Harina de trigo',
        cantidad: 100,
        unidad: 'kg',
        precioUnitario: 1.50,
        subtotal: 150.00,
        cantidadRecibida: 100
      },
      {
        id: 'LP-002',
        articuloId: 'ING-002',
        articuloNombre: 'Harina integral',
        cantidad: 50,
        unidad: 'kg',
        precioUnitario: 1.80,
        subtotal: 90.00,
        cantidadRecibida: 50
      }
    ],
    subtotal: 240.00,
    iva: 50.40,
    total: 290.40,
    observaciones: 'Pedido regular mensual',
    creadoPor: 'María González',
    pdvDestino: 'tiana',
    numeroAlbaran: 'ALB-2024-0045',
    fechaRecepcion: new Date('2024-11-22')
  },
  {
    id: 'PED-002',
    numero: 'PED-2024-002',
    proveedorId: 'PROV-002',
    proveedorNombre: 'Lácteos Frescos S.L.',
    fecha: new Date('2024-11-25'),
    fechaEntregaEsperada: new Date('2024-11-26'),
    estado: 'completado',
    lineas: [
      {
        id: 'LP-003',
        articuloId: 'ING-005',
        articuloNombre: 'Leche entera',
        cantidad: 40,
        unidad: 'litros',
        precioUnitario: 0.85,
        subtotal: 34.00,
        cantidadRecibida: 40
      },
      {
        id: 'LP-004',
        articuloId: 'ING-006',
        articuloNombre: 'Mantequilla',
        cantidad: 20,
        unidad: 'kg',
        precioUnitario: 6.50,
        subtotal: 130.00,
        cantidadRecibida: 20
      },
      {
        id: 'LP-005',
        articuloId: 'ING-007',
        articuloNombre: 'Nata para cocinar',
        cantidad: 15,
        unidad: 'litros',
        precioUnitario: 3.20,
        subtotal: 48.00,
        cantidadRecibida: 15
      }
    ],
    subtotal: 212.00,
    iva: 44.52,
    total: 256.52,
    observaciones: 'Entrega semanal',
    creadoPor: 'Carlos Ruiz',
    pdvDestino: 'badalona',
    numeroAlbaran: 'ALB-2024-0046',
    fechaRecepcion: new Date('2024-11-26')
  },
  {
    id: 'PED-003',
    numero: 'PED-2024-003',
    proveedorId: 'PROV-003',
    proveedorNombre: 'Frutas y Verduras del Mercado',
    fecha: new Date('2024-11-26'),
    fechaEntregaEsperada: new Date('2024-11-27'),
    estado: 'parcial',
    lineas: [
      {
        id: 'LP-006',
        articuloId: 'ING-015',
        articuloNombre: 'Manzanas golden',
        cantidad: 25,
        unidad: 'kg',
        precioUnitario: 2.10,
        subtotal: 52.50,
        cantidadRecibida: 20
      },
      {
        id: 'LP-007',
        articuloId: 'ING-016',
        articuloNombre: 'Fresas',
        cantidad: 10,
        unidad: 'kg',
        precioUnitario: 4.50,
        subtotal: 45.00,
        cantidadRecibida: 10
      },
      {
        id: 'LP-008',
        articuloId: 'ING-017',
        articuloNombre: 'Plátanos',
        cantidad: 30,
        unidad: 'kg',
        precioUnitario: 1.80,
        subtotal: 54.00,
        cantidadRecibida: 25
      }
    ],
    subtotal: 151.50,
    iva: 31.82,
    total: 183.32,
    observaciones: 'Faltan 5 kg de manzanas y 5 kg de plátanos',
    creadoPor: 'Ana López',
    pdvDestino: 'tiana',
    numeroAlbaran: 'ALB-2024-0047',
    fechaRecepcion: new Date('2024-11-27')
  },
  {
    id: 'PED-004',
    numero: 'PED-2024-004',
    proveedorId: 'PROV-001',
    proveedorNombre: 'Molinos del Sur',
    fecha: new Date('2024-11-27'),
    fechaEntregaEsperada: new Date('2024-11-29'),
    estado: 'confirmado',
    lineas: [
      {
        id: 'LP-009',
        articuloId: 'ING-001',
        articuloNombre: 'Harina de trigo',
        cantidad: 75,
        unidad: 'kg',
        precioUnitario: 1.50,
        subtotal: 112.50
      },
      {
        id: 'LP-010',
        articuloId: 'ING-003',
        articuloNombre: 'Harina de centeno',
        cantidad: 30,
        unidad: 'kg',
        precioUnitario: 2.20,
        subtotal: 66.00
      }
    ],
    subtotal: 178.50,
    iva: 37.49,
    total: 215.99,
    observaciones: 'Pedido para Badalona',
    creadoPor: 'María González',
    pdvDestino: 'badalona'
  },
  {
    id: 'PED-005',
    numero: 'PED-2024-005',
    proveedorId: 'PROV-004',
    proveedorNombre: 'Cárnicas Barcelona Premium',
    fecha: new Date('2024-11-28'),
    fechaEntregaEsperada: new Date('2024-11-30'),
    estado: 'pendiente',
    lineas: [
      {
        id: 'LP-011',
        articuloId: 'ING-020',
        articuloNombre: 'Carne de ternera premium',
        cantidad: 15,
        unidad: 'kg',
        precioUnitario: 18.50,
        subtotal: 277.50
      },
      {
        id: 'LP-012',
        articuloId: 'ING-021',
        articuloNombre: 'Pollo de corral',
        cantidad: 20,
        unidad: 'kg',
        precioUnitario: 8.90,
        subtotal: 178.00
      }
    ],
    subtotal: 455.50,
    iva: 95.66,
    total: 551.16,
    observaciones: 'Pedido especial para evento',
    creadoPor: 'Carlos Ruiz',
    pdvDestino: 'tiana'
  }
];

// Helper para obtener pedido por ID
export function getPedidoById(id: string): PedidoProveedor | undefined {
  return pedidosProveedores.find(p => p.id === id);
}

// Helper para obtener pedidos por proveedor
export function getPedidosByProveedor(proveedorId: string): PedidoProveedor[] {
  return pedidosProveedores.filter(p => p.proveedorId === proveedorId);
}

// Helper para obtener pedidos por estado
export function getPedidosByEstado(estado: PedidoProveedor['estado']): PedidoProveedor[] {
  return pedidosProveedores.filter(p => p.estado === estado);
}

// Helper para obtener pedidos pendientes de recibir
export function getPedidosPendientesRecepcion(): PedidoProveedor[] {
  return pedidosProveedores.filter(p => p.estado === 'pendiente' || p.estado === 'confirmado' || p.estado === 'parcial');
}
