/**
 * 🧪 TEST DE WEBHOOKS
 * Componente para probar que los webhooks funcionan correctamente
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Copy,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================
// DATOS DE PRUEBA
// ============================================

const WEBHOOKS_TEST = {
  glovo: {
    nombre: 'Glovo - Nuevo Pedido',
    url: '/api/webhooks/glovo',
    payload: {
      event: 'order.created',
      order: {
        id: 'GLV-TEST-12345',
        state: 'NEW',
        customer: {
          id: 'customer-123',
          name: 'María García',
          phone: '+34678123456',
          email: 'maria@example.com'
        },
        deliveryAddress: {
          label: 'Calle Mayor 45, 3ºB',
          details: 'Portal izquierdo, timbre García',
          coordinates: {
            latitude: 40.4168,
            longitude: -3.7038
          }
        },
        products: [
          {
            id: 'prod-001',
            name: 'Croissant de Mantequilla',
            price: 180,
            quantity: 2
          },
          {
            id: 'prod-002',
            name: 'Café con Leche',
            price: 150,
            quantity: 1
          }
        ],
        totalPrice: 510,
        subtotal: 510,
        deliveryFee: 0,
        servicesFee: 128
      }
    }
  },

  uber_eats: {
    nombre: 'Uber Eats - Nuevo Pedido',
    url: '/api/webhooks/uber_eats',
    payload: {
      event_type: 'orders.notification',
      order: {
        id: 'UBER-TEST-67890',
        display_id: 'U-001',
        type: 'DELIVERY_BY_UBER',
        current_state: 'CREATED',
        eater: {
          first_name: 'Carlos',
          phone: '612345678',
          phone_code: '+34'
        },
        cart: {
          items: [
            {
              id: 'item-1',
              title: 'Bocadillo de Jamón',
              quantity: 1,
              price: {
                unit_price: {
                  amount: 550,
                  currency_code: 'EUR',
                  formatted: '5.50€'
                },
                total_price: {
                  amount: 550
                }
              }
            }
          ]
        },
        payment: {
          charges: {
            total: { amount: 550 },
            sub_total: { amount: 550 },
            tax: { amount: 55 },
            total_fee: { amount: 165 }
          }
        },
        placed_at: new Date().toISOString()
      }
    }
  },

  justeat: {
    nombre: 'Just Eat - Nuevo Pedido',
    url: '/api/webhooks/justeat',
    payload: {
      EventType: 'NewOrder',
      Order: {
        Id: 'JE-TEST-111',
        FriendlyOrderReference: 'A-001',
        OrderDate: new Date().toISOString(),
        Status: 'Pending',
        Customer: {
          Name: 'Ana Martínez',
          PhoneNumber: '+34655789123',
          Email: 'ana@example.com'
        },
        Lines: [
          {
            ProductId: 'prod-003',
            Name: 'Pizza Margarita',
            Quantity: 1,
            UnitPrice: 12.50,
            TotalPrice: 12.50
          }
        ],
        Totals: {
          SubTotal: 12.50,
          DeliveryCharge: 2.50,
          ServiceCharge: 1.88,
          Total: 16.88,
          Discount: 0
        }
      }
    }
  },

  monei: {
    nombre: 'Monei - Pago Exitoso',
    url: '/api/webhooks/monei',
    payload: {
      type: 'payment.succeeded',
      payment: {
        id: 'pay_test_12345',
        status: 'SUCCEEDED',
        amount: 4550,
        currency: 'EUR',
        orderId: 'ORD-TEST-001',
        customer: {
          email: 'cliente@example.com',
          name: 'Juan Pérez'
        },
        paymentMethod: 'card'
      }
    }
  }
};

// ============================================
// COMPONENTE
// ============================================

export function TestWebhooks() {
  const [testando, setTestando] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Record<string, any>>({});

  const testearWebhook = async (agregadorId: string) => {
    setTestando(agregadorId);
    
    const test = WEBHOOKS_TEST[agregadorId as keyof typeof WEBHOOKS_TEST];
    
    try {
      const response = await fetch(test.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        },
        body: JSON.stringify(test.payload)
      });

      const data = await response.json();

      setResultados(prev => ({
        ...prev,
        [agregadorId]: {
          success: response.ok,
          status: response.status,
          data,
          timestamp: new Date()
        }
      }));

      if (response.ok) {
        toast.success(`✓ Webhook ${test.nombre} funciona correctamente`);
      } else {
        toast.error(`✗ Error en webhook ${test.nombre}`);
      }
    } catch (error: any) {
      setResultados(prev => ({
        ...prev,
        [agregadorId]: {
          success: false,
          error: error.message,
          timestamp: new Date()
        }
      }));
      toast.error(`Error: ${error.message}`);
    } finally {
      setTestando(null);
    }
  };

  const copiarPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success('Payload copiado al portapapeles');
  };

  const verificarWebhook = async (agregadorId: string) => {
    const test = WEBHOOKS_TEST[agregadorId as keyof typeof WEBHOOKS_TEST];
    
    try {
      const response = await fetch(test.url, {
        method: 'GET'
      });

      const data = await response.json();
      
      toast.success(`✓ Webhook configurado: ${data.nombre}`);
      console.log('Info webhook:', data);
    } catch (error) {
      toast.error('Webhook no disponible');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight">Test de Webhooks</h1>
        <p className="text-sm text-gray-600 mt-1">
          Prueba que los webhooks estén funcionando correctamente
        </p>
      </div>

      {/* Información */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">¿Qué son los webhooks?</p>
              <p className="text-blue-700 mb-2">
                Son URLs especiales que las plataformas externas (Glovo, Uber Eats, etc.) 
                llaman cuando pasa algo importante (nuevo pedido, cancelación, etc.).
              </p>
              <p className="text-blue-700">
                <strong>Tus URLs de webhook:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                <li>https://tuapp.com/api/webhooks/glovo</li>
                <li>https://tuapp.com/api/webhooks/uber_eats</li>
                <li>https://tuapp.com/api/webhooks/justeat</li>
                <li>https://tuapp.com/api/webhooks/monei</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(WEBHOOKS_TEST).map(([id, test]) => {
          const resultado = resultados[id];
          
          return (
            <Card key={id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.nombre}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      POST {test.url}
                    </CardDescription>
                  </div>
                  
                  {resultado && (
                    resultado.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Payload de prueba */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-600">Payload de prueba:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copiarPayload(test.payload)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={JSON.stringify(test.payload, null, 2)}
                    readOnly
                    className="font-mono text-xs h-32"
                  />
                </div>

                {/* Resultado */}
                {resultado && (
                  <div className={`p-3 rounded text-xs ${
                    resultado.success 
                      ? 'bg-green-50 border border-green-200 text-green-900' 
                      : 'bg-red-50 border border-red-200 text-red-900'
                  }`}>
                    <p className="font-medium mb-1">
                      {resultado.success ? '✓ Success' : '✗ Error'} - Status: {resultado.status || 'N/A'}
                    </p>
                    {resultado.data && (
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(resultado.data, null, 2)}
                      </pre>
                    )}
                    {resultado.error && (
                      <p className="text-red-700">{resultado.error}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      {resultado.timestamp.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => testearWebhook(id)}
                    disabled={testando === id}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    {testando === id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    Probar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => verificarWebhook(id)}
                  >
                    Verificar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Prueba los webhooks aquí</strong> para verificar que funcionan
            </li>
            <li>
              <strong>Copia las URLs de webhook</strong> de arriba
            </li>
            <li>
              <strong>Ve al dashboard de cada plataforma</strong> (Glovo, Uber Eats, etc.)
            </li>
            <li>
              <strong>Configura las URLs</strong> en la sección "Webhooks" o "Notifications"
            </li>
            <li>
              <strong>¡Listo!</strong> Las plataformas te notificarán automáticamente
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default TestWebhooks;
