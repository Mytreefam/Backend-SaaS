// Archivo temporal para datos EBITDA - será integrado al Dashboard360

export const datosFinancieros = [
  // INGRESOS NETOS
  { tipo: 'header', concepto: 'INGRESOS NETOS', subconcepto: '', importe: null },
  { tipo: 'detalle', concepto: '', subconcepto: 'Ingresos por ventas en mostrador', importe: 180000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Ingresos por pedidos online propios', importe: 90000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Ingresos por terceros (apps de delivery)', importe: 30000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Otros ingresos (eventos, alquiler de sala, etc.)', importe: 5000 },
  { tipo: 'total', concepto: 'TOTAL INGRESOS NETOS', subconcepto: 'Suma ingresos', importe: 305000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // COSTE DE VENTAS
  { tipo: 'header', concepto: 'COSTE DE VENTAS', subconcepto: '', importe: null },
  { tipo: 'detalle', concepto: '', subconcepto: 'Materias primas alimentación (pan, bollería, etc.)', importe: 70000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Bebidas y complementos', importe: 18000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Envases y embalajes', importe: 9000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Mermas y roturas', importe: 15000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Consumos internos (productos para personal, etc.)', importe: 10000 },
  { tipo: 'total', concepto: 'TOTAL COSTE DE VENTAS', subconcepto: 'Suma costes de ventas', importe: 122000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // MARGEN BRUTO
  { tipo: 'resultado', concepto: 'MARGEN BRUTO', subconcepto: 'Ingresos netos – Coste de ventas', importe: 183000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // GASTOS OPERATIVOS
  { tipo: 'header', concepto: 'GASTOS OPERATIVOS', subconcepto: '', importe: null },
  { tipo: 'detalle', concepto: '', subconcepto: 'Personal (sueldos + Seguridad Social)', importe: 90000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Alquiler del local', importe: 18000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Suministros (luz, agua, gas)', importe: 8000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Limpieza e higiene', importe: 4000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Marketing y publicidad', importe: 3000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Transporte y reparto', importe: 5000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Comisiones TPV / pasarela de pago', importe: 4000 },
  { tipo: 'total', concepto: 'TOTAL GASTOS OPERATIVOS', subconcepto: 'Suma gastos operativos', importe: 132000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // EBITDA
  { tipo: 'resultado', concepto: 'EBITDA', subconcepto: 'Margen bruto – Gastos operativos', importe: 51000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // COSTES ESTRUCTURALES
  { tipo: 'header', concepto: 'COSTES ESTRUCTURALES', subconcepto: '', importe: null },
  { tipo: 'detalle', concepto: '', subconcepto: 'Asesoría contable y laboral', importe: 6000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Software y licencias (ERP, TPV, etc.)', importe: 4000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Seguros (RC, multirriesgo, etc.)', importe: 3000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Telefonía e internet', importe: 2000 },
  { tipo: 'detalle', concepto: '', subconcepto: 'Gastos bancarios', importe: 2000 },
  { tipo: 'total', concepto: 'TOTAL COSTES ESTRUCT.', subconcepto: 'Suma costes estructurales', importe: 17000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // BAI
  { tipo: 'resultado', concepto: 'BAI', subconcepto: 'EBITDA – Costes estructurales', importe: 34000 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // IMPUESTO SOCIEDADES
  { tipo: 'header', concepto: 'IMPUESTO SOCIEDADES', subconcepto: '25% aprox. sobre BAI', importe: -8500 },
  { tipo: 'separador', concepto: '', subconcepto: '', importe: null },
  
  // BENEFICIO NETO
  { tipo: 'resultado', concepto: 'BENEFICIO NETO', subconcepto: 'BAI – Impuesto de sociedades', importe: 25500 },
];

export const formatEuro = (valor: number | null) => {
  if (valor === null) return '';
  const esNegativo = valor < 0;
  const absoluto = Math.abs(valor);
  return `${esNegativo ? '–' : ''}${absoluto.toLocaleString('es-ES')} €`;
};
