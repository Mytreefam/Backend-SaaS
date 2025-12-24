/**
 * CONFIGURACIÓN CENTRALIZADA DE EMPRESA
 * ======================================
 * 
 * IMPORTANTE: Este archivo es la fuente única de verdad para:
 * - Información de empresas
 * - Marcas disponibles (lee desde localStorage 'udar_marcas_sistema')
 * - Puntos de venta (PDV)
 * - Relaciones jerárquicas: Empresa → Marcas → PDVs
 * 
 * ⭐ SISTEMA DE MARCAS MADRE:
 * Las marcas se crean desde Gerente → Empresas → Crear/Editar Empresa
 * y se almacenan en localStorage como única fuente de verdad.
 * 
 * USAR EN: Todos los filtros, cálculos, visualizaciones y componentes
 * 
 * MÓDULOS QUE DEBEN USAR ESTA CONFIG:
 * - Ventas, Cierres, EBITDA
 * - Clientes, Facturación
 * - Productos, Promociones
 * - Equipo y RRHH
 * - Stock y Proveedores
 * - Operativa, Chat y Soporte
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface Marca {
  id: string;
  codigo: string;
  nombre: string;
  colorIdentidad: string;
  icono?: string;
  logoUrl?: string; // URL o base64 del logo de la marca
  logo?: string; // Alias de logoUrl
  empresaId?: string;
  empresaNombre?: string;
  activo?: boolean;
  fechaCreacion?: string;
}

export interface PuntoVenta {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  telefono: string;
  email: string;
  marcasDisponibles: string[]; // IDs de marcas
  empresaId: string;
  activo: boolean;
}

export interface Empresa {
  id: string;
  codigo: string;
  nombreFiscal: string;
  nombreComercial: string;
  cif: string;
  domicilioFiscal: string;
  marcasIds: string[]; // IDs de marcas que pertenecen a esta empresa
  puntosVentaIds: string[]; // IDs de PDVs que pertenecen a esta empresa
  activo: boolean;
}

// ============================================
// DATOS MAESTROS
// ============================================

/**
 * MARCAS POR DEFECTO (Fallback si localStorage está vacío)
 */
const MARCAS_DEFAULT: Record<string, Marca> = {
  'MRC-001': {
    id: 'MRC-001',
    codigo: 'MODOMIO',
    nombre: 'Modomio',
    colorIdentidad: '#FF6B35',
    icono: '🍕',
    logoUrl: 'figma:asset/b966ced4dfea1f56e5df241d7888d0c365c0e242.png', // Logo circular con gorro de chef y bigote
    empresaId: 'EMP-001',
    activo: true
  },
  'MRC-002': {
    id: 'MRC-002',
    codigo: 'BLACKBURGUER',
    nombre: 'Blackburguer',
    colorIdentidad: '#1A1A1A',
    icono: '🍔',
    logoUrl: 'figma:asset/38810c4050d91b450da46794e58e881817083739.png', // Logo con hamburguesa y texto BLACK BURGUERR
    empresaId: 'EMP-001',
    activo: true
  }
};

/**
 * FUNCIÓN PARA CARGAR MARCAS DESDE LOCALSTORAGE
 * ⭐ Sistema de Marcas MADRE - Lee desde 'udar_marcas_sistema'
 */
function cargarMarcasDesdeLocalStorage(): Record<string, Marca> {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log('📦 No hay localStorage disponible, usando marcas por defecto');
    return MARCAS_DEFAULT;
  }

  try {
    const marcasJSON = localStorage.getItem('udar_marcas_sistema');
    if (!marcasJSON) {
      console.log('📦 No hay marcas en localStorage, usando marcas por defecto');
      return MARCAS_DEFAULT;
    }

    const marcasArray: Marca[] = JSON.parse(marcasJSON);
    const marcasRecord: Record<string, Marca> = {};
    
    marcasArray.forEach(marca => {
      // Normalizar el objeto marca para asegurar compatibilidad
      marcasRecord[marca.id] = {
        id: marca.id,
        codigo: marca.codigo,
        nombre: marca.nombre,
        colorIdentidad: marca.colorIdentidad || (marca as any).color || '#0d9488',
        icono: marca.icono,
        logoUrl: marca.logoUrl || marca.logo || '',
        logo: marca.logo || marca.logoUrl || '',
        empresaId: marca.empresaId,
        empresaNombre: marca.empresaNombre,
        activo: marca.activo !== false,
        fechaCreacion: marca.fechaCreacion
      };
    });

    console.log('✅ Marcas cargadas desde localStorage:', marcasRecord);
    return Object.keys(marcasRecord).length > 0 ? marcasRecord : MARCAS_DEFAULT;
  } catch (error) {
    console.error('❌ Error al cargar marcas desde localStorage:', error);
    return MARCAS_DEFAULT;
  }
}

