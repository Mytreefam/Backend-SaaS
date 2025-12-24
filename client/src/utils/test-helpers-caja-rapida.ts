/**
 * 🧪 UTILIDADES DE TESTING - CAJA RÁPIDA TPV
 * 
 * Funciones helper para probar las mejoras implementadas
 * en el sistema "Ya estoy aquí"
 */

import { crearPedido, validarGeolocalizacion } from '../services/pedidos.service';
import type { CrearPedidoParams } from '../services/pedidos.service';

/**
 * Crear pedido de prueba con geolocalización validada
 */
export const crearPedidoPruebaConGeo = (params: {
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  total: number;
  pagado?: boolean;
}): string => {
  const pedidoParams: CrearPedidoParams = {
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    
    clienteId: `CLI-TEST-${Date.now()}`,
    clienteNombre: params.clienteNombre,
    clienteEmail: params.clienteEmail || 'test@ejemplo.com',
    clienteTelefono: params.clienteTelefono,
    
    items: [
      {
        productoId: 'prod-test-001',
        nombre: 'Producto de Prueba',
        cantidad: 1,
        precio: params.total,
        subtotal: params.total,
        imagen: '',
        observaciones: 'Pedido de prueba'
      }
    ],
    
    subtotal: params.total,
    descuento: 0,
    iva: params.total * 0.10,
    total: params.total * 1.10,
    
    metodoPago: params.pagado ? 'tarjeta' : 'efectivo',
    tipoEntrega: 'recogida'
  };

  const pedido = crearPedido(pedidoParams);
  
  // Validar geolocalización automáticamente
  validarGeolocalizacion(pedido.id);
  
  console.log(`✅ Pedido de prueba creado: ${pedido.id}`);
  console.log(`   Cliente: ${params.clienteNombre}`);
  console.log(`   Geolocalización: VALIDADA`);
  
  return pedido.id;
};

/**
 * Simular llegada de múltiples clientes
 */
export const simularLlegadaMultiple = (cantidad: number = 3): string[] => {
  const pedidosIds: string[] = [];
  const nombres = [
    'María García', 'Carlos López', 'Ana Martínez', 'Pedro Ruiz',
    'Laura Sánchez', 'José Torres', 'Carmen Díaz', 'Miguel Romero'
  ];
  const telefonos = [
    '678123456', '645987321', '612345678', '698765432',
    '687654321', '634567890', '621098765', '656789012'
  ];

  for (let i = 0; i < cantidad; i++) {
    const nombre = nombres[i % nombres.length];
    const telefono = telefonos[i % telefonos.length];
    const total = Math.floor(Math.random() * 50) + 10; // Entre 10€ y 60€
    const pagado = Math.random() > 0.5;

    const pedidoId = crearPedidoPruebaConGeo({
      clienteNombre: `${nombre} (${i + 1})`,
      clienteTelefono: telefono,
      total,
      pagado
    });

    pedidosIds.push(pedidoId);

    // Esperar un poco entre creaciones para simular llegadas escalonadas
    if (i < cantidad - 1) {
      const delay = Math.random() * 2000 + 500; // 0.5-2.5 segundos
      new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.log(`🎯 ${cantidad} clientes simulados con geolocalización validada`);
  return pedidosIds;
};

/**
 * Simular llegada de cliente con retraso
 */
export const simularLlegadaConRetraso = (segundos: number, params: {
  clienteNombre: string;
  clienteTelefono: string;
  total: number;
  pagado?: boolean;
}): Promise<string> => {
  return new Promise((resolve) => {
    console.log(`⏰ Cliente ${params.clienteNombre} llegará en ${segundos} segundos...`);
    
    setTimeout(() => {
      const pedidoId = crearPedidoPruebaConGeo(params);
      console.log(`✅ Cliente ${params.clienteNombre} ha llegado!`);
      resolve(pedidoId);
    }, segundos * 1000);
  });
};

/**
 * Limpiar pedidos de prueba
 */
export const limpiarPedidosPrueba = (): void => {
  try {
    const pedidos = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
    const pedidosLimpios = pedidos.filter((p: any) => 
      !p.cliente.id.includes('CLI-TEST')
    );
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidosLimpios));
    console.log('🧹 Pedidos de prueba eliminados');
  } catch (error) {
    console.error('Error al limpiar pedidos de prueba:', error);
  }
};

