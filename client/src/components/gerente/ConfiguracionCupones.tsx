/**
 * 🎫 CONFIGURACIÓN DE CUPONES Y REGLAS - PERFIL GERENTE
 * Sistema completo de reglas automáticas para generar cupones
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Gift,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Share2,
  Play,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCupones } from '../../hooks/useCupones';
import type { ReglaCupon, CrearReglaRequest, TipoRegla } from '../../types/cupon.types';

export function ConfiguracionCupones() {
  const {
    obtenerReglas,
    crearRegla,
    actualizarRegla,
    eliminarRegla,
    activarDesactivarRegla,
    ejecutarRegla,
    obtenerEstadisticas,
  } = useCupones();

  // Estados
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [reglaSeleccionada, setReglaSeleccionada] = useState<ReglaCupon | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Form crear regla
  const [formData, setFormData] = useState<CrearReglaRequest>({
    nombre: '',
    descripcion: '',
    tipo: 'fidelizacion',
    condiciones: {
      numeroPedidos: 7,
      gastoMinimoPorPedido: 30,
    },
    recompensa: {
      tipoDescuento: 'fijo',
      valor: 5,
      validezDias: 30,
      gastoMinimo: 20,
      usosMaximos: 1,
      prefijoCodigoCupon: 'FIDEL-',
      notificarCliente: true,
      mensajeNotificacion: '¡Felicidades! Has ganado un cupón de descuento',
    },
  });

  // Obtener reglas
  const reglas = useMemo(() => {
    return obtenerReglas();
  }, [obtenerReglas]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    return obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  // Handlers
  const handleCrearRegla = async () => {
    if (!formData.nombre) {
      toast.error('Ingresa un nombre para la regla');
      return;
    }

    setProcesando(true);
    const resultado = await crearRegla(formData);
    setProcesando(false);

    if (resultado) {
      toast.success('Regla creada correctamente');
      setModalCrear(false);
      resetForm();
    } else {
      toast.error('Error al crear la regla');
    }
  };

  const handleEliminarRegla = async () => {
    if (!reglaSeleccionada) return;

    setProcesando(true);
    const resultado = await eliminarRegla(reglaSeleccionada.id);
    setProcesando(false);

    if (resultado) {
      toast.success('Regla eliminada correctamente');
      setModalEliminar(false);
      setReglaSeleccionada(null);
    } else {
      toast.error('Error al eliminar la regla');
    }
  };

  const handleToggleActiva = async (regla: ReglaCupon) => {
    const resultado = await activarDesactivarRegla(regla.id, !regla.activa);
    if (resultado) {
      toast.success(regla.activa ? 'Regla desactivada' : 'Regla activada');
    } else {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleEjecutarRegla = async (reglaId: string) => {
    setProcesando(true);
    const resultado = await ejecutarRegla(reglaId);
    setProcesando(false);

    if (resultado) {
      toast.success('Regla ejecutada correctamente');
    } else {
      toast.error('Error al ejecutar la regla');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'fidelizacion',
      condiciones: {
        numeroPedidos: 7,
        gastoMinimoPorPedido: 30,
      },
      recompensa: {
        tipoDescuento: 'fijo',
        valor: 5,
        validezDias: 30,
        gastoMinimo: 20,
        usosMaximos: 1,
        prefijoCodigoCupon: 'FIDEL-',
        notificarCliente: true,
        mensajeNotificacion: '¡Felicidades! Has ganado un cupón de descuento',
      },
    });
  };

  // Función para obtener icono según tipo de regla
  const getIconoTipo = (tipo: TipoRegla) => {
    switch (tipo) {
      case 'fidelizacion':
        return <TrendingUp className="h-4 w-4" />;
      case 'google-maps':
        return <Star className="h-4 w-4" />;
      case 'primera-compra':
        return <Gift className="h-4 w-4" />;
      case 'cumpleanos':
        return <Calendar className="h-4 w-4" />;
      case 'inactividad':
        return <Clock className="h-4 w-4" />;
      case 'gasto-acumulado':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  // Función para formatear nombre del tipo
  const getNombreTipo = (tipo: TipoRegla) => {
    const nombres = {
      'fidelizacion': 'Fidelización',
      'google-maps': 'Google Maps',
      'primera-compra': 'Primera Compra',
      'cumpleanos': 'Cumpleaños',
      'inactividad': 'Inactividad',
      'gasto-acumulado': 'Gasto Acumulado',
      'personalizada': 'Personalizada',
    };
    return nombres[tipo] || tipo;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            🎫 Cupones y Reglas Automáticas
          </CardTitle>
          <Button onClick={() => setModalCrear(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Regla
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Configura reglas para generar cupones automáticamente basados en el comportamiento de tus clientes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{estadisticas.totalReglas}</div>
                  <div className="text-xs text-gray-600">Total Reglas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{estadisticas.reglasActivas}</div>
                  <div className="text-xs text-gray-600">Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {estadisticas.cuponesGeneradosPorReglas}
                  </div>
                  <div className="text-xs text-gray-600">Cupones Generados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{estadisticas.clientesUnicos}</div>
                  <div className="text-xs text-gray-600">Clientes Activos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabla de reglas */}
        {reglas.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No hay reglas configuradas</h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera regla para automatizar la generación de cupones
            </p>
            <Button onClick={() => setModalCrear(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Primera Regla
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Condiciones</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reglas.map((regla) => (
                  <TableRow key={regla.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{regla.nombre}</div>
                        {regla.descripcion && (
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">
                            {regla.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIconoTipo(regla.tipo)}
                        <span className="text-sm">{getNombreTipo(regla.tipo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {regla.condiciones.numeroPedidos && (
                          <div>Cada {regla.condiciones.numeroPedidos} pedidos</div>
                        )}
                        {regla.condiciones.gastoMinimoPorPedido && (
                          <div>&gt; {regla.condiciones.gastoMinimoPorPedido}€</div>
                        )}
                        {regla.condiciones.gastoAcumuladoTotal && (
                          <div>Total: {regla.condiciones.gastoAcumuladoTotal}€</div>
                        )}
                        {regla.condiciones.primeraCompra && <div>Primera compra</div>}
                        {regla.condiciones.mesCumpleanos && <div>Mes cumpleaños</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">
                        {regla.recompensa.tipoDescuento === 'porcentaje' && `${regla.recompensa.valor}%`}
                        {regla.recompensa.tipoDescuento === 'fijo' && `${regla.recompensa.valor}€`}
                        {regla.recompensa.tipoDescuento === 'regalo' && 'Regalo'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Validez: {regla.recompensa.validezDias} días
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Generados: {regla.stats.cuponesGenerados}</div>
                        <div className="text-green-600">Usados: {regla.stats.cuponesUsados}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {regla.activa ? (
                        <Badge className="bg-green-100 text-green-700">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100">
                          Inactiva
                        </Badge>
                      )}
                      {regla.tipo === 'google-maps' && regla.googleMaps && (
                        <div className="text-xs text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {regla.googleMaps.reviewsDetectadas} reviews
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEjecutarRegla(regla.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Ejecutar Ahora
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActiva(regla)}>
                            {regla.activa ? (
                              <>
                                <ToggleLeft className="h-4 w-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          {regla.tipo === 'google-maps' && (
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver Configuración API
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setReglaSeleccionada(regla);
                              setModalEliminar(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">Tipos de Reglas Disponibles:</div>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Fidelización:</strong> Cupón cada X pedidos de más de Y €</li>
                <li><strong>Google Maps:</strong> Cupón por dejar review con código único</li>
                <li><strong>Primera Compra:</strong> Cupón de bienvenida para nuevos clientes</li>
                <li><strong>Cumpleaños:</strong> Cupón en el mes del cumpleaños</li>
                <li><strong>Inactividad:</strong> Cupón tras X días sin comprar</li>
                <li><strong>Gasto Acumulado:</strong> Cupón al alcanzar X € en total</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal Crear Regla */}
      <Dialog open={modalCrear} onOpenChange={setModalCrear}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Regla Automática</DialogTitle>
            <DialogDescription>
              Configura una regla para generar cupones automáticamente
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Información básica */}
            <div className="grid gap-2">
              <Label>Nombre de la Regla *</Label>
              <Input
                placeholder="Ej: Fidelización - 7 pedidos"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Descripción</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="Explica cómo funciona esta regla..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            {/* Tipo de regla */}
            <div className="grid gap-2">
              <Label>Tipo de Regla *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoRegla })}
              >
                <option value="fidelizacion">Fidelización (por pedidos)</option>
                <option value="google-maps">Google Maps (por review)</option>
                <option value="primera-compra">Primera Compra</option>
                <option value="cumpleanos">Cumpleaños</option>
                <option value="inactividad">Inactividad</option>
                <option value="gasto-acumulado">Gasto Acumulado</option>
                <option value="personalizada">Personalizada</option>
              </select>
            </div>

            <Separator />

            {/* Condiciones según tipo */}
            <div className="space-y-3">
              <h4 className="font-semibold">Condiciones</h4>

              {formData.tipo === 'fidelizacion' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Número de Pedidos</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.condiciones.numeroPedidos || 7}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condiciones: { ...formData.condiciones, numeroPedidos: parseInt(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Gasto Mínimo por Pedido (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.condiciones.gastoMinimoPorPedido || 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          condiciones: {
                            ...formData.condiciones,
                            gastoMinimoPorPedido: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'google-maps' && (
                <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-2">Configuración de Google Maps</p>
                      <p>
                        Esta regla genera un código único para cada cliente. Cuando el cliente incluya su código
                        en una reseña de Google Maps, se le otorgará automáticamente el cupón configurado.
                      </p>
                      <p className="mt-2">
                        Necesitarás configurar la API de Google Maps en la configuración avanzada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {formData.tipo === 'gasto-acumulado' && (
                <div className="grid gap-2">
                  <Label>Gasto Total Acumulado (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="500"
                    value={formData.condiciones.gastoAcumuladoTotal || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condiciones: {
                          ...formData.condiciones,
                          gastoAcumuladoTotal: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              )}

              {formData.tipo === 'inactividad' && (
                <div className="grid gap-2">
                  <Label>Días de Inactividad</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.condiciones.diasInactividad || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condiciones: {
                          ...formData.condiciones,
                          diasInactividad: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Recompensa */}
            <div className="space-y-3">
              <h4 className="font-semibold">Recompensa (Cupón a Generar)</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo de Descuento</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.recompensa.tipoDescuento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recompensa: { ...formData.recompensa, tipoDescuento: e.target.value as any },
                      })
                    }
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="fijo">Fijo (€)</option>
                    <option value="regalo">Regalo</option>
                    <option value="envio-gratis">Envío Gratis</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.recompensa.valor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recompensa: { ...formData.recompensa, valor: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Validez del Cupón (días)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.recompensa.validezDias}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recompensa: { ...formData.recompensa, validezDias: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Gasto Mínimo para Usar (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.recompensa.gastoMinimo || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recompensa: {
                          ...formData.recompensa,
                          gastoMinimo: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Prefijo del Código del Cupón</Label>
                <Input
                  placeholder="FIDEL-"
                  value={formData.recompensa.prefijoCodigoCupon || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recompensa: { ...formData.recompensa, prefijoCodigoCupon: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Ejemplo: FIDEL-001, FIDEL-002, etc.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificar al Cliente</Label>
                  <p className="text-xs text-gray-500">Enviar notificación cuando se genere el cupón</p>
                </div>
                <Switch
                  checked={formData.recompensa.notificarCliente}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      recompensa: { ...formData.recompensa, notificarCliente: checked },
                    })
                  }
                />
              </div>

              {formData.recompensa.notificarCliente && (
                <div className="grid gap-2">
                  <Label>Mensaje de Notificación</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md min-h-[60px]"
                    placeholder="¡Felicidades! Has ganado un cupón de descuento"
                    value={formData.recompensa.mensajeNotificacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recompensa: { ...formData.recompensa, mensajeNotificacion: e.target.value },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalCrear(false);
                resetForm();
              }}
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button onClick={handleCrearRegla} disabled={procesando}>
              {procesando ? 'Creando...' : 'Crear Regla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Regla</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la regla "{reglaSeleccionada?.nombre}"?
              Los cupones ya generados por esta regla no se eliminarán.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalEliminar(false)}
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEliminarRegla} disabled={procesando}>
              {procesando ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}