// Promociones Disponibles - Sistema Udar Edge
// Base de datos MASTER de promociones - Conectada a Gerente, Cliente y TPV

export type TipoPromocion = 
  | '2x1' 
  | '3x2'
  | 'descuento_porcentaje' 
  | 'descuento_fijo' 
  | 'regalo' 
  | 'puntos'
  | 'combo_pack'; // Nuevo: para combos de productos

export type PublicoObjetivo = 
  | 'general' // Todos los clientes
  | 'nuevo' // Clientes nuevos
  | 'premium' // VIP / Premium
  | 'alta_frecuencia' // Alta frecuencia
  | 'multitienda' // Multitienda
  | 'personalizado'; // Clientes específicos seleccionados

export type CanalPromocion = 
  | 'app' // Solo app del cliente
  | 'tienda' // Solo en tienda física
  | 'ambos'; // App y tienda

export interface ProductoCombo {
  id: string;
  nombre: string;
  precioOriginal: number;
  precioCoste: number;
}

export interface PromocionDisponible {
  // Identificación
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  
  // Descuento/Valor
  valor: number; // Porcentaje o cantidad fija
  descripcion: string;
  
  // Productos (para combos o productos específicos con descuento)
  productosIncluidos?: ProductoCombo[]; // Para tipo 'combo_pack'
  productoIdAplicable?: string; // Para descuentos en productos específicos
  categoriaAplicable?: string; // Para descuentos en categorías
  
  // Precio especial (solo para combos)
  precioCombo?: number; // PVP del combo
  
  // Visual
  imagen?: string;
  color: string;
  destacada?: boolean;
  
  // Fechas y estado
  activa: boolean;
  fechaInicio: string;
  fechaFin: string;
  
  // Segmentación
  publicoObjetivo: PublicoObjetivo;
  clientesAsignados?: string[]; // IDs de clientes específicos (para 'personalizado')
  
  // Canales
  canal: CanalPromocion;
  
  // PDVs donde aplica (null = todos)
  pdvsAplicables?: string[]; // IDs de puntos de venta
  
  // Limitaciones
  limiteUsosPorCliente?: number; // null = sin límite
  cantidadMinima?: number; // Cantidad mínima para aplicar (ej: compra mínima 2 unidades)
  
  // Restricciones horarias
  horaInicio?: string; // Ej: "17:00" para Happy Hour
  horaFin?: string; // Ej: "19:00"
  
  // Métricas
  vecesUsada?: number;
  clientesQueUsaron?: string[]; // IDs
}

// ============================================
// DATOS MOCK - PROMOCIONES DE EJEMPLO
// ============================================