/**
 * Obtener estadísticas de clientes presentes
 */
export const obtenerEstadisticasClientesPresentes = () => {
  try {
    const pedidos = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
    const clientesPresentes = pedidos.filter((p: any) => 
      p.geolocalizacionValidada && 
      p.origenPedido === 'app' &&
      !['entregado', 'cancelado'].includes(p.estado)
    );

    const tiemposEspera = clientesPresentes
      .filter((p: any) => p.fechaGeolocalizacion)
      .map((p: any) => {
        const tiempo = Date.now() - new Date(p.fechaGeolocalizacion).getTime();
        return Math.floor(tiempo / 60000); // en minutos
      });

    const tiempoPromedio = tiemposEspera.length > 0
      ? tiemposEspera.reduce((a: number, b: number) => a + b, 0) / tiemposEspera.length
      : 0;

    const stats = {
      total: clientesPresentes.length,
      pagados: clientesPresentes.filter((p: any) => p.estadoPago === 'pagado').length,
      pendientes: clientesPresentes.filter((p: any) => p.estadoPago !== 'pagado').length,
      tiempoPromedioMinutos: Math.round(tiempoPromedio),
      tiempoMaximoMinutos: tiemposEspera.length > 0 ? Math.max(...tiemposEspera) : 0,
      tiempoMinimoMinutos: tiemposEspera.length > 0 ? Math.min(...tiemposEspera) : 0
    };

    console.log('📊 Estadísticas de Clientes Presentes:');
    console.table(stats);

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

/**
 * Simular escenario completo de prueba
 */
export const simularEscenarioCompleto = async () => {
  console.log('🎬 Iniciando escenario de prueba completo...\n');

  // 1. Limpiar datos previos
  console.log('1️⃣ Limpiando datos previos...');
  limpiarPedidosPrueba();

  // 2. Crear 2 clientes que ya están presentes
  console.log('\n2️⃣ Simulando 2 clientes que ya llegaron...');
  crearPedidoPruebaConGeo({
    clienteNombre: 'María García',
    clienteTelefono: '678123456',
    total: 25.50,
    pagado: true
  });

  crearPedidoPruebaConGeo({
    clienteNombre: 'Carlos López',
    clienteTelefono: '645987321',
    total: 15.00,
    pagado: false
  });

  // 3. Simular llegada de cliente en 5 segundos
  console.log('\n3️⃣ Programando llegada de cliente en 5 segundos...');
  simularLlegadaConRetraso(5, {
    clienteNombre: 'Ana Martínez',
    clienteTelefono: '612345678',
    total: 30.00,
    pagado: true
  });

  // 4. Simular llegada de cliente en 10 segundos
  console.log('\n4️⃣ Programando llegada de cliente en 10 segundos...');
  simularLlegadaConRetraso(10, {
    clienteNombre: 'Pedro Ruiz',
    clienteTelefono: '698765432',
    total: 18.50,
    pagado: false
  });

  console.log('\n✅ Escenario configurado. Observa la Caja Rápida para ver:');
  console.log('   - Ordenamiento automático');
  console.log('   - Contador de clientes presentes (empezará en 2, luego 3, luego 4)');
  console.log('   - Sonido de alerta al llegar nuevos clientes');
  console.log('   - Tiempo de espera promedio calculándose');
  console.log('\n⏰ Espera las llegadas programadas...');
};

/**
 * Exportar para uso en consola del navegador
 */
if (typeof window !== 'undefined') {
  (window as any).testCajaRapida = {
    crearPedidoPruebaConGeo,
    simularLlegadaMultiple,
    simularLlegadaConRetraso,
    limpiarPedidosPrueba,
    obtenerEstadisticasClientesPresentes,
    simularEscenarioCompleto
  };

  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║  🧪 TEST HELPERS - CAJA RÁPIDA TPV                        ║
  ╠════════════════════════════════════════════════════════════╣
  ║  Usa en la consola del navegador:                          ║
  ║                                                            ║
  ║  testCajaRapida.simularEscenarioCompleto()                ║
  ║  testCajaRapida.simularLlegadaMultiple(5)                 ║
  ║  testCajaRapida.obtenerEstadisticasClientesPresentes()    ║
  ║  testCajaRapida.limpiarPedidosPrueba()                    ║
  ╚════════════════════════════════════════════════════════════╝
  `);
}
