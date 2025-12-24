/**
 * COMPONENTE: MIS FACTURAS (CLIENTE)
 * Panel donde el cliente ve todas sus facturas recibidas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  FileText,
  Download,
  QrCode,
  Search,
  Calendar,
  Eye,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import facturacionAutomaticaService from '../../services/facturacion-automatica.service';
import { FacturaVeriFactu } from '../../types/verifactu.types';

interface MisFacturasProps {
  clienteId?: string; // ID del cliente actual
  clienteNIF?: string; // NIF del cliente actual
}

export function MisFacturas({ clienteId, clienteNIF }: MisFacturasProps) {
  const [facturas, setFacturas] = useState<FacturaVeriFactu[]>([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState<FacturaVeriFactu[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturaVeriFactu | null>(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar facturas al montar
  useEffect(() => {
    cargarFacturas();
  }, [clienteId, clienteNIF]);

  // Filtrar cuando cambia la búsqueda
  useEffect(() => {
    filtrarFacturas();
  }, [busqueda, facturas]);

  const cargarFacturas = () => {
    setLoading(true);
    try {
      // Obtener todas las facturas
      const todasFacturas = facturacionAutomaticaService.obtenerTodasLasFacturas();

      // Filtrar las del cliente actual
      // En producción, esto vendría filtrado del backend
      const facturasCliente = todasFacturas.filter((f) => {
        if (clienteNIF && f.receptor?.numeroIdentificador === clienteNIF) {
          return true;
        }
        if (clienteId && f.referenciaExterna?.includes(clienteId)) {
          return true;
        }
        return false;
      });

      // Ordenar por fecha descendente (más recientes primero)
      facturasCliente.sort((a, b) => {
        return new Date(b.fechaExpedicion).getTime() - new Date(a.fechaExpedicion).getTime();
      });

      setFacturas(facturasCliente);
      setFacturasFiltradas(facturasCliente);
    } catch (error) {
      toast.error('Error cargando facturas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarFacturas = () => {
    if (!busqueda.trim()) {
      setFacturasFiltradas(facturas);
      return;
    }

    const busquedaLower = busqueda.toLowerCase();
    const filtradas = facturas.filter(
      (f) =>
        f.numeroCompleto.toLowerCase().includes(busquedaLower) ||
        f.referenciaExterna?.toLowerCase().includes(busquedaLower) ||
        f.fechaExpedicion.toLocaleDateString('es-ES').includes(busquedaLower)
    );

    setFacturasFiltradas(filtradas);
  };

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

    toast.success('Código QR descargado');
  };

  const verificarFacturaAEAT = (factura: FacturaVeriFactu) => {
    if (!factura.verifactu?.urlQR) {
      toast.error('URL de verificación no disponible');
      return;
    }

    window.open(factura.verifactu.urlQR, '_blank');
    toast.info('Abriendo portal de verificación AEAT');
  };

  const reenviarEmail = (factura: FacturaVeriFactu) => {
    toast.success('Factura reenviada por email', {
      description: 'Recibirás una copia en tu correo',
    });
  };

  // Calcular totales
  const totalFacturado = facturas.reduce((sum, f) => sum + f.importeTotal, 0);
  const totalIVA = facturas.reduce((sum, f) => sum + f.cuotaIVATotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Mis Facturas
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Todas tus facturas con código QR VeriFactu
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturas</p>
                <p className="text-2xl text-gray-900 mt-1">{facturas.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 opacity-50" />
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total IVA</p>
                <p className="text-2xl text-gray-900 mt-1">{totalIVA.toFixed(2)}€</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Facturas</CardTitle>
              <CardDescription>Descarga y verifica tus facturas</CardDescription>
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
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
              <p>Cargando facturas...</p>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                {facturas.length === 0
                  ? 'No tienes facturas todavía'
                  : 'No se encontraron facturas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {facturasFiltradas.map((factura) => (
                <div
                  key={factura.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-900">
                            Factura {factura.numeroCompleto}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(factura.fechaExpedicion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                            {factura.referenciaExterna && (
                              <span className="text-gray-400">
                                Pedido: {factura.referenciaExterna}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Totales */}
                      <div className="mt-3 flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Base: </span>
                          <span className="text-gray-900">
                            {factura.baseImponibleTotal.toFixed(2)}€
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">IVA: </span>
                          <span className="text-gray-900">
                            {factura.cuotaIVATotal.toFixed(2)}€
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total: </span>
                          <span className="text-gray-900">
                            {factura.importeTotal.toFixed(2)}€
                          </span>
                        </div>
                      </div>

                      {/* VeriFactu badge */}
                      {factura.verifactu && (
                        <div className="mt-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            VeriFactu Validado
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => verDetalles(factura)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
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

                      {factura.verifactu?.urlQR && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verificarFacturaAEAT(factura)}
                        >
                          <ExternalLink className="w-4 h-4" />
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

      {/* Dialog: Detalles de la factura */}
      <Dialog open={dialogDetalles} onOpenChange={setDialogDetalles}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
            <DialogDescription>
              Factura {facturaSeleccionada?.numeroCompleto}
            </DialogDescription>
          </DialogHeader>

          {facturaSeleccionada && (
            <div className="space-y-4">
              {/* Código QR */}
              {facturaSeleccionada.verifactu?.codigoQR && (
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <img
                    src={facturaSeleccionada.verifactu.codigoQR}
                    alt="Código QR VeriFactu"
                    className="w-48 h-48"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Escanea este código para verificar la factura en la web de la AEAT
                  </p>
                </div>
              )}

              {/* Información de la factura */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número de Factura</p>
                  <p className="text-gray-900">{facturaSeleccionada.numeroCompleto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Expedición</p>
                  <p className="text-gray-900">
                    {new Date(facturaSeleccionada.fechaExpedicion).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emisor</p>
                  <p className="text-gray-900">{facturaSeleccionada.emisor.razonSocial}</p>
                  <p className="text-sm text-gray-600">NIF: {facturaSeleccionada.emisor.nif}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Importe Total</p>
                  <p className="text-2xl text-gray-900">
                    {facturaSeleccionada.importeTotal.toFixed(2)}€
                  </p>
                </div>
              </div>

              {/* Líneas de factura */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Detalle</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Descripción</th>
                        <th className="text-right p-2">Cantidad</th>
                        <th className="text-right p-2">Precio</th>
                        <th className="text-right p-2">IVA</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaSeleccionada.lineas.map((linea) => (
                        <tr key={linea.numeroLinea} className="border-t">
                          <td className="p-2">{linea.descripcion}</td>
                          <td className="text-right p-2">{linea.cantidad}</td>
                          <td className="text-right p-2">{linea.precioUnitario.toFixed(2)}€</td>
                          <td className="text-right p-2">{linea.tipoIVA}%</td>
                          <td className="text-right p-2">{linea.importeTotal.toFixed(2)}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Imponible:</span>
                  <span className="text-gray-900">
                    {facturaSeleccionada.baseImponibleTotal.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA:</span>
                  <span className="text-gray-900">
                    {facturaSeleccionada.cuotaIVATotal.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900 text-xl">
                    {facturaSeleccionada.importeTotal.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Información VeriFactu */}
              {facturaSeleccionada.verifactu && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-900">
                        Factura validada con VeriFactu
                      </p>
                      <p className="text-xs text-green-700 mt-1 font-mono break-all">
                        Hash: {facturaSeleccionada.verifactu.hash.substring(0, 32)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => reenviarEmail(facturaSeleccionada!)}>
              <Mail className="w-4 h-4 mr-2" />
              Reenviar Email
            </Button>
            <Button onClick={() => setDialogDetalles(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