export const promocionesDisponibles: PromocionDisponible[] = [
  // COMBOS/PACKS
  {
    id: 'PROMO-COMBO-001',
    nombre: 'Pack Croissants Familiares',
    tipo: 'combo_pack',
    valor: 25, // 25% ahorro
    descripcion: '4 Croissants + 4 Napolitanas a precio especial',
    productosIncluidos: [
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
    ],
    precioCombo: 12.00, // Precio total: 15.20€ → Combo: 12€ (ahorro 3.20€)
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    color: 'orange',
    destacada: true,
    activa: true,
    fechaInicio: '2024-11-01',
    fechaFin: '2025-11-30',
    publicoObjetivo: 'general',
    canal: 'ambos',
    vecesUsada: 142,
    clientesQueUsaron: []
  },
  {
    id: 'PROMO-COMBO-002',
    nombre: 'Menú Desayuno Familiar',
    tipo: 'combo_pack',
    valor: 23, // 23% ahorro
    descripcion: '2 Baguettes + 4 Croissants + 4 Cafés',
    productosIncluidos: [
      { id: 'PROD-003', nombre: 'Baguette', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-003', nombre: 'Baguette', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
    ],
    precioCombo: 27.00, // Total: 35€ → Combo: 27€ (ahorro 8€)
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    color: 'orange',
    destacada: true,
    activa: true,
    fechaInicio: '2024-10-15',
    fechaFin: '2025-12-31',
    publicoObjetivo: 'general',
    canal: 'ambos',
    vecesUsada: 87
  },
  {
    id: 'PROMO-COMBO-003',
    nombre: 'Combo Bollería Completo',
    tipo: 'combo_pack',
    valor: 22, // 22% ahorro
    descripcion: 'Selección premium de bollería para toda la semana',
    productosIncluidos: [
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
      { id: 'PROD-008', nombre: 'Croissant almendra', precioOriginal: 2.20, precioCoste: 0.88 },
    ],
    precioCombo: 14.50, // Total: 18.50€ → Combo: 14.50€ (ahorro 4€)
    imagen: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400',
    color: 'orange',
    activa: true,
    fechaInicio: '2024-11-20',
    fechaFin: '2025-12-15',
    publicoObjetivo: 'alta_frecuencia',
    canal: 'ambos',
    vecesUsada: 56
  },

  // DESCUENTOS INDIVIDUALES
  {
    id: 'PROMO-001',
    nombre: '2x1 en Croissants',
    tipo: '2x1',
    valor: 0,
    descripcion: 'Lleva 2 croissants y paga 1',
    productoIdAplicable: 'PROD-007',
    color: 'red',
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'general',
    canal: 'ambos',
    cantidadMinima: 2,
    vecesUsada: 234
  },
  {
    id: 'PROMO-002',
    nombre: '20% Descuento Bollería',
    tipo: 'descuento_porcentaje',
    valor: 20,
    descripcion: '20% de descuento en toda la bollería',
    categoriaAplicable: 'Bollería simple',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    color: 'orange',
    destacada: true,
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'nuevo',
    canal: 'app',
    vecesUsada: 167
  },
  {
    id: 'PROMO-003',
    nombre: '30% Descuento VIP',
    tipo: 'descuento_porcentaje',
    valor: 30,
    descripcion: '30% de descuento exclusivo para clientes VIP',
    color: 'purple',
    destacada: true,
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'premium',
    canal: 'ambos',
    vecesUsada: 89
  },
  {
    id: 'PROMO-004',
    nombre: '-2€ en tu compra',
    tipo: 'descuento_fijo',
    valor: 2,
    descripcion: '2€ de descuento directo en compras superiores a 10€',
    color: 'green',
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'general',
    canal: 'tienda',
    vecesUsada: 312
  },
  {
    id: 'PROMO-005',
    nombre: '-5€ Bienvenida',
    tipo: 'descuento_fijo',
    valor: 5,
    descripcion: '5€ de descuento en tu primera compra',
    color: 'green',
    destacada: true,
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'nuevo',
    canal: 'app',
    limiteUsosPorCliente: 1,
    vecesUsada: 78
  },
  {
    id: 'PROMO-006',
    nombre: 'Happy Hour 15%',
    tipo: 'descuento_porcentaje',
    valor: 15,
    descripcion: '15% descuento de 17h a 19h',
    color: 'purple',
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'general',
    canal: 'tienda',
    horaInicio: '17:00',
    horaFin: '19:00',
    vecesUsada: 456
  },
  {
    id: 'PROMO-007',
    nombre: 'Regalo Café',
    tipo: 'regalo',
    valor: 0,
    descripcion: 'Café gratis con compras superiores a 15€',
    color: 'blue',
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'general',
    canal: 'tienda',
    vecesUsada: 189
  },
  {
    id: 'PROMO-008',
    nombre: 'Doble Puntos',
    tipo: 'puntos',
    valor: 2,
    descripcion: 'Doble de puntos fidelidad en todas tus compras',
    color: 'yellow',
    activa: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'alta_frecuencia',
    canal: 'ambos',
    vecesUsada: 234
  },
  {
    id: 'PROMO-009',
    nombre: '3x2 en Magdalenas',
    tipo: '3x2',
    valor: 0,
    descripcion: 'Lleva 3 magdalenas y paga solo 2',
    categoriaAplicable: 'magdalenas',
    color: 'red',
    activa: true,
    fechaInicio: '2025-11-15',
    fechaFin: '2025-11-29',
    publicoObjetivo: 'general',
    canal: 'ambos',
    cantidadMinima: 3,
    vecesUsada: 156
  },
  {
    id: 'PROMO-HORARIO-001',
    nombre: 'Happy Hour Coffee',
    tipo: 'combo_pack',
    valor: 0,
    descripcion: 'Café + Croissant por 2.50€ (08:00-11:00)',
    productosIncluidos: [
      { id: 'PROD-001', nombre: 'Café espresso', precioOriginal: 1.00, precioCoste: 0.40 },
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.50, precioCoste: 0.60 }
    ],
    precioCombo: 2.50,
    horaInicio: '08:00',
    horaFin: '11:00',
    color: 'orange',
    destacada: true,
    activa: true,
    fechaInicio: '2025-11-01',
    fechaFin: '2025-11-30',
    publicoObjetivo: 'general',
    canal: 'ambos',
    vecesUsada: 324
  },
  {
    id: 'PROMO-010',
    nombre: 'Black Friday',
    tipo: 'descuento_porcentaje',
    valor: 50,
    descripcion: '50% descuento especial Black Friday',
    imagen: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    color: 'black',
    destacada: true,
    activa: false,
    fechaInicio: '2024-11-24',
    fechaFin: '2024-11-24',
    publicoObjetivo: 'general',
    canal: 'ambos',
    vecesUsada: 0
  },

  // PROMOCIONES PERSONALIZADAS (ejemplo con clientes específicos)
  {
    id: 'PROMO-PERS-001',
    nombre: 'Especial Laura - 40% OFF',
    tipo: 'descuento_porcentaje',
    valor: 40,
    descripcion: 'Promoción exclusiva para ti. ¡Gracias por tu fidelidad!',
    color: 'pink',
    destacada: true,
    activa: true,
    fechaInicio: '2024-11-01',
    fechaFin: '2025-01-31',
    publicoObjetivo: 'personalizado',
    clientesAsignados: ['CLI-0015'], // Laura Martínez
    canal: 'app',
    limiteUsosPorCliente: 1,
    vecesUsada: 0
  },
  {
    id: 'PROMO-PERS-002',
    nombre: 'Pack Especial María',
    tipo: 'combo_pack',
    valor: 30,
    descripcion: 'Tu pack favorito con descuento especial',
    productosIncluidos: [
      { id: 'PROD-007', nombre: 'Croissant mantequilla', precioOriginal: 1.80, precioCoste: 0.72 },
      { id: 'PROD-010', nombre: 'Napolitana chocolate', precioOriginal: 2.00, precioCoste: 0.80 },
    ],
    precioCombo: 2.50, // Total: 3.80€ → Combo: 2.50€
    color: 'purple',
    destacada: true,
    activa: true,
    fechaInicio: '2024-11-01',
    fechaFin: '2024-12-31',
    publicoObjetivo: 'personalizado',
    clientesAsignados: ['CLI-0011'], // María López
    canal: 'ambos',
    vecesUsada: 0
  }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export const buscarPromocion = (id: string): PromocionDisponible | undefined => {
  return promocionesDisponibles.find(p => p.id === id);
};

export const obtenerPromocionesActivas = (): PromocionDisponible[] => {
  const hoy = new Date();
  return promocionesDisponibles.filter(p => {
    if (!p.activa) return false;
    const inicio = new Date(p.fechaInicio);
    const fin = new Date(p.fechaFin);
    return hoy >= inicio && hoy <= fin;
  });
};

export const obtenerPromocionesParaCliente = (clienteId: string, segmento?: string): PromocionDisponible[] => {
  const activas = obtenerPromocionesActivas();
  
  return activas.filter(p => {
    // Promociones personalizadas
    if (p.publicoObjetivo === 'personalizado') {
      return p.clientesAsignados?.includes(clienteId);
    }
    
    // Promociones por segmento
    if (segmento && p.publicoObjetivo !== 'general') {
      return p.publicoObjetivo === segmento.toLowerCase();
    }
    
    // Promociones generales
    return p.publicoObjetivo === 'general';
  });
};

export const calcularPrecioConPromocion = (precioOriginal: number, promocion: PromocionDisponible): number => {
  switch (promocion.tipo) {
    case 'descuento_porcentaje':
      return precioOriginal * (1 - promocion.valor / 100);
    case 'descuento_fijo':
      return Math.max(0, precioOriginal - promocion.valor);
    case '2x1':
    case '3x2':
      // Esto se maneja en el carrito según cantidad
      return precioOriginal;
    case 'combo_pack':
      return promocion.precioCombo || precioOriginal;
    default:
      return precioOriginal;
  }
};
