import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { FileText, AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Componente de Términos y Condiciones
 * Contrato legal de uso de la aplicación
 */
export const TerminosCondiciones: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-600" />
            <div>
              <CardTitle className="text-2xl">Términos y Condiciones</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Última actualización: 27 de noviembre de 2024
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Alerta importante */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Al utilizar Udar Edge, aceptas estos Términos y Condiciones. Por favor, léelos 
                  detenidamente antes de usar nuestros servicios.
                </AlertDescription>
              </Alert>

              {/* Introducción */}
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                <p className="text-gray-700 leading-relaxed">
                  Estos Términos y Condiciones ("Términos") constituyen un acuerdo legal vinculante 
                  entre tú ("Usuario") y <strong>Udar Edge S.L.</strong> ("Nosotros", "Nuestro") 
                  respecto al uso de la aplicación móvil y servicios web Udar Edge.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Al acceder o utilizar Udar Edge, confirmas que has leído, comprendido y aceptado 
                  estar sujeto a estos Términos.
                </p>
              </section>

              <Separator />

              {/* Descripción del servicio */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
                <p className="text-gray-700 mb-2">
                  Udar Edge es una plataforma SaaS multiempresa que proporciona:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Sistema TPV (Terminal Punto de Venta) digital</li>
                  <li>Gestión de pedidos en tiempo real</li>
                  <li>Dashboard para clientes, trabajadores y gerentes</li>
                  <li>Gestión de stock y proveedores</li>
                  <li>Sistema de comunicación interna</li>
                  <li>Herramientas de análisis y reportes</li>
                  <li>Funcionalidades offline y sincronización</li>
                </ul>
              </section>

              <Separator />

              {/* Registro y cuenta */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Registro y Cuenta de Usuario</h2>
                
                <h3 className="font-medium mt-4 mb-2">3.1. Requisitos</h3>
                <p className="text-gray-700 mb-2">Para usar Udar Edge debes:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Ser mayor de 18 años</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Mantener la seguridad de tu contraseña</li>
                  <li>Notificarnos inmediatamente de cualquier acceso no autorizado</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">3.2. Responsabilidad</h3>
                <p className="text-gray-700">
                  Eres responsable de todas las actividades realizadas desde tu cuenta. 
                  No compartas tus credenciales con terceros.
                </p>

                <h3 className="font-medium mt-4 mb-2">3.3. Suspensión</h3>
                <p className="text-gray-700">
                  Nos reservamos el derecho de suspender o cancelar tu cuenta si detectamos 
                  actividad fraudulenta, violación de estos Términos, o uso indebido.
                </p>
              </section>

              <Separator />

              {/* Planes y pagos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Planes de Suscripción y Pagos</h2>
                
                <h3 className="font-medium mt-4 mb-2">4.1. Planes Disponibles</h3>
                <p className="text-gray-700 mb-2">Ofrecemos diferentes planes de suscripción:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Básico:</strong> Funcionalidades esenciales para pequeños negocios</li>
                  <li><strong>Profesional:</strong> Herramientas avanzadas y soporte prioritario</li>
                  <li><strong>Enterprise:</strong> Solución completa para grandes organizaciones</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">4.2. Facturación</h3>
                <p className="text-gray-700">
                  Las suscripciones se facturan mensual o anualmente según el plan elegido. 
                  Los pagos se procesan de forma segura a través de proveedores certificados PCI-DSS.
                </p>

                <h3 className="font-medium mt-4 mb-2">4.3. Renovación Automática</h3>
                <p className="text-gray-700">
                  Las suscripciones se renuevan automáticamente al final de cada período, 
                  a menos que canceles antes de la fecha de renovación.
                </p>

                <h3 className="font-medium mt-4 mb-2">4.4. Cancelación</h3>
                <p className="text-gray-700">
                  Puedes cancelar tu suscripción en cualquier momento desde la configuración de 
                  tu cuenta. El acceso continuará hasta el final del período pagado.
                </p>

                <h3 className="font-medium mt-4 mb-2">4.5. Reembolsos</h3>
                <p className="text-gray-700">
                  Ofrecemos reembolso completo dentro de los primeros 14 días de la suscripción. 
                  Después de este período, no se realizan reembolsos prorrateados.
                </p>
              </section>

              <Separator />

              {/* Uso aceptable */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Uso Aceptable</h2>
                
                <h3 className="font-medium mt-4 mb-2">5.1. Permitido</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Usar el servicio para fines comerciales legítimos</li>
                  <li>Integrar con sistemas propios mediante APIs</li>
                  <li>Exportar tus propios datos</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">5.2. Prohibido</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Usar el servicio para actividades ilegales</li>
                  <li>Intentar acceder a cuentas de terceros</li>
                  <li>Realizar ingeniería inversa del software</li>
                  <li>Sobrecargar o interferir con la infraestructura</li>
                  <li>Revender o sublicenciar el servicio sin autorización</li>
                  <li>Extraer datos de otros usuarios (scraping)</li>
                  <li>Distribuir malware o contenido malicioso</li>
                </ul>
              </section>

              <Separator />

              {/* Propiedad intelectual */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Propiedad Intelectual</h2>
                
                <h3 className="font-medium mt-4 mb-2">6.1. Nuestros Derechos</h3>
                <p className="text-gray-700">
                  Todos los derechos de propiedad intelectual sobre Udar Edge (código, diseño, 
                  marca, logos) son de nuestra propiedad o de nuestros licenciantes.
                </p>

                <h3 className="font-medium mt-4 mb-2">6.2. Tus Datos</h3>
                <p className="text-gray-700">
                  Mantienes todos los derechos sobre los datos que introduces en Udar Edge. 
                  Nos otorgas una licencia limitada para procesar dichos datos con el fin de 
                  proporcionar el servicio.
                </p>
              </section>

              <Separator />

              {/* Disponibilidad */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disponibilidad del Servicio</h2>
                <p className="text-gray-700 mb-2">
                  Nos esforzamos por mantener Udar Edge disponible 24/7, pero no garantizamos 
                  disponibilidad ininterrumpida. El servicio puede verse afectado por:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Mantenimiento programado (notificado con antelación)</li>
                  <li>Mantenimiento de emergencia</li>
                  <li>Causas fuera de nuestro control (fallo de proveedores, desastres naturales)</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Nuestro objetivo es un SLA (Service Level Agreement) del 99.9% de uptime.
                </p>
              </section>

              <Separator />

              {/* Limitación de responsabilidad */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitación de Responsabilidad</h2>
                <p className="text-gray-700 mb-2">
                  En la medida permitida por la ley:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>El servicio se proporciona "tal cual" sin garantías de ningún tipo</li>
                  <li>No somos responsables de pérdidas de beneficios, datos o daños indirectos</li>
                  <li>Nuestra responsabilidad total está limitada a las tarifas pagadas en los 
                      últimos 12 meses</li>
                  <li>No garantizamos resultados específicos de negocio</li>
                </ul>
              </section>

              <Separator />

              {/* Indemnización */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Indemnización</h2>
                <p className="text-gray-700">
                  Aceptas indemnizarnos y protegernos de cualquier reclamación, pérdida o daño 
                  (incluidos honorarios legales) que surja de:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Tu uso del servicio</li>
                  <li>Violación de estos Términos</li>
                  <li>Violación de derechos de terceros</li>
                  <li>Contenido que subas a la plataforma</li>
                </ul>
              </section>

              <Separator />

              {/* Modificaciones */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Modificaciones</h2>
                <p className="text-gray-700">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. 
                  Los cambios significativos se notificarán con 30 días de antelación por email. 
                  El uso continuado del servicio después de los cambios constituye aceptación de 
                  los nuevos Términos.
                </p>
              </section>

              <Separator />

              {/* Terminación */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Terminación</h2>
                <p className="text-gray-700 mb-2">
                  Puedes cancelar tu cuenta en cualquier momento. Nosotros podemos suspender o 
                  cancelar tu acceso si:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Incumples estos Términos</li>
                  <li>Detectamos actividad fraudulenta</li>
                  <li>No pagas las tarifas acordadas</li>
                  <li>Por requerimiento legal</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Al terminar, tendrás 30 días para exportar tus datos antes de la eliminación 
                  permanente.
                </p>
              </section>

              <Separator />

              {/* Ley aplicable */}
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Ley Aplicable y Jurisdicción</h2>
                <p className="text-gray-700">
                  Estos Términos se rigen por las leyes de España. Cualquier disputa se someterá 
                  a la jurisdicción exclusiva de los tribunales de Madrid, España, sin perjuicio 
                  de derechos de consumidor aplicables.
                </p>
              </section>

              <Separator />

              {/* Varios */}
              <section>
                <h2 className="text-xl font-semibold mb-3">13. Disposiciones Varias</h2>
                
                <h3 className="font-medium mt-4 mb-2">13.1. Acuerdo Completo</h3>
                <p className="text-gray-700">
                  Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo 
                  completo entre tú y Udar Edge.
                </p>

                <h3 className="font-medium mt-4 mb-2">13.2. Divisibilidad</h3>
                <p className="text-gray-700">
                  Si alguna disposición se considera inválida, las demás continuarán en vigor.
                </p>

                <h3 className="font-medium mt-4 mb-2">13.3. No Renuncia</h3>
                <p className="text-gray-700">
                  El no ejercer un derecho no constituye renuncia al mismo.
                </p>

                <h3 className="font-medium mt-4 mb-2">13.4. Cesión</h3>
                <p className="text-gray-700">
                  No puedes ceder estos Términos sin nuestro consentimiento previo por escrito.
                </p>
              </section>

              <Separator />

              {/* Contacto */}
              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contacto</h2>
                <p className="text-gray-700 mb-3">
                  Para preguntas sobre estos Términos:
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:legal@udaredge.com" className="text-teal-600 hover:underline">
                      legal@udaredge.com
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Teléfono:</strong>{' '}
                    <a href="tel:+34900123456" className="text-teal-600 hover:underline">
                      +34 900 123 456
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Dirección:</strong> Udar Edge S.L., Calle Ejemplo 123, 28001 Madrid, España
                  </p>
                </div>
              </section>

              {/* Footer legal */}
              <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-700 text-center">
                  <strong>Udar Edge S.L.</strong> • CIF: B-12345678 • 
                  Registro Mercantil de Madrid, Tomo 1234, Folio 56, Hoja M-789012
                </p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
