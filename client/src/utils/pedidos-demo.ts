/**
 * 🎭 DATOS DE DEMOSTRACIÓN - PEDIDOS
 * 
 * Genera pedidos de ejemplo para probar el sistema de cambio de estados
 */

import { 
  crearPedido, 
  crearPedidoTPV,
  crearPedidoExterno,
  type Pedido 
} from '../services/pedidos.service';

/**
 * Genera pedidos de demostración para testing
 */
export function generarPedidosDemo() {
  // Limpiar pedidos existentes (opcional)
  // limpiarPedidos();

  const puntoVentaId = 'PDV-TIANA';
  const puntoVentaNombre = 'Tiana';
  const marcaId = 'MRC-001';
  const marcaNombre = 'Modomio';
  const empresaId = 'EMP-001';
  const empresaNombre = 'Disarmink S.L.';

  // ===== PEDIDO 1: App - Pagado - Listo para iniciar preparación =====
  crearPedido({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    clienteId: 'CLI-001',
    clienteNombre: 'María García',
    clienteEmail: 'maria@example.com',
    clienteTelefono: '+34 654 321 098',
    clienteDireccion: 'Calle Mayor 123, 08391 Tiana',
    items: [
      {
        productoId: 'PROD-001',
        nombre: 'Hamburguesa Clásica',
        cantidad: 2,
        precio: 12.50,
        opciones: {
          tipo: 'Con queso',
          complementos: ['Bacon', 'Cebolla caramelizada']
        }
      },
      {
        productoId: 'PROD-002',
        nombre: 'Patatas Fritas',
        cantidad: 1,
        precio: 4.50,
      },
      {
        productoId: 'PROD-003',
        nombre: 'Coca-Cola',
        cantidad: 2,
        precio: 2.50,
      }
    ],
    subtotal: 34.50,
    descuento: 0,
    iva: 3.45,
    total: 37.95,
    metodoPago: 'tarjeta',
    tipoEntrega: 'domicilio',
    observaciones: 'Sin cebolla en una hamburguesa por favor'
  });

  // ===== PEDIDO 2: TPV - Efectivo - Pendiente de cobro =====
  crearPedidoTPV({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    tpvId: 'TPV-001',
    cajeroId: 'TRABAJADOR-001',
    clienteNombre: 'Cliente en local',
    clienteTelefono: '',
    items: [
      {
        productoId: 'PROD-004',
        nombre: 'Menú del Día',
        cantidad: 1,
        precio: 15.00,
      }
    ],
    subtotal: 15.00,
    descuento: 0,
    iva: 1.50,
    total: 16.50,
    metodoPago: 'efectivo',
    observaciones: 'Para llevar'
  });

  // ===== PEDIDO 3: Glovo - En preparación =====
  const pedidoGlovo = crearPedidoExterno({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    plataforma: 'glovo',
    pedidoExternoId: 'GLOVO-789456',
    comisionPlataforma: 4.50,
    clienteNombre: 'Carlos Ruiz',
    clienteTelefono: '+34 600 111 222',
    clienteDireccion: 'Av. Barcelona 45, 08391 Tiana',
    items: [
      {
        productoId: 'PROD-005',
        nombre: 'Pizza Margarita',
        cantidad: 1,
        precio: 11.00,
      },
      {
        productoId: 'PROD-006',
        nombre: 'Pizza 4 Quesos',
        cantidad: 1,
        precio: 13.50,
      },
      {
        productoId: 'PROD-007',
        nombre: 'Ensalada César',
        cantidad: 1,
        precio: 7.50,
      }
    ],
    subtotal: 32.00,
    descuento: 0,
    iva: 3.20,
    total: 35.20,
    tiempoEstimadoRecogida: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    observaciones: 'Rider llegará en 15 minutos'
  });

  // Marcar este como en preparación
  import('../services/pedidos.service').then(({ marcarEnPreparacion }) => {
    marcarEnPreparacion(pedidoGlovo.id, 'TRABAJADOR-002');
  });

  // ===== PEDIDO 4: App - Listo para entregar =====
  const pedidoListo = crearPedido({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    clienteId: 'CLI-002',
    clienteNombre: 'Laura Martínez',
    clienteEmail: 'laura@example.com',
    clienteTelefono: '+34 622 333 444',
    clienteDireccion: 'Calle Sol 78, 08391 Tiana',
    items: [
      {
        productoId: 'PROD-008',
        nombre: 'Sushi Variado (20 piezas)',
        cantidad: 1,
        precio: 24.00,
      },
      {
        productoId: 'PROD-009',
        nombre: 'Edamame',
        cantidad: 1,
        precio: 4.50,
      }
    ],
    subtotal: 28.50,
    descuento: 2.85,
    cuponAplicado: 'DESCUENTO10',
    iva: 2.57,
    total: 28.22,
    metodoPago: 'tarjeta',
    tipoEntrega: 'domicilio',
    observaciones: 'Sin wasabi'
  });

  // Marcar como en preparación y luego listo
  import('../services/pedidos.service').then(({ marcarEnPreparacion, marcarComoListo }) => {
    marcarEnPreparacion(pedidoListo.id, 'TRABAJADOR-002');
    setTimeout(() => {
      marcarComoListo(pedidoListo.id, 'TRABAJADOR-002');
    }, 100);
  });

  // ===== PEDIDO 5: Just Eat - Recién llegado =====
  crearPedidoExterno({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    plataforma: 'justeat',
    pedidoExternoId: 'JUSTEAT-456789',
    comisionPlataforma: 3.80,
    clienteNombre: 'Jorge López',
    clienteTelefono: '+34 611 222 333',
    clienteDireccion: 'Calle Luna 12, 08391 Tiana',
    items: [
      {
        productoId: 'PROD-010',
        nombre: 'Pollo al Curry',
        cantidad: 1,
        precio: 13.50,
      },
      {
        productoId: 'PROD-011',
        nombre: 'Arroz Basmati',
        cantidad: 2,
        precio: 3.50,
      },
      {
        productoId: 'PROD-012',
        nombre: 'Naan',
        cantidad: 2,
        precio: 2.00,
      }
    ],
    subtotal: 24.50,
    descuento: 0,
    iva: 2.45,
    total: 26.95,
    observaciones: 'Extra picante'
  });

  // ===== PEDIDO 6: App - Para recogida en local =====
  crearPedido({
    empresaId,
    empresaNombre,
    marcaId,
    marcaNombre,
    puntoVentaId,
    puntoVentaNombre,
    clienteId: 'CLI-003',
    clienteNombre: 'Roberto Sánchez',
    clienteEmail: 'roberto@example.com',
    clienteTelefono: '+34 633 444 555',
    items: [
      {
        productoId: 'PROD-013',
        nombre: 'Bocadillo de Jamón',
        cantidad: 2,
        precio: 5.50,
      },
      {
        productoId: 'PROD-014',
        nombre: 'Café con Leche',
        cantidad: 2,
        precio: 1.80,
      }
    ],
    subtotal: 14.60,
    descuento: 0,
    iva: 1.46,
    total: 16.06,
    metodoPago: 'bizum',
    tipoEntrega: 'recogida',
    observaciones: 'Recogeré en 10 minutos'
  });

  console.log('✅ 6 pedidos de demostración generados exitosamente');
  console.log('📊 Estados:');
  console.log('  - 3 pedidos pagados (listos para iniciar preparación)');
  console.log('  - 1 pedido en preparación (Glovo)');
  console.log('  - 1 pedido listo (esperando entrega)');
  console.log('  - 1 pedido pendiente de cobro (efectivo)');
}

/**
 * Limpiar y regenerar pedidos demo
 */
export function resetPedidosDemo() {
  import('../services/pedidos.service').then(({ limpiarPedidos }) => {
    limpiarPedidos();
    console.log('🧹 Pedidos limpiados');
    
    setTimeout(() => {
      generarPedidosDemo();
    }, 100);
  });
}
