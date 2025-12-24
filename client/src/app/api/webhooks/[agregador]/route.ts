/**
 * 🔔 WEBHOOKS - API Route Dinámico
 * Recibe notificaciones de agregadores (Monei, Glovo, Uber Eats, Just Eat)
 * 
 * URLs soportadas:
 * - POST /api/webhooks/glovo
 * - POST /api/webhooks/uber_eats
 * - POST /api/webhooks/justeat
 * - POST /api/webhooks/monei
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { gestorAgregadores } from '@/lib/aggregator-adapter';
import { procesarNuevoPedidoDelivery } from '@/services/pedidos-delivery.service';

// ============================================
// POST - Recibir Webhooks
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { agregador: string } }
) {
  const agregadorId = params.agregador;
  const timestamp = new Date().toISOString();

  console.log(`🔔 [WEBHOOK ${agregadorId.toUpperCase()}] Petición recibida - ${timestamp}`);

  try {
    // Obtener firma de seguridad según agregador
    const firma = request.headers.get('x-signature') || 
                  request.headers.get('x-glovo-signature') ||
                  request.headers.get('x-uber-signature') ||
                  request.headers.get('x-je-signature') ||
                  '';

    // Leer body como texto (necesario para verificar firma HMAC)
    const bodyText = await request.text();
    let payload: any;

    try {
      payload = JSON.parse(bodyText);
    } catch (parseError) {
      console.error(`❌ [WEBHOOK ${agregadorId}] Error parseando JSON:`, parseError);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    // Verificar agregador existe
    const agregador = gestorAgregadores.obtener(agregadorId);
    if (!agregador) {
      console.error(`❌ [WEBHOOK ${agregadorId}] Agregador no configurado`);
      return NextResponse.json({ error: 'Agregador no configurado' }, { status: 404 });
    }

    // ⚠️ SEGURIDAD: Verificar firma HMAC (solo en producción)
    if (process.env.NODE_ENV === 'production' && firma) {
      const firmaValida = verificarFirmaAvanzada(agregadorId, bodyText, firma);
      
      if (!firmaValida) {
        console.error(`❌ [WEBHOOK ${agregadorId}] Firma HMAC inválida`);
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
      
      console.log(`✅ [WEBHOOK ${agregadorId}] Firma HMAC verificada`);
    }

    // Determinar tipo de evento
    const tipoEvento = determinarTipoEvento(payload, agregadorId);
    console.log(`📦 [WEBHOOK ${agregadorId}] Tipo de evento: ${tipoEvento}`);

    // Procesar webhook usando el adaptador
    const resultado = await gestorAgregadores.procesarWebhook(agregadorId, {
      agregador: agregadorId,
      tipo: tipoEvento,
      timestamp: new Date(),
      firma,
      datos: payload
    });

    if (!resultado.success) {
      console.error(`❌ [WEBHOOK ${agregadorId}] Error procesando:`, resultado.error);
      return NextResponse.json({ error: resultado.error?.message }, { status: 500 });
    }

    // Procesar evento específico (conecta con servicio de pedidos)
    const pedidoProcesado = await procesarEventoWebhook(agregadorId, payload, tipoEvento);

    console.log(`✅ [WEBHOOK ${agregadorId}] Webhook procesado correctamente`);

    return NextResponse.json({
      success: true,
      message: 'Webhook procesado correctamente',
      evento: tipoEvento,
      pedido_id: pedidoProcesado?.id,
      timestamp
    });

  } catch (error: any) {
    console.error(`❌ [WEBHOOK ${agregadorId}] Error:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Verificar webhook
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { agregador: string } }
) {
  const agregador = gestorAgregadores.obtener(params.agregador);
  
  if (!agregador) {
    return NextResponse.json({ error: 'Agregador no configurado' }, { status: 404 });
  }

  return NextResponse.json({
    agregador: params.agregador,
    nombre: agregador.getConfig().nombre,
    activo: agregador.getConfig().activo,
    conectado: await agregador.verificarConexion(),
    webhook_url: `${request.nextUrl.origin}/api/webhooks/${params.agregador}`,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Determinar tipo de evento según agregador y payload
 */
function determinarTipoEvento(payload: any, agregadorId: string): 'pedido' | 'actualizacion' | 'cancelacion' | 'pago' {
  // GLOVO
  if (agregadorId === 'glovo') {
    if (payload.event === 'order.new') return 'pedido';
    if (payload.event === 'order.cancelled') return 'cancelacion';
    return 'actualizacion';
  }
  
  // UBER EATS
  if (agregadorId === 'uber_eats') {
    if (payload.event_type === 'orders.notification') return 'pedido';
    if (payload.event_type === 'orders.cancel') return 'cancelacion';
    return 'actualizacion';
  }
  
  // JUST EAT
  if (agregadorId === 'justeat') {
    if (payload.EventType === 'NewOrder') return 'pedido';
    if (payload.EventType === 'OrderCancelled') return 'cancelacion';
    return 'actualizacion';
  }
  
  // MONEI (Pagos)
  if (agregadorId === 'monei') {
    if (payload.type === 'payment.succeeded' || payload.type === 'payment.failed') return 'pago';
    return 'actualizacion';
  }
  
  return 'actualizacion';
}

/**
 * Verificar firma HMAC avanzada según agregador
 */
function verificarFirmaAvanzada(agregadorId: string, bodyText: string, firma: string): boolean {
  try {
    let secretKey = '';
    
    // Obtener secret según agregador
    switch (agregadorId) {
      case 'glovo':
        secretKey = process.env.GLOVO_WEBHOOK_SECRET || '';
        break;
      case 'uber_eats':
        secretKey = process.env.UBER_EATS_WEBHOOK_SECRET || '';
        break;
      case 'justeat':
        secretKey = process.env.JUSTEAT_WEBHOOK_SECRET || '';
        break;
      case 'monei':
        secretKey = process.env.MONEI_WEBHOOK_SECRET || '';
        break;
      default:
        return false;
    }
    
    if (!secretKey) {
      console.warn(`⚠️ [WEBHOOK ${agregadorId}] Secret no configurado`);
      return true; // En dev, permitir sin secret
    }
    
    // Calcular HMAC SHA256
    const hmac = createHmac('sha256', secretKey);
    hmac.update(bodyText);
    const firmaCalculada = hmac.digest('hex');
    
    // Comparar firmas (timing-safe)
    return firma === firmaCalculada;
    
  } catch (error) {
    console.error(`❌ [WEBHOOK ${agregadorId}] Error verificando firma:`, error);
    return false;
  }
}

/**
 * Procesar evento - Conecta con servicio de pedidos delivery
 */
async function procesarEventoWebhook(
  agregadorId: string, 
  payload: any,
  tipo: 'pedido' | 'actualizacion' | 'cancelacion' | 'pago'
): Promise<any> {
  
  switch (tipo) {
    
    case 'pedido':
      console.log(`🆕 [${agregadorId}] Procesando nuevo pedido...`);
      
      try {
        // Obtener adaptador para convertir formato
        const agregador = gestorAgregadores.obtener(agregadorId);
        
        if (agregador) {
          // Convertir pedido a formato interno usando el adaptador
          const pedidoAgregador = await agregador.convertirPedido(payload);
          
          // Procesar con servicio de pedidos
          const pedidoInterno = await procesarNuevoPedidoDelivery(pedidoAgregador, agregadorId);
          
          console.log(`✅ [${agregadorId}] Pedido creado: ${pedidoInterno.id}`);
          
          return pedidoInterno;
        }
      } catch (error) {
        console.error(`❌ [${agregadorId}] Error procesando pedido:`, error);
        throw error;
      }
      break;

    case 'cancelacion':
      console.log(`❌ [${agregadorId}] Pedido cancelado`);
      // TODO: Implementar lógica de cancelación
      // await actualizarEstadoPedidoDelivery(payload.id, 'cancelado');
      break;

    case 'pago':
      console.log(`💰 [${agregadorId}] Evento de pago`);
      // TODO: Implementar lógica de pago
      // await actualizarEstadoPago(payload);
      break;

    case 'actualizacion':
      console.log(`🔄 [${agregadorId}] Actualización de estado`);
      // TODO: Implementar lógica de actualización
      break;
  }
  
  return null;
}
