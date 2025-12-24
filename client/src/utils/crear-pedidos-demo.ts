/**
 * 🎭 UTILIDAD: Crear Pedidos de Demostración
 * 
 * Crea pedidos de ejemplo con diferentes orígenes, estados y tipos
 * para demostrar el funcionamiento del sistema unificado.
 */

import { crearPedido, crearPedidoTPV, crearPedidoExterno } from '../services/pedidos.service';

export function crearPedidosDemo() {
  console.log('🎭 Creando pedidos de demostración...');

  // ============================================================================
  // PEDIDO 1: App - Domicilio - Pago Online (LISTO)
  // ============================================================================
  
  crearPedido({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    clienteId: 'CLI-001',
    clienteNombre: 'María García López',
    clienteEmail: 'maria.garcia@email.com',
    clienteTelefono: '+34 600 123 456',
    clienteDireccion: 'Calle Mayor 123, 4ºB, 28001 Madrid',
    items: [
      {
        id: 'item-1',
        productoId: 'PROD-001',
        nombre: 'Pizza Margarita',
        precio: 12.50,
        cantidad: 2,
        imagen: '',
        categoria: 'Pizzas',
      },
      {
        id: 'item-2',
        productoId: 'PROD-002',
        nombre: 'Coca Cola 1.5L',
        precio: 2.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Bebidas',
      },
    ],
    subtotal: 27.50,
    descuento: 0,
    iva: 2.89,
    total: 30.39,
    metodoPago: 'tarjeta',
    tipoEntrega: 'domicilio',
    observaciones: 'Piso sin ascensor, tocar al portero',
  });

  // Marcar como listo
  const pedidos1 = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  if (pedidos1.length > 0) {
    pedidos1[0].estado = 'listo';
    pedidos1[0].estadoEntrega = 'listo';
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos1));
  }

  // ============================================================================
  // PEDIDO 2: App - Domicilio - Efectivo (PENDIENTE)
  // ============================================================================
  
  crearPedido({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    clienteId: 'CLI-002',
    clienteNombre: 'Carlos Martínez Ruiz',
    clienteEmail: 'carlos.martinez@email.com',
    clienteTelefono: '+34 645 987 321',
    clienteDireccion: 'Av. Barcelona 22, 3°B, 08930 Barcelona',
    items: [
      {
        id: 'item-3',
        productoId: 'PROD-010',
        nombre: 'Hamburguesa Completa',
        precio: 9.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Hamburguesas',
      },
      {
        id: 'item-4',
        productoId: 'PROD-011',
        nombre: 'Patatas Fritas',
        precio: 3.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Acompañamientos',
      },
    ],
    subtotal: 13.00,
    descuento: 0,
    iva: 1.37,
    total: 14.37,
    metodoPago: 'efectivo',
    tipoEntrega: 'domicilio',
    observaciones: 'Llamar 5 minutos antes de llegar',
  });

  // Marcar como en preparación
  const pedidos2 = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  if (pedidos2.length > 1) {
    pedidos2[0].estado = 'en_preparacion';
    pedidos2[0].estadoEntrega = 'preparando';
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos2));
  }

  // ============================================================================
  // PEDIDO 3: TPV - Recogida Local (LISTO)
  // ============================================================================
  
  crearPedidoTPV({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tpvId: 'TPV-001',
    cajeroId: 'EMP-001',
    clienteNombre: 'Laura Sánchez',
    clienteTelefono: '+34 612 321 456',
    items: [
      {
        id: 'item-5',
        productoId: 'PROD-020',
        nombre: 'Café con Leche',
        precio: 1.80,
        cantidad: 2,
        imagen: '',
        categoria: 'Bebidas',
      },
      {
        id: 'item-6',
        productoId: 'PROD-021',
        nombre: 'Croissant',
        precio: 2.50,
        cantidad: 2,
        imagen: '',
        categoria: 'Bollería',
      },
    ],
    subtotal: 8.60,
    descuento: 0,
    iva: 0.90,
    total: 9.50,
    metodoPago: 'tarjeta',
    observaciones: 'Para llevar',
  });

  // Marcar como listo
  const pedidos3 = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  if (pedidos3.length > 2) {
    pedidos3[0].estado = 'listo';
    pedidos3[0].estadoEntrega = 'listo';
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos3));
  }

  // ============================================================================
  // PEDIDO 4: Glovo - Domicilio (EN PREPARACIÓN)
  // ============================================================================
  
  crearPedidoExterno({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    plataforma: 'glovo',
    pedidoExternoId: 'GLOVO-987654321',
    comisionPlataforma: 3.50,
    clienteNombre: 'Ana Ruiz Gómez',
    clienteTelefono: '+34 677 888 999',
    clienteDireccion: 'Passeig Marítim 45, 1°A, 08005 Barcelona',
    items: [
      {
        id: 'item-7',
        productoId: 'PROD-030',
        nombre: 'Ensalada César',
        precio: 8.90,
        cantidad: 1,
        imagen: '',
        categoria: 'Ensaladas',
      },
      {
        id: 'item-8',
        productoId: 'PROD-031',
        nombre: 'Agua Mineral',
        precio: 1.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Bebidas',
      },
    ],
    subtotal: 10.40,
    descuento: 0,
    iva: 1.09,
    total: 11.49,
    tiempoEstimadoRecogida: '15 minutos',
    observaciones: 'Sin cebolla en la ensalada',
  });

  // Marcar como en preparación
  const pedidos4 = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  if (pedidos4.length > 3) {
    pedidos4[0].estado = 'en_preparacion';
    pedidos4[0].estadoEntrega = 'preparando';
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos4));
  }

  // ============================================================================
  // PEDIDO 5: Just Eat - Domicilio (LISTO)
  // ============================================================================
  
  crearPedidoExterno({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    plataforma: 'justeat',
    pedidoExternoId: 'JUSTEAT-123456789',
    comisionPlataforma: 4.20,
    clienteNombre: 'Pedro López Fernández',
    clienteTelefono: '+34 655 444 333',
    clienteDireccion: 'Rambla Catalunya 88, 2°C, 08008 Barcelona',
    items: [
      {
        id: 'item-9',
        productoId: 'PROD-040',
        nombre: 'Paella Valenciana',
        precio: 15.90,
        cantidad: 1,
        imagen: '',
        categoria: 'Arroces',
      },
      {
        id: 'item-10',
        productoId: 'PROD-041',
        nombre: 'Sangría 1L',
        precio: 6.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Bebidas',
      },
    ],
    subtotal: 22.40,
    descuento: 0,
    iva: 2.35,
    total: 24.75,
    tiempoEstimadoRecogida: '20 minutos',
  });

  // Marcar como listo
  const pedidos5 = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  if (pedidos5.length > 4) {
    pedidos5[0].estado = 'listo';
    pedidos5[0].estadoEntrega = 'listo';
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos5));
  }

  // ============================================================================
  // PEDIDO 6: TPV - Recogida Local (PENDIENTE)
  // ============================================================================
  
  crearPedidoTPV({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'Modomio',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tpvId: 'TPV-002',
    cajeroId: 'EMP-002',
    clienteNombre: 'Isabel Moreno',
    clienteTelefono: '+34 699 111 222',
    items: [
      {
        id: 'item-11',
        productoId: 'PROD-050',
        nombre: 'Menú del Día',
        precio: 12.50,
        cantidad: 1,
        imagen: '',
        categoria: 'Menús',
      },
    ],
    subtotal: 12.50,
    descuento: 0,
    iva: 1.31,
    total: 13.81,
    metodoPago: 'efectivo',
  });

  console.log('✅ Pedidos de demostración creados exitosamente');
}
