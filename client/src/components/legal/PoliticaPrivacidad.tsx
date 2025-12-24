import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Shield, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Separator } from '../ui/separator';

/**
 * Componente de Política de Privacidad
 * Cumplimiento GDPR y normativa europea
 */
export const PoliticaPrivacidad: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-600" />
            <div>
              <CardTitle className="text-2xl">Política de Privacidad</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Última actualización: 27 de noviembre de 2024
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {/* Introducción */}
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introducción</h2>
                <p className="text-gray-700 leading-relaxed">
                  En <strong>Udar Edge</strong>, respetamos tu privacidad y nos comprometemos a proteger 
                  tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, 
                  almacenamos y protegemos tu información cuando utilizas nuestra aplicación móvil y 
                  servicios web.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Al utilizar Udar Edge, aceptas las prácticas descritas en esta política.
                </p>
              </section>

              <Separator />

              {/* Datos que recopilamos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Datos que Recopilamos</h2>
                
                <h3 className="font-medium mt-4 mb-2">2.1. Datos de Cuenta</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Teléfono (opcional)</li>
                  <li>Foto de perfil (opcional)</li>
                  <li>Contraseña (encriptada)</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">2.2. Datos de Uso</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Actividad en la aplicación</li>
                  <li>Funcionalidades utilizadas</li>
                  <li>Tiempo de uso</li>
                  <li>Errores y crashes (anónimos)</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">2.3. Datos de Dispositivo</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Modelo y versión del dispositivo</li>
                  <li>Sistema operativo</li>
                  <li>Identificador único del dispositivo</li>
                  <li>Datos de geolocalización (solo si autorizas)</li>
                </ul>

                <h3 className="font-medium mt-4 mb-2">2.4. Datos de Empresas (Gerentes)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Nombre fiscal</li>
                  <li>CIF/NIF</li>
                  <li>Dirección</li>
                  <li>Datos de facturación</li>
                </ul>
              </section>

              <Separator />

              {/* Cómo usamos tus datos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cómo Usamos tus Datos</h2>
                <p className="text-gray-700 mb-2">Utilizamos tus datos para:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Autenticar tu identidad y gestionar tu cuenta</li>
                  <li>Procesar pedidos y transacciones</li>
                  <li>Enviar notificaciones importantes</li>
                  <li>Personalizar tu experiencia</li>
                  <li>Analizar el uso de la app para mejoras</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraude y abusos</li>
                </ul>
              </section>

              <Separator />

              {/* Base legal */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Base Legal (GDPR)</h2>
                <p className="text-gray-700 mb-2">
                  Procesamos tus datos bajo las siguientes bases legales:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Consentimiento:</strong> Para marketing y comunicaciones opcionales</li>
                  <li><strong>Ejecución de contrato:</strong> Para proporcionar los servicios contratados</li>
                  <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
                  <li><strong>Obligación legal:</strong> Para cumplir con normativas fiscales y legales</li>
                </ul>
              </section>

              <Separator />

              {/* Compartir datos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Compartir tus Datos</h2>
                <p className="text-gray-700 mb-2">
                  <strong>No vendemos tus datos</strong> a terceros. Solo compartimos información con:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Proveedores de servicios:</strong> Hosting, analytics, notificaciones push</li>
                  <li><strong>Procesadores de pago:</strong> Para transacciones seguras</li>
                  <li><strong>Autoridades:</strong> Cuando sea legalmente requerido</li>
                  <li><strong>Tu empresa:</strong> Si eres trabajador, tu gerente puede ver datos laborales</li>
                </ul>
              </section>

              <Separator />

              {/* Tus derechos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Tus Derechos (GDPR)</h2>
                <p className="text-gray-700 mb-2">Tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Acceso:</strong> Solicitar una copia de tus datos</li>
                  <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
                  <li><strong>Supresión:</strong> Eliminar tu cuenta y datos</li>
                  <li><strong>Portabilidad:</strong> Exportar tus datos</li>
                  <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Para ejercer tus derechos, contacta con nosotros en{' '}
                  <a href="mailto:privacidad@udaredge.com" className="text-teal-600 hover:underline">
                    privacidad@udaredge.com
                  </a>
                </p>
              </section>

              <Separator />

              {/* Seguridad */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Seguridad de los Datos</h2>
                <p className="text-gray-700 mb-2">Implementamos medidas técnicas y organizativas:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Encriptación SSL/TLS en todas las comunicaciones</li>
                  <li>Contraseñas hasheadas con bcrypt</li>
                  <li>Autenticación de dos factores (opcional)</li>
                  <li>Acceso restringido a datos personales</li>
                  <li>Auditorías de seguridad regulares</li>
                  <li>Copias de seguridad automáticas</li>
                </ul>
              </section>

              <Separator />

              {/* Retención de datos */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Retención de Datos</h2>
                <p className="text-gray-700">
                  Conservamos tus datos mientras tu cuenta esté activa o sea necesario para 
                  proporcionarte servicios. Al eliminar tu cuenta, tus datos se borran en un plazo 
                  de 30 días, excepto los datos que debamos retener por obligaciones legales 
                  (fiscales, laborales).
                </p>
              </section>

              <Separator />

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Cookies y Tecnologías Similares</h2>
                <p className="text-gray-700 mb-2">Utilizamos:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Cookies esenciales:</strong> Para autenticación y funcionalidad</li>
                  <li><strong>Cookies de analytics:</strong> Para entender el uso (opcional)</li>
                  <li><strong>Local Storage:</strong> Para funcionamiento offline</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Puedes gestionar las cookies desde la configuración de tu navegador.
                </p>
              </section>

              <Separator />

              {/* Menores */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Menores de Edad</h2>
                <p className="text-gray-700">
                  Nuestros servicios están dirigidos a mayores de 18 años. No recopilamos 
                  intencionalmente datos de menores. Si detectamos datos de un menor, los 
                  eliminaremos inmediatamente.
                </p>
              </section>

              <Separator />

              {/* Transferencias internacionales */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Transferencias Internacionales</h2>
                <p className="text-gray-700">
                  Tus datos se almacenan en servidores ubicados en la Unión Europea. Si utilizamos 
                  servicios fuera de la UE, aseguramos que cuenten con garantías adecuadas 
                  (cláusulas contractuales tipo, Privacy Shield).
                </p>
              </section>

              <Separator />

              {/* Cambios en la política */}
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Cambios en esta Política</h2>
                <p className="text-gray-700">
                  Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios 
                  significativos por email o mediante notificación en la app. La fecha de la última 
                  actualización aparece al inicio de este documento.
                </p>
              </section>

              <Separator />

              {/* Contacto */}
              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contacto</h2>
                <p className="text-gray-700 mb-4">
                  Si tienes preguntas o inquietudes sobre esta Política de Privacidad:
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a 
                        href="mailto:privacidad@udaredge.com" 
                        className="text-teal-600 hover:underline"
                      >
                        privacidad@udaredge.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <a href="tel:+34900123456" className="text-teal-600 hover:underline">
                        +34 900 123 456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-sm">
                        Udar Edge S.L.<br />
                        Calle Ejemplo, 123<br />
                        28001 Madrid, España
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Delegado de Protección de Datos (DPO)</p>
                      <a 
                        href="mailto:dpo@udaredge.com" 
                        className="text-teal-600 hover:underline"
                      >
                        dpo@udaredge.com
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer legal */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 text-center">
                  Esta Política de Privacidad cumple con el Reglamento General de Protección de Datos 
                  (GDPR - UE 2016/679) y la Ley Orgánica 3/2018 de Protección de Datos Personales y 
                  garantía de los derechos digitales (LOPDGDD).
                </p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
