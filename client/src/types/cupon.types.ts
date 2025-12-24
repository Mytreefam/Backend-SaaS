/**
 * 🎫 TIPOS E INTERFACES - SISTEMA DE CUPONES Y REGLAS
 * Sistema completo de cupones con generación automática por reglas
 */

// ============================================
// CUPÓN
// ============================================

export interface Cupon {
  id: string;
  codigo: string; // "VERANO2024", "BIENVENIDA10", etc.
  nombre: string; // Nombre descriptivo
  descripcion?: string;
  
  // Tipo de descuento
  tipoDescuento: 'porcentaje' | 'fijo' | 'regalo' | 'envio-gratis';
  valorDescuento: number; // % o € según tipoDescuento
  
  // Producto de regalo (si aplica)
  productoRegalo?: {
    id: string;
    nombre: string;
    cantidad: number;
  };
  
  // Restricciones
  gastoMinimo?: number; // Gasto mínimo para aplicar
  gastoMaximo?: number; // Gasto máximo para aplicar
  categoriaProductos?: string[]; // Solo aplica a ciertas categorías
  marcasAplicables?: string[]; // Solo aplica a ciertas marcas
  puntosVentaAplicables?: string[]; // Solo aplica en ciertos PDV
  
  // Límites de uso
  usosMaximos?: number; // Máximo de veces que se puede usar en total
  usosMaximosPorCliente?: number; // Máximo de veces por cliente
  usosActuales: number; // Contador de usos
  
  // Validez
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  
  // Cliente específico
  clienteEspecifico?: string; // Si es un cupón personal
  
  // Origen
  origenCreacion: 'manual' | 'regla-automatica';
  reglaGeneradoraId?: string; // ID de la regla que lo generó
  
  // Metadata
  fechaCreacion: string;
  creadoPor: string;
  ultimoUso?: string;
  
  // Estadísticas
  stats: {
    vecesUsado: number;
    clientesUnicos: number;
    totalDescuentoOtorgado: number;
  };
}

// ============================================
// REGLAS DE GENERACIÓN AUTOMÁTICA
// ============================================

export interface ReglaCupon {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoRegla;
  activa: boolean;
  
  // Condiciones según el tipo
  condiciones: CondicionesRegla;
  
  // Recompensa a generar
  recompensa: RecompensaRegla;
  
  // Configuración de Google Maps (si aplica)
  googleMaps?: ConfiguracionGoogleMaps;
  
  // Programación
  ejecutarCada?: number; // Minutos (para chequeos periódicos)
  ultimaEjecucion?: string;
  
  // Estadísticas
  stats: {
    cuponesGenerados: number;
    cuponesUsados: number;
    clientesActivos: number;
    totalDescuentoOtorgado: number;
  };
  
  // Metadata
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
}

export type TipoRegla = 
  | 'fidelizacion'      // Por número de pedidos
  | 'google-maps'       // Por review en Google Maps
  | 'primera-compra'    // Nuevo cliente
  | 'cumpleanos'        // Mes del cumpleaños
  | 'inactividad'       // Cliente inactivo X días
  | 'gasto-acumulado'   // Gasto total acumulado
  | 'personalizada';    // Regla custom

export interface CondicionesRegla {
  // Fidelización
  numeroPedidos?: number; // "Cada X pedidos"
  gastoMinimoPorPedido?: number; // "De más de Y €"
  
  // Gasto acumulado
  gastoAcumuladoTotal?: number; // "Al alcanzar X € en total"
  
  // Primera compra
  primeraCompra?: boolean;
  
  // Cumpleaños
  mesCumpleanos?: boolean;
  diasAntesCumpleanos?: number; // Generar cupón X días antes
  
  // Inactividad
  diasInactividad?: number; // "Cliente sin comprar X días"
  
  // Rango de fechas
  rangoFechas?: {
    inicio: string;
    fin: string;
  };
  
  // Marcas/PDV aplicables
  marcasAplicables?: string[];
  puntosVentaAplicables?: string[];
}

export interface RecompensaRegla {
  // Tipo de cupón a generar
  tipoDescuento: 'porcentaje' | 'fijo' | 'regalo' | 'envio-gratis';
  valor: number;
  
  // Producto de regalo (si aplica)
  productoRegalo?: {
    id: string;
    nombre: string;
    cantidad: number;
  };
  
  // Validez del cupón generado
  validezDias: number; // "El cupón expira en X días"
  
  // Restricciones del cupón
  gastoMinimo?: number;
  usosMaximos?: number;
  
  // Personalización del código
  prefijoCodigoCupon?: string; // "FIDEL-", "CUMPLE-", etc.
  
  // Notificación al cliente
  notificarCliente: boolean;
  mensajeNotificacion?: string;
}

export interface ConfiguracionGoogleMaps {
  // Credenciales API
  apiKey: string;
  placeId: string; // ID del negocio en Google Maps
  
  // Configuración de verificación
  checkIntervalHoras: number; // Cada cuántas horas verificar
  palabrasClaveRequeridas?: string[]; // Palabras que debe contener la review
  ratingMinimo?: number; // Rating mínimo (1-5 estrellas)
  
  // Estado
  ultimaVerificacion?: string;
  reviewsDetectadas: number;
}

// ============================================
// CÓDIGO ÚNICO CLIENTE (Google Maps)
// ============================================

export interface CodigoClienteGoogleMaps {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  
  // Código único
  codigo: string; // "HOYPECAMOS-CLI-12345"
  urlParaCompartir: string; // Texto pre-formateado para copiar
  qrCode?: string; // Base64 del QR (opcional)
  
  // Estado
  compartido: boolean;
  fechaCompartido?: string;
  
  // Detección
  detectado: boolean;
  fechaDeteccion?: string;
  reviewUrl?: string; // URL de la review donde se detectó
  reviewRating?: number; // Rating de la review
  reviewTexto?: string; // Extracto de la review
  
  // Cupón generado
  cuponGenerado?: string; // ID del cupón
  cuponNotificado: boolean;
  
  // Metadata
  fechaCreacion: string;
  activo: boolean;
}

// ============================================
// HISTORIAL DE USO DE CUPONES
// ============================================

export interface UsoCupon {
  id: string;
  cuponId: string;
  codigoCupon: string;
  
  // Cliente
  clienteId: string;
  clienteNombre: string;
  
  // Pedido/Venta
  pedidoId: string;
  facturaId?: string;
  
  // Descuento aplicado
  montoOriginal: number;
  montoDescuento: number;
  montoFinal: number;
  
  // Contexto
  puntoVentaId: string;
  marcaId: string;
  trabajadorId?: string; // Quien aplicó el cupón (en TPV)
  
  // Metadata
  fechaUso: string;
  canalUso: 'app-cliente' | 'tpv' | 'online';
}

// ============================================
// VALIDACIÓN DE CUPONES
// ============================================

export interface ValidacionCupon {
  valido: boolean;
  mensaje: string;
  
  // Si es válido
  cupon?: Cupon;
  descuentoAplicable?: number;
  
  // Si no es válido
  razon?: RazonInvalidez;
}

export type RazonInvalidez =
  | 'no-existe'
  | 'expirado'
  | 'inactivo'
  | 'ya-usado-max'
  | 'gasto-minimo-no-alcanzado'
  | 'cliente-no-autorizado'
  | 'categoria-no-aplicable'
  | 'marca-no-aplicable'
  | 'pdv-no-aplicable';

// ============================================
// ESTADÍSTICAS DE CUPONES
// ============================================

export interface EstadisticasCupones {
  // Totales
  totalCupones: number;
  cuponesActivos: number;
  cuponesExpirados: number;
  
  // Uso
  totalUsos: number;
  clientesUnicos: number;
  tasaConversion: number; // % de cupones usados vs generados
  
  // Financiero
  totalDescuentoOtorgado: number;
  descuentoPromedioporUso: number;
  ticketPromedioConCupon: number;
  
  // Por tipo
  usosPorTipo: {
    porcentaje: number;
    fijo: number;
    regalo: number;
    envioGratis: number;
  };
  
  // Top cupones
  cuponMasUsado: string;
  cuponMayorDescuento: string;
  
  // Reglas automáticas
  totalReglas: number;
  reglasActivas: number;
  cuponesGeneradosPorReglas: number;
}

// ============================================
// FILTROS
// ============================================

export interface FiltrosCupones {
  activo?: boolean;
  tipo?: Cupon['tipoDescuento'];
  clienteId?: string;
  marcaId?: string;
  puntoVentaId?: string;
  origen?: 'manual' | 'regla-automatica';
  busqueda?: string; // Buscar por código o nombre
}

export interface FiltrosReglas {
  activa?: boolean;
  tipo?: TipoRegla;
  marcaId?: string;
}

// ============================================
// REQUESTS/RESPONSES
// ============================================

export interface CrearCuponRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoDescuento: Cupon['tipoDescuento'];
  valorDescuento: number;
  gastoMinimo?: number;
  fechaInicio: string;
  fechaFin: string;
  usosMaximos?: number;
  usosMaximosPorCliente?: number;
  clienteEspecifico?: string;
}

export interface CrearReglaRequest {
  nombre: string;
  descripcion?: string;
  tipo: TipoRegla;
  condiciones: CondicionesRegla;
  recompensa: RecompensaRegla;
  googleMaps?: ConfiguracionGoogleMaps;
}

export interface AplicarCuponRequest {
  codigoCupon: string;
  clienteId: string;
  montoCarrito: number;
  productosCarrito: Array<{
    id: string;
    categoria?: string;
  }>;
  marcaId: string;
  puntoVentaId: string;
}

export interface AplicarCuponResponse {
  exito: boolean;
  mensaje: string;
  descuentoAplicado?: number;
  montoFinal?: number;
  cuponAplicado?: Cupon;
}
