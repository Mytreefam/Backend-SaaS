/**
 * EJEMPLO DE USO RÁPIDO - VERIFACTU
 * 
 * Este archivo muestra cómo integrar VeriFactu en tu aplicación
 * Copia estos ejemplos en tus componentes existentes
 */

import verifactuService from './services/verifactu.service';
import { FacturaVeriFactu } from './types/verifactu.types';
import { toast } from 'sonner@2.0.3';

// ============================================
// EJEMPLO 1: GENERAR VERIFACTU DESDE PEDIDO
// ============================================

/**
 * Convierte un pedido en una factura VeriFactu
 */
async function generarFacturaDesdeProducto(pedido: any) {
  // 1. Crear estructura de factura
  const factura: FacturaVeriFactu = {
    // IDENTIFICACIÓN
    id: `FAC-${Date.now()}`,
    serie: '2025',
    numero: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    numeroCompleto: '', // Se llenará abajo
    
    // FECHAS
    fechaExpedicion: new Date(),
    horaExpedicion: new Date().toTimeString().split(' ')[0],
    
    // TIPO
    tipoFactura: 'F1',
    tipoOperacion: 'venta',
    facturaSimplificada: false,
    facturaSinDestinatario: false,
    
    // EMISOR (tu empresa)
    emisor: {
      nif: 'B12345678', // ⚠️ CAMBIAR POR TU NIF REAL
      razonSocial: 'Udar Edge S.L.', // ⚠️ CAMBIAR POR TU RAZÓN SOCIAL
      direccion: {
        tipoVia: 'Calle',
        nombreVia: 'Gran Vía',
        numeroFinca: '45',
        codigoPostal: '28013',
        municipio: 'Madrid',
        provincia: 'Madrid',
        codigoPais: 'ES',
      },
    },
    
    // RECEPTOR (cliente)
    receptor: pedido.cliente ? {
      tipoIdentificador: 'NIF',
      numeroIdentificador: pedido.cliente.nif || 'CONSUMIDOR',
      razonSocial: pedido.cliente.nombre,
      codigoPais: 'ES',
    } : undefined,
    
    // LÍNEAS (productos del pedido)
    lineas: pedido.lineas.map((linea: any, index: number) => ({
      numeroLinea: index + 1,
      descripcion: linea.producto.nombre,
      cantidad: linea.cantidad,
      unidad: 'ud',
      precioUnitario: linea.precioUnitario,
      descuento: linea.descuento || 0,
      tipoIVA: linea.tipoIVA || 21,
      importeIVA: linea.importeIVA,
      baseImponible: linea.baseImponible,
      importeTotal: linea.importeTotal,
    })),
    
    // DESGLOSE IVA
    desgloseIVA: calcularDesgloseIVA(pedido.lineas),
    
    // TOTALES
    baseImponibleTotal: pedido.baseImponible,
    cuotaIVATotal: pedido.iva,
    importeTotal: pedido.total,
  };
  
  factura.numeroCompleto = `${factura.serie}/${factura.numero}`;
  
  // 2. Generar VeriFactu
  try {
    const facturaConVeriFactu = await verifactuService.generarVeriFactu(factura);
    
    toast.success('Factura VeriFactu generada', {
      description: `Factura ${facturaConVeriFactu.numeroCompleto} lista`,
    });
    
    return facturaConVeriFactu;
    
  } catch (error) {
    toast.error('Error generando VeriFactu');
    throw error;
  }
}

// ============================================
// EJEMPLO 2: ENVIAR A AEAT
// ============================================

async function enviarFacturaAAEAT(factura: FacturaVeriFactu) {
  try {
    // Validar que tenga VeriFactu generado
    if (!factura.verifactu) {
      toast.error('La factura no tiene VeriFactu generado');
      return;
    }
    
    // Enviar
    const resultado = await verifactuService.enviarAEAT(factura);
    
    if (resultado.exito) {
      toast.success('Factura registrada en AEAT', {
        description: `CSV: ${factura.verifactu.csvEnvio}`,
      });
      
      // Aquí podrías guardar en Supabase
      // await guardarEnSupabase(factura);
      
      return true;
    } else {
      toast.error('Factura rechazada por AEAT', {
        description: resultado.mensaje,
      });
      return false;
    }
    
  } catch (error) {
    toast.error('Error al enviar a AEAT');
    return false;
  }
}

