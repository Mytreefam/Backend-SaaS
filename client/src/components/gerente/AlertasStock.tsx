import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  ShoppingCart,
  Package,
  TrendingDown,
  Bell,
  Plus
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ModalCrearPedidoProveedor } from './modales/ModalCrearPedidoProveedor';
import { stockApi } from '../../services/api/gerente.api';

export function AlertasStock() {
  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    Promise.all([stockApi.obtenerAlertas(), stockApi.obtenerProveedores?.({})])
      .then(([alertasRes, proveedoresRes]) => {
        if (cancelled) return;
        setAlertas(Array.isArray(alertasRes) ? alertasRes : []);
        setProveedores(Array.isArray(proveedoresRes) ? proveedoresRes : []);
      })
      .catch(() => {
        if (cancelled) return;
        setAlertas([]);
        setProveedores([]);
      })
      .finally(() => {
        if (cancelled) return;
        setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stockActual = alertas;
  const articulosStockBajo = useMemo(() => {
    return stockActual.filter((a: any) => Number(a.stockActual ?? 0) > 0);
  }, [stockActual]);
  const articulosSinStock = useMemo(() => {
    return stockActual.filter((a: any) => Number(a.stockActual ?? 0) <= 0);
  }, [stockActual]);

  // Calcular métricas
  const totalArticulos = stockActual.length;
  const porcentajeStockBajo = (articulosStockBajo.length / totalArticulos) * 100;
  const porcentajeSinStock = (articulosSinStock.length / totalArticulos) * 100;
  const valorTotalStockBajo = articulosStockBajo.reduce(
    (sum: number, art: any) => sum + Number(art.stockActual || 0) * Number(art.precioUltimaCompra || 0),
    0,
  );

  // Agrupar alertas por proveedor
  const alertasPorProveedor = [...articulosStockBajo, ...articulosSinStock].reduce((acc, articulo: any) => {
    const proveedorNombre = articulo?.proveedor?.nombre || 'Sin proveedor';
    if (!acc[proveedorNombre]) {
      acc[proveedorNombre] = [];
    }
    acc[proveedorNombre].push(articulo);
    return acc;
  }, {} as Record<string, typeof articulosStockBajo>);

  const crearPedidoAutomatico = (proveedorNombre: string) => {
    const proveedor = proveedores.find(p => p.nombre === proveedorNombre);
    
    if (!proveedor) {
      toast.error('Proveedor no encontrado');
      return;
    }

    toast.info('Creando pedido automático...', {
      description: `Se creará un pedido con los artículos con stock bajo de ${proveedorNombre}`
    });

    console.log('🛒 CREAR PEDIDO AUTOMÁTICO', {
      proveedor: proveedorNombre,
      articulos: alertasPorProveedor[proveedorNombre].length,
      valorEstimado: alertasPorProveedor[proveedorNombre].reduce(
        (sum: number, art: any) => sum + (Number(art.stockMinimo || 0) - Number(art.stockActual || 0)) * Number(art.precioUltimaCompra || 0),
        0
      ).toFixed(2)
    });

    // Aquí se abriría el modal de crear pedido con los artículos pre-cargados
    setModalPedidoAbierto(true);
  };

  const getColorNivelStock = (stock: number, stockMinimo: number = 100) => {
    const porcentaje = (stock / stockMinimo) * 100;
    if (porcentaje === 0) return { bg: 'bg-red-500', text: 'text-red-600', label: 'Sin stock' };
    if (porcentaje < 25) return { bg: 'bg-red-500', text: 'text-red-600', label: 'Crítico' };
    if (porcentaje < 50) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Bajo' };
    if (porcentaje < 75) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Medio' };
    return { bg: 'bg-green-500', text: 'text-green-600', label: 'Óptimo' };
  };

  return (
    <div className="space-y-4">
      {/* Métricas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-amber-700">Stock Bajo</p>
                <p className="text-2xl font-bold text-amber-900">{cargando ? '—' : articulosStockBajo.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <Progress value={Number.isFinite(porcentajeStockBajo) ? porcentajeStockBajo : 0} className="h-2 bg-amber-200" />
            <p className="text-xs text-amber-700 mt-2">
              {cargando ? '—' : `${(Number.isFinite(porcentajeStockBajo) ? porcentajeStockBajo : 0).toFixed(1)}% del inventario`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-red-700">Sin Stock</p>
                <p className="text-2xl font-bold text-red-900">{cargando ? '—' : articulosSinStock.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <Progress value={Number.isFinite(porcentajeSinStock) ? porcentajeSinStock : 0} className="h-2 bg-red-200" />
            <p className="text-xs text-red-700 mt-2">
              Requiere atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-blue-700">Valor en Riesgo</p>
                <p className="text-2xl font-bold text-blue-900">
                  {cargando ? '—' : `€${valorTotalStockBajo.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Stock bajo valoración
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-green-700">Stock Óptimo</p>
                <p className="text-2xl font-bold text-green-900">
                  {cargando ? '—' : totalArticulos - articulosStockBajo.length - articulosSinStock.length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-700 mt-2">
              {cargando
                ? '—'
                : `${(
                    (1 - (articulosStockBajo.length + articulosSinStock.length) / Math.max(1, totalArticulos)) *
                    100
                  ).toFixed(1)}% del inventario`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas por Proveedor */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Alertas por Proveedor
              </CardTitle>
              <CardDescription>
                Artículos que requieren reposición agrupados por proveedor
              </CardDescription>
            </div>
            <Button
              onClick={() => setModalPedidoAbierto(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pedido
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(alertasPorProveedor).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-semibold text-gray-900">¡Todo en orden!</p>
                <p className="text-sm text-gray-600">No hay artículos con stock bajo en este momento</p>
              </div>
            ) : (
              Object.entries(alertasPorProveedor).map(([proveedorNombre, articulos]) => {
                const proveedor = proveedores.find(p => p.nombre === proveedorNombre);
                const articulosCriticos = (articulos as any[]).filter(a => Number((a as any).stockActual ?? 0) <= 0);
                const articulosBajos = (articulos as any[]).filter(a => Number((a as any).stockActual ?? 0) > 0);

                return (
                  <Card key={proveedorNombre} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{proveedorNombre}</p>
                            <p className="text-xs text-gray-600">
                              {articulos.length} artículo{articulos.length !== 1 ? 's' : ''} pendiente{articulos.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {articulosCriticos.length > 0 && (
                            <Badge className="bg-red-600">
                              {articulosCriticos.length} sin stock
                            </Badge>
                          )}
                          {articulosBajos.length > 0 && (
                            <Badge className="bg-amber-600">
                              {articulosBajos.length} stock bajo
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => crearPedidoAutomatico(proveedorNombre)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Crear Pedido
                          </Button>
                        </div>
                      </div>

                      {/* Lista de artículos */}
                      <div className="space-y-2 mt-3">
                        {articulos.slice(0, 3).map((articulo) => {
                          const stock = Number((articulo as any).stockActual ?? 0);
                          const stockMinimo = Number((articulo as any).stockMinimo ?? 100);
                          const colorNivel = getColorNivelStock(stock, stockMinimo);
                          const porcentajeStock = stockMinimo > 0 ? (stock / stockMinimo) * 100 : 0;

                          return (
                            <div
                              key={(articulo as any).id}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium">{(articulo as any).nombre}</p>
                                  <Badge variant="outline" className={`${colorNivel.text} text-xs`}>
                                    {colorNivel.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={Math.min(100, Math.max(0, porcentajeStock))} className="h-1.5 flex-1" />
                                  <span className="text-xs text-gray-600 w-20 text-right">
                                    {stock} {(articulo as any).unidadMedida || 'u'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {articulos.length > 3 && (
                          <p className="text-xs text-gray-500 text-center pt-1">
                            + {articulos.length - 3} artículo{articulos.length - 3 !== 1 ? 's' : ''} más
                          </p>
                        )}
                      </div>

                      {/* Info del proveedor */}
                      {proveedor && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                          <div className="flex items-center justify-between gap-4">
                            <span>Contacto: {proveedor.contactoNombre || '—'}</span>
                            <span>Pago: {proveedor.condicionesPago || '—'}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla Detallada de Artículos con Stock Bajo */}
      {articulosStockBajo.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Detalle de Artículos con Stock Bajo</CardTitle>
            <CardDescription>
              Listado completo de artículos que requieren reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Artículo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock Actual</TableHead>
                    <TableHead className="text-right">Precio/Unidad</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articulosStockBajo.map((articulo: any) => {
                    const stock = Number(articulo.stockActual ?? 0);
                    const stockMinimo = Number(articulo.stockMinimo ?? 100);
                    const colorNivel = getColorNivelStock(stock, stockMinimo);

                    return (
                      <TableRow key={articulo.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{articulo.nombre}</p>
                            <p className="text-xs text-gray-500">{articulo.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {articulo.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${colorNivel.text}`}>
                            {stock} {articulo.unidadMedida || 'u'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          €{Number(articulo.precioUltimaCompra || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {articulo?.proveedor?.nombre || 'Sin asignar'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${colorNivel.text}`}>
                            {colorNivel.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setArticuloSeleccionado(String(articulo.id));
                              setModalPedidoAbierto(true);
                            }}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Pedir
                          </Button>
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

      {/* Modal Crear Pedido */}
      <ModalCrearPedidoProveedor
        isOpen={modalPedidoAbierto}
        onClose={() => {
          setModalPedidoAbierto(false);
          setArticuloSeleccionado(null);
        }}
        onCrearPedido={(pedido) => {
          console.log('Pedido creado desde alertas:', pedido);
          toast.success('Pedido creado correctamente');
        }}
      />
    </div>
  );
}
