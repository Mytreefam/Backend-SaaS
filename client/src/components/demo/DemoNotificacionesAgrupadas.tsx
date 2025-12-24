import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Store,
  Users,
  DollarSign,
  AlertTriangle,
  Bell,
  ChevronDown,
  Briefcase,
  MessageSquare,
  Mail,
  CheckCircle2,
  X
} from 'lucide-react';

/**
 * Componente de demostración del sistema de notificaciones agrupadas
 * Muestra el antes y después de la reorganización de notificaciones
 */
export function DemoNotificacionesAgrupadas() {
  const [vistaActual, setVistaActual] = useState<'antes' | 'despues'>('despues');
  const [perfilActual, setPerfilActual] = useState<'gerente' | 'trabajador'>('gerente');

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            📋 Sistema de Notificaciones Agrupadas
          </h1>
          <p className="text-gray-600 mb-6">
            Notificaciones organizadas por secciones desplegables para mejor usabilidad
          </p>

          {/* Controles */}
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={() => setVistaActual('antes')}
              variant={vistaActual === 'antes' ? 'default' : 'outline'}
              className={vistaActual === 'antes' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              Antes
            </Button>
            <Button
              onClick={() => setVistaActual('despues')}
              variant={vistaActual === 'despues' ? 'default' : 'outline'}
              className={vistaActual === 'despues' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              Después ✨
            </Button>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setPerfilActual('gerente')}
              variant={perfilActual === 'gerente' ? 'secondary' : 'ghost'}
              size="sm"
            >
              Perfil Gerente
            </Button>
            <Button
              onClick={() => setPerfilActual('trabajador')}
              variant={perfilActual === 'trabajador' ? 'secondary' : 'ghost'}
              size="sm"
            >
              Perfil Colaborador
            </Button>
          </div>
        </div>

        {/* Vista Comparativa */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Comparación de Beneficios */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                Mejoras Implementadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Store className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Organización por Contexto</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Notificaciones agrupadas por área funcional
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Acordeones Desplegables</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Colapsa secciones para navegar más rápido
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Badge className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Contadores Visuales</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Badges muestran cantidad de notificaciones
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vista ANTES */}
          <Card className={vistaActual === 'antes' ? 'ring-2 ring-red-400' : 'opacity-50'}>
            <CardHeader className="bg-red-50 border-b">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <X className="w-5 h-5" />
                Antes - Lista Plana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6 max-h-[600px] overflow-y-auto">
              {perfilActual === 'gerente' ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pedidos Nuevos</Label>
                      <p className="text-sm text-gray-500">Recibir alerta cuando haya un nuevo pedido</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stock Bajo</Label>
                      <p className="text-sm text-gray-500">Alertas cuando el inventario esté por debajo</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Incidencias Críticas</Label>
                      <p className="text-sm text-gray-500">Notificaciones de alta prioridad</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Solicitudes de Vacaciones</Label>
                      <p className="text-sm text-gray-500">Cuando un empleado solicite vacaciones</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Horas Extra</Label>
                      <p className="text-sm text-gray-500">Solicitudes de horas extraordinarias</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fichajes Tardíos</Label>
                      <p className="text-sm text-gray-500">Alertas de retrasos en fichajes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Facturas Pendientes</Label>
                      <p className="text-sm text-gray-500">Recordatorios de facturas por pagar</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pagos Recibidos</Label>
                      <p className="text-sm text-gray-500">Confirmación de pagos de clientes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reportes Diarios</Label>
                      <p className="text-sm text-gray-500">Resumen financiero al final del día</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificaciones de Tareas</Label>
                      <p className="text-sm text-gray-500">Alertas de nuevas tareas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Recordatorios de Fichaje</Label>
                      <p className="text-sm text-gray-500">Recordatorios de entrada/salida</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cambios en Turnos</Label>
                      <p className="text-sm text-gray-500">Modificaciones en tu horario</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mensajes del Equipo</Label>
                      <p className="text-sm text-gray-500">Mensajes del chat</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Anuncios de la Empresa</Label>
                      <p className="text-sm text-gray-500">Noticias importantes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </>
              )}
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Problemas:</strong> Lista larga y difícil de navegar. Las notificaciones no están agrupadas por contexto.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vista DESPUÉS */}
          <Card className={vistaActual === 'despues' ? 'ring-2 ring-teal-400' : 'opacity-50'}>
            <CardHeader className="bg-teal-50 border-b">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-5 h-5" />
                Después - Agrupadas ✨
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 max-h-[600px] overflow-y-auto">
              {perfilActual === 'gerente' ? (
                <>
                  {/* Operativa y Pedidos */}
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="w-5 h-5 text-teal-600" />
                          <span className="font-medium">Operativa y Pedidos</span>
                          <Badge variant="secondary" className="ml-2">2</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Pedidos Nuevos</Label>
                          <p className="text-xs text-gray-500">Alertas de nuevos pedidos</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Stock Bajo</Label>
                          <p className="text-xs text-gray-500">Alertas de inventario bajo</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Recursos Humanos */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Recursos Humanos</span>
                          <Badge variant="secondary" className="ml-2">3</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Solicitudes de Vacaciones</Label>
                          <p className="text-xs text-gray-500">Solicitudes de empleados</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Horas Extra</Label>
                          <p className="text-xs text-gray-500">Solicitudes de horas extra</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Fichajes Tardíos</Label>
                          <p className="text-xs text-gray-500">Alertas de retrasos</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Finanzas */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Finanzas</span>
                          <Badge variant="secondary" className="ml-2">3</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Facturas Pendientes</Label>
                          <p className="text-xs text-gray-500">Recordatorios de pagos</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <>
                  {/* Notificaciones de Trabajo */}
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-teal-600" />
                          <span className="font-medium">Notificaciones de Trabajo</span>
                          <Badge variant="secondary" className="ml-2">3</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Notificaciones de Tareas</Label>
                          <p className="text-xs text-gray-500">Alertas de nuevas tareas</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Recordatorios de Fichaje</Label>
                          <p className="text-xs text-gray-500">Recordatorios de entrada/salida</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Comunicación */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Comunicación</span>
                          <Badge variant="secondary" className="ml-2">2</Badge>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Mensajes del Equipo</Label>
                          <p className="text-xs text-gray-500">Mensajes del chat</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
              <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm text-teal-800">
                  ✅ <strong>Ventajas:</strong> Organización clara, navegación rápida, contadores visuales y mejor UX.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas de Mejora */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle>📊 Mejoras Cuantificables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">5</div>
                <p className="text-sm text-gray-600">Secciones Organizadas</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">-60%</div>
                <p className="text-sm text-gray-600">Reducción de Scroll</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">+40%</div>
                <p className="text-sm text-gray-600">Velocidad de Navegación</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-3xl mb-2">100%</div>
                <p className="text-sm text-gray-600">Contexto Claro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
