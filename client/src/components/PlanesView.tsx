import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Target, Smartphone } from 'lucide-react';
import planImage from 'figma:asset/3f305c5a0e089513de23ee23622e34a99bf4d327.png';

export function PlanesView() {
  const planes = [
    {
      nombre: 'Plan Básico',
      descripcion: 'Digitaliza tu negocio Food',
      precio: '29.99',
      perfilIdeal: 'Negocios pequeños que inician su digitalización',
      caracteristicas: [
        'App personalizada con el logo y nombre de tu negocio food',
        'Gestión básica de pedidos y precios en un solo lugar',
        'Factura: Un pedido cada vez. Vérificas, cumples la normativa',
        'Carrusel de menú y personal',
        'Catálogo y tienda online con pago seguro y fácil de usar',
        'Recordatorios automáticos de vencimientos',
      ],
      destacado: true,
    },
    {
      nombre: 'Plan Profesional',
      descripcion: 'Maximiza tu negocio Food',
      precio: '59.99',
      perfilIdeal: 'Negocios medianos con múltiples servicios',
      caracteristicas: [
        'Todo lo incluido en Plan Básico',
        'Gestión de múltiples sucursales',
        'Sistema de reservas y mesas',
        'Programa de fidelización de clientes',
        'Reportes y analíticas avanzadas',
        'Integración con delivery partners',
        'Soporte prioritario 24/7',
      ],
      destacado: false,
    },
    {
      nombre: 'Plan Enterprise',
      descripcion: 'Solución completa para tu cadena',
      precio: 'Personalizado',
      perfilIdeal: 'Cadenas de restaurantes y franquicias',
      caracteristicas: [
        'Todo lo incluido en Plan Profesional',
        'API personalizada para integraciones',
        'Gestión de inventario en tiempo real',
        'Sistema de nómina para empleados',
        'Control de costos y rentabilidad',
        'Capacitación personalizada del equipo',
        'Gerente de cuenta dedicado',
      ],
      destacado: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-teal-700 mb-2">Nuestros Planes</h2>
        <p className="text-gray-600">
          Elige el plan que mejor se adapte a las necesidades de tu negocio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => (
          <Card
            key={plan.nombre}
            className={
              plan.destacado
                ? 'border-2 border-teal-600 shadow-lg relative'
                : ''
            }
          >
            {plan.destacado && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-teal-600">Más Popular</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-teal-700">{plan.nombre}</CardTitle>
                  <CardDescription>{plan.descripcion}</CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  {plan.precio === 'Personalizado' ? (
                    <span className="text-gray-900">{plan.precio}</span>
                  ) : (
                    <>
                      <span className="text-gray-900">${plan.precio}</span>
                      <span className="text-gray-600 text-sm">/mes</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-teal-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-teal-700 text-sm">Perfil Ideal</p>
                    <p className="text-gray-700 text-sm">{plan.perfilIdeal}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700">Incluye:</p>
                <ul className="space-y-2">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{caracteristica}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={
                  plan.destacado
                    ? 'w-full bg-teal-600 hover:bg-teal-700'
                    : 'w-full'
                }
                variant={plan.destacado ? 'default' : 'outline'}
              >
                {plan.precio === 'Personalizado' ? 'Contactar' : 'Seleccionar Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Imagen de referencia del plan */}
      <Card className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-white mb-4">El Plan Básico digitaliza tu negocio de comida rápida sin complicaciones</h3>
              <p className="text-white/90 mb-4">
                Perfecto para comenzar a digitalizar tu negocio, gestionar clientes
                y agilizar las entregas sin costos iniciales elevados.
              </p>
              <div className="flex items-center gap-2 text-white/90">
                <Smartphone className="w-5 h-5" />
                <span>App móvil incluida</span>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={planImage}
                alt="Plan Básico"
                className="max-w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
