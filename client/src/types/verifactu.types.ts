/**
 * TIPOS Y INTERFACES VERIFACTU
 * Sistema de verificación de facturas según normativa AEAT española
 * Actualizado: Noviembre 2025
 */

// ============================================
// TIPOS BÁSICOS
// ============================================

export type TipoFactura = 'F1' | 'F2' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
export type TipoOperacion = 'venta' | 'devolucion' | 'rectificativa' | 'simplificada';
export type EstadoVeriFactu = 'pendiente' | 'firmada' | 'enviada' | 'validada' | 'rechazada' | 'error';
export type TipoHash = 'SHA-256' | 'SHA-384' | 'SHA-512';
export type AlgoritmoFirma = 'RSA-SHA256' | 'ECDSA-SHA256';

// ============================================
// DATOS DEL EMISOR (EMPRESA)
// ============================================

export interface EmisorVeriFactu {
  nif: string;                    // NIF/CIF de la empresa
  razonSocial: string;            // Nombre legal de la empresa
  nombreComercial?: string;       // Nombre comercial
  direccion: DireccionFiscal;     // Dirección fiscal completa
  codigoCAE?: string;             // Código de Actividad Económica (CNAE)
  regimenEspecial?: string;       // Régimen especial si aplica
}

export interface DireccionFiscal {
  tipoVia: string;                // Calle, Avenida, Plaza, etc.
  nombreVia: string;              // Nombre de la vía
  numeroFinca: string;            // Número
  piso?: string;                  // Piso (opcional)
  puerta?: string;                // Puerta (opcional)
  codigoPostal: string;           // Código postal
  municipio: string;              // Municipio
  provincia: string;              // Provincia
  codigoPais: string;             // ES, FR, etc.
}

// ============================================
// DATOS DEL RECEPTOR (CLIENTE)
// ============================================

export interface ReceptorVeriFactu {
  tipoIdentificador: 'NIF' | 'NIE' | 'Pasaporte' | 'Otro' | 'SinIdentificar';
  numeroIdentificador?: string;   // NIF/NIE/Pasaporte
  razonSocial?: string;           // Nombre o razón social
  codigoPais?: string;            // País del cliente (ES, FR, etc.)
  direccion?: DireccionCliente;   // Dirección (opcional para facturas simplificadas)
}

export interface DireccionCliente {
  direccion: string;              // Dirección completa
  codigoPostal?: string;          // Código postal
  municipio?: string;             // Municipio
  provincia?: string;             // Provincia
  codigoPais: string;             // ES, FR, etc.
}

// ============================================
// LÍNEAS DE FACTURA
// ============================================

export interface LineaFacturaVeriFactu {
  numeroLinea: number;            // Número de línea (1, 2, 3...)
  descripcion: string;            // Descripción del producto/servicio
  cantidad: number;               // Cantidad
  unidad: string;                 // Unidad de medida (ud, kg, l, etc.)
  precioUnitario: number;         // Precio unitario SIN IVA
  descuento: number;              // % de descuento (0-100)
  tipoIVA: number;                // % IVA (0, 4, 10, 21, etc.)
  importeIVA: number;             // Importe del IVA
  baseImponible: number;          // Base imponible (cantidad * precio - descuento)
  importeTotal: number;           // Total de la línea (base + IVA)
  recargoEquivalencia?: number;   // Recargo de equivalencia si aplica
}

// ============================================
// DESGLOSE DE IMPUESTOS
// ============================================

export interface DesgloseIVA {
  tipoIVA: number;                // % IVA (0, 4, 10, 21)
  baseImponible: number;          // Base imponible
  cuotaIVA: number;               // Cuota de IVA
  tipoRecargoEquivalencia?: number; // % recargo equivalencia
  cuotaRecargoEquivalencia?: number; // Cuota recargo
}

// ============================================
// DATOS DE COBRO
// ============================================

export interface DatosCobro {
  medioCobro: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'pagaré' | 'otros';
  importe: number;                // Importe cobrado
  fecha: Date;                    // Fecha del cobro
  cuenta?: string;                // Cuenta bancaria (IBAN)
  referencia?: string;            // Referencia de la transacción
}

// ============================================
// FACTURA COMPLETA VERIFACTU
// ============================================

export interface FacturaVeriFactu {
  // IDENTIFICACIÓN
  id: string;                     // ID interno
  serie: string;                  // Serie de la factura (2025, A, B, etc.)
  numero: string;                 // Número de factura
  numeroCompleto: string;         // Serie + Número (ej: 2025/001)
  
  // FECHAS
  fechaExpedicion: Date;          // Fecha de expedición
  fechaOperacion?: Date;          // Fecha de operación (si es diferente)
  horaExpedicion: string;         // Hora de expedición (HH:MM:SS)
  
  // TIPO Y ESTADO
  tipoFactura: TipoFactura;       // Tipo según normativa
  tipoOperacion: TipoOperacion;   // Tipo de operación
  facturaSimplificada: boolean;   // ¿Es factura simplificada?
  facturaSinDestinatario: boolean; // ¿Factura sin destinatario identificado?
  
  // PARTES
  emisor: EmisorVeriFactu;        // Datos del emisor
  receptor?: ReceptorVeriFactu;   // Datos del receptor (opcional en simplificadas)
  
  // LÍNEAS Y TOTALES
  lineas: LineaFacturaVeriFactu[]; // Líneas de la factura
  desgloseIVA: DesgloseIVA[];     // Desglose por tipos de IVA
  baseImponibleTotal: number;     // Total base imponible
  cuotaIVATotal: number;          // Total IVA
  importeTotal: number;           // Total factura (base + IVA)
  
  // COBRO
  datosCobro?: DatosCobro;        // Datos del cobro (si ya está cobrada)
  
  // DATOS ADICIONALES
  descripcionOperacion?: string;  // Descripción general
  referenciaExterna?: string;     // Referencia externa (nº pedido, etc.)
  observaciones?: string;         // Observaciones
  
  // FACTURA RECTIFICATIVA
  facturaRectificada?: string;    // ID de la factura que rectifica
  motivoRectificacion?: string;   // Motivo de la rectificación
  
  // VERIFACTU
  verifactu?: DatosVeriFactu;     // Datos de VeriFactu (se generan después)
}

// ============================================
// DATOS VERIFACTU (FIRMA Y HASH)
// ============================================

export interface DatosVeriFactu {
  // IDENTIFICADOR ÚNICO
  idVeriFactu: string;            // ID único VeriFactu
  
  // HASH Y FIRMA
  hash: string;                   // Hash de la factura (SHA-256)
  algoritmoHash: TipoHash;        // Algoritmo de hash usado
  firma?: string;                 // Firma electrónica (opcional)
  algoritmoFirma?: AlgoritmoFirma; // Algoritmo de firma
  
  // ENCADENAMIENTO
  hashFacturaAnterior?: string;   // Hash de la factura anterior (cadena)
  
  // QR
  codigoQR: string;               // Código QR en formato PNG base64
  urlQR: string;                  // URL de verificación
  
  // REGISTRO
  fechaRegistro: Date;            // Fecha de registro
  numeroRegistro?: string;        // Número de registro AEAT
  
  // ESTADO
  estado: EstadoVeriFactu;        // Estado actual
  
  // ENVÍO A AEAT
  fechaEnvio?: Date;              // Fecha de envío a AEAT
  csvEnvio?: string;              // CSV de envío
  respuestaAEAT?: RespuestaAEAT;  // Respuesta de la AEAT
}

// ============================================
// RESPUESTA DE LA AEAT
// ============================================

export interface RespuestaAEAT {
  codigo: string;                 // Código de respuesta
  descripcion: string;            // Descripción
  aceptada: boolean;              // ¿Factura aceptada?
  errores?: ErrorAEAT[];          // Errores si los hay
  csv?: string;                   // CSV de respuesta
  fechaProceso: Date;             // Fecha de procesamiento
}

export interface ErrorAEAT {
  codigo: string;                 // Código del error
  descripcion: string;            // Descripción del error
  campo?: string;                 // Campo que causó el error
  gravedad: 'error' | 'aviso';    // Gravedad
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

export interface ConfiguracionVeriFactu {
  // EMPRESA
  nifEmpresa: string;             // NIF de la empresa
  nombreSistemaInformatico: string; // Nombre del sistema (ej: "Udar Edge v1.0")
  versionSistema: string;         // Versión del sistema
  
  // CERTIFICADO
  certificado?: CertificadoDigital; // Certificado digital (opcional)
  
  // CONFIGURACIÓN TÉCNICA
  algoritmoHash: TipoHash;        // Algoritmo de hash a usar
  algoritmoFirma?: AlgoritmoFirma; // Algoritmo de firma
  urlBase: string;                // URL base para QR (ej: https://verifactu.agenciatributaria.gob.es)
  
  // SERIES
  seriesPorDefecto: {
    [key: string]: string;        // Series por tipo de factura
  };
  
  // MODO
  modoProduccion: boolean;        // true = Producción, false = Pruebas
  
  // ENCADENAMIENTO
  ultimoHash?: string;            // Hash de la última factura (para encadenar)
}

// ============================================
// CERTIFICADO DIGITAL
// ============================================

export interface CertificadoDigital {
  archivo: ArrayBuffer;           // Archivo del certificado (.p12, .pfx)
  password: string;               // Contraseña del certificado
  emisor: string;                 // Emisor del certificado
  titular: string;                // Titular del certificado
  fechaInicio: Date;              // Fecha de inicio de validez
  fechaFin: Date;                 // Fecha de fin de validez
  valido: boolean;                // ¿Certificado válido?
}

// ============================================
// RESULTADO DE OPERACIONES
// ============================================

export interface ResultadoVeriFactu {
  exito: boolean;                 // ¿Operación exitosa?
  mensaje: string;                // Mensaje descriptivo
  datos?: any;                    // Datos adicionales
  errores?: string[];             // Lista de errores
}

// ============================================
// LOGS Y AUDITORÍA
// ============================================

export interface LogVeriFactu {
  id: string;                     // ID del log
  fecha: Date;                    // Fecha y hora
  accion: 'generar' | 'firmar' | 'enviar' | 'validar' | 'error'; // Acción realizada
  facturaId: string;              // ID de la factura
  usuario?: string;               // Usuario que realizó la acción
  detalles: string;               // Detalles de la operación
  resultado: 'exito' | 'error';   // Resultado
  datosAdicionales?: any;         // Datos adicionales
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface EstadisticasVeriFactu {
  totalFacturas: number;          // Total de facturas
  facturasFirmadas: number;       // Facturas firmadas
  facturasEnviadas: number;       // Facturas enviadas a AEAT
  facturasValidadas: number;      // Facturas validadas por AEAT
  facturasRechazadas: number;     // Facturas rechazadas
  ultimaFactura?: string;         // ID de la última factura
  ultimoHash?: string;            // Último hash generado
  fechaUltimaFactura?: Date;      // Fecha de la última factura
}
