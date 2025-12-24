// Analytics y Métricas de Promociones - Udar Edge
// Dashboard de análisis para el Gerente

export interface MetricaPromocion {
  promocionId: string;
  promocionNombre: string;
  tipo: string;
  
  // Uso y alcance
  vecesUsada: number;
  clientesUnicos: number;
  pedidosTotales: number;
  
  // Financiero
  ventasTotales: number; // Ventas totales con la promoción
  ventasSinDescuento: number; // Lo que hubieran pagado sin descuento
  descuentoOtorgado: number; // Total descontado
  costeTotalProductos: number; // Coste de productos vendidos
  
  // Calculado
  margenBruto: number; // ventasTotales - costeTotalProductos
  margenPorcentaje: number; // (margenBruto / ventasTotales) * 100
  roi: number; // ((ventasTotales - costeTotalProductos - descuentoOtorgado) / descuentoOtorgado) * 100
  
  // Conversión
  impresiones: number; // Veces que se mostró la promoción
  clics: number; // Veces que se seleccionó
  conversiones: number; // Veces que se completó la compra con la promo
  tasaConversion: number; // (conversiones / impresiones) * 100
  
  // Temporal
  fechaInicio: string;
  fechaFin: string;
  diasActiva: number;
  
  // Rendimiento diario
  ventasPorDia: number;
  usosPorDia: number;
  
  // Productos más vendidos con esta promoción
  productosTop: {
    productoId: string;
    nombre: string;
    cantidad: number;
    ventas: number;
  }[];
  
  // Horarios de mayor uso
  usosPorHora: {
    hora: number;
    usos: number;
  }[];
}

export interface ComparativaPromocion {
  promocionId: string;
  nombre: string;
  ventas: number;
  usos: number;
  roi: number;
  conversion: number;
  margen: number;
}

export interface TendenciaTemporal {
  fecha: string;
  ventas: number;
  usos: number;
  descuentos: number;
  margen: number;
}

export interface AnalisisHorario {
  hora: number;
  horaLabel: string;
  usos: number;
  ventas: number;
  conversion: number;
}

export interface SegmentoCliente {
  segmento: string;
  clientes: number;
  usos: number;
  ventasPromedio: number;
  tasaRetencion: number;
}

// ============================================
// DATOS MOCK - MÉTRICAS DE EJEMPLO
// ============================================

