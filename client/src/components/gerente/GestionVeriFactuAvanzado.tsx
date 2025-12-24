/**
 * COMPONENTE DE GESTIÓN VERIFACTU AVANZADO (GERENTE)
 * Panel completo con descargas masivas, filtros y exportación
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  QrCode,
  FileText,
  Search,
  Calendar,
  Filter,
  Archive,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Package,
  Users,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import facturacionAutomaticaService from '../../services/facturacion-automatica.service';
import verifactuService from '../../services/verifactu.service';
import {
  FacturaVeriFactu,
  EstadisticasVeriFactu,
  LogVeriFactu,
  EstadoVeriFactu,
} from '../../types/verifactu.types';

export function GestionVeriFactuAvanzado() {
  const [activeTab, setActiveTab] = useState('facturas');
  const [facturas, setFacturas] = useState<FacturaVeriFactu[]>([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState<FacturaVeriFactu[]>([]);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<Set<string>>(new Set());
  const [estadisticas, setEstadisticas] = useState<EstadisticasVeriFactu | null>(null);
  const [logs, setLogs] = useState<LogVeriFactu[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturaVeriFactu | null>(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [dialogFiltros, setDialogFiltros] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtros avanzados
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estadoVeriFactu: 'todos',
    importeMin: '',
    importeMax: '',
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [busqueda, filtros, facturas]);

  const cargarDatos = () => {
    setLoading(true);
    try {
      // Cargar facturas
      const todasFacturas = facturacionAutomaticaService.obtenerTodasLasFacturas();
      setFacturas(todasFacturas);

      // Cargar estadísticas
      const stats = verifactuService.obtenerEstadisticas();
      setEstadisticas(stats);

      // Cargar logs
      const logsData = verifactuService.obtenerLogs(50);
      setLogs(logsData);

      toast.success('Datos actualizados');
    } catch (error) {
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...facturas];

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.numeroCompleto.toLowerCase().includes(busquedaLower) ||
          f.receptor?.razonSocial?.toLowerCase().includes(busquedaLower) ||
          f.receptor?.numeroIdentificador?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de fecha desde
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter((f) => new Date(f.fechaExpedicion) >= fechaDesde);
    }

    // Filtro de fecha hasta
    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter((f) => new Date(f.fechaExpedicion) <= fechaHasta);
    }

    // Filtro de estado VeriFactu
    if (filtros.estadoVeriFactu !== 'todos') {
      resultado = resultado.filter((f) => f.verifactu?.estado === filtros.estadoVeriFactu);
    }

    // Filtro de importe mínimo
    if (filtros.importeMin) {
      const importeMin = parseFloat(filtros.importeMin);
      resultado = resultado.filter((f) => f.importeTotal >= importeMin);
    }

    // Filtro de importe máximo
    if (filtros.importeMax) {
      const importeMax = parseFloat(filtros.importeMax);
      resultado = resultado.filter((f) => f.importeTotal <= importeMax);
    }

    setFacturasFiltradas(resultado);
  };

  // ============================================
  // ACCIONES INDIVIDUALES
  // ============================================

  const verDetalles = (factura: FacturaVeriFactu) => {
    setFacturaSeleccionada(factura);
    setDialogDetalles(true);
  };

  const descargarFactura = (factura: FacturaVeriFactu) => {
    facturacionAutomaticaService.descargarFactura(factura);
  };

  const descargarQR = (factura: FacturaVeriFactu) => {
    if (!factura.verifactu?.codigoQR) {
      toast.error('Código QR no disponible');
      return;
    }

    const link = document.createElement('a');
    link.href = factura.verifactu.codigoQR;
    link.download = `QR-${factura.numeroCompleto}.png`;
    link.click();

    toast.success('QR descargado');
  };

  // ============================================
  // SELECCIÓN MÚLTIPLE
  // ============================================

  const toggleSeleccion = (facturaId: string) => {
    const nuevasSeleccionadas = new Set(facturasSeleccionadas);
    if (nuevasSeleccionadas.has(facturaId)) {
      nuevasSeleccionadas.delete(facturaId);
    } else {
      nuevasSeleccionadas.add(facturaId);
    }
    setFacturasSeleccionadas(nuevasSeleccionadas);
  };

  const seleccionarTodas = () => {
    if (facturasSeleccionadas.size === facturasFiltradas.length) {
      // Deseleccionar todas
      setFacturasSeleccionadas(new Set());
    } else {
      // Seleccionar todas
      const ids = new Set(facturasFiltradas.map((f) => f.id));
      setFacturasSeleccionadas(ids);
    }
  };

  const limpiarSeleccion = () => {
    setFacturasSeleccionadas(new Set());
  };

  // ============================================
  // ACCIONES MASIVAS
  // ============================================

  const descargarSeleccionadas = async () => {
    if (facturasSeleccionadas.size === 0) {
      toast.error('No hay facturas seleccionadas');
      return;
    }

    const facturasADescargar = facturas.filter((f) => facturasSeleccionadas.has(f.id));

    toast.info('Descargando facturas...', {
      description: `${facturasADescargar.length} facturas`,
    });

    await facturacionAutomaticaService.descargarFacturasMasivo(facturasADescargar);

    limpiarSeleccion();
  };

  const exportarSeleccionadasCSV = () => {
    if (facturasSeleccionadas.size === 0) {
      toast.error('No hay facturas seleccionadas');
      return;
    }

    const facturasAExportar = facturas.filter((f) => facturasSeleccionadas.has(f.id));
    facturacionAutomaticaService.exportarFacturasCSV(facturasAExportar);

    limpiarSeleccion();
  };

  const exportarTodasCSV = () => {
    if (facturasFiltradas.length === 0) {
      toast.error('No hay facturas para exportar');
      return;
    }

    facturacionAutomaticaService.exportarFacturasCSV(facturasFiltradas);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      estadoVeriFactu: 'todos',
      importeMin: '',
      importeMax: '',
    });
    setBusqueda('');
  };

  // ============================================
  // ESTADÍSTICAS CALCULADAS
  // ============================================

  const totalFacturado = facturasFiltradas.reduce((sum, f) => sum + f.importeTotal, 0);
  const totalIVA = facturasFiltradas.reduce((sum, f) => sum + f.cuotaIVATotal, 0);
  const totalBase = facturasFiltradas.reduce((sum, f) => sum + f.baseImponibleTotal, 0);

  const getEstadoBadge = (estado: EstadoVeriFactu) => {
    const config = {
      pendiente: { label: 'Pendiente', className: 'bg-gray-100 text-gray-800', icon: Clock },
      firmada: { label: 'Firmada', className: 'bg-blue-100 text-blue-800', icon: Shield },
      enviada: { label: 'Enviada', className: 'bg-purple-100 text-purple-800', icon: Activity },
      validada: { label: 'Validada', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800', icon: XCircle },
      error: { label: 'Error', className: 'bg-orange-100 text-orange-800', icon: XCircle },
    };

    const cfg = config[estado];
    const Icon = cfg.icon;

    return (
      <Badge className={cfg.className}>
        <Icon className="w-3 h-3 mr-1" />
        {cfg.label}
      </Badge>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Gestión de Facturas VeriFactu
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Panel completo para gerente con descargas masivas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setDialogFiltros(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturas</p>
                <p className="text-2xl text-gray-900 mt-1">{facturasFiltradas.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Base Imponible</p>
                <p className="text-2xl text-gray-900 mt-1">{totalBase.toFixed(2)}€</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total IVA</p>
                <p className="text-2xl text-gray-900 mt-1">{totalIVA.toFixed(2)}€</p>
              </div>
              <Package className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturado</p>
                <p className="text-2xl text-gray-900 mt-1">{totalFacturado.toFixed(2)}€</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="facturas">
            <FileText className="w-4 h-4 mr-2" />
            Facturas ({facturasFiltradas.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        {/* TAB: Facturas */}
        <TabsContent value="facturas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Listado de Facturas</CardTitle>
                  <CardDescription>Gestión completa de facturas emitidas</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Buscador */}
                  <div className="w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar factura..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Barra de acciones masivas */}
              {facturasSeleccionadas.size > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-900">
                      {facturasSeleccionadas.size} factura(s) seleccionada(s)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={descargarSeleccionadas}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                      <Button size="sm" variant="outline" onClick={exportarSeleccionadasCSV}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={limpiarSeleccion}>
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Barra de acciones generales */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      facturasSeleccionadas.size === facturasFiltradas.length &&
                      facturasFiltradas.length > 0
                    }
                    onCheckedChange={seleccionarTodas}
                  />
                  <span className="text-sm text-gray-600">Seleccionar todas</span>
                </div>
                <Button size="sm" variant="outline" onClick={exportarTodasCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar Todas a CSV
                </Button>
              </div>

              {/* Listado */}
              {facturasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {facturas.length === 0
                      ? 'No hay facturas todavía'
                      : 'No se encontraron facturas con los filtros aplicados'}
                  </p>
                  {facturas.length > 0 && (
                    <Button variant="link" onClick={limpiarFiltros} className="mt-2">
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {facturasFiltradas.map((factura) => (
                    <div
                      key={factura.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={facturasSeleccionadas.has(factura.id)}
                          onCheckedChange={() => toggleSeleccion(factura.id)}
                        />

                        {/* Información */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-gray-900">{factura.numeroCompleto}</p>
                            {factura.verifactu && getEstadoBadge(factura.verifactu.estado)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {factura.receptor?.razonSocial || 'Cliente sin identificar'}
                            {factura.receptor?.numeroIdentificador &&
                              ` • NIF: ${factura.receptor.numeroIdentificador}`}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(factura.fechaExpedicion).toLocaleDateString('es-ES')}
                            </span>
                            <span>Base: {factura.baseImponibleTotal.toFixed(2)}€</span>
                            <span>IVA: {factura.cuotaIVATotal.toFixed(2)}€</span>
                            <span className="text-gray-900">
                              Total: {factura.importeTotal.toFixed(2)}€
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => verDetalles(factura)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => descargarFactura(factura)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {factura.verifactu?.codigoQR && (
                            <Button size="sm" variant="outline" onClick={() => descargarQR(factura)}>
                              <QrCode className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
              <CardDescription>Últimas operaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay actividad registrada</p>
                  </div>
                ) : (
                  logs.reverse().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {log.resultado === 'exito' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.accion}</Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(log.fecha).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{log.detalles}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Filtros Avanzados */}
      <Dialog open={dialogFiltros} onOpenChange={setDialogFiltros}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtros Avanzados</DialogTitle>
            <DialogDescription>Filtra las facturas por diferentes criterios</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Estado VeriFactu</Label>
              <Select
                value={filtros.estadoVeriFactu}
                onValueChange={(value) => setFiltros({ ...filtros, estadoVeriFactu: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="firmada">Firmada</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="validada">Validada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Importe Mínimo</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filtros.importeMin}
                  onChange={(e) => setFiltros({ ...filtros, importeMin: e.target.value })}
                />
              </div>
              <div>
                <Label>Importe Máximo</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filtros.importeMax}
                  onChange={(e) => setFiltros({ ...filtros, importeMax: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Button onClick={() => setDialogFiltros(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalles (igual que antes) */}
      <Dialog open={dialogDetalles} onOpenChange={setDialogDetalles}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Factura</DialogTitle>
            <DialogDescription>
              Factura {facturaSeleccionada?.numeroCompleto}
            </DialogDescription>
          </DialogHeader>

          {facturaSeleccionada?.verifactu && (
            <div className="space-y-4">
              {/* QR */}
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={facturaSeleccionada.verifactu.codigoQR}
                  alt="Código QR"
                  className="w-48 h-48"
                />
              </div>

              {/* Datos */}
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600">Hash VeriFactu</Label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {facturaSeleccionada.verifactu.hash}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Estado</Label>
                  <div className="mt-1">
                    {getEstadoBadge(facturaSeleccionada.verifactu.estado)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogDetalles(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
