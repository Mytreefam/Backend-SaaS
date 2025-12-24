/**
 * 🧪 SIMULADOR DE WEBHOOKS JUST EAT (DESARROLLO/TESTING)
 * Genera pedidos de prueba para testear la integración
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST] Generando pedido de prueba Just Eat...');
  
  try {
    const now = new Date().toISOString();
    const orderId = `JUSTEAT-${Date.now()}`;
    const friendlyRef = `JE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Generar pedido mock
    const pedidoMock = {
      eventName: 'OrderPlaced',
      eventTime: now,
      eventId: `evt_${Date.now()}`,
      
      data: {
        order: {
          id: orderId,
          friendlyOrderReference: friendlyRef,
          status: 'Placed',
          
          customer: {
            name: generarNombreAleatorio(),
            phoneNumber: generarTelefonoAleatorio(),
            emailAddress: `cliente${Date.now()}@example.com`
          },
          
          deliveryAddress: {
            line1: generarDireccionAleatoria(),
            line2: generarDetallesDireccion(),
            city: 'Barcelona',
            postalCode: '08001',
            location: {
              type: 'Point' as const,
              coordinates: [
                2.1734 + (Math.random() - 0.5) * 0.1, // longitude
                41.3851 + (Math.random() - 0.5) * 0.1  // latitude
              ]
            }
          },
          
          deliveryInstructions: Math.random() > 0.7 ? 'Llamar al timbre 2 veces' : undefined,
          
          items: generarItemsJustEat(),
          
          totals: {
            subtotal: 0,
            deliveryCharge: 2.50,
            serviceCharge: 0.50,
            discount: 0,
            total: 0
          },
          
          payment: {
            paymentMethod: Math.random() > 0.5 ? 'Card' : 'Online',
            isPaid: true
          },
          
          placedDate: now,
          requestedForTime: new Date(Date.now() + 30 * 60000).toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 45 * 60000).toISOString()
        },
        
        restaurant: {
          id: 'rest_justeat_123',
          name: 'Modomio Barcelona'
        }
      }
    };
    
    // Calcular totales
    const subtotal = pedidoMock.data.order.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    
    pedidoMock.data.order.totals.subtotal = subtotal;
    pedidoMock.data.order.totals.total = 
      subtotal + 
      pedidoMock.data.order.totals.deliveryCharge + 
      pedidoMock.data.order.totals.serviceCharge -
      pedidoMock.data.order.totals.discount;
    
    // Enviar al webhook real
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/justeat`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-justeat-signature': 'sha256=test-signature'
      },
      body: JSON.stringify(pedidoMock)
    });
    
    const resultado = await response.json();
    
    console.log('✅ [TEST] Pedido de prueba Just Eat enviado:', resultado);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido de prueba Just Eat generado y enviado',
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
    service: 'Just Eat Webhook Test Simulator',
    endpoint: '/api/webhooks/justeat/test',
    usage: 'POST a este endpoint para generar un pedido de prueba',
    examples: {
      curl: 'curl -X POST http://localhost:3000/api/webhooks/justeat/test'
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
  return `+346${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
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

function generarItemsJustEat() {
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
  
  const numProductos = Math.floor(Math.random() * 4) + 1;
  const items = [];
  
  for (let i = 0; i < numProductos; i++) {
    const producto = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
    const cantidad = Math.floor(Math.random() * 3) + 1;
    
    const item: any = {
      menuItemId: producto.id,
      name: producto.name,
      quantity: cantidad,
      unitPrice: producto.price,
      totalPrice: producto.price * cantidad
    };
    
    // Añadir modificadores aleatoriamente
    if (Math.random() > 0.7) {
      item.modifierGroups = [
        {
          name: 'Extras',
          items: [
            {
              name: 'Extra queso',
              price: 1.00
            }
          ]
        }
      ];
      item.totalPrice += 1.00;
    }
    
    // Añadir instrucciones especiales aleatoriamente
    if (Math.random() > 0.8) {
      item.specialInstructions = 'Sin cebolla por favor';
    }
    
    items.push(item);
  }
  
  return items;
}
