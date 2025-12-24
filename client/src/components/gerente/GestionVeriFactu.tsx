/**
 * COMPONENTE DE GESTIÓN VERIFACTU
 * Panel completo para gestionar el sistema VeriFactu
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Download,
  QrCode,
  FileText,
  Settings,
  AlertTriangle,
  Info,
  TrendingUp,
  Activity,
  Key,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import verifactuService from '../../services/verifactu.service';
import {
  FacturaVeriFactu,
  EstadisticasVeriFactu,
  LogVeriFactu,
  ConfiguracionVeriFactu,
  EstadoVeriFactu,
} from '../../types/verifactu.types';

export function GestionVeriFactu() {
  const [activeTab, setActiveTab] = useState('facturas');
  const [facturas, setFacturas] = useState<FacturaVeriFactu[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasVeriFactu | null>(null);
  const [logs, setLogs] = useState<LogVeriFactu[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionVeriFactu | null>(null);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturaVeriFactu | null>(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [dialogConfig, setDialogConfig] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const stats = verifactuService.obtenerEstadisticas();
    const logsData = verifactuService.obtenerLogs(50);
    const config = verifactuService.obtenerConfiguracion();

    setEstadisticas(stats);
    setLogs(logsData);
    setConfiguracion(config);

    // Cargar facturas simuladas (en producción vendrían de Supabase)
    setFacturas(obtenerFacturasSimuladas());
  };

  // ============================================
  // ACCIONES
  // ============================================

  const generarVeriFactu = async (factura: FacturaVeriFactu) => {
    try {
      setLoading(true);
      const facturaConVeriFactu = await verifactuService.generarVeriFactu(factura);
      
      // Actualizar factura en el estado
      setFacturas(prev => prev.map(f => f.id === factura.id ? facturaConVeriFactu : f));
      
      toast.success('VeriFactu generado correctamente', {
        description: `Hash: ${facturaConVeriFactu.verifactu?.hash.substring(0, 16)}...`,
      });
      
      cargarDatos();
    } catch (error) {
      toast.error('Error al generar VeriFactu', {
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarAEAT = async (factura: FacturaVeriFactu) => {
    try {
      setLoading(true);
      const resultado = await verifactuService.enviarAEAT(factura);
      
      if (resultado.exito) {
        toast.success('Factura enviada a AEAT', {
          description: resultado.mensaje,
        });
      } else {
        toast.error('Error al enviar a AEAT', {
          description: resultado.mensaje,
        });
      }
      
      cargarDatos();
    } catch (error) {
      toast.error('Error en el envío', {
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = (factura: FacturaVeriFactu) => {
    if (!factura.verifactu?.codigoQR) {
      toast.error('No hay código QR disponible');
      return;
    }

    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = factura.verifactu.codigoQR;
    link.download = `QR-${factura.numeroCompleto}.png`;
    link.click();

    toast.success('QR descargado correctamente');
  };

  const descargarXML = (factura: FacturaVeriFactu) => {
    toast.info('Función de descarga XML en desarrollo');
  };

  const verDetalles = (factura: FacturaVeriFactu) => {
    setFacturaSeleccionada(factura);
    setDialogDetalles(true);
  };

  // ============================================
  // UTILIDADES
  // ============================================

  const getEstadoBadge = (estado: EstadoVeriFactu) => {
    const config = {
      pendiente: { label: 'Pendiente', className: 'bg-gray-100 text-gray-800', icon: Clock },
      firmada: { label: 'Firmada', className: 'bg-blue-100 text-blue-800', icon: Lock },
      enviada: { label: 'Enviada', className: 'bg-purple-100 text-purple-800', icon: Send },
      validada: { label: 'Validada', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800', icon: XCircle },
      error: { label: 'Error', className: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
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

  const facturasFiltradas = facturas.filter(f =>
    f.numeroCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.emisor.razonSocial.toLowerCase().includes(busqueda.toLowerCase())
  );

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
            Sistema VeriFactu
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestión de facturas electrónicas según normativa AEAT
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cargarDatos}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setDialogConfig(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Facturas</p>
                  <p className="text-2xl text-gray-900 mt-1">{estadisticas.totalFacturas}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Firmadas</p>
                  <p className="text-2xl text-gray-900 mt-1">{estadisticas.facturasFirmadas}</p>
                </div>
                <Lock className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validadas</p>
                  <p className="text-2xl text-gray-900 mt-1">{estadisticas.facturasValidadas}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rechazadas</p>
                  <p className="text-2xl text-gray-900 mt-1">{estadisticas.facturasRechazadas}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="facturas">
            <FileText className="w-4 h-4 mr-2" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Registro de Actividad
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="w-4 h-4 mr-2" />
            Información
          </TabsTrigger>
        </TabsList>

        {/* TAB: Facturas */}
        <TabsContent value="facturas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facturas VeriFactu</CardTitle>
                  <CardDescription>Gestión de facturas electrónicas</CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facturasFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay facturas disponibles</p>
                  </div>
                ) : (
                  facturasFiltradas.map((factura) => (
                    <div
                      key={factura.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="text-gray-900">{factura.numeroCompleto}</p>
                            {factura.verifactu && getEstadoBadge(factura.verifactu.estado)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {factura.emisor.razonSocial}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(factura.fechaExpedicion).toLocaleDateString('es-ES')} •{' '}
                            {factura.importeTotal.toFixed(2)}€
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!factura.verifactu && (
                            <Button
                              size="sm"
                              onClick={() => generarVeriFactu(factura)}
                              disabled={loading}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Generar VeriFactu
                            </Button>
                          )}

                          {factura.verifactu?.estado === 'firmada' && (
                            <Button
                              size="sm"
                              onClick={() => enviarAEAT(factura)}
                              disabled={loading}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Enviar AEAT
                            </Button>
                          )}

                          {factura.verifactu && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => descargarQR(factura)}
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => descargarXML(factura)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verDetalles(factura)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {factura.verifactu && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Hash:</span>{' '}
                              {factura.verifactu.hash.substring(0, 24)}...
                            </div>
                            <div>
                              <span className="font-medium">ID VeriFactu:</span>{' '}
                              {factura.verifactu.idVeriFactu}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
              <CardDescription>Últimas operaciones VeriFactu</CardDescription>
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
                        <p className="text-xs text-gray-500 mt-1">Factura: {log.facturaId}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Información */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema VeriFactu</CardTitle>
              <CardDescription>Normativa y funcionamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-gray-900 mb-2">¿Qué es VeriFactu?</h4>
                <p className="text-sm text-gray-600">
                  VeriFactu es el sistema de verificación de facturas de la Agencia Tributaria
                  Española (AEAT). Permite registrar y verificar facturas electrónicas para
                  prevenir el fraude fiscal.
                </p>
              </div>

              <div>
                <h4 className="text-gray-900 mb-2">Características principales:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Generación de hash SHA-256 de cada factura</li>
                  <li>Encadenamiento criptográfico de facturas</li>
                  <li>Código QR para verificación pública</li>
                  <li>Firma electrónica opcional con certificado digital</li>
                  <li>Envío automático a la AEAT</li>
                  <li>Formato XML según normativa FacturaE</li>
                </ul>
              </div>

              <div>
                <h4 className="text-gray-900 mb-2">Estado del sistema:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Modo de operación</span>
                    <Badge>
                      {configuracion?.modoProduccion ? 'Producción' : 'Pruebas'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Algoritmo hash</span>
                    <Badge variant="outline">{configuracion?.algoritmoHash}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Sistema informático</span>
                    <Badge variant="outline">
                      {configuracion?.nombreSistemaInformatico} v
                      {configuracion?.versionSistema}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Detalles de factura */}
      <Dialog open={dialogDetalles} onOpenChange={setDialogDetalles}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles VeriFactu</DialogTitle>
            <DialogDescription>
              Información completa de la factura {facturaSeleccionada?.numeroCompleto}
            </DialogDescription>
          </DialogHeader>

          {facturaSeleccionada?.verifactu && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={facturaSeleccionada.verifactu.codigoQR}
                  alt="Código QR VeriFactu"
                  className="w-48 h-48"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">ID VeriFactu</Label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {facturaSeleccionada.verifactu.idVeriFactu}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Hash (SHA-256)</Label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {facturaSeleccionada.verifactu.hash}
                  </p>
                </div>

                {facturaSeleccionada.verifactu.hashFacturaAnterior && (
                  <div>
                    <Label className="text-xs text-gray-600">Hash Factura Anterior</Label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {facturaSeleccionada.verifactu.hashFacturaAnterior}
                    </p>
                  </div>
                )}

                {facturaSeleccionada.verifactu.firma && (
                  <div>
                    <Label className="text-xs text-gray-600">Firma Electrónica</Label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {facturaSeleccionada.verifactu.firma.substring(0, 100)}...
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-gray-600">URL de Verificación</Label>
                  <a
                    href={facturaSeleccionada.verifactu.urlQR}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {facturaSeleccionada.verifactu.urlQR}
                  </a>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Estado</Label>
                  <div className="mt-1">
                    {getEstadoBadge(facturaSeleccionada.verifactu.estado)}
                  </div>
                </div>

                {facturaSeleccionada.verifactu.respuestaAEAT && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Label className="text-xs text-gray-600">Respuesta AEAT</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {facturaSeleccionada.verifactu.respuestaAEAT.descripcion}
                    </p>
                    {facturaSeleccionada.verifactu.respuestaAEAT.csv && (
                      <p className="text-xs text-gray-600 mt-1">
                        CSV: {facturaSeleccionada.verifactu.respuestaAEAT.csv}
                      </p>
                    )}
                  </div>
                )}
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

      {/* Dialog: Configuración */}
      <Dialog open={dialogConfig} onOpenChange={setDialogConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración VeriFactu</DialogTitle>
            <DialogDescription>
              Configura los parámetros del sistema VeriFactu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>NIF Empresa</Label>
              <Input value={configuracion?.nifEmpresa} disabled />
            </div>

            <div>
              <Label>Modo Producción</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={configuracion?.modoProduccion}
                  onCheckedChange={(checked) => {
                    if (configuracion) {
                      verifactuService.actualizarConfiguracion({ modoProduccion: checked });
                      cargarDatos();
                    }
                  }}
                />
                <span className="text-sm text-gray-600">
                  {configuracion?.modoProduccion
                    ? 'Modo Producción activo'
                    : 'Modo Pruebas activo'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  En modo producción, las facturas se enviarán realmente a la AEAT. Asegúrate
                  de tener un certificado digital válido.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogConfig(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function obtenerFacturasSimuladas(): FacturaVeriFactu[] {
  return [
    {
      id: 'FAC-001',
      serie: '2025',
      numero: '001',
      numeroCompleto: '2025/001',
      fechaExpedicion: new Date('2025-11-28'),
      horaExpedicion: '10:30:00',
      tipoFactura: 'F1',
      tipoOperacion: 'venta',
      facturaSimplificada: false,
      facturaSinDestinatario: false,
      emisor: {
        nif: 'B12345678',
        razonSocial: 'Udar Edge S.L.',
        direccion: {
          tipoVia: 'Calle',
          nombreVia: 'Gran Vía',
          numeroFinca: '45',
          codigoPostal: '28013',
          municipio: 'Madrid',
          provincia: 'Madrid',
          codigoPais: 'ES',
        },
      },
      receptor: {
        tipoIdentificador: 'NIF',
        numeroIdentificador: '12345678A',
        razonSocial: 'Cliente Ejemplo S.L.',
        codigoPais: 'ES',
      },
      lineas: [
        {
          numeroLinea: 1,
          descripcion: 'Producto Ejemplo',
          cantidad: 2,
          unidad: 'ud',
          precioUnitario: 10,
          descuento: 0,
          tipoIVA: 21,
          importeIVA: 4.2,
          baseImponible: 20,
          importeTotal: 24.2,
        },
      ],
      desgloseIVA: [
        {
          tipoIVA: 21,
          baseImponible: 20,
          cuotaIVA: 4.2,
        },
      ],
      baseImponibleTotal: 20,
      cuotaIVATotal: 4.2,
      importeTotal: 24.2,
    },
    {
      id: 'FAC-002',
      serie: '2025',
      numero: '002',
      numeroCompleto: '2025/002',
      fechaExpedicion: new Date('2025-11-27'),
      horaExpedicion: '15:45:00',
      tipoFactura: 'F1',
      tipoOperacion: 'venta',
      facturaSimplificada: false,
      facturaSinDestinatario: false,
      emisor: {
        nif: 'B12345678',
        razonSocial: 'Udar Edge S.L.',
        direccion: {
          tipoVia: 'Calle',
          nombreVia: 'Gran Vía',
          numeroFinca: '45',
          codigoPostal: '28013',
          municipio: 'Madrid',
          provincia: 'Madrid',
          codigoPais: 'ES',
        },
      },
      receptor: {
        tipoIdentificador: 'NIF',
        numeroIdentificador: '87654321B',
        razonSocial: 'Otro Cliente S.L.',
        codigoPais: 'ES',
      },
      lineas: [
        {
          numeroLinea: 1,
          descripcion: 'Servicio Premium',
          cantidad: 1,
          unidad: 'ud',
          precioUnitario: 50,
          descuento: 0,
          tipoIVA: 21,
          importeIVA: 10.5,
          baseImponible: 50,
          importeTotal: 60.5,
        },
      ],
      desgloseIVA: [
        {
          tipoIVA: 21,
          baseImponible: 50,
          cuotaIVA: 10.5,
        },
      ],
      baseImponibleTotal: 50,
      cuotaIVATotal: 10.5,
      importeTotal: 60.5,
    },
  ];
}