/**
 * MARCAS DISPONIBLES EN EL SISTEMA
 * ⭐ Se cargan dinámicamente desde localStorage
 */
export let MARCAS: Record<string, Marca> = typeof window !== 'undefined' 
  ? cargarMarcasDesdeLocalStorage() 
  : MARCAS_DEFAULT;

/**
 * FUNCIÓN PARA RECARGAR MARCAS
 * Se debe llamar cuando se actualicen las marcas en el sistema
 */
export function recargarMarcas() {
  MARCAS = cargarMarcasDesdeLocalStorage();
  console.log('🔄 Marcas recargadas:', MARCAS);
}

// Escuchar eventos de actualización de marcas
if (typeof window !== 'undefined') {
  window.addEventListener('marcas-sistema-updated', () => {
    recargarMarcas();
  });
}

/**
 * PUNTOS DE VENTA DISPONIBLES EN EL SISTEMA
 */
export const PUNTOS_VENTA: Record<string, PuntoVenta> = {
  'PDV-TIANA': {
    id: 'PDV-TIANA',
    codigo: 'PDV-TIANA',
    nombre: 'Tiana',
    direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
    coordenadas: {
      latitud: 41.4933,
      longitud: 2.2633
    },
    telefono: '+34 933 456 789',
    email: 'tiana@hoypecamos.com',
    marcasDisponibles: ['MRC-001', 'MRC-002'],
    empresaId: 'EMP-001',
    activo: true
  },
  'PDV-BADALONA': {
    id: 'PDV-BADALONA',
    codigo: 'PDV-BADALONA',
    nombre: 'Badalona',
    direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
    coordenadas: {
      latitud: 41.4500,
      longitud: 2.2461
    },
    telefono: '+34 933 456 790',
    email: 'badalona@hoypecamos.com',
    marcasDisponibles: ['MRC-001', 'MRC-002'],
    empresaId: 'EMP-001',
    activo: true
  }
};

/**
 * EMPRESAS DISPONIBLES EN EL SISTEMA
 */
export const EMPRESAS: Record<string, Empresa> = {
  'EMP-001': {
    id: 'EMP-001',
    codigo: 'DISARMINK',
    nombreFiscal: 'Disarmink S.L.',
    nombreComercial: 'Hoy Pecamos',
    cif: 'B67284315',
    domicilioFiscal: 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona',
    marcasIds: ['MRC-001', 'MRC-002'],
    puntosVentaIds: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  }
};

// ============================================
// FUNCIONES AUXILIARES PARA FILTROS
// ============================================

/**
 * Obtiene el nombre completo de la empresa para visualización
 * @param empresaId ID de la empresa
 * @returns "{nombreFiscal} - {nombreComercial}"
 * @example "Disarmink S.L. - Hoy Pecamos"
 */
export function getNombreEmpresa(empresaId: string): string {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) {
    // Fallback: mostrar el ID de la empresa como referencia para debugging
    console.warn(`Empresa no encontrada en config: ${empresaId}`);
    return empresaId || 'Sin empresa';
  }
  return `${empresa.nombreFiscal} - ${empresa.nombreComercial}`;
}

/**
 * Obtiene el nombre completo del PDV con sus marcas para visualización
 * @param pdvId ID del punto de venta
 * @returns "{nombrePDV} - {marca1}, {marca2}"
 * @example "Tiana - Modomio, Blackburguer"
 */
export function getNombrePDVConMarcas(pdvId: string): string {
  const pdv = PUNTOS_VENTA[pdvId];
  if (!pdv) return 'PDV no encontrado';
  
  const marcasNombres = pdv.marcasDisponibles
    .map(marcaId => MARCAS[marcaId]?.nombre)
    .filter(Boolean)
    .join(', ');
  
  if (marcasNombres) {
    return `${pdv.nombre} - ${marcasNombres}`;
  }
  return pdv.nombre;
}

