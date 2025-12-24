// Tipos para operaciones de caja TPV 360

export type TipoOperacionCaja = 
  | 'apertura' 
  | 'arqueo' 
  | 'cierre' 
  | 'retirada' 
  | 'consumo_propio' 
  | 'devolucion';

export interface OperacionCaja {
  operacion_id: string;
  tipo_operacion: TipoOperacionCaja;
  empresa_id: string;
  punto_venta_id: string;
  usuario_id: string;
  nombre_usuario: string;
  fecha_hora: Date;
  importe_efectivo: number;
  importe_tarjeta: number;
  saldo_caja_teorico: number;
  saldo_caja_real: number;
  diferencia: number;
  observaciones: string;
}

export interface EstadoCaja {
  caja_abierta: boolean;
  ultima_apertura: OperacionCaja | null;
  ultimo_cierre: OperacionCaja | null;
  ultimo_arqueo: OperacionCaja | null;
  saldo_actual_teorico: number;
  saldo_actual_real: number;
  diferencia_acumulada: number;
  operaciones_del_turno: OperacionCaja[];
  requiere_atencion: boolean; // Si hay diferencias significativas
}

export const EVENTO_OPERACION_CAJA = 'OPERACION_CAJA_REGISTRADA';

// Helper para crear ID único
export const generarOperacionId = (): string => {
  return `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper para emitir evento
export const emitirOperacionCaja = (operacion: OperacionCaja) => {
  const event = new CustomEvent(EVENTO_OPERACION_CAJA, {
    detail: operacion
  });
  window.dispatchEvent(event);
  console.log('📊 Operación de caja registrada:', operacion);
};