// ============================================
// EJEMPLO 3: DESCARGAR QR
// ============================================

function descargarCodigoQR(factura: FacturaVeriFactu) {
  if (!factura.verifactu?.codigoQR) {
    toast.error('No hay código QR disponible');
    return;
  }
  
  // Crear enlace de descarga
  const link = document.createElement('a');
  link.href = factura.verifactu.codigoQR;
  link.download = `QR-Factura-${factura.numeroCompleto}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Código QR descargado');
}

// ============================================
// EJEMPLO 4: FLUJO COMPLETO
// ============================================

/**
 * Flujo completo: Pedido → Factura → VeriFactu → AEAT → Guardar
 */
async function procesoCompletoFacturacion(pedido: any) {
  try {
    // 1. Generar factura VeriFactu
    console.log('1. Generando factura VeriFactu...');
    const factura = await generarFacturaDesdeProducto(pedido);
    
    // 2. Mostrar QR al usuario
    console.log('2. QR generado:', factura.verifactu?.codigoQR.substring(0, 50) + '...');
    
    // 3. Enviar a AEAT
    console.log('3. Enviando a AEAT...');
    const enviado = await enviarFacturaAAEAT(factura);
    
    if (enviado) {
      // 4. Guardar en base de datos
      console.log('4. Guardando en base de datos...');
      // await guardarEnSupabase(factura);
      
      // 5. Enviar email al cliente
      console.log('5. Enviando email al cliente...');
      // await enviarEmailFactura(factura);
      
      toast.success('Proceso completado', {
        description: 'Factura generada, enviada y guardada correctamente',
      });
      
      return factura;
    }
    
  } catch (error) {
    console.error('Error en el proceso:', error);
    toast.error('Error en el proceso de facturación');
    throw error;
  }
}

// ============================================
// EJEMPLO 5: CONSULTAR ESTADÍSTICAS
// ============================================

function mostrarEstadisticas() {
  const stats = verifactuService.obtenerEstadisticas();
  
  console.log('=== ESTADÍSTICAS VERIFACTU ===');
  console.log('Total facturas:', stats.totalFacturas);
  console.log('Facturas firmadas:', stats.facturasFirmadas);
  console.log('Facturas enviadas:', stats.facturasEnviadas);
  console.log('Facturas validadas:', stats.facturasValidadas);
  console.log('Facturas rechazadas:', stats.facturasRechazadas);
  
  if (stats.ultimaFactura) {
    console.log('\nÚltima factura:');
    console.log('- ID:', stats.ultimaFactura);
    console.log('- Hash:', stats.ultimoHash?.substring(0, 16) + '...');
    console.log('- Fecha:', stats.fechaUltimaFactura);
  }
}

// ============================================
// EJEMPLO 6: INTEGRACIÓN CON BOTÓN UI
// ============================================

/**
 * Ejemplo de componente con botón para generar VeriFactu
 */
function BotonGenerarVeriFactu({ pedido }: { pedido: any }) {
  const [loading, setLoading] = React.useState(false);
  
  const handleGenerar = async () => {
    setLoading(true);
    try {
      await procesoCompletoFacturacion(pedido);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleGenerar}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {loading ? 'Generando...' : 'Generar Factura VeriFactu'}
    </button>
  );
}

// ============================================
// EJEMPLO 7: VALIDAR ANTES DE GENERAR
// ============================================

function validarDatosParaVeriFactu(pedido: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  // Validar importe
  if (!pedido.total || pedido.total <= 0) {
    errores.push('El importe total debe ser mayor a 0');
  }
  
  // Validar líneas
  if (!pedido.lineas || pedido.lineas.length === 0) {
    errores.push('El pedido debe tener al menos una línea');
  }
  
  // Validar cliente (si es factura no simplificada)
  if (pedido.requiereFactura && !pedido.cliente?.nif) {
    errores.push('Se requiere NIF del cliente para factura completa');
  }
  
  return {
    valido: errores.length === 0,
    errores,
  };
}

// ============================================
// UTILIDADES
// ============================================

function calcularDesgloseIVA(lineas: any[]) {
  const desglosePorTipo: { [key: number]: { base: number; cuota: number } } = {};
  
  lineas.forEach((linea) => {
    const tipoIVA = linea.tipoIVA || 21;
    
    if (!desglosePorTipo[tipoIVA]) {
      desglosePorTipo[tipoIVA] = { base: 0, cuota: 0 };
    }
    
    desglosePorTipo[tipoIVA].base += linea.baseImponible;
    desglosePorTipo[tipoIVA].cuota += linea.importeIVA;
  });
  
  return Object.entries(desglosePorTipo).map(([tipo, valores]) => ({
    tipoIVA: Number(tipo),
    baseImponible: valores.base,
    cuotaIVA: valores.cuota,
  }));
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

export {
  generarFacturaDesdeProducto,
  enviarFacturaAAEAT,
  descargarCodigoQR,
  procesoCompletoFacturacion,
  mostrarEstadisticas,
  validarDatosParaVeriFactu,
  BotonGenerarVeriFactu,
};

// ============================================
// EJEMPLO DE USO EN COMPONENTE REAL
// ============================================

/*

// En tu componente de pedidos:

import { procesoCompletoFacturacion } from './EJEMPLO_USO_VERIFACTU';

function ComponentePedidos() {
  const [pedidos, setPedidos] = useState([]);
  
  const handleFacturar = async (pedido) => {
    try {
      const factura = await procesoCompletoFacturacion(pedido);
      
      // Actualizar estado del pedido
      setPedidos(prev => prev.map(p => 
        p.id === pedido.id 
          ? { ...p, facturado: true, facturaId: factura.id }
          : p
      ));
      
    } catch (error) {
      console.error('Error facturando:', error);
    }
  };
  
  return (
    <div>
      {pedidos.map(pedido => (
        <div key={pedido.id}>
          <span>{pedido.numeroCompleto}</span>
          <button onClick={() => handleFacturar(pedido)}>
            Facturar
          </button>
        </div>
      ))}
    </div>
  );
}

*/

// ============================================
// TESTING EN CONSOLA
// ============================================

/*

// Para probar en la consola del navegador:

// 1. Importa el servicio
import verifactuService from './services/verifactu.service';

// 2. Crea una factura de prueba
const facturaPrueba = {
  id: 'TEST-001',
  serie: '2025',
  numero: '001',
  numeroCompleto: '2025/001',
  fechaExpedicion: new Date(),
  horaExpedicion: new Date().toTimeString().split(' ')[0],
  tipoFactura: 'F1',
  tipoOperacion: 'venta',
  facturaSimplificada: false,
  facturaSinDestinatario: false,
  emisor: {
    nif: 'B12345678',
    razonSocial: 'Test S.L.',
    direccion: {
      tipoVia: 'Calle',
      nombreVia: 'Test',
      numeroFinca: '1',
      codigoPostal: '28001',
      municipio: 'Madrid',
      provincia: 'Madrid',
      codigoPais: 'ES',
    },
  },
  lineas: [
    {
      numeroLinea: 1,
      descripcion: 'Producto Test',
      cantidad: 1,
      unidad: 'ud',
      precioUnitario: 10,
      descuento: 0,
      tipoIVA: 21,
      importeIVA: 2.1,
      baseImponible: 10,
      importeTotal: 12.1,
    },
  ],
  desgloseIVA: [
    {
      tipoIVA: 21,
      baseImponible: 10,
      cuotaIVA: 2.1,
    },
  ],
  baseImponibleTotal: 10,
  cuotaIVATotal: 2.1,
  importeTotal: 12.1,
};

// 3. Generar VeriFactu
const resultado = await verifactuService.generarVeriFactu(facturaPrueba);

// 4. Ver resultado
console.log('Hash:', resultado.verifactu?.hash);
console.log('QR:', resultado.verifactu?.codigoQR);
console.log('URL:', resultado.verifactu?.urlQR);

// 5. Ver estadísticas
console.log(verifactuService.obtenerEstadisticas());

*/