export const metricasPromociones: MetricaPromocion[] = [
  {
    promocionId: 'PROMO-001',
    promocionNombre: '2x1 en Croissants',
    tipo: '2x1',
    vecesUsada: 248,
    clientesUnicos: 187,
    pedidosTotales: 248,
    ventasTotales: 892.80,
    ventasSinDescuento: 1785.60,
    descuentoOtorgado: 892.80,
    costeTotalProductos: 357.12,
    margenBruto: 535.68,
    margenPorcentaje: 60.0,
    roi: -40.0, // ROI negativo porque el descuento es mayor que el margen
    impresiones: 1245,
    clics: 456,
    conversiones: 248,
    tasaConversion: 19.9,
    fechaInicio: '2025-11-15',
    fechaFin: '2025-11-29',
    diasActiva: 14,
    ventasPorDia: 63.77,
    usosPorDia: 17.7,
    productosTop: [
      { productoId: 'PROD-007', nombre: 'Croissant mantequilla', cantidad: 496, ventas: 892.80 }
    ],
    usosPorHora: [
      { hora: 7, usos: 12 },
      { hora: 8, usos: 45 },
      { hora: 9, usos: 58 },
      { hora: 10, usos: 42 },
      { hora: 11, usos: 28 },
      { hora: 12, usos: 15 },
      { hora: 13, usos: 8 },
      { hora: 14, usos: 6 },
      { hora: 15, usos: 10 },
      { hora: 16, usos: 14 },
      { hora: 17, usos: 8 },
      { hora: 18, usos: 2 }
    ]
  },
  {
    promocionId: 'PROMO-002',
    promocionNombre: '20% en Bollería',
    tipo: 'descuento_porcentaje',
    vecesUsada: 412,
    clientesUnicos: 298,
    pedidosTotales: 412,
    ventasTotales: 2478.40,
    ventasSinDescuento: 3098.00,
    descuentoOtorgado: 619.60,
    costeTotalProductos: 991.36,
    margenBruto: 1487.04,
    margenPorcentaje: 60.0,
    roi: 139.9, // ROI positivo
    impresiones: 2145,
    clics: 785,
    conversiones: 412,
    tasaConversion: 19.2,
    fechaInicio: '2025-11-15',
    fechaFin: '2025-11-29',
    diasActiva: 14,
    ventasPorDia: 177.03,
    usosPorDia: 29.4,
    productosTop: [
      { productoId: 'PROD-007', nombre: 'Croissant mantequilla', cantidad: 245, ventas: 1234.80 },
      { productoId: 'PROD-008', nombre: 'Napolitana chocolate', cantidad: 198, ventas: 742.32 },
      { productoId: 'PROD-009', nombre: 'Magdalena', cantidad: 165, ventas: 501.28 }
    ],
    usosPorHora: [
      { hora: 7, usos: 18 },
      { hora: 8, usos: 62 },
      { hora: 9, usos: 78 },
      { hora: 10, usos: 65 },
      { hora: 11, usos: 48 },
      { hora: 12, usos: 32 },
      { hora: 13, usos: 22 },
      { hora: 14, usos: 18 },
      { hora: 15, usos: 24 },
      { hora: 16, usos: 28 },
      { hora: 17, usos: 15 },
      { hora: 18, usos: 2 }
  ]
  },
  {
    promocionId: 'PROMO-009',
    promocionNombre: '3x2 en Magdalenas',
    tipo: '3x2',
    vecesUsada: 156,
    clientesUnicos: 124,
    pedidosTotales: 156,
    ventasTotales: 561.60,
    ventasSinDescuento: 842.40,
    descuentoOtorgado: 280.80,
    costeTotalProductos: 224.64,
    margenBruto: 336.96,
    margenPorcentaje: 60.0,
    roi: 19.8, // ROI positivo pero bajo
    impresiones: 945,
    clics: 298,
    conversiones: 156,
    tasaConversion: 16.5,
    fechaInicio: '2025-11-15',
    fechaFin: '2025-11-29',
    diasActiva: 14,
    ventasPorDia: 40.11,
    usosPorDia: 11.1,
    productosTop: [
      { productoId: 'PROD-009', nombre: 'Magdalena', cantidad: 468, ventas: 561.60 }
    ],
    usosPorHora: [
      { hora: 7, usos: 8 },
      { hora: 8, usos: 22 },
      { hora: 9, usos: 28 },
      { hora: 10, usos: 24 },
      { hora: 11, usos: 18 },
      { hora: 12, usos: 14 },
      { hora: 13, usos: 10 },
      { hora: 14, usos: 8 },
      { hora: 15, usos: 10 },
      { hora: 16, usos: 12 },
      { hora: 17, usos: 2 },
      { hora: 18, usos: 0 }
    ]
  },
  {
    promocionId: 'PROMO-COMBO-001',
    promocionNombre: 'Pack Croissants Familiares',
    tipo: 'combo_pack',
    vecesUsada: 89,
    clientesUnicos: 78,
    pedidosTotales: 89,
    ventasTotales: 1068.00,
    ventasSinDescuento: 1424.00,
    descuentoOtorgado: 356.00,
    costeTotalProductos: 427.20,
    margenBruto: 640.80,
    margenPorcentaje: 60.0,
    roi: 79.9, // ROI positivo
    impresiones: 678,
    clics: 178,
    conversiones: 89,
    tasaConversion: 13.1,
    fechaInicio: '2025-11-22',
    fechaFin: '2025-12-06',
    diasActiva: 7,
    ventasPorDia: 152.57,
    usosPorDia: 12.7,
    productosTop: [
      { productoId: 'PROD-007', nombre: 'Croissant mantequilla', cantidad: 356, ventas: 640.80 },
      { productoId: 'PROD-008', nombre: 'Napolitana chocolate', cantidad: 356, ventas: 427.20 }
    ],
    usosPorHora: [
      { hora: 7, usos: 4 },
      { hora: 8, usos: 12 },
      { hora: 9, usos: 18 },
      { hora: 10, usos: 15 },
      { hora: 11, usos: 12 },
      { hora: 12, usos: 10 },
      { hora: 13, usos: 6 },
      { hora: 14, usos: 4 },
      { hora: 15, usos: 4 },
      { hora: 16, usos: 3 },
      { hora: 17, usos: 1 },
      { hora: 18, usos: 0 }
    ]
  },
  {
    promocionId: 'PROMO-HORARIO-001',
    promocionNombre: 'Happy Hour Coffee',
    tipo: 'combo_pack',
    vecesUsada: 324,
    clientesUnicos: 256,
    pedidosTotales: 324,
    ventasTotales: 810.00,
    ventasSinDescuento: 1134.00,
    descuentoOtorgado: 324.00,
    costeTotalProductos: 324.00,
    margenBruto: 486.00,
    margenPorcentaje: 60.0,
    roi: 50.0, // ROI positivo
    impresiones: 1875,
    clics: 645,
    conversiones: 324,
    tasaConversion: 17.3,
    fechaInicio: '2025-11-01',
    fechaFin: '2025-11-30',
    diasActiva: 29,
    ventasPorDia: 27.93,
    usosPorDia: 11.2,
    productosTop: [
      { productoId: 'PROD-001', nombre: 'Café espresso', cantidad: 324, ventas: 324.00 },
      { productoId: 'PROD-007', nombre: 'Croissant mantequilla', cantidad: 324, ventas: 486.00 }
    ],
    usosPorHora: [
      { hora: 8, usos: 145 },
      { hora: 9, usos: 142 },
      { hora: 10, usos: 37 },
      { hora: 11, usos: 0 },
      { hora: 12, usos: 0 },
      { hora: 13, usos: 0 },
      { hora: 14, usos: 0 },
      { hora: 15, usos: 0 },
      { hora: 16, usos: 0 },
      { hora: 17, usos: 0 },
      { hora: 18, usos: 0 }
    ]
  }
];

// Tendencia temporal (últimos 14 días)
export const tendenciaTemporal: TendenciaTemporal[] = [
  { fecha: '2025-11-15', ventas: 285.40, usos: 48, descuentos: 98.20, margen: 171.24 },
  { fecha: '2025-11-16', ventas: 312.80, usos: 52, descuentos: 105.40, margen: 187.68 },
  { fecha: '2025-11-17', ventas: 298.60, usos: 51, descuentos: 102.80, margen: 179.16 },
  { fecha: '2025-11-18', ventas: 405.20, usos: 68, descuentos: 142.60, margen: 243.12 },
  { fecha: '2025-11-19', ventas: 428.40, usos: 72, descuentos: 151.20, margen: 257.04 },
  { fecha: '2025-11-20', ventas: 392.80, usos: 65, descuentos: 136.40, margen: 235.68 },
  { fecha: '2025-11-21', ventas: 378.60, usos: 63, descuentos: 128.80, margen: 227.16 },
  { fecha: '2025-11-22', ventas: 445.20, usos: 74, descuentos: 158.60, margen: 267.12 },
  { fecha: '2025-11-23', ventas: 512.80, usos: 86, descuentos: 182.40, margen: 307.68 },
  { fecha: '2025-11-24', ventas: 498.60, usos: 83, descuentos: 175.20, margen: 299.16 },
  { fecha: '2025-11-25', ventas: 485.20, usos: 81, descuentos: 168.60, margen: 291.12 },
  { fecha: '2025-11-26', ventas: 458.40, usos: 76, descuentos: 159.40, margen: 275.04 },
  { fecha: '2025-11-27', ventas: 472.80, usos: 79, descuentos: 164.20, margen: 283.68 },
  { fecha: '2025-11-28', ventas: 495.20, usos: 82, descuentos: 171.80, margen: 297.12 },
  { fecha: '2025-11-29', ventas: 512.40, usos: 85, descuentos: 178.20, margen: 307.44 }
];

// Análisis por horario (heatmap)
export const analisisHorario: AnalisisHorario[] = [
  { hora: 7, horaLabel: '07:00', usos: 42, ventas: 98.40, conversion: 15.2 },
  { hora: 8, horaLabel: '08:00', usos: 284, ventas: 782.40, conversion: 22.4 },
  { hora: 9, horaLabel: '09:00', usos: 322, ventas: 895.20, conversion: 24.8 },
  { hora: 10, horaLabel: '10:00', usos: 186, ventas: 512.80, conversion: 19.6 },
  { hora: 11, horaLabel: '11:00', usos: 106, ventas: 298.40, conversion: 16.8 },
  { hora: 12, horaLabel: '12:00', usos: 71, ventas: 195.20, conversion: 14.2 },
  { hora: 13, horaLabel: '13:00', usos: 46, ventas: 128.60, conversion: 12.4 },
  { hora: 14, horaLabel: '14:00', usos: 36, ventas: 98.80, conversion: 11.8 },
  { hora: 15, horaLabel: '15:00', usos: 48, ventas: 132.40, conversion: 13.6 },
  { hora: 16, horaLabel: '16:00', usos: 57, ventas: 158.20, conversion: 14.8 },
  { hora: 17, horaLabel: '17:00', usos: 26, ventas: 72.80, conversion: 10.4 },
  { hora: 18, horaLabel: '18:00', usos: 5, ventas: 14.20, conversion: 8.2 }
];

// Análisis por segmento de cliente
export const analisisPorSegmento: SegmentoCliente[] = [
  { segmento: 'Premium', clientes: 87, usos: 342, ventasPromedio: 18.45, tasaRetencion: 78.2 },
  { segmento: 'Alta Frecuencia', clientes: 203, usos: 645, ventasPromedio: 14.20, tasaRetencion: 65.4 },
  { segmento: 'General', clientes: 450, usos: 892, ventasPromedio: 8.75, tasaRetencion: 42.8 },
  { segmento: 'Nuevo', clientes: 125, usos: 178, ventasPromedio: 12.30, tasaRetencion: 28.6 }
];

// Comparativa entre promociones
export const comparativaPromociones: ComparativaPromocion[] = metricasPromociones.map(m => ({
  promocionId: m.promocionId,
  nombre: m.promocionNombre,
  ventas: m.ventasTotales,
  usos: m.vecesUsada,
  roi: m.roi,
  conversion: m.tasaConversion,
  margen: m.margenPorcentaje
}));

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export const obtenerTopPromociones = (cantidad: number = 5): MetricaPromocion[] => {
  return [...metricasPromociones]
    .sort((a, b) => b.ventasTotales - a.ventasTotales)
    .slice(0, cantidad);
};

export const obtenerPromocionesROIPositivo = (): MetricaPromocion[] => {
  return metricasPromociones.filter(m => m.roi > 0);
};

export const obtenerPromocionesROINegativo = (): MetricaPromocion[] => {
  return metricasPromociones.filter(m => m.roi <= 0);
};

export const calcularPromedios = () => {
  const total = metricasPromociones.length;
  
  return {
    roiPromedio: metricasPromociones.reduce((sum, m) => sum + m.roi, 0) / total,
    conversionPromedio: metricasPromociones.reduce((sum, m) => sum + m.tasaConversion, 0) / total,
    margenPromedio: metricasPromociones.reduce((sum, m) => sum + m.margenPorcentaje, 0) / total,
    ventasPromedio: metricasPromociones.reduce((sum, m) => sum + m.ventasTotales, 0) / total,
    usosPromedio: metricasPromociones.reduce((sum, m) => sum + m.vecesUsada, 0) / total
  };
};

export const calcularTotales = () => {
  return {
    ventasTotales: metricasPromociones.reduce((sum, m) => sum + m.ventasTotales, 0),
    descuentosTotales: metricasPromociones.reduce((sum, m) => sum + m.descuentoOtorgado, 0),
    margenTotal: metricasPromociones.reduce((sum, m) => sum + m.margenBruto, 0),
    usosTotales: metricasPromociones.reduce((sum, m) => sum + m.vecesUsada, 0),
    clientesUnicos: metricasPromociones.reduce((sum, m) => sum + m.clientesUnicos, 0)
  };
};

export const obtenerMejorHorario = (): AnalisisHorario => {
  return analisisHorario.reduce((mejor, actual) => 
    actual.usos > mejor.usos ? actual : mejor
  );
};

export const obtenerMejorSegmento = (): SegmentoCliente => {
  return analisisPorSegmento.reduce((mejor, actual) => 
    actual.ventasPromedio > mejor.ventasPromedio ? actual : mejor
  );
};

export const calcularCrecimiento = (): number => {
  if (tendenciaTemporal.length < 2) return 0;
  const primera = tendenciaTemporal[0].ventas;
  const ultima = tendenciaTemporal[tendenciaTemporal.length - 1].ventas;
  return ((ultima - primera) / primera) * 100;
};
