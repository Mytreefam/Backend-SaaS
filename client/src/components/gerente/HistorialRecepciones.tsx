import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Package,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  MapPin,
  User,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Truck,
  Box,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { stockManager } from '../../data/stock-manager';
import { pedidosProveedores } from '../../data/pedidos-proveedores';
import { proveedores } from '../../data/proveedores';
import { Separator } from '../ui/separator';

export function HistorialRecepciones() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState<string>('todos');
  const [filtroPdv, setFiltroPdv] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('30');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 15;

  // Modal detalle
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<any>(null);

  // Obtener todas las recepciones del stockManager
  const todasRecepciones = useMemo(() => {
    const movimientos = stockManager.getMovimientos();
    
    // Agrupar movimientos de tipo 'recepcion' por número de albarán
    const recepcionesAgrupadas: Record<string, any> = {};
    
    movimientos
      .filter(m => m.tipo === 'recepcion')
      .forEach(mov => {
        const numeroAlbaran = mov.numeroAlbaran || `REC-${mov.id.substring(0, 8)}`;
        
        if (!recepcionesAgrupadas[numeroAlbaran]) {
          recepcionesAgrupadas[numeroAlbaran] = {
            id: mov.id,
            numeroAlbaran,
            fecha: mov.fecha,
            proveedorNombre: mov.observaciones?.split(' - ')[0] || 'Proveedor desconocido',
            pdv: mov.pdv,
            usuario: mov.usuario,
            pedidoRelacionado: mov.pedidoId,
            lineas: [],
            cantidadArticulos: 0,
            valorTotal: 0
          };
        }
        
        recepcionesAgrupadas[numeroAlbaran].lineas.push({
          articuloId: mov.articuloId,
          articuloNombre: mov.observaciones?.split(' - ')[1] || mov.articuloId,
          cantidad: mov.cantidad,
          unidad: mov.unidad,
          lote: mov.lote,
          caducidad: mov.caducidad
        });
        
        recepcionesAgrupadas[numeroAlbaran].cantidadArticulos += 1;
      });
    
    // Calcular valores totales desde los pedidos relacionados
    return Object.values(recepcionesAgrupadas).map(rec => {
      if (rec.pedidoRelacionado) {
        const pedido = pedidosProveedores.find(p => p.id === rec.pedidoRelacionado);
        if (pedido) {
          rec.valorTotal = pedido.total;
          rec.proveedorNombre = pedido.proveedorNombre;
        }
      }
      return rec;
    });
  }, []);

  // Calcular métricas
  const metricas = useMemo(() => {
    const hoy = new Date();
    const fecha30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fecha7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recepcionesUltimos30 = todasRecepciones.filter(r => new Date(r.fecha) >= fecha30Dias);
    const recepcionesUltimos7 = todasRecepciones.filter(r => new Date(r.fecha) >= fecha7Dias);

    const articulosRecibidos30 = recepcionesUltimos30.reduce((sum, r) => sum + r.cantidadArticulos, 0);
    const valorTotal30 = recepcionesUltimos30.reduce((sum, r) => sum + r.valorTotal, 0);

    // Calcular recepciones con diferencias (mock - en producción compararía con pedido)
    const recepcionesConDiferencias = Math.floor(todasRecepciones.length * 0.15); // 15% tienen diferencias

    return {
      totalRecepciones: todasRecepciones.length,
      recepcionesUltimos30: recepcionesUltimos30.length,
      recepcionesUltimos7: recepcionesUltimos7.length,
      articulosRecibidos: articulosRecibidos30,
      valorTotal: valorTotal30,
      recepcionesConDiferencias
    };
  }, [todasRecepciones]);

  // Filtrar recepciones
  const recepcionesFiltradas = useMemo(() => {
    let resultado = [...todasRecepciones];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        r =>
          r.numeroAlbaran.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.proveedorNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.lineas.some((l: any) => l.articuloNombre.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    // Filtro por proveedor
    if (filtroProveedor !== 'todos') {
      resultado = resultado.filter(r => r.proveedorNombre.includes(filtroProveedor));
    }

    // Filtro por PDV
    if (filtroPdv !== 'todos') {
      resultado = resultado.filter(r => r.pdv === filtroPdv);
    }

    // Filtro por fecha
    const hoy = new Date();
    if (filtroFecha !== 'todos') {
      const dias = parseInt(filtroFecha);
      const fechaLimite = new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000);
      resultado = resultado.filter(r => new Date(r.fecha) >= fechaLimite);
    }

    return resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [todasRecepciones, busqueda, filtroProveedor, filtroPdv, filtroFecha]);

  // Paginación
  const totalPaginas = Math.ceil(recepcionesFiltradas.length / itemsPorPagina);
  const recepcionesPaginadas = recepcionesFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleVerDetalle = (recepcion: any) => {
    setRecepcionSeleccionada(recepcion);
    setModalDetalleAbierto(true);
  };

  const handleDescargarAlbaran = (recepcion: any) => {
    toast.info('Descargando albarán...', {
      description: `Generando PDF del albarán ${recepcion.numeroAlbaran}`
    });
    console.log('📄 DESCARGAR ALBARÁN:', recepcion.numeroAlbaran);
  };

  const handleExportarExcel = () => {
    toast.info('Exportando a Excel...', {
      description: `Generando archivo con ${recepcionesFiltradas.length} recepciones`
    });
    console.log('📊 EXPORTAR EXCEL - Recepciones:', recepcionesFiltradas.length);
  };

  const formatearFecha = (fecha: Date | string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha: Date | string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  const getPedidoInfo = (pedidoId?: string) => {
    if (!pedidoId) return null;
    return pedidosProveedores.find(p => p.id === pedidoId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Historial de Recepciones
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Registro completo de todas las recepciones de material
          </p>
        </div>
        <Button
          onClick={handleExportarExcel}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-teal-700">Últimos 30 días</p>
                <p className="text-2xl font-bold text-teal-900">{metricas.recepcionesUltimos30}</p>
              </div>
              <Package className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-xs text-teal-700">
              {metricas.articulosRecibidos} artículos recibidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-blue-700">Valor Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatearMoneda(metricas.valorTotal)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-green-700">Esta Semana</p>
                <p className="text-2xl font-bold text-green-900">{metricas.recepcionesUltimos7}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-700">
              Recepciones registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-amber-700">Con Diferencias</p>
                <p className="text-2xl font-bold text-amber-900">{metricas.recepcionesConDiferencias}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700">
              Requieren revisión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            {/* Primera fila: Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por albarán, proveedor, usuario o artículo..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Segunda fila: Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filtroProveedor} onValueChange={(val) => {
                setFiltroProveedor(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los proveedores</SelectItem>
                  {proveedores.map(prov => (
                    <SelectItem key={prov.id} value={prov.nombre}>
                      {prov.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroPdv} onValueChange={(val) => {
                setFiltroPdv(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="PDV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los PDV</SelectItem>
                  <SelectItem value="tiana">Tiana</SelectItem>
                  <SelectItem value="badalona">Badalona</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroFecha} onValueChange={(val) => {
                setFiltroFecha(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="todos">Todas las fechas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador */}
            <div className="text-sm text-gray-600">
              Mostrando {recepcionesPaginadas.length} de {recepcionesFiltradas.length} recepciones
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Recepciones */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Albarán</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Pedido Relacionado</TableHead>
                  <TableHead>Artículos</TableHead>
                  <TableHead>PDV Destino</TableHead>
                  <TableHead>Recibido por</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recepcionesPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Box className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        No hay recepciones
                      </p>
                      <p className="text-sm text-gray-600">
                        {busqueda || filtroProveedor !== 'todos' || filtroPdv !== 'todos'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Las recepciones de material aparecerán aquí'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recepcionesPaginadas.map((recepcion) => {
                    const pedidoInfo = getPedidoInfo(recepcion.pedidoRelacionado);
                    
                    return (
                      <TableRow key={recepcion.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            <span className="font-medium text-sm">{recepcion.numeroAlbaran}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{formatearFecha(recepcion.fecha)}</p>
                            <p className="text-xs text-gray-500">{formatearHora(recepcion.fecha)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{recepcion.proveedorNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pedidoInfo ? (
                            <div>
                              <p className="text-sm font-medium text-blue-600">{pedidoInfo.numero}</p>
                              <Badge 
                                variant="outline" 
                                className="text-xs mt-1"
                              >
                                {pedidoInfo.estado}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin pedido</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{recepcion.cantidadArticulos} artículo{recepcion.cantidadArticulos !== 1 ? 's' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            <MapPin className="w-3 h-3 mr-1" />
                            {recepcion.pdv}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{recepcion.usuario}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {recepcion.valorTotal > 0 ? (
                            <span className="font-semibold">{formatearMoneda(recepcion.valorTotal)}</span>
                          ) : (
                            <span className="text-xs text-gray-400">N/D</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalle(recepcion)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDescargarAlbaran(recepcion)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
              <p className="text-sm text-gray-600">
                Página {paginaActual} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (paginaActual <= 3) {
                    pageNum = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pageNum = totalPaginas - 4 + i;
                  } else {
                    pageNum = paginaActual - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={pageNum === paginaActual ? 'default' : 'outline'}
                      className={pageNum === paginaActual ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPaginaActual(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detalle Recepción */}
      <Dialog open={modalDetalleAbierto} onOpenChange={setModalDetalleAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Detalle de Recepción
            </DialogTitle>
            <DialogDescription>
              Información completa del albarán de recepción
            </DialogDescription>
          </DialogHeader>

          {recepcionSeleccionada && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{recepcionSeleccionada.numeroAlbaran}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Recibido el {formatearFecha(recepcionSeleccionada.fecha)} a las {formatearHora(recepcionSeleccionada.fecha)}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Recepción Completada
                </Badge>
              </div>

              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-gray-900 mb-2">{recepcionSeleccionada.proveedorNombre}</p>
                    {recepcionSeleccionada.pedidoRelacionado && (() => {
                      const pedido = getPedidoInfo(recepcionSeleccionada.pedidoRelacionado);
                      return pedido ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">
                            Pedido: <span className="font-medium">{pedido.numero}</span>
                          </p>
                          <p className="text-xs text-gray-600">
                            Estado: <span className="font-medium capitalize">{pedido.estado}</span>
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Destino y Recepción
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        <span className="text-gray-600">PDV:</span>{' '}
                        <span className="font-semibold capitalize">{recepcionSeleccionada.pdv}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        <span className="text-gray-600">Recibido por:</span>{' '}
                        <span className="font-semibold">{recepcionSeleccionada.usuario}</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Artículos Recibidos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Artículos Recibidos</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Artículo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Caducidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recepcionSeleccionada.lineas.map((linea: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{linea.articuloNombre}</p>
                              <p className="text-xs text-gray-500">{linea.articuloId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {linea.cantidad} {linea.unidad}
                          </TableCell>
                          <TableCell>
                            {linea.lote ? (
                              <Badge variant="outline" className="text-xs">
                                {linea.lote}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {linea.caducidad ? (
                              <span className="text-sm">{formatearFecha(linea.caducidad)}</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total de artículos recibidos:</p>
                    <p className="text-2xl font-bold text-gray-900">{recepcionSeleccionada.cantidadArticulos}</p>
                  </div>
                  {recepcionSeleccionada.valorTotal > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Valor total:</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {formatearMoneda(recepcionSeleccionada.valorTotal)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleDescargarAlbaran(recepcionSeleccionada)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Albarán
                </Button>
                <Button
                  onClick={() => setModalDetalleAbierto(false)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
