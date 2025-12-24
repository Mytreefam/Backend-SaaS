/**
 * HELPER PARA GESTIÓN DE MARCAS MADRE
 * ====================================
 * Sistema centralizado para gestionar marcas en localStorage
 * Las marcas se crean desde Gerente → Empresas y se almacenan como única fuente de verdad
 */

export interface MarcaSistema {
  id: string;
  codigo: string;
  nombre: string;
  color?: string;
  colorIdentidad?: string;
  logo?: string;
  logoUrl?: string;
  icono?: string;
  empresaId?: string;
  empresaNombre?: string;
  activo?: boolean;
  fechaCreacion?: string;
}

const LOCALSTORAGE_KEY = 'udar_marcas_sistema';

/**
 * INICIALIZAR MARCAS POR DEFECTO
 * Se ejecuta al cargar la aplicación si no hay marcas
 */
export function inicializarMarcasDefault() {
  const marcasExistentes = localStorage.getItem(LOCALSTORAGE_KEY);
  
  if (!marcasExistentes) {
    const marcasDefault: MarcaSistema[] = [
      {
        id: 'MRC-001',
        codigo: 'MODOMIO',
        nombre: 'Modomio',
        colorIdentidad: '#FF6B35',
        icono: '🍕',
        logoUrl: 'figma:asset/b966ced4dfea1f56e5df241d7888d0c365c0e242.png', // Logo circular con gorro de chef y bigote
        empresaId: 'EMP-001',
        empresaNombre: 'Hoy Pecamos',
        activo: true,
        fechaCreacion: new Date().toISOString()
      },
      {
        id: 'MRC-002',
        codigo: 'BLACKBURGUER',
        nombre: 'Blackburguer',
        colorIdentidad: '#1A1A1A',
        icono: '🍔',
        logoUrl: 'figma:asset/38810c4050d91b450da46794e58e881817083739.png', // Logo con hamburguesa y texto BLACK BURGUERR
        empresaId: 'EMP-001',
        empresaNombre: 'Hoy Pecamos',
        activo: true,
        fechaCreacion: new Date().toISOString()
      }
    ];
    
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(marcasDefault));
    console.log('✅ Marcas por defecto inicializadas');
    return marcasDefault;
  }
  
  return JSON.parse(marcasExistentes);
}

/**
 * OBTENER TODAS LAS MARCAS
 */
export function obtenerMarcas(): MarcaSistema[] {
  try {
    const marcasJSON = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!marcasJSON) {
      return inicializarMarcasDefault();
    }
    return JSON.parse(marcasJSON);
  } catch (error) {
    console.error('❌ Error al obtener marcas:', error);
    return [];
  }
}

/**
 * GUARDAR O ACTUALIZAR UNA MARCA
 */
export function guardarMarca(marca: MarcaSistema): boolean {
  try {
    const marcas = obtenerMarcas();
    const index = marcas.findIndex(m => m.id === marca.id || m.codigo === marca.codigo);
    
    if (index >= 0) {
      // Actualizar marca existente
      marcas[index] = { ...marcas[index], ...marca };
      console.log(`✅ Marca ${marca.nombre} actualizada`);
    } else {
      // Añadir nueva marca
      marca.fechaCreacion = marca.fechaCreacion || new Date().toISOString();
      marcas.push(marca);
      console.log(`✅ Marca ${marca.nombre} añadida`);
    }
    
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(marcas));
    
    // Disparar evento para actualizar componentes
    window.dispatchEvent(new CustomEvent('marcas-sistema-updated'));
    
    return true;
  } catch (error) {
    console.error('❌ Error al guardar marca:', error);
    return false;
  }
}

/**
 * GUARDAR MÚLTIPLES MARCAS (desde crear empresa)
 */
export function guardarMarcasMultiples(marcas: MarcaSistema[]): boolean {
  try {
    const marcasExistentes = obtenerMarcas();
    
    marcas.forEach(nuevaMarca => {
      const index = marcasExistentes.findIndex(
        m => m.id === nuevaMarca.id || m.codigo === nuevaMarca.codigo
      );
      
      if (index >= 0) {
        marcasExistentes[index] = { ...marcasExistentes[index], ...nuevaMarca };
      } else {
        nuevaMarca.fechaCreacion = nuevaMarca.fechaCreacion || new Date().toISOString();
        marcasExistentes.push(nuevaMarca);
      }
    });
    
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(marcasExistentes));
    window.dispatchEvent(new CustomEvent('marcas-sistema-updated'));
    
    console.log(`✅ ${marcas.length} marcas guardadas`);
    return true;
  } catch (error) {
    console.error('❌ Error al guardar marcas múltiples:', error);
    return false;
  }
}

/**
 * ELIMINAR UNA MARCA
 */
export function eliminarMarca(marcaId: string): boolean {
  try {
    const marcas = obtenerMarcas();
    const marcasFiltradas = marcas.filter(m => m.id !== marcaId && m.codigo !== marcaId);
    
    if (marcas.length === marcasFiltradas.length) {
      console.warn('⚠️ Marca no encontrada');
      return false;
    }
    
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(marcasFiltradas));
    window.dispatchEvent(new CustomEvent('marcas-sistema-updated'));
    
    console.log('✅ Marca eliminada');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar marca:', error);
    return false;
  }
}

/**
 * OBTENER MARCAS POR EMPRESA
 */
export function obtenerMarcasPorEmpresa(empresaId: string): MarcaSistema[] {
  const marcas = obtenerMarcas();
  return marcas.filter(m => m.empresaId === empresaId);
}