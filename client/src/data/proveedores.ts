// Base de datos de Proveedores - Udar Edge Sistema 360
// Proveedor completo con datos de contacto, historial y evaluación

export interface Proveedor {
  id: string;
  nombre: string;
  nif: string;
  categoria: 'harinas' | 'lacteos' | 'frutas' | 'carnes' | 'pescados' | 'verduras' | 'bebidas' | 'embalaje' | 'limpieza' | 'varios';
  contacto: {
    nombreResponsable: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    codigoPostal: string;
  };
  condicionesComerciales: {
    descuentoVolumen?: number;
    plazoEntrega: number; // días
    pedidoMinimo: number; // euros
    formaPago: 'contado' | '30_dias' | '60_dias' | '90_dias';
  };
  evaluacion: {
    calidad: number; // 1-5
    puntualidad: number; // 1-5
    precio: number; // 1-5
    servicio: number; // 1-5
  };
  estadisticas: {
    totalPedidos: number;
    totalGastado: number;
    pedidoPromedio: number;
    diasEntregaPromedio: number;
    incidencias: number;
  };
  activo: boolean;
  observaciones?: string;
}

export const proveedores: Proveedor[] = [
  {
    id: 'PROV-001',
    nombre: 'Molinos del Sur',
    nif: 'B12345678',
    categoria: 'harinas',
    contacto: {
      nombreResponsable: 'Juan Martínez',
      telefono: '+34 934 123 456',
      email: 'pedidos@molinosdelsur.es',
      direccion: 'Calle Molino, 23',
      ciudad: 'Barcelona',
      codigoPostal: '08001'
    },
    condicionesComerciales: {
      descuentoVolumen: 5,
      plazoEntrega: 2,
      pedidoMinimo: 200,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 5,
      puntualidad: 4,
      precio: 4,
      servicio: 5
    },
    estadisticas: {
      totalPedidos: 48,
      totalGastado: 24580.50,
      pedidoPromedio: 512.09,
      diasEntregaPromedio: 2.1,
      incidencias: 2
    },
    activo: true,
    observaciones: 'Excelente calidad en harinas. Pedido mínimo de 200€.'
  },
  {
    id: 'PROV-002',
    nombre: 'Lácteos Frescos S.L.',
    nif: 'B87654321',
    categoria: 'lacteos',
    contacto: {
      nombreResponsable: 'María García',
      telefono: '+34 935 678 901',
      email: 'comercial@lactecosfrescos.com',
      direccion: 'Polígono Industrial Norte, Nave 15',
      ciudad: 'Sabadell',
      codigoPostal: '08201'
    },
    condicionesComerciales: {
      descuentoVolumen: 3,
      plazoEntrega: 1,
      pedidoMinimo: 150,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 5,
      puntualidad: 5,
      precio: 3,
      servicio: 4
    },
    estadisticas: {
      totalPedidos: 96,
      totalGastado: 18240.30,
      pedidoPromedio: 190.00,
      diasEntregaPromedio: 1.0,
      incidencias: 0
    },
    activo: true,
    observaciones: 'Entrega diaria. Muy fiables.'
  },
  {
    id: 'PROV-003',
    nombre: 'Frutas y Verduras del Mercado',
    nif: 'B45678912',
    categoria: 'frutas',
    contacto: {
      nombreResponsable: 'Carlos López',
      telefono: '+34 932 345 678',
      email: 'pedidos@frutasmercado.es',
      direccion: 'Mercado Central, Puesto 45-48',
      ciudad: 'Barcelona',
      codigoPostal: '08003'
    },
    condicionesComerciales: {
      plazoEntrega: 1,
      pedidoMinimo: 80,
      formaPago: 'contado'
    },
    evaluacion: {
      calidad: 4,
      puntualidad: 4,
      precio: 5,
      servicio: 4
    },
    estadisticas: {
      totalPedidos: 120,
      totalGastado: 12450.75,
      pedidoPromedio: 103.76,
      diasEntregaPromedio: 1.2,
      incidencias: 8
    },
    activo: true,
    observaciones: 'Buenos precios. Fruta de temporada.'
  },
  {
    id: 'PROV-004',
    nombre: 'Cárnicas Barcelona Premium',
    nif: 'B78912345',
    categoria: 'carnes',
    contacto: {
      nombreResponsable: 'Pedro Ruiz',
      telefono: '+34 933 456 789',
      email: 'comercial@carnicasbcn.es',
      direccion: 'Calle Industria, 89',
      ciudad: 'Barcelona',
      codigoPostal: '08025'
    },
    condicionesComerciales: {
      descuentoVolumen: 8,
      plazoEntrega: 2,
      pedidoMinimo: 300,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 5,
      puntualidad: 4,
      precio: 3,
      servicio: 5
    },
    estadisticas: {
      totalPedidos: 36,
      totalGastado: 15680.00,
      pedidoPromedio: 435.56,
      diasEntregaPromedio: 2.3,
      incidencias: 1
    },
    activo: true,
    observaciones: 'Excelente calidad de carne. Precios premium.'
  },
  {
    id: 'PROV-005',
    nombre: 'Mariscos y Pescados del Puerto',
    nif: 'B65432178',
    categoria: 'pescados',
    contacto: {
      nombreResponsable: 'Ana Martín',
      telefono: '+34 936 789 012',
      email: 'info@mariscospuerto.es',
      direccion: 'Puerto Pesquero, Lonja 12',
      ciudad: 'Barcelona',
      codigoPostal: '08039'
    },
    condicionesComerciales: {
      plazoEntrega: 1,
      pedidoMinimo: 200,
      formaPago: 'contado'
    },
    evaluacion: {
      calidad: 5,
      puntualidad: 5,
      precio: 2,
      servicio: 4
    },
    estadisticas: {
      totalPedidos: 52,
      totalGastado: 18920.40,
      pedidoPromedio: 363.85,
      diasEntregaPromedio: 1.0,
      incidencias: 3
    },
    activo: true,
    observaciones: 'Producto fresco diario. Precios según lonja.'
  },
  {
    id: 'PROV-006',
    nombre: 'Distribuciones Hortícolas',
    nif: 'B32165498',
    categoria: 'verduras',
    contacto: {
      nombreResponsable: 'Luis Torres',
      telefono: '+34 937 890 123',
      email: 'pedidos@horticolas.com',
      direccion: 'Polígono Agrícola, Parcela 45',
      ciudad: 'Viladecans',
      codigoPostal: '08840'
    },
    condicionesComerciales: {
      descuentoVolumen: 4,
      plazoEntrega: 1,
      pedidoMinimo: 100,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 4,
      puntualidad: 5,
      precio: 4,
      servicio: 5
    },
    estadisticas: {
      totalPedidos: 84,
      totalGastado: 9840.60,
      pedidoPromedio: 117.15,
      diasEntregaPromedio: 1.1,
      incidencias: 2
    },
    activo: true,
    observaciones: 'Variedad de verduras frescas. Muy profesionales.'
  },
  {
    id: 'PROV-007',
    nombre: 'Bebidas y Refrescos Distribuciones',
    nif: 'B98765432',
    categoria: 'bebidas',
    contacto: {
      nombreResponsable: 'Roberto Sánchez',
      telefono: '+34 931 234 567',
      email: 'ventas@bebidasdist.es',
      direccion: 'Calle Distribución, 56',
      ciudad: 'Sant Adrià del Besòs',
      codigoPostal: '08930'
    },
    condicionesComerciales: {
      descuentoVolumen: 10,
      plazoEntrega: 3,
      pedidoMinimo: 250,
      formaPago: '60_dias'
    },
    evaluacion: {
      calidad: 4,
      puntualidad: 3,
      precio: 5,
      servicio: 4
    },
    estadisticas: {
      totalPedidos: 24,
      totalGastado: 8940.25,
      pedidoPromedio: 372.51,
      diasEntregaPromedio: 3.5,
      incidencias: 5
    },
    activo: true,
    observaciones: 'Buenos descuentos por volumen. A veces se retrasan.'
  },
  {
    id: 'PROV-008',
    nombre: 'Envases y Embalajes BCN',
    nif: 'B11223344',
    categoria: 'embalaje',
    contacto: {
      nombreResponsable: 'Elena Fernández',
      telefono: '+34 934 567 890',
      email: 'info@envasesbcn.es',
      direccion: 'Calle Industrial, 123',
      ciudad: 'Barcelona',
      codigoPostal: '08040'
    },
    condicionesComerciales: {
      descuentoVolumen: 15,
      plazoEntrega: 5,
      pedidoMinimo: 500,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 4,
      puntualidad: 4,
      precio: 4,
      servicio: 5
    },
    estadisticas: {
      totalPedidos: 12,
      totalGastado: 7250.80,
      pedidoPromedio: 604.23,
      diasEntregaPromedio: 5.2,
      incidencias: 1
    },
    activo: true,
    observaciones: 'Gran variedad de envases. Pedidos grandes.'
  },
  {
    id: 'PROV-009',
    nombre: 'Productos de Limpieza Profesional',
    nif: 'B55667788',
    categoria: 'limpieza',
    contacto: {
      nombreResponsable: 'Miguel Ángel Vega',
      telefono: '+34 935 678 901',
      email: 'pedidos@limpiezapro.es',
      direccion: 'Avenida Logística, 78',
      ciudad: 'Barcelona',
      codigoPostal: '08019'
    },
    condicionesComerciales: {
      descuentoVolumen: 7,
      plazoEntrega: 3,
      pedidoMinimo: 150,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 5,
      puntualidad: 5,
      precio: 4,
      servicio: 5
    },
    estadisticas: {
      totalPedidos: 18,
      totalGastado: 3420.90,
      pedidoPromedio: 190.05,
      diasEntregaPromedio: 2.8,
      incidencias: 0
    },
    activo: true,
    observaciones: 'Productos de alta calidad. Muy profesionales.'
  },
  {
    id: 'PROV-010',
    nombre: 'Suministros Varios BCN',
    nif: 'B99887766',
    categoria: 'varios',
    contacto: {
      nombreResponsable: 'Laura Jiménez',
      telefono: '+34 932 109 876',
      email: 'ventas@suministrosvarios.es',
      direccion: 'Calle Comercio, 45',
      ciudad: 'Barcelona',
      codigoPostal: '08015'
    },
    condicionesComerciales: {
      plazoEntrega: 4,
      pedidoMinimo: 100,
      formaPago: '30_dias'
    },
    evaluacion: {
      calidad: 3,
      puntualidad: 3,
      precio: 4,
      servicio: 3
    },
    estadisticas: {
      totalPedidos: 15,
      totalGastado: 2145.50,
      pedidoPromedio: 143.03,
      diasEntregaPromedio: 4.5,
      incidencias: 4
    },
    activo: true,
    observaciones: 'Proveedor de respaldo para necesidades puntuales.'
  }
];

// Helper para obtener proveedor por ID
export function getProveedorById(id: string): Proveedor | undefined {
  return proveedores.find(p => p.id === id);
}

// Helper para obtener proveedores por categoría
export function getProveedoresByCategoria(categoria: Proveedor['categoria']): Proveedor[] {
  return proveedores.filter(p => p.categoria === categoria && p.activo);
}

// Helper para obtener proveedores activos
export function getProveedoresActivos(): Proveedor[] {
  return proveedores.filter(p => p.activo);
}
