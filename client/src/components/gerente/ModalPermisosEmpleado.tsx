import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import {
  User,
  ChevronDown,
  Shield,
  Clock,
  ShoppingBag,
  CreditCard,
  Package,
  TrendingUp,
  Users,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  UserX
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Empleado {
  id: string;
  nombre: string;
  codigo: string;
  rol: string;
  email: string;
  telefono: string;
  puesto: string;
  empresa: string;
  marca: string;
  puntoVenta: string;
}

interface SubPermiso {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface BloquePermiso {
  id: string;
  titulo: string;
  icono: any;
  descripcion: string;
  permisos: SubPermiso[];
}

interface PlantillaRol {
  [key: string]: string[]; // Array de IDs de permisos activos
}

// ============================================================================
// PLANTILLAS DE ROLES
// ============================================================================

const PLANTILLAS_ROLES: PlantillaRol = {
  'cocinero': [
    'acceso_app', 'ver_perfil', 'recibir_notificaciones',
    'fichar', 'ver_horas',
    'ver_pedidos', 'cambiar_estado_cocina'
  ],
  'encargado': [
    'acceso_app', 'ver_perfil', 'recibir_notificaciones',
    'fichar', 'ver_horas', 'ver_calendario', 'ver_doc_laboral',
    'ver_pedidos', 'crear_pedidos', 'editar_pedidos', 'cambiar_estado_cocina', 'cambiar_estado_reparto', 'ver_metodo_pago',
    'ver_tpv', 'abrir_caja', 'cerrar_caja', 'arqueo', 'ver_ventas_tpv', 'devoluciones',
    'ver_stock', 'editar_stock', 'ver_mermas',
    'ver_kpi_pv', 'ver_escandallos',
    'ver_empleados', 'ver_fichajes_equipo'
  ],
  'repartidor': [
    'acceso_app', 'ver_perfil', 'recibir_notificaciones',
    'fichar', 'ver_horas',
    'ver_pedidos', 'cambiar_estado_reparto'
  ],
  'caja_tpv': [
    'acceso_app', 'ver_perfil', 'recibir_notificaciones',
    'fichar', 'ver_horas',
    'ver_pedidos', 'ver_metodo_pago',
    'ver_tpv', 'abrir_caja', 'cerrar_caja', 'arqueo', 'ver_ventas_tpv', 'devoluciones'
  ],
  'responsable_tienda': [
    'acceso_app', 'ver_perfil', 'recibir_notificaciones',
    'fichar', 'ver_horas', 'ver_calendario', 'ver_doc_laboral', 'subir_doc_otros',
    'ver_pedidos', 'crear_pedidos', 'editar_pedidos', 'cambiar_estado_cocina', 'cambiar_estado_reparto', 'ver_metodo_pago', 'ver_costes_pedido',
    'ver_tpv', 'abrir_caja', 'cerrar_caja', 'arqueo', 'ver_ventas_tpv', 'devoluciones',
    'ver_stock', 'editar_stock', 'crear_pedido_proveedor', 'ver_mermas', 'aprobar_mermas', 'ver_historial',
    'ver_kpi_pv', 'ver_kpi_marca', 'ver_escandallos', 'ver_facturacion',
    'ver_empleados', 'ver_fichajes_equipo', 'invitar_trabajador'
  ],
  'personalizado': [] // Sin plantilla predefinida
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface ModalPermisosEmpleadoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: Empleado;
}

export function ModalPermisosEmpleado({
  isOpen,
  onOpenChange,
  empleado
}: ModalPermisosEmpleadoProps) {
  const [rolSeleccionado, setRolSeleccionado] = useState<string>(empleado.rol || 'personalizado');
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [bloques, setBloques] = useState<BloquePermiso[]>([]);

  // Inicializar bloques de permisos
  useEffect(() => {
    setBloques([
      {
        id: 'acceso',
        titulo: 'Acceso al sistema',
        icono: Shield,
        descripcion: 'Permisos básicos de acceso a la aplicación',
        permisos: [
          { id: 'acceso_app', nombre: 'Acceso a la app', descripcion: 'Puede iniciar sesión en la aplicación', activo: true },
          { id: 'ver_perfil', nombre: 'Ver perfil', descripcion: 'Puede ver su perfil personal', activo: true },
          { id: 'recibir_notificaciones', nombre: 'Recibir notificaciones', descripcion: 'Recibe notificaciones push y email', activo: true }
        ]
      },
      {
        id: 'fichajes',
        titulo: 'Fichajes y RRHH',
        icono: Clock,
        descripcion: 'Gestión de horarios y documentación laboral',
        permisos: [
          { id: 'fichar', nombre: 'Fichar entrada/salida', descripcion: 'Puede fichar su jornada laboral', activo: false },
          { id: 'ver_horas', nombre: 'Ver horas trabajadas', descripcion: 'Consultar registro de horas', activo: false },
          { id: 'ver_calendario', nombre: 'Ver calendario laboral', descripcion: 'Consultar calendario y turnos', activo: false },
          { id: 'ver_doc_laboral', nombre: 'Ver documentación laboral', descripcion: 'Acceder a nóminas, contratos e IRPF', activo: false },
          { id: 'subir_doc_otros', nombre: 'Subir documentos "Otros"', descripcion: 'Subir bajas médicas, justificantes, etc.', activo: false }
        ]
      },
      {
        id: 'pedidos',
        titulo: 'Gestión de pedidos',
        icono: ShoppingBag,
        descripcion: 'Operaciones con pedidos de clientes',
        permisos: [
          { id: 'ver_pedidos', nombre: 'Ver pedidos', descripcion: 'Consultar listado de pedidos', activo: false },
          { id: 'crear_pedidos', nombre: 'Crear pedidos', descripcion: 'Crear nuevos pedidos de clientes', activo: false },
          { id: 'editar_pedidos', nombre: 'Editar pedidos', descripcion: 'Modificar pedidos existentes', activo: false },
          { id: 'cambiar_estado_cocina', nombre: 'Cambiar estado cocina', descripcion: 'Actualizar estado de preparación', activo: false },
          { id: 'cambiar_estado_reparto', nombre: 'Cambiar estado reparto', descripción: 'Actualizar estado de entrega', activo: false },
          { id: 'ver_metodo_pago', nombre: 'Ver método de pago', descripcion: 'Ver forma de pago del pedido', activo: false },
          { id: 'ver_costes_pedido', nombre: 'Ver costes del pedido (escandallo)', descripcion: 'Ver desglose de costes', activo: false }
        ]
      },
      {
        id: 'tpv',
        titulo: 'TPV / Caja',
        icono: CreditCard,
        descripcion: 'Operaciones de punto de venta',
        permisos: [
          { id: 'ver_tpv', nombre: 'Ver estado TPV', descripcion: 'Consultar estado del punto de venta', activo: false },
          { id: 'abrir_caja', nombre: 'Abrir caja', descripcion: 'Iniciar turno de caja', activo: false },
          { id: 'cerrar_caja', nombre: 'Cerrar caja', descripcion: 'Finalizar turno de caja', activo: false },
          { id: 'arqueo', nombre: 'Hacer arqueo', descripcion: 'Realizar arqueo de caja', activo: false },
          { id: 'ver_ventas_tpv', nombre: 'Ver ventas TPV', descripcion: 'Consultar ventas del turno', activo: false },
          { id: 'devoluciones', nombre: 'Hacer devoluciones', descripcion: 'Procesar devoluciones de clientes', activo: false }
        ]
      },
      {
        id: 'stock',
        titulo: 'Stock y proveedores',
        icono: Package,
        descripcion: 'Gestión de inventario y proveedores',
        permisos: [
          { id: 'ver_stock', nombre: 'Ver stock', descripcion: 'Consultar niveles de inventario', activo: false },
          { id: 'editar_stock', nombre: 'Editar stock', descripcion: 'Modificar cantidades de stock', activo: false },
          { id: 'crear_pedido_proveedor', nombre: 'Crear pedido proveedor', descripcion: 'Realizar pedidos a proveedores', activo: false },
          { id: 'ver_mermas', nombre: 'Ver mermas', descripcion: 'Consultar pérdidas y mermas', activo: false },
          { id: 'aprobar_mermas', nombre: 'Aprobar mermas', descripcion: 'Autorizar registro de mermas', activo: false },
          { id: 'ver_historial', nombre: 'Ver historial', descripcion: 'Consultar histórico de movimientos', activo: false }
        ]
      },
      {
        id: 'kpi',
        titulo: 'KPI y Finanzas',
        icono: TrendingUp,
        descripcion: 'Métricas y análisis financiero',
        permisos: [
          { id: 'ver_kpi_pv', nombre: 'Ver KPIs punto de venta', descripcion: 'Métricas del punto de venta', activo: false },
          { id: 'ver_kpi_marca', nombre: 'Ver KPIs marca', descripcion: 'Métricas de toda la marca', activo: false },
          { id: 'ver_escandallos', nombre: 'Ver escandallos', descripcion: 'Consultar costes de productos', activo: false },
          { id: 'ver_facturacion', nombre: 'Ver facturación', descripcion: 'Consultar facturación y ventas', activo: false },
          { id: 'ver_ebitda', nombre: 'Ver EBITDA', descripcion: 'Acceder a cuenta de resultados', activo: false }
        ]
      },
      {
        id: 'equipo',
        titulo: 'Gestión de equipo',
        icono: Users,
        descripcion: 'Administración de empleados',
        permisos: [
          { id: 'ver_empleados', nombre: 'Ver empleados', descripcion: 'Consultar listado de empleados', activo: false },
          { id: 'ver_fichajes_equipo', nombre: 'Ver fichajes del equipo', descripcion: 'Consultar fichajes de otros', activo: false },
          { id: 'cambiar_roles', nombre: 'Cambiar roles', descripcion: 'Modificar roles y permisos', activo: false },
          { id: 'invitar_trabajador', nombre: 'Invitar trabajador', descripcion: 'Añadir nuevos empleados', activo: false },
          { id: 'dar_baja', nombre: 'Dar de baja', descripcion: 'Desactivar empleados', activo: false }
        ]
      }
    ]);
  }, []);

  // Aplicar plantilla al cambiar rol
  useEffect(() => {
    if (rolSeleccionado && PLANTILLAS_ROLES[rolSeleccionado.toLowerCase().replace(/ /g, '_')]) {
      aplicarPlantillaRol(rolSeleccionado);
    }
  }, [rolSeleccionado]);

  const aplicarPlantillaRol = (rol: string) => {
    const rolKey = rol.toLowerCase().replace(/ /g, '_');
    const permisosActivos = PLANTILLAS_ROLES[rolKey] || [];

    setBloques(bloques.map(bloque => ({
      ...bloque,
      permisos: bloque.permisos.map(permiso => ({
        ...permiso,
        activo: permisosActivos.includes(permiso.id)
      }))
    })));

    toast.success(`Plantilla de rol "${rol}" aplicada`);
  };

  const togglePermiso = (bloqueId: string, permisoId: string) => {
    setBloques(bloques.map(bloque => {
      if (bloque.id === bloqueId) {
        return {
          ...bloque,
          permisos: bloque.permisos.map(permiso => {
            if (permiso.id === permisoId) {
              return { ...permiso, activo: !permiso.activo };
            }
            return permiso;
          })
        };
      }
      return bloque;
    }));
  };

  const toggleBloque = (bloqueId: string, activar: boolean) => {
    setBloques(bloques.map(bloque => {
      if (bloque.id === bloqueId) {
        return {
          ...bloque,
          permisos: bloque.permisos.map(permiso => ({
            ...permiso,
            activo: activar
          }))
        };
      }
      return bloque;
    }));
  };

  const contarPermisosActivos = (bloque: BloquePermiso) => {
    return bloque.permisos.filter(p => p.activo).length;
  };

  const handleGuardar = () => {
    const permisosActivos = bloques
      .flatMap(bloque => bloque.permisos)
      .filter(permiso => permiso.activo)
      .map(permiso => permiso.id);

    console.log('💾 GUARDAR PERMISOS:', {
      empleado_id: empleado.id,
      rol: rolSeleccionado,
      permisos_activos: permisosActivos,
      total_permisos: permisosActivos.length
    });

    toast.success('Permisos actualizados correctamente');
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Permisos del empleado
                </DialogTitle>
                <DialogDescription>
                  {empleado.nombre} · Código: {empleado.codigo}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selector de rol */}
            <div className="space-y-2">
              <Label htmlFor="rol">Rol del empleado</Label>
              <Select value={rolSeleccionado} onValueChange={setRolSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cocinero">Cocinero</SelectItem>
                  <SelectItem value="encargado">Encargado</SelectItem>
                  <SelectItem value="repartidor">Repartidor</SelectItem>
                  <SelectItem value="caja_tpv">Caja / TPV</SelectItem>
                  <SelectItem value="responsable_tienda">Responsable de tienda</SelectItem>
                  <SelectItem value="personalizado">Rol personalizado</SelectItem>
                </SelectContent>
              </Select>
              <Alert className="border-blue-200 bg-blue-50 mt-2">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-700">
                  Al cambiar el rol, los permisos se actualizarán automáticamente según la plantilla predefinida. 
                  Puedes personalizar manualmente cualquier permiso después.
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Bloques de permisos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Permisos por categoría</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarResumen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver resumen de permisos
                </Button>
              </div>

              <Accordion type="multiple" className="w-full">
                {bloques.map((bloque) => {
                  const permisosActivos = contarPermisosActivos(bloque);
                  const todoActivado = permisosActivos === bloque.permisos.length;
                  const Icon = bloque.icono;

                  return (
                    <AccordionItem key={bloque.id} value={bloque.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              permisosActivos > 0 ? 'bg-teal-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                permisosActivos > 0 ? 'text-teal-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">
                                {bloque.titulo}
                              </p>
                              <p className="text-sm text-gray-600">
                                {permisosActivos} de {bloque.permisos.length} activos
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={todoActivado}
                              onCheckedChange={(checked) => {
                                toggleBloque(bloque.id, checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-4 pb-2 px-4">
                          {bloque.permisos.map((permiso) => (
                            <div
                              key={permiso.id}
                              className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {permiso.nombre}
                                  </p>
                                  {permiso.activo && (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {permiso.descripcion}
                                </p>
                              </div>
                              <Switch
                                checked={permiso.activo}
                                onCheckedChange={() => togglePermiso(bloque.id, permiso.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

            <Separator />

            {/* Bloque de dar de baja (sin cambios) */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900 text-sm">Zona de peligro</p>
                    <p className="text-sm text-red-700 mt-1">
                      Dar de baja a este empleado eliminará su acceso al sistema
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Dar de baja
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Resumen de Permisos */}
      <ModalResumenPermisos
        isOpen={mostrarResumen}
        onOpenChange={setMostrarResumen}
        bloques={bloques}
        empleado={empleado}
        rol={rolSeleccionado}
      />
    </>
  );
}

// ============================================================================
// MODAL: RESUMEN DE PERMISOS
// ============================================================================

interface ModalResumenPermisosProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bloques: BloquePermiso[];
  empleado: Empleado;
  rol: string;
}

function ModalResumenPermisos({
  isOpen,
  onOpenChange,
  bloques,
  empleado,
  rol
}: ModalResumenPermisosProps) {
  const totalPermisos = bloques.reduce((sum, bloque) => sum + bloque.permisos.length, 0);
  const permisosActivos = bloques.reduce(
    (sum, bloque) => sum + bloque.permisos.filter(p => p.activo).length,
    0
  );

  const getRolLabel = (rol: string) => {
    const labels: { [key: string]: string } = {
      'cocinero': 'Cocinero',
      'encargado': 'Encargado',
      'repartidor': 'Repartidor',
      'caja_tpv': 'Caja / TPV',
      'responsable_tienda': 'Responsable de tienda',
      'personalizado': 'Rol personalizado'
    };
    return labels[rol] || rol;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Resumen de permisos del trabajador
              </DialogTitle>
              <DialogDescription>
                {empleado.nombre} · {getRolLabel(rol)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumen numérico */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-teal-700">{permisosActivos}</p>
              <p className="text-sm text-teal-600 mt-1">Permisos activos</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-700">{totalPermisos - permisosActivos}</p>
              <p className="text-sm text-gray-600 mt-1">Permisos inactivos</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">
                {Math.round((permisosActivos / totalPermisos) * 100)}%
              </p>
              <p className="text-sm text-purple-600 mt-1">Cobertura</p>
            </div>
          </div>

          <Separator />

          {/* Lista completa de permisos por bloque */}
          <div className="space-y-4">
            {bloques.map((bloque) => {
              const Icon = bloque.icono;
              const permisosActivosBloque = bloque.permisos.filter(p => p.activo);

              return (
                <div key={bloque.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bloque.titulo}</p>
                      <p className="text-xs text-gray-600">
                        {permisosActivosBloque.length} de {bloque.permisos.length} activos
                      </p>
                    </div>
                  </div>

                  <div className="pl-11 space-y-2">
                    {bloque.permisos.map((permiso) => (
                      <div
                        key={permiso.id}
                        className={`flex items-start gap-3 text-sm ${
                          permiso.activo ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {permiso.activo ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className={permiso.activo ? 'font-medium' : ''}>
                            {permiso.nombre}
                          </p>
                          {permiso.activo && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              {permiso.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
