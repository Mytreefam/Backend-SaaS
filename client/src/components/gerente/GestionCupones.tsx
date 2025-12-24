/**
 * 🎫 GESTIÓN DE CUPONES - PERFIL GERENTE
 * CRUD completo de cupones con estadísticas
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Ticket,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Gift,
  Calendar,
  RefreshCw,
  Download,
  Check,
  X,
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCupones } from '../../hooks/useCupones';
import type { Cupon, CrearCuponRequest } from '../../types/cupon.types';

export function GestionCupones() {
  const {
    obtenerCupones,
    crearCupon,
    actualizarCupon,
    eliminarCupon,
    activarDesactivarCupon,
    obtenerEstadisticas,
    refrescar,
  } = useCupones();

  // Estados
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<'todos' | 'activos' | 'expirados'>('todos');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [cuponSeleccionado, setCuponSeleccionado] = useState<Cupon | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Form crear/editar cupón
  const [formData, setFormData] = useState<CrearCuponRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: 10,
    gastoMinimo: undefined,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usosMaximos: undefined,
    usosMaximosPorCliente: 1,
  });

  // Obtener todos los cupones
  const todosCupones = useMemo(() => {
    return obtenerCupones();
  }, [obtenerCupones]);

  // Filtrar cupones
  const cuponesFiltrados = useMemo(() => {
    let cupones = todosCupones;

    // Filtrar por tab
    const ahora = new Date();
    if (tabActiva === 'activos') {
      cupones = cupones.filter(c => {
        const fin = new Date(c.fechaFin);
        return c.activo && fin >= ahora;
      });
    } else if (tabActiva === 'expirados') {
      cupones = cupones.filter(c => {
        const fin = new Date(c.fechaFin);
        return fin < ahora;
      });
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      cupones = cupones.filter(c =>
        c.codigo.toLowerCase().includes(termino) ||
        c.nombre.toLowerCase().includes(termino)
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    return cupones.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [todosCupones, tabActiva, busqueda]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    return obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  // Handlers
  const handleCrearCupon = async () => {
    if (!formData.codigo || !formData.nombre) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    setProcesando(true);
    const resultado = await crearCupon(formData);
    setProcesando(false);

    if (resultado) {
      toast.success('Cupón creado correctamente');
      setModalCrear(false);
      resetForm();
    } else {
      toast.error('Error al crear el cupón');
    }
  };

  const handleEliminarCupon = async () => {
    if (!cuponSeleccionado) return;

    setProcesando(true);
    const resultado = await eliminarCupon(cuponSeleccionado.id);
    setProcesando(false);

    if (resultado) {
      toast.success('Cupón eliminado correctamente');
      setModalEliminar(false);
      setCuponSeleccionado(null);
    } else {
      toast.error('Error al eliminar el cupón');
    }
  };

  const handleToggleActivo = async (cupon: Cupon) => {
    const resultado = await activarDesactivarCupon(cupon.id, !cupon.activo);
    if (resultado) {
      toast.success(cupon.activo ? 'Cupón desactivado' : 'Cupón activado');
    } else {
      toast.error('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipoDescuento: 'porcentaje',
      valorDescuento: 10,
      gastoMinimo: undefined,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usosMaximos: undefined,
      usosMaximosPorCliente: 1,
    });
  };

  const getIconoTipo = (tipo: Cupon['tipoDescuento']) => {
    switch (tipo) {
      case 'porcentaje':
        return <Percent className="h-4 w-4" />;
      case 'fijo':
        return <DollarSign className="h-4 w-4" />;
      case 'regalo':
        return <Gift className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const formatearDescuento = (cupon: Cupon) => {
    if (cupon.tipoDescuento === 'porcentaje') {
      return `${cupon.valorDescuento}%`;
    } else if (cupon.tipoDescuento === 'fijo') {
      return `${cupon.valorDescuento}€`;
    }
    return 'Regalo';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Gestión de Cupones</h2>
          <p className="text-gray-600">
            Administra cupones de descuento y promociones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refrescar} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setModalCrear(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Cupón
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{estadisticas.totalCupones}</div>
                <div className="text-xs text-gray-600">Total Cupones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{estadisticas.cuponesActivos}</div>
                <div className="text-xs text-gray-600">Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{estadisticas.clientesUnicos}</div>
                <div className="text-xs text-gray-600">Clientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {estadisticas.totalDescuentoOtorgado.toFixed(0)}€
                </div>
                <div className="text-xs text-gray-600">Descuento Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as typeof tabActiva)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todos">
            Todos ({todosCupones.length})
          </TabsTrigger>
          <TabsTrigger value="activos">
            Activos ({estadisticas.cuponesActivos})
          </TabsTrigger>
          <TabsTrigger value="expirados">
            Expirados ({estadisticas.cuponesExpirados})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tabActiva} className="mt-6">
          {cuponesFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {busqueda ? 'No se encontraron cupones' : 'No hay cupones en esta categoría'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Usos</TableHead>
                        <TableHead>Validez</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuponesFiltrados.map((cupon) => {
                        const ahora = new Date();
                        const fin = new Date(cupon.fechaFin);
                        const expirado = fin < ahora;

                        return (
                          <TableRow key={cupon.id}>
                            <TableCell>
                              <div className="font-mono font-semibold">{cupon.codigo}</div>
                              {cupon.origenCreacion === 'regla-automatica' && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Auto
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>{cupon.nombre}</div>
                              {cupon.descripcion && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {cupon.descripcion}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getIconoTipo(cupon.tipoDescuento)}
                                <span className="text-sm capitalize">
                                  {cupon.tipoDescuento}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatearDescuento(cupon)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {cupon.usosActuales}
                                {cupon.usosMaximos && ` / ${cupon.usosMaximos}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(parseISO(cupon.fechaFin), 'dd/MM/yy', { locale: es })}
                              </div>
                              {expirado && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs mt-1">
                                  Expirado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {cupon.activo ? (
                                <Badge className="bg-green-100 text-green-700">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100">
                                  Inactivo
                                </Badge>
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
                                  <DropdownMenuItem
                                    onClick={() => handleToggleActivo(cupon)}
                                  >
                                    {cupon.activo ? (
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
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCuponSeleccionado(cupon);
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Crear Cupón */}
      <Dialog open={modalCrear} onOpenChange={setModalCrear}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupón</DialogTitle>
            <DialogDescription>
              Configura un nuevo cupón de descuento para tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Código */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Código del Cupón *</label>
              <Input
                placeholder="VERANO2024"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                className="uppercase font-mono"
              />
              <p className="text-xs text-gray-500">Código único que los clientes usarán</p>
            </div>

            {/* Nombre */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                placeholder="Verano 2024"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="Descripción del cupón..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            {/* Tipo de descuento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tipo de Descuento *</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.tipoDescuento}
                  onChange={(e) => setFormData({ ...formData, tipoDescuento: e.target.value as any })}
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="fijo">Fijo (€)</option>
                  <option value="regalo">Regalo</option>
                  <option value="envio-gratis">Envío Gratis</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Valor *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.valorDescuento}
                  onChange={(e) => setFormData({ ...formData, valorDescuento: parseFloat(e.target.value) })}
                  placeholder={formData.tipoDescuento === 'porcentaje' ? '10' : '5'}
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Fecha Inicio *</label>
                <Input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Fecha Fin *</label>
                <Input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />
              </div>
            </div>

            {/* Restricciones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Gasto Mínimo (€)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.gastoMinimo || ''}
                  onChange={(e) => setFormData({ ...formData, gastoMinimo: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Opcional"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Usos Máximos</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usosMaximos || ''}
                  onChange={(e) => setFormData({ ...formData, usosMaximos: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Usos Máximos por Cliente</label>
              <Input
                type="number"
                min="1"
                value={formData.usosMaximosPorCliente || ''}
                onChange={(e) => setFormData({ ...formData, usosMaximosPorCliente: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="1"
              />
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
            <Button onClick={handleCrearCupon} disabled={procesando}>
              {procesando ? 'Creando...' : 'Crear Cupón'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cupón</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el cupón {cuponSeleccionado?.codigo}?
              Esta acción no se puede deshacer.
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
            <Button
              variant="destructive"
              onClick={handleEliminarCupon}
              disabled={procesando}
            >
              {procesando ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
