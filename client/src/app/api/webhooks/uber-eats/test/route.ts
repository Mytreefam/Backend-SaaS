/**
 * 🧪 SIMULADOR DE WEBHOOKS UBER EATS (DESARROLLO/TESTING)
 * Genera pedidos de prueba para testear la integración
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST] Generando pedido de prueba Uber Eats...');
  
  try {
    const now = Math.floor(Date.now() / 1000); // Unix timestamp
    const orderId = `UBER-${Date.now()}`;
    
    // Generar pedido mock
    const pedidoMock = {
      event_id: `evt_${Date.now()}`,
      event_time: now,
      event_type: 'orders.notification',
      meta_data: {
        resource_id: orderId,
        user_id: 'store_uber_123'
      },
      order: {
        id: orderId,
        type: 'DELIVERY_BY_UBER',
        state: 'CREATED',
        
        eater: {
          first_name: generarNombreAleatorio().split(' ')[0],
          last_name: generarNombreAleatorio().split(' ')[1] || 'Usuario',
          phone: generarTelefonoAleatorio().replace(/^\+34/, ''),
          phone_code: '+34'
        },
        
        delivery: {
          location: {
            address: {
              street_address: generarDireccionAleatoria(),
              city: 'Barcelona',
              postal_code: '08001',
              country: 'ES'
            },
            geo: {
              latitude: 41.3851 + (Math.random() - 0.5) * 0.1,
              longitude: 2.1734 + (Math.random() - 0.5) * 0.1
            }
          },
          dropoff_notes: Math.random() > 0.7 ? 'Piso 2, puerta A' : undefined
        },
        
        cart: {
          items: generarItemsUberEats()
        },
        
        payment: {
          charges: {
            total: { amount: 0, currency_code: 'EUR' },
            sub_total: { amount: 0, currency_code: 'EUR' },
            tax: { amount: 0, currency_code: 'EUR' },
            total_fee: { amount: 0, currency_code: 'EUR' }
          }
        },
        
        placed_at: now,
        estimated_ready_for_pickup_at: now + (15 * 60) // 15 minutos
      }
    };
    
    // Calcular totales
    let subtotal = 0;
    pedidoMock.order.cart.items.forEach(item => {
      subtotal += item.price.total_price.amount;
    });
    
    const tax = Math.floor(subtotal * 0.10); // 10% IVA
    const total_fee = Math.floor(subtotal * 0.05); // 5% fee
    const total = subtotal + tax + total_fee;
    
    pedidoMock.order.payment.charges.sub_total.amount = subtotal;
    pedidoMock.order.payment.charges.tax.amount = tax;
    pedidoMock.order.payment.charges.total_fee.amount = total_fee;
    pedidoMock.order.payment.charges.total.amount = total;
    
    // Enviar al webhook real
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/uber-eats`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-uber-signature': 'test-signature'
      },
      body: JSON.stringify(pedidoMock)
    });
    
    const resultado = await response.json();
    
    console.log('✅ [TEST] Pedido de prueba Uber Eats enviado:', resultado);
    
    return NextResponse.json({
      success: true,
      message: 'Pedido de prueba Uber Eats generado y enviado',
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
    service: 'Uber Eats Webhook Test Simulator',
    endpoint: '/api/webhooks/uber-eats/test',
    usage: 'POST a este endpoint para generar un pedido de prueba',
    examples: {
      curl: 'curl -X POST http://localhost:3000/api/webhooks/uber-eats/test'
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

function generarItemsUberEats() {
  const productosDisponibles = [
    { id: 'prod-001', title: 'Pan de Masa Madre', price: 350 }, // En centavos
    { id: 'prod-002', title: 'Croissant de Mantequilla', price: 180 },
    { id: 'prod-003', title: 'Café Americano', price: 150 },
    { id: 'prod-004', title: 'Tarta de Zanahoria', price: 450 },
    { id: 'prod-005', title: 'Bocadillo de Jamón Ibérico', price: 550 },
    { id: 'prod-006', title: 'Coca-Cola 33cl', price: 250 },
    { id: 'prod-008', title: 'Hamburguesa Clásica', price: 750 },
    { id: 'prod-009', title: 'Napolitana de Chocolate', price: 200 }
  ];
  
  const numProductos = Math.floor(Math.random() * 4) + 1;
  const items = [];
  
  for (let i = 0; i < numProductos; i++) {
    const producto = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
    const cantidad = Math.floor(Math.random() * 3) + 1;
    
    const unitPrice = producto.price;
    const totalPrice = unitPrice * cantidad;
    
    items.push({
      id: `item_${i}_${Date.now()}`,
      external_data: producto.id,
      title: producto.title,
      quantity: cantidad,
      price: {
        unit_price: {
          amount: unitPrice,
          currency_code: 'EUR'
        },
        total_price: {
          amount: totalPrice,
          currency_code: 'EUR'
        }
      },
      selected_modifier_groups: Math.random() > 0.7 ? [
        {
          id: 'mod_group_1',
          title: 'Extras',
          selected_items: [
            {
              id: 'mod_1',
              title: 'Extra queso',
              price: {
                amount: 100,
                currency_code: 'EUR'
              }
            }
          ]
        }
      ] : undefined,
      special_instructions: Math.random() > 0.8 ? 'Sin cebolla por favor' : undefined
    });
  }
  
  return items;
}