/**
 * Obtiene solo el nombre del PDV
 * @param pdvId ID del punto de venta
 * @returns Nombre del PDV
 * @example "Tiana"
 */
export function getNombrePDV(pdvId: string): string {
  const pdv = PUNTOS_VENTA[pdvId];
  return pdv?.nombre || 'PDV no encontrado';
}

/**
 * Obtiene el nombre de la marca
 * @param marcaId ID de la marca
 * @returns Nombre de la marca
 * @example "Modomio"
 */
export function getNombreMarca(marcaId: string): string {
  const marca = MARCAS[marcaId];
  if (!marca) {
    console.warn(`Marca no encontrada en config: ${marcaId}`);
    return marcaId || 'Sin marca';
  }
  return marca.nombre;
}

/**
 * Obtiene todas las marcas de una empresa
 * @param empresaId ID de la empresa
 * @returns Array de objetos Marca
 */
export function getMarcasEmpresa(empresaId: string): Marca[] {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) return [];
  return empresa.marcasIds.map(id => MARCAS[id]).filter(Boolean);
}

/**
 * Obtiene todos los PDVs de una empresa
 * @param empresaId ID de la empresa
 * @returns Array de objetos PuntoVenta
 */
export function getPDVsEmpresa(empresaId: string): PuntoVenta[] {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) return [];
  return empresa.puntosVentaIds.map(id => PUNTOS_VENTA[id]).filter(Boolean);
}

/**
 * Obtiene todos los PDVs que tienen una marca específica
 * @param marcaId ID de la marca
 * @returns Array de objetos PuntoVenta
 */
export function getPDVsPorMarca(marcaId: string): PuntoVenta[] {
  return Object.values(PUNTOS_VENTA).filter(pdv => 
    pdv.marcasDisponibles.includes(marcaId)
  );
}

/**
 * Obtiene el icono de una marca
 * @param marcaId ID de la marca
 * @returns Emoji del icono
 */
export function getIconoMarca(marcaId: string): string {
  const marca = MARCAS[marcaId];
  return marca?.icono || '🏪';
}

// ============================================
// ARRAYS PARA SELECT/DROPDOWN
// ============================================

/**
 * Array de todas las empresas para usar en selects
 */
export const EMPRESAS_ARRAY = Object.values(EMPRESAS);

/**
 * Obtiene array de todas las marcas (siempre actualizado)
 * @returns Array de objetos Marca
 */
export function getMarcasArray(): Marca[] {
  return Object.values(MARCAS);
}

/**
 * Array de todas las marcas para usar en selects
 * ⭐ IMPORTANTE: Usar getMarcasArray() para obtener datos actualizados
 * Este export se mantiene por compatibilidad pero puede estar desactualizado
 */
export const MARCAS_ARRAY = Object.values(MARCAS);

/**
 * Array de todos los PDVs para usar en selects
 */
export const PUNTOS_VENTA_ARRAY = Object.values(PUNTOS_VENTA);

// ============================================
// CONFIGURACIÓN DE FILTROS GLOBALES
// ============================================

/**
 * Opciones para filtros de empresa
 */
export const OPCIONES_FILTRO_EMPRESA = EMPRESAS_ARRAY.map(emp => ({
  value: emp.id,
  label: getNombreEmpresa(emp.id),
  empresaId: emp.id
}));

/**
 * Opciones para filtros de PDV
 */
export const OPCIONES_FILTRO_PDV = PUNTOS_VENTA_ARRAY.map(pdv => ({
  value: pdv.id,
  label: getNombrePDVConMarcas(pdv.id),
  pdvId: pdv.id,
  empresaId: pdv.empresaId
}));

/**
 * Obtiene opciones de filtro de marca (siempre actualizado)
 * @returns Array de opciones para filtros
 */
export function getOpcionesFiltroMarca() {
  return Object.values(MARCAS).map(marca => ({
    value: marca.id,
    label: marca.nombre,
    marcaId: marca.id,
    icono: marca.icono
  }));
}

/**
 * Opciones para filtros de marca
 * ⭐ IMPORTANTE: Usar getOpcionesFiltroMarca() para datos actualizados
 * Este export se mantiene por compatibilidad pero puede estar desactualizado
 */
export const OPCIONES_FILTRO_MARCA = MARCAS_ARRAY.map(marca => ({
  value: marca.id,
  label: marca.nombre,
  marcaId: marca.id,
  icono: marca.icono
}));