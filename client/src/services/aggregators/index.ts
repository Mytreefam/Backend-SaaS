/**
 * 🔌 INICIALIZACIÓN DE AGREGADORES
 * Configurar todos los adaptadores de plataformas externas
 */

import { GlovoAdapter } from './glovo.adapter';
import { JustEatAdapter } from './justeat.adapter';
import { UberEatsAdapter } from './uber-eats.adapter';

import { gestorAgregadores, TipoAgregador } from '../../lib/aggregator-adapter';
import { MoneiAdapter } from './monei.adapter';

let inicializado = false;

/**
 * Inicializar todos los agregadores
 * Llamar UNA VEZ al iniciar la aplicación
 */
export function inicializarAgregadores() {
  if (inicializado) {
    console.log('⚠️  Agregadores ya inicializados');
    return;
  }

  console.log('🔌 Inicializando agregadores...');

  // MONEI - Pagos
  if (process.env.MONEI_API_KEY) {
    const monei = new MoneiAdapter({
      id: 'monei',
      nombre: 'Monei',
      tipo: TipoAgregador.PAGO,
      activo: true,
      credenciales: {
        apiKey: process.env.MONEI_API_KEY,
        accountId: process.env.MONEI_ACCOUNT_ID || '',
        webhookSecret: process.env.MONEI_WEBHOOK_SECRET || ''
      },
      configuracion: {
        callbackUrl: `${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/api/webhooks/monei`
      }
    });
    gestorAgregadores.registrar('monei', monei);
    console.log('  ✓ Monei');
  }

  // GLOVO - Delivery
  if (process.env.GLOVO_API_KEY && process.env.GLOVO_STORE_ID) {
    const glovo = new GlovoAdapter({
      id: 'glovo',
      nombre: 'Glovo',
      tipo: TipoAgregador.DELIVERY,
      activo: true,
      credenciales: {
        apiKey: process.env.GLOVO_API_KEY,
        storeId: process.env.GLOVO_STORE_ID
      },
      configuracion: {
        webhookUrl: `${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/api/webhooks/glovo`,
        comision: 25,
        tiempoPreparacion: 15
      }
    });
    gestorAgregadores.registrar('glovo', glovo);
    console.log('  ✓ Glovo');
  }

  // UBER EATS - Delivery
  if (process.env.UBER_EATS_CLIENT_ID && process.env.UBER_EATS_CLIENT_SECRET) {
    const uberEats = new UberEatsAdapter({
      id: 'uber_eats',
      nombre: 'Uber Eats',
      tipo: TipoAgregador.DELIVERY,
      activo: true,
      credenciales: {
        clientId: process.env.UBER_EATS_CLIENT_ID,
        clientSecret: process.env.UBER_EATS_CLIENT_SECRET,
        storeId: process.env.UBER_EATS_STORE_ID || ''
      },
      configuracion: {
        webhookUrl: `${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/api/webhooks/uber_eats`,
        comision: 30,
        tiempoPreparacion: 15
      }
    });
    gestorAgregadores.registrar('uber_eats', uberEats);
    console.log('  ✓ Uber Eats');
  }

  // JUST EAT - Delivery
  if (process.env.JUSTEAT_API_KEY && process.env.JUSTEAT_RESTAURANT_ID) {
    const justEat = new JustEatAdapter({
      id: 'justeat',
      nombre: 'Just Eat',
      tipo: TipoAgregador.DELIVERY,
      activo: true,
      credenciales: {
        apiKey: process.env.JUSTEAT_API_KEY,
        restaurantId: process.env.JUSTEAT_RESTAURANT_ID
      },
      configuracion: {
        webhookUrl: `${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/api/webhooks/justeat`,
        comision: 13,
        tiempoPreparacion: 15
      }
    });
    gestorAgregadores.registrar('justeat', justEat);
    console.log('  ✓ Just Eat');
  }

  const total = gestorAgregadores.obtenerTodos().length;
  console.log(`🎉 ${total} agregadores inicializados`);
  inicializado = true;
}

/**
 * Verificar que todos estén conectados
 */
export async function verificarConexiones() {
  console.log('🔍 Verificando conexiones...');
  const resultados = await gestorAgregadores.verificarConexiones();
  
  Object.entries(resultados).forEach(([id, conectado]) => {
    console.log(`  ${conectado ? '✓' : '✗'} ${id}`);
  });
  
  return resultados;
}

// Exportar gestor
export { gestorAgregadores };