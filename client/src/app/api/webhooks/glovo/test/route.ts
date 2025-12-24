/**
 * 🧪 SIMULADOR DE WEBHOOKS GLOVO (DESARROLLO/TESTING)
 * Genera pedidos de prueba para testear la integración
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST] Generando pedido de prueba Glovo...');
  
  try {
    // Generar pedido mock
    const pedidoMock = {
      event: 'order.new',
      timestamp: new Date().toISOString(),
      data: {
        order: {
          id: `GLOVO-${Date.now()}`,
          state: 'NEW',
          storeId: 'STORE-001',
          
          customer: {
            id: `CUST-${Math.random().toString(36).substr(2, 9)}`,
            name: generarNombreAleatorio(),
            phone: generarTelefonoAleatorio(),
            email: `cliente${Date.now()}@example.com`
          },
          
          deliveryAddress: {
            label: generarDireccionAleatoria(),
            details: generarDetallesDireccion(),
            coordinates: {
              latitude: 41.3851 + (Math.random() - 0.5) * 0.1,
              longitude: 2.1734 + (Math.random() - 0.5) * 0.1
            },
            postalCode: '08001',
            city: 'Barcelona'
          },
          
          products: generarProductosAleatorios(),
          
          totalPrice: 0, // Se calculará
          subtotal: 0,
          deliveryFee: 2.50,
          servicesFee: 0.50,
          discount: 0,
          
          estimatedPickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString()
        }
      }
    };
    
    // Calcular totales
    const subtotal = pedidoMock.data.order.products.reduce(
      (sum, p) => sum + (p.price * p.quantity), 
      0
    );
    pedidoMock.data.order.subtotal = subtotal;
    pedidoMock.data.order.totalPrice = subtotal + pedidoMock.data.order.deliveryFee + pedidoMock.data.order.servicesFee;
    
    // Enviar al webhook real
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/glovo`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-glovo-signature': 'test-signature'
      },
      body: JSON.stringify(pedidoMock)
    });
    
    const resultado = await response.json();
    
    console.log('✅ [TEST] Pedido de prueba enviado:', resultado);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido de prueba generado y enviado',
      pedido: pedidoMock,
      resultado
    });
    
  } catch (error: any) {
    console.error('❌ [TEST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Glovo Webhook Test Simulator',
    endpoint: '/api/webhooks/glovo/test',
    usage: 'POST a este endpoint para generar un pedido de prueba',
    examples: {
      curl: 'curl -X POST http://localhost:3000/api/webhooks/glovo/test'
    }
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function generarNombreAleatorio(): string {
  const nombres = ['Carlos', 'María', 'Ana', 'Juan', 'Laura', 'Pedro', 'Sofia', 'Miguel', 'Elena'];
  const apellidos = ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Rodríguez', 'Pérez'];
  
  return `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
}

function generarTelefonoAleatorio(): string {
  return `6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

function generarDireccionAleatoria(): string {
  const calles = [
    'Calle Gran Via',
    'Carrer de Balmes',
    'Passeig de Gràcia',
    'Rambla de Catalunya',
    'Carrer de Provença',
    'Avinguda Diagonal',
    'Carrer de Muntaner'
  ];
  
  const numero = Math.floor(Math.random() * 200) + 1;
  return `${calles[Math.floor(Math.random() * calles.length)]}, ${numero}`;
}

function generarDetallesDireccion(): string {
  const detalles = [
    'Piso 2, Puerta A',
    '3º 1ª',
    'Bajo',
    'Ático',
    'Portal B, 4º 2ª',
    '1º izquierda'
  ];
  
  return Math.random() > 0.3 
    ? detalles[Math.floor(Math.random() * detalles.length)]
    : '';
}

function generarProductosAleatorios() {
  const productosDisponibles = [
    { id: 'prod-001', name: 'Pan de Masa Madre', price: 3.50 },
    { id: 'prod-002', name: 'Croissant de Mantequilla', price: 1.80 },
    { id: 'prod-003', name: 'Café Americano', price: 1.50 },
    { id: 'prod-004', name: 'Tarta de Zanahoria', price: 4.50 },
    { id: 'prod-005', name: 'Bocadillo de Jamón Ibérico', price: 5.50 },
    { id: 'prod-006', name: 'Coca-Cola 33cl', price: 2.50 },
    { id: 'prod-008', name: 'Hamburguesa Clásica', price: 7.50 },
    { id: 'prod-009', name: 'Napolitana de Chocolate', price: 2.00 }
  ];
  
  const numProductos = Math.floor(Math.random() * 4) + 1; // 1-4 productos
  const productos = [];
  
  for (let i = 0; i < numProductos; i++) {
    const producto = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
    const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 unidades
    
    productos.push({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      quantity: cantidad,
      attributes: Math.random() > 0.7 ? [
        {
          id: 'attr-001',
          name: 'Extra queso',
          price: 1.00
        }
      ] : undefined,
      comment: Math.random() > 0.8 ? 'Sin cebolla por favor' : undefined
    });
  }
  
  return productos;
}
