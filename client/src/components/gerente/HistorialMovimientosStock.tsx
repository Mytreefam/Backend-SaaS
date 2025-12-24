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
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Package,
  TrendingUp,
  Search,
  Filter,
  Download,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { stockManager, TipoMovimiento } from '../../data/stock-manager';
import { toast } from 'sonner@2.0.3';

export function HistorialMovimientosStock() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroPdv, setFiltroPdv] = useState<string>('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  // Obtener movimientos del stockManager
  const todosMovimientos = stockManager.getMovimientos();

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    let resultado = [...todosMovimientos];

    // Filtro por búsqueda (nombre de artículo o referencia)
    if (busqueda) {
      resultado = resultado.filter(
        mov =>
          mov.articuloNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          mov.referencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
          mov.motivo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por tipo de movimiento
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(mov => mov.tipo === filtroTipo);
    }

    // Filtro por PDV
    if (filtroPdv !== 'todos') {
      resultado = resultado.filter(mov => mov.pdv === filtroPdv);
    }

    return resultado;
  }, [todosMovimientos, busqueda, filtroTipo, filtroPdv]);

  // Paginación
  const totalPaginas = Math.ceil(movimientosFiltrados.length / itemsPorPagina);
  const movimientosPaginados = movimientosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const getBadgeTipo = (tipo: TipoMovimiento) => {
    const configs = {
      entrada: { color: 'bg-green-100 text-green-800', icon: ArrowUpRight, label: 'Entrada' },
      salida: { color: 'bg-red-100 text-red-800', icon: ArrowDownRight, label: 'Salida' },
      recepcion: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Recepción' },
      produccion: { color: 'bg-purple-100 text-purple-800', icon: TrendingUp, label: 'Producción' },
      venta: { color: 'bg-orange-100 text-orange-800', icon: TrendingUp, label: 'Venta' },
      merma: { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle, label: 'Merma' },
      ajuste: { color: 'bg-gray-100 text-gray-800', icon: RefreshCw, label: 'Ajuste' },
    };

    const config = configs[tipo] || configs.ajuste;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportarExcel = () => {
    toast.info('Exportando a Excel...', {
      description: 'Esta funcionalidad estará disponible próximamente'
    });
    console.log('📊 EXPORTAR MOVIMIENTOS A EXCEL', {
      totalMovimientos: movimientosFiltrados.length,
      filtros: { tipo: filtroTipo, pdv: filtroPdv, busqueda }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Historial de Movimientos</CardTitle>
              <CardDescription>
                Registro completo de entradas, salidas y ajustes de inventario
              </CardDescription>
            </div>
            <Button
              onClick={exportarExcel}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por artículo, referencia o motivo..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select value={filtroTipo} onValueChange={(val) => {
              setFiltroTipo(val);
              setPaginaActual(1);
            }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="recepcion">Recepción</SelectItem>
                <SelectItem value="produccion">Producción</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="merma">Merma</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por PDV */}
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
          </div>

          {/* Contador de resultados */}
          <div className="mt-3 text-sm text-gray-600">
            Mostrando {movimientosPaginados.length} de {movimientosFiltrados.length} movimientos
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Stock Anterior</TableHead>
                  <TableHead className="text-right">Stock Nuevo</TableHead>
                  <TableHead>PDV</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay movimientos que mostrar</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientosPaginados.map((mov) => (
                    <TableRow key={mov.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatearFecha(mov.fecha)}
                      </TableCell>
                      <TableCell>{getBadgeTipo(mov.tipo)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{mov.articuloNombre}</p>
                          <p className="text-xs text-gray-500">{mov.articuloId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            mov.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {mov.cantidad > 0 ? '+' : ''}
                          {mov.cantidad} {mov.unidad}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-600">
                        {mov.cantidadAnterior} {mov.unidad}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-sm">
                          {mov.cantidadNueva} {mov.unidad}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {mov.pdv}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{mov.usuario}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {mov.motivo}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {mov.referencia || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
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
    </div>
  );
}
