/**
 * 📦 DATOS DE DEMOSTRACIÓN - PEDIDOS
 * 
 * Pedidos de ejemplo para mostrar en la demo
 * ACTUALIZADO: Ahora usa el sistema unificado de pedidos
 */

import { crearPedidosDemo } from '../utils/crear-pedidos-demo';

export function inicializarPedidosDemo() {
  // Verificar si ya hay pedidos
  const pedidosExistentes = localStorage.getItem('udar-pedidos');
  
  // Solo inicializar si no hay pedidos (primera vez)
  if (!pedidosExistentes || JSON.parse(pedidosExistentes).length === 0) {
    console.log('📦 Inicializando pedidos de demostración...');
    crearPedidosDemo();
    console.log('✅ Pedidos de demostración inicializados');
  }
}