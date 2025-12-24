import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Filter, ChevronDown } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca,
  EMPRESAS,
  MARCAS,
  PUNTOS_VENTA
} from '../../constants/empresaConfig';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Package, FileText, Star, TrendingUp, Plus } from 'lucide-react';

// ============================================
// INTERFACES
// ============================================

interface Proveedor {
  id: string;
  nombre: string;
  categoria: string;
  sla: number;
  evaluacion: number;
  pedidos: number;
}

export function ProveedoresGerente() {
  // Estado para filtros
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  // ============================================
  // DATOS MOCK - Ahora con más proveedores
  // ============================================
  const [proveedores] = useState<Proveedor[]>([
    { id: '1', nombre: 'Repuestos Premium SA', categoria: 'Autopartes', sla: 95, evaluacion: 4.5, pedidos: 45 },
    { id: '2', nombre: 'Lubricantes del Norte', categoria: 'Aceites', sla: 88, evaluacion: 4.2, pedidos: 32 },
    { id: '3', nombre: 'Distribuciones Cafés Barcelona', categoria: 'Café', sla: 92, evaluacion: 4.7, pedidos: 58 },
    { id: '4', nombre: 'Harinas Molinos del Sur SL', categoria: 'Panadería', sla: 85, evaluacion: 4.1, pedidos: 41 },
    { id: '5', nombre: 'Lácteos San Pedro', categoria: 'Lácteos', sla: 90, evaluacion: 4.6, pedidos: 52 },
    { id: '6', nombre: 'Azucarera Industrial', categoria: 'Azúcar', sla: 78, evaluacion: 3.9, pedidos: 28 },
    { id: '7', nombre: 'Levaduras Pro', categoria: 'Levaduras', sla: 94, evaluacion: 4.8, pedidos: 36 },
    { id: '8', nombre: 'Chocolates Premium', categoria: 'Chocolates', sla: 87, evaluacion: 4.4, pedidos: 44 },
    { id: '9', nombre: 'Frutos Secos Sol', categoria: 'Frutos Secos', sla: 91, evaluacion: 4.3, pedidos: 39 },
    { id: '10', nombre: 'Oleícola Española', categoria: 'Aceites', sla: 89, evaluacion: 4.5, pedidos: 47 },
    { id: '11', nombre: 'Especias del Mundo', categoria: 'Especias', sla: 93, evaluacion: 4.7, pedidos: 33 },
    { id: '12', nombre: 'Granja Feliz', categoria: 'Huevos', sla: 96, evaluacion: 4.9, pedidos: 62 },
    { id: '13', nombre: 'Materiales Hostelería Pro', categoria: 'Material', sla: 82, evaluacion: 4.0, pedidos: 29 },
    { id: '14', nombre: 'Envases y Embalajes SL', categoria: 'Envases', sla: 86, evaluacion: 4.2, pedidos: 37 },
    { id: '15', nombre: 'Tecnología TPV Systems', categoria: 'Tecnología', sla: 75, evaluacion: 3.8, pedidos: 18 },
    { id: '16', nombre: 'Servicios Limpieza Integral', categoria: 'Limpieza', sla: 88, evaluacion: 4.1, pedidos: 25 },
    { id: '17', nombre: 'Bebidas Refrescantes SA', categoria: 'Bebidas', sla: 91, evaluacion: 4.6, pedidos: 55 },
    { id: '18', nombre: 'Carnes Selectas Premium', categoria: 'Carnes', sla: 94, evaluacion: 4.8, pedidos: 48 },
  ]);

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo
  // ============================================

  const estadisticas = useMemo(() => {
    // GRUPO 1: Totales básicos
    const totalProveedores = proveedores.length;
    const totalPedidos = proveedores.reduce((sum, p) => sum + p.pedidos, 0);

    // GRUPO 2: Promedios
    const slaPromedio = proveedores.reduce((sum, p) => sum + p.sla, 0) / totalProveedores;
    const evaluacionMedia = proveedores.reduce((sum, p) => sum + p.evaluacion, 0) / totalProveedores;

    // GRUPO 3: Análisis de rendimiento
    const proveedoresExcelentes = proveedores.filter(p => p.sla >= 90 && p.evaluacion >= 4.5).length;
    const proveedoresBuenos = proveedores.filter(p => p.sla >= 80 && p.sla < 90 && p.evaluacion >= 4.0).length;
    const proveedoresMejorables = proveedores.filter(p => p.sla < 80 || p.evaluacion < 4.0).length;

    // GRUPO 4: Top performers
    const proveedorMayorSLA = proveedores.reduce((max, p) => p.sla > max.sla ? p : max, proveedores[0]);
    const proveedorMejorEvaluacion = proveedores.reduce((max, p) => p.evaluacion > max.evaluacion ? p : max, proveedores[0]);
    const proveedorMasPedidos = proveedores.reduce((max, p) => p.pedidos > max.pedidos ? p : max, proveedores[0]);

    // GRUPO 5: Por categoría
    const categorias = [...new Set(proveedores.map(p => p.categoria))];
    const totalCategorias = categorias.length;
    const pedidosPorCategoria = categorias.map(cat => ({
      categoria: cat,
      pedidos: proveedores.filter(p => p.categoria === cat).reduce((sum, p) => sum + p.pedidos, 0)
    })).sort((a, b) => b.pedidos - a.pedidos);

    // GRUPO 6: Análisis de actividad
    const pedidoPromedioPorProveedor = totalPedidos / totalProveedores;
    const proveedoresMuyActivos = proveedores.filter(p => p.pedidos > pedidoPromedioPorProveedor * 1.2).length;
    const proveedoresPocoActivos = proveedores.filter(p => p.pedidos < pedidoPromedioPorProveedor * 0.5).length;

    return {
      totalProveedores,
      totalPedidos,
      slaPromedio,
      evaluacionMedia,
      proveedoresExcelentes,
      proveedoresBuenos,
      proveedoresMejorables,
      proveedorMayorSLA,
      proveedorMejorEvaluacion,
      proveedorMasPedidos,
      totalCategorias,
      pedidosPorCategoria,
      pedidoPromedioPorProveedor,
      proveedoresMuyActivos,
      proveedoresPocoActivos,
    };
  }, [proveedores]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-600">Tarifas, pedidos y evaluación</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Filtro Multiselección */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center justify-between gap-2 w-full sm:w-auto"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>
                  {filtrosSeleccionados.length === 0 
                    ? 'Filtros' 
                    : `${filtrosSeleccionados.length} filtro${filtrosSeleccionados.length > 1 ? 's' : ''}`
                  }
                </span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-3">
              {/* Empresa */}
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                {EMPRESAS_ARRAY.map(empresa => (
                  <div key={empresa.id} className="flex items-center gap-2 mb-2">
                    <Checkbox 
                      id={`empresa-${empresa.id}`}
                      checked={filtrosSeleccionados.includes(empresa.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltrosSeleccionados([...filtrosSeleccionados, empresa.id]);
                        } else {
                          setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== empresa.id));
                        }
                      }}
                    />
                    <label htmlFor={`empresa-${empresa.id}`} className="text-sm cursor-pointer">
                      🏢 {getNombreEmpresa(empresa.id)}
                    </label>
                  </div>
                ))}
              </div>

              {/* Puntos de Venta */}
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                <div className="space-y-2">
                  {PUNTOS_VENTA_ARRAY.map(pdv => (
                    <div key={pdv.id} className="flex items-center gap-2">
                      <Checkbox 
                        id={`pdv-${pdv.id}`}
                        checked={filtrosSeleccionados.includes(pdv.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltrosSeleccionados([...filtrosSeleccionados, pdv.id]);
                          } else {
                            setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== pdv.id));
                          }
                        }}
                      />
                      <label htmlFor={`pdv-${pdv.id}`} className="text-sm cursor-pointer">
                        📍 {getNombrePDVConMarcas(pdv.id)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                <div className="space-y-2">
                  {MARCAS_ARRAY.map(marca => (
                    <div key={marca.id} className="flex items-center gap-2">
                      <Checkbox 
                        id={`marca-${marca.id}`}
                        checked={filtrosSeleccionados.includes(marca.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltrosSeleccionados([...filtrosSeleccionados, marca.id]);
                          } else {
                            setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== marca.id));
                          }
                        }}
                      />
                      <label htmlFor={`marca-${marca.id}`} className="text-sm cursor-pointer">
                        {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón limpiar */}
              {filtrosSeleccionados.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setFiltrosSeleccionados([])}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Búsqueda */}
        <Input
          placeholder="Buscar proveedores..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1"
        />

        {/* Mostrar filtros activos */}
        {filtrosSeleccionados.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {filtrosSeleccionados.map(id => {
              let label = '';
              if (EMPRESAS[id]) label = getNombreEmpresa(id);
              else if (PUNTOS_VENTA[id]) label = PUNTOS_VENTA[id].nombre;
              else if (MARCAS[id]) label = getNombreMarca(id);
              
              return (
                <Badge key={id} variant="outline" className="text-xs">
                  {label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* KPIs CALCULADOS DINÁMICAMENTE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Proveedores Activos</p>
                <p className="text-gray-900 text-2xl">{estadisticas.totalProveedores}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.totalCategorias} categorías
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pedidos (Mes)</p>
                <p className="text-gray-900 text-2xl">{estadisticas.totalPedidos}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ~{estadisticas.pedidoPromedioPorProveedor.toFixed(1)} por proveedor
                </p>
              </div>
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">SLA Promedio</p>
                <p className="text-gray-900 text-2xl">{estadisticas.slaPromedio.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.proveedoresExcelentes} excelentes (≥90%)
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Evaluación Media</p>
                <p className="text-gray-900 text-2xl">{estadisticas.evaluacionMedia.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo: {estadisticas.proveedorMejorEvaluacion.evaluacion.toFixed(1)} ⭐
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESTADÍSTICAS ADICIONALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rendimiento por Nivel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excelentes (SLA ≥90%, ⭐≥4.5)</span>
              <Badge className="bg-green-100 text-green-800">
                {estadisticas.proveedoresExcelentes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Buenos (SLA ≥80%, ⭐≥4.0)</span>
              <Badge className="bg-blue-100 text-blue-800">
                {estadisticas.proveedoresBuenos}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mejorables</span>
              <Badge className="bg-amber-100 text-amber-800">
                {estadisticas.proveedoresMejorables}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Mejor SLA</p>
              <p className="text-sm">{estadisticas.proveedorMayorSLA.nombre}</p>
              <p className="text-xs text-teal-600">{estadisticas.proveedorMayorSLA.sla}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mt-2">Más pedidos</p>
              <p className="text-sm">{estadisticas.proveedorMasPedidos.nombre}</p>
              <p className="text-xs text-teal-600">{estadisticas.proveedorMasPedidos.pedidos} pedidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actividad de Proveedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Muy activos</span>
              <Badge className="bg-purple-100 text-purple-800">
                {estadisticas.proveedoresMuyActivos}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Poco activos</span>
              <Badge className="bg-gray-100 text-gray-800">
                {estadisticas.proveedoresPocoActivos}
              </Badge>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Categoría más activa</p>
              <p className="text-sm">{estadisticas.pedidosPorCategoria[0]?.categoria}</p>
              <p className="text-xs text-teal-600">
                {estadisticas.pedidosPorCategoria[0]?.pedidos} pedidos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLA DE PROVEEDORES */}
      <Card>
        <CardHeader>
          <CardTitle>Cartera de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proveedores.map((prov) => (
              <div key={prov.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{prov.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-2">{prov.categoria}</p>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={
                        prov.sla >= 90 
                          ? "bg-green-100 text-green-800" 
                          : prov.sla >= 80 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      SLA: {prov.sla}%
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{prov.evaluacion}</span>
                    </div>
                    <span className="text-sm text-gray-600">{prov.pedidos} pedidos</span>
                    {prov.pedidos > estadisticas.pedidoPromedioPorProveedor * 1.2 && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        Muy activo
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline">Ver Detalles</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
