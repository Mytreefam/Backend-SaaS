/**
 * 🎁 GESTIÓN DE PROMOCIONES - GERENTE
 * Panel maestro para crear, editar y gestionar promociones
 * Conecta con visualizaciones del Cliente y TPV
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
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
  DialogFooter,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Download,
  Upload,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  Percent,
  Gift,
  Package,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Store,
  Smartphone,
  Globe
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { promocionesApi } from '../../services/api/promociones.api';
import { clientesApi } from '../../services/api/clientes.api';

// ============================================================================
// Tipos (sin depender de mocks en /data)
// ============================================================================
type TipoPromocion = string;
type PublicoObjetivo = string;
type CanalPromocion = string;
type ProductoCombo = any;

interface PromocionDisponible {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  valor: number;
  descripcion: string;
  color?: string;
  activa: boolean;
  fechaInicio: string;
  fechaFin: string;
  publicoObjetivo: PublicoObjetivo;
  canal: CanalPromocion;
  destacada?: boolean;
  imagen?: string;
  limiteUsosPorCliente?: number;
  cantidadMinima?: number;
  horaInicio?: string;
  horaFin?: string;
  vecesUsada?: number;
  clientesQueUsaron?: string[];
  clientesAsignados?: string[];
  combos?: ProductoCombo[];
}

// ============================================
// TIPOS ADICIONALES
// ============================================

interface Cliente {
  id: string;
  nombre: string;
  segmento: string;
  email: string;
  telefono: string;
}

interface EstadisticasPromocion {
  totalPromociones: number;
  promocionesActivas: number;
  promocionesInactivas: number;
  totalUsos: number;
  clientesImpactados: number;
  descuentoPromedio: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PromocionesGerente() {
  // Estados principales
  const [promociones, setPromociones] = useState<PromocionDisponible[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPublico, setFiltroPublico] = useState<string>('todos');
  const [filtroCanal, setFiltroCanal] = useState<string>('todos');
  
  // Modales
  const [modalCrearEditar, setModalCrearEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);
  const [modalAsignarClientes, setModalAsignarClientes] = useState(false);
  const [modalEstadisticas, setModalEstadisticas] = useState(false);
  
  // Datos temporales
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<PromocionDisponible | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([]);
  const [busquedaClientes, setBusquedaClientes] = useState('');

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    Promise.all([promocionesApi.getAll(), clientesApi.getAll()])
      .then(([promos, clientesRes]) => {
        if (cancelled) return;
        const now = new Date();
        const promocionesMap = (Array.isArray(promos) ? promos : []).map((p: any) => {
          const validoHasta = p.validoHasta ? new Date(p.validoHasta) : null;
          const activa = !!validoHasta && validoHasta.getTime() >= now.getTime();
          const descuentoStr = String(p.descuento || '').trim();
          const valorNum = Number(descuentoStr.replace('%', '').replace(',', '.')) || 0;

          return {
            id: String(p.id),
            nombre: p.titulo || 'Promoción',
            tipo: (descuentoStr.includes('%') ? 'descuento_porcentaje' : 'precio_fijo') as any,
            valor: valorNum,
            descripcion: p.descripcion || '',
            color: 'blue',
            activa,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: validoHasta ? validoHasta.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            publicoObjetivo: 'general' as any,
            canal: 'ambos' as any,
            destacada: false,
            // métricas (si no se trackean aún, 0 / vacío)
            vecesUsada: 0,
            clientesQueUsaron: [],
            clientesAsignados: [],
          } as any;
        });

        setPromociones(promocionesMap as any);

        const clientesMap: Cliente[] = (Array.isArray(clientesRes) ? clientesRes : []).map((c: any) => ({
          id: String(c.id),
          nombre: c.nombre || 'Cliente',
          segmento: 'general',
          email: c.email || '',
          telefono: c.telefono || '',
        }));
        setClientes(clientesMap);
      })
      .catch(() => {
        if (cancelled) return;
        setPromociones([]);
        setClientes([]);
      })
      .finally(() => {
        if (cancelled) return;
        setCargando(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Formulario de nueva/editar promoción
  const [formData, setFormData] = useState<Partial<PromocionDisponible>>({
    nombre: '',
    tipo: 'descuento_porcentaje',
    valor: 0,
    descripcion: '',
    color: 'blue',
    activa: true,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    publicoObjetivo: 'general',
    canal: 'ambos',
    destacada: false,
  });

  // ============================================
  // CÁLCULOS Y FILTROS
  // ============================================

  const estadisticas = useMemo((): EstadisticasPromocion => {
    const activas = promociones.filter(p => p.activa).length;
    const totalUsos = promociones.reduce((sum, p) => sum + (p.vecesUsada || 0), 0);
    const clientesUnicos = new Set(
      promociones.flatMap(p => p.clientesQueUsaron || [])
    ).size;
    const descuentoPromedio = promociones
      .filter(p => p.tipo.includes('descuento'))
      .reduce((sum, p) => sum + p.valor, 0) / 
      promociones.filter(p => p.tipo.includes('descuento')).length || 0;

    return {
      totalPromociones: promociones.length,
      promocionesActivas: activas,
      promocionesInactivas: promociones.length - activas,
      totalUsos: totalUsos,
      clientesImpactados: clientesUnicos,
      descuentoPromedio: descuentoPromedio,
    };
  }, [promociones]);

  const promocionesFiltradas = useMemo(() => {
    return promociones.filter(promo => {
      // Filtro de búsqueda
      if (busqueda && !promo.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
          !promo.descripcion.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }

      // Filtro de tipo
      if (filtroTipo !== 'todos' && promo.tipo !== filtroTipo) {
        return false;
      }

      // Filtro de estado
      if (filtroEstado === 'activas' && !promo.activa) return false;
      if (filtroEstado === 'inactivas' && promo.activa) return false;

      // Filtro de público
      if (filtroPublico !== 'todos' && promo.publicoObjetivo !== filtroPublico) {
        return false;
      }

      // Filtro de canal
      if (filtroCanal !== 'todos' && promo.canal !== filtroCanal) {
        return false;
      }

      return true;
    });
  }, [promociones, busqueda, filtroTipo, filtroEstado, filtroPublico, filtroCanal]);

  const clientesFiltrados = useMemo(() => {
    if (!busquedaClientes) return clientes;
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(busquedaClientes.toLowerCase()) ||
      c.email.toLowerCase().includes(busquedaClientes.toLowerCase())
    );
  }, [busquedaClientes, clientes]);

  // ============================================
  // FUNCIONES DE MANIPULACIÓN
  // ============================================

  const handleCrearPromocion = () => {
    setModoEdicion(false);
    setFormData({
      nombre: '',
      tipo: 'descuento_porcentaje',
      valor: 0,
      descripcion: '',
      color: 'blue',
      activa: true,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      publicoObjetivo: 'general',
      canal: 'ambos',
      destacada: false,
    });
    setModalCrearEditar(true);
  };

  const handleEditarPromocion = (promo: PromocionDisponible) => {
    setModoEdicion(true);
    setPromocionSeleccionada(promo);
    setFormData(promo);
    setModalCrearEditar(true);
  };

  const recargarPromociones = async () => {
    const promos = await promocionesApi.getAll();
    const now = new Date();
    const mapped = (Array.isArray(promos) ? promos : []).map((p: any) => {
      const validoHasta = p.validoHasta ? new Date(p.validoHasta) : null;
      const activa = !!validoHasta && validoHasta.getTime() >= now.getTime();
      const descuentoStr = String(p.descuento || '').trim();
      const valorNum = Number(descuentoStr.replace('%', '').replace(',', '.')) || 0;
      return {
        id: String(p.id),
        nombre: p.titulo || 'Promoción',
        tipo: (descuentoStr.includes('%') ? 'descuento_porcentaje' : 'precio_fijo') as any,
        valor: valorNum,
        descripcion: p.descripcion || '',
        color: 'blue',
        activa,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: validoHasta ? validoHasta.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        publicoObjetivo: 'general' as any,
        canal: 'ambos' as any,
        destacada: false,
        vecesUsada: 0,
        clientesQueUsaron: [],
        clientesAsignados: [],
      } as any;
    });
    setPromociones(mapped);
  };

  const handleDuplicarPromocion = async (promo: PromocionDisponible) => {
    try {
      const validoHasta = promo.fechaFin ? new Date(promo.fechaFin).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const descuento = promo.tipo?.includes('porcentaje') ? `${promo.valor}%` : String(promo.valor);
      await promocionesApi.create({
        titulo: `${promo.nombre} (Copia)`,
        descripcion: promo.descripcion,
        descuento,
        validoHasta,
      });
      await recargarPromociones();
      toast.success('Promoción duplicada correctamente');
    } catch {
      toast.error('No se pudo duplicar la promoción');
    }
  };

  const handleGuardarPromocion = async () => {
    if (!formData.nombre || !formData.descripcion) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    try {
      const descuento = String(formData.tipo || '').includes('porcentaje') ? `${formData.valor || 0}%` : String(formData.valor || 0);
      const validoHasta = formData.fechaFin ? new Date(formData.fechaFin).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (modoEdicion && promocionSeleccionada) {
        await promocionesApi.update(Number(promocionSeleccionada.id), {
          titulo: formData.nombre!,
          descripcion: formData.descripcion!,
          descuento,
          validoHasta,
        } as any);
        toast.success('Promoción actualizada correctamente');
      } else {
        await promocionesApi.create({
          titulo: formData.nombre!,
          descripcion: formData.descripcion!,
          descuento,
          validoHasta,
        });
        toast.success('Promoción creada correctamente');
      }

      await recargarPromociones();
      setModalCrearEditar(false);
      setPromocionSeleccionada(null);
    } catch {
      toast.error('No se pudo guardar la promoción');
    }

  };

  const handleEliminarPromocion = async () => {
    if (!promocionSeleccionada) return;
    try {
      await promocionesApi.delete(Number(promocionSeleccionada.id));
      await recargarPromociones();
      toast.success('Promoción eliminada correctamente');
    } catch {
      toast.error('No se pudo eliminar la promoción');
    } finally {
      setModalEliminar(false);
      setPromocionSeleccionada(null);
    }
  };

  const handleToggleActiva = async (promo: PromocionDisponible) => {
    try {
      const willActivate = !promo.activa;
      const validoHasta = willActivate
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const descuento = String(promo.tipo || '').includes('porcentaje') ? `${promo.valor || 0}%` : String(promo.valor || 0);
      await promocionesApi.update(Number(promo.id), {
        titulo: promo.nombre,
        descripcion: promo.descripcion,
        descuento,
        validoHasta,
      } as any);
      await recargarPromociones();
      toast.success(`Promoción ${willActivate ? 'activada' : 'desactivada'}`);
    } catch {
      toast.error('No se pudo actualizar la promoción');
    }
  };

  const handleToggleDestacada = (promo: PromocionDisponible) => {
    toast.info('Funcionalidad disponible próximamente');
  };

  const handleAsignarClientes = () => {
    if (promocionSeleccionada) {
      toast.info('Asignación a clientes: disponible próximamente');
      setModalAsignarClientes(false);
      setClientesSeleccionados([]);
      setPromocionSeleccionada(null);
    }
  };

  const handleExportarPromociones = () => {
    const csv = [
      ['ID', 'Nombre', 'Tipo', 'Valor', 'Estado', 'Usos', 'Fecha Inicio', 'Fecha Fin'].join(','),
      ...promocionesFiltradas.map(p =>
        [p.id, p.nombre, p.tipo, p.valor, p.activa ? 'Activa' : 'Inactiva', p.vecesUsada || 0, p.fechaInicio, p.fechaFin].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promociones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Promociones exportadas correctamente');
  };

  // ============================================
  // FUNCIONES AUXILIARES DE RENDERIZADO
  // ============================================

  const getIconoTipo = (tipo: TipoPromocion) => {
    switch (tipo) {
      case 'descuento_porcentaje':
      case 'descuento_fijo':
        return <Percent className="w-4 h-4" />;
      case '2x1':
      case '3x2':
        return <Tag className="w-4 h-4" />;
      case 'regalo':
        return <Gift className="w-4 h-4" />;
      case 'combo_pack':
        return <Package className="w-4 h-4" />;
      case 'puntos':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getIconoCanal = (canal: CanalPromocion) => {
    switch (canal) {
      case 'app':
        return <Smartphone className="w-4 h-4" />;
      case 'tienda':
        return <Store className="w-4 h-4" />;
      case 'ambos':
        return <Globe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getColorBadge = (color: string) => {
    const colores: Record<string, string> = {
      red: 'bg-red-100 text-red-800 border-red-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      pink: 'bg-pink-100 text-pink-800 border-pink-300',
      black: 'bg-gray-800 text-white border-gray-900',
    };
    return colores[color] || colores.blue;
  };

  const getNombreTipo = (tipo: TipoPromocion) => {
    const nombres: Record<TipoPromocion, string> = {
      '2x1': '2x1',
      '3x2': '3x2',
      'descuento_porcentaje': 'Descuento %',
      'descuento_fijo': 'Descuento Fijo',
      'regalo': 'Regalo',
      'puntos': 'Puntos',
      'combo_pack': 'Combo/Pack',
    };
    return nombres[tipo];
  };

  const getNombrePublico = (publico: PublicoObjetivo) => {
    const nombres: Record<PublicoObjetivo, string> = {
      'general': 'General',
      'nuevo': 'Nuevos',
      'premium': 'Premium/VIP',
      'alta_frecuencia': 'Alta Frecuencia',
      'multitienda': 'Multitienda',
      'personalizado': 'Personalizado',
    };
    return nombres[publico];
  };

  const getNombreCanal = (canal: CanalPromocion) => {
    const nombres: Record<CanalPromocion, string> = {
      'app': 'Solo App',
      'tienda': 'Solo Tienda',
      'ambos': 'App y Tienda',
    };
    return nombres[canal];
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con título y botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-600" />
            Gestión de Promociones
          </h1>
          <p className="text-gray-500 mt-1">
            Crea y gestiona promociones para tus clientes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setModalEstadisticas(true)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Estadísticas</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportarPromociones}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            onClick={handleCrearPromocion}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Promoción
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="mt-1">{estadisticas.totalPromociones}</p>
              </div>
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="mt-1 text-green-600">{estadisticas.promocionesActivas}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactivas</p>
                <p className="mt-1 text-gray-400">{estadisticas.promocionesInactivas}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usos</p>
                <p className="mt-1">{estadisticas.totalUsos}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="mt-1">{estadisticas.clientesImpactados}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dto. Medio</p>
                <p className="mt-1">{estadisticas.descuentoPromedio.toFixed(1)}%</p>
              </div>
              <Percent className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar promociones..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro Tipo */}
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="descuento_porcentaje">Descuento %</SelectItem>
                <SelectItem value="descuento_fijo">Descuento Fijo</SelectItem>
                <SelectItem value="2x1">2x1</SelectItem>
                <SelectItem value="3x2">3x2</SelectItem>
                <SelectItem value="combo_pack">Combo/Pack</SelectItem>
                <SelectItem value="regalo">Regalo</SelectItem>
                <SelectItem value="puntos">Puntos</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Estado */}
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activas">Activas</SelectItem>
                <SelectItem value="inactivas">Inactivas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Público */}
            <Select value={filtroPublico} onValueChange={setFiltroPublico}>
              <SelectTrigger>
                <SelectValue placeholder="Público" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="nuevo">Nuevos</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="alta_frecuencia">Alta Frecuencia</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros adicionales */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={filtroCanal} onValueChange={setFiltroCanal}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los canales</SelectItem>
                <SelectItem value="app">Solo App</SelectItem>
                <SelectItem value="tienda">Solo Tienda</SelectItem>
                <SelectItem value="ambos">App y Tienda</SelectItem>
              </SelectContent>
            </Select>

            {(busqueda || filtroTipo !== 'todos' || filtroEstado !== 'todos' || filtroPublico !== 'todos' || filtroCanal !== 'todos') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBusqueda('');
                  setFiltroTipo('todos');
                  setFiltroEstado('todos');
                  setFiltroPublico('todos');
                  setFiltroCanal('todos');
                }}
              >
                Limpiar filtros
              </Button>
            )}

            <div className="ml-auto text-sm text-gray-500 self-center">
              {promocionesFiltradas.length} de {promociones.length} promociones
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promocionesFiltradas.map((promo) => (
          <Card
            key={promo.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              !promo.activa ? 'opacity-60' : ''
            } ${promo.destacada ? 'ring-2 ring-yellow-400' : ''}`}
          >
            {/* Imagen de fondo si existe */}
            {promo.imagen && (
              <div className="relative h-32 overflow-hidden">
                <ImageWithFallback
                  src={promo.imagen}
                  alt={promo.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              {/* Header con badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <h3 className="line-clamp-1">{promo.nombre}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {promo.descripcion}
                  </p>
                </div>
                {promo.destacada && (
                  <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                )}
              </div>

              {/* Badges de información */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getColorBadge(promo.color)}>
                  {getIconoTipo(promo.tipo)}
                  <span className="ml-1">{getNombreTipo(promo.tipo)}</span>
                </Badge>
                
                {promo.valor > 0 && (
                  <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                    {promo.tipo.includes('porcentaje') ? `${promo.valor}%` : `${promo.valor}€`}
                  </Badge>
                )}

                <Badge variant="outline">
                  {getIconoCanal(promo.canal)}
                  <span className="ml-1">{getNombreCanal(promo.canal)}</span>
                </Badge>
              </div>

              {/* Público objetivo */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>{getNombrePublico(promo.publicoObjetivo)}</span>
                {promo.clientesAsignados && promo.clientesAsignados.length > 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {promo.clientesAsignados.length} clientes
                  </Badge>
                )}
              </div>

              {/* Fechas */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(promo.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {' - '}
                  {new Date(promo.fechaFin).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>

              {/* Horario (si aplica) */}
              {promo.horaInicio && promo.horaFin && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {promo.horaInicio} - {promo.horaFin}
                  </span>
                </div>
              )}

              {/* Estadísticas de uso */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{promo.vecesUsada || 0} usos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActiva(promo)}
                    title={promo.activa ? 'Desactivar' : 'Activar'}
                  >
                    {promo.activa ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDestacada(promo)}
                    title={promo.destacada ? 'No destacar' : 'Destacar'}
                  >
                    <Sparkles
                      className={`w-4 h-4 ${
                        promo.destacada ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPromocionSeleccionada(promo);
                    setModalVistaPrevia(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditarPromocion(promo)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicarPromocion(promo)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPromocionSeleccionada(promo);
                    setClientesSeleccionados(promo.clientesAsignados || []);
                    setModalAsignarClientes(true);
                  }}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPromocionSeleccionada(promo);
                    setModalEliminar(true);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promocionesFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 mb-2">No se encontraron promociones</h3>
            <p className="text-sm text-gray-400 mb-4">
              {busqueda || filtroTipo !== 'todos' || filtroEstado !== 'todos'
                ? 'Prueba a ajustar los filtros de búsqueda'
                : 'Crea tu primera promoción para empezar'}
            </p>
            {!busqueda && filtroTipo === 'todos' && filtroEstado === 'todos' && (
              <Button onClick={handleCrearPromocion} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Promoción
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL: Crear/Editar Promoción */}
      <Dialog open={modalCrearEditar} onOpenChange={setModalCrearEditar}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? 'Editar Promoción' : 'Nueva Promoción'}
            </DialogTitle>
            <DialogDescription>
              {modoEdicion
                ? 'Modifica los detalles de la promoción'
                : 'Completa los datos para crear una nueva promoción'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="segmentacion">Segmentación</TabsTrigger>
              <TabsTrigger value="restricciones">Restricciones</TabsTrigger>
            </TabsList>

            {/* TAB: Información Básica */}
            <TabsContent value="basico" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Promoción *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: 2x1 en Croissants"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la promoción..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Promoción</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value as TipoPromocion })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descuento_porcentaje">Descuento %</SelectItem>
                      <SelectItem value="descuento_fijo">Descuento Fijo €</SelectItem>
                      <SelectItem value="2x1">2x1</SelectItem>
                      <SelectItem value="3x2">3x2</SelectItem>
                      <SelectItem value="combo_pack">Combo/Pack</SelectItem>
                      <SelectItem value="regalo">Regalo</SelectItem>
                      <SelectItem value="puntos">Puntos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">
                    Valor{' '}
                    {formData.tipo?.includes('porcentaje')
                      ? '(%)'
                      : formData.tipo?.includes('fijo')
                      ? '(€)'
                      : ''}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color de Badge</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Rojo</SelectItem>
                      <SelectItem value="orange">Naranja</SelectItem>
                      <SelectItem value="yellow">Amarillo</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Morado</SelectItem>
                      <SelectItem value="pink">Rosa</SelectItem>
                      <SelectItem value="black">Negro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagen">URL de Imagen (opcional)</Label>
                  <Input
                    id="imagen"
                    placeholder="https://..."
                    value={formData.imagen || ''}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="activa">Promoción Activa</Label>
                  <p className="text-sm text-gray-500">
                    La promoción estará visible y aplicable
                  </p>
                </div>
                <Switch
                  id="activa"
                  checked={formData.activa}
                  onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 bg-yellow-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="destacada">Promoción Destacada</Label>
                  <p className="text-sm text-gray-500">
                    Se mostrará con mayor prominencia
                  </p>
                </div>
                <Switch
                  id="destacada"
                  checked={formData.destacada}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacada: checked })}
                />
              </div>
            </TabsContent>

            {/* TAB: Segmentación */}
            <TabsContent value="segmentacion" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="publicoObjetivo">Público Objetivo</Label>
                <Select
                  value={formData.publicoObjetivo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, publicoObjetivo: value as PublicoObjetivo })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General (Todos)</SelectItem>
                    <SelectItem value="nuevo">Clientes Nuevos</SelectItem>
                    <SelectItem value="premium">Premium/VIP</SelectItem>
                    <SelectItem value="alta_frecuencia">Alta Frecuencia</SelectItem>
                    <SelectItem value="multitienda">Multitienda</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  {formData.publicoObjetivo === 'personalizado' &&
                    'Podrás asignar clientes específicos después de crear la promoción'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canal">Canal de Distribución</Label>
                <Select
                  value={formData.canal}
                  onValueChange={(value) =>
                    setFormData({ ...formData, canal: value as CanalPromocion })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambos">App y Tienda (Omnicanal)</SelectItem>
                    <SelectItem value="app">Solo App Móvil</SelectItem>
                    <SelectItem value="tienda">Solo Tienda Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Restricciones Horarias (opcional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaInicio" className="text-sm text-gray-500">
                      Hora Inicio
                    </Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      value={formData.horaInicio || ''}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFin" className="text-sm text-gray-500">
                      Hora Fin
                    </Label>
                    <Input
                      id="horaFin"
                      type="time"
                      value={formData.horaFin || ''}
                      onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Ej: Happy Hour de 17:00 a 19:00
                </p>
              </div>
            </TabsContent>

            {/* TAB: Restricciones */}
            <TabsContent value="restricciones" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="limiteUsos">Límite de Usos por Cliente (opcional)</Label>
                <Input
                  id="limiteUsos"
                  type="number"
                  min="0"
                  placeholder="Ej: 1 (sin límite si está vacío)"
                  value={formData.limiteUsosPorCliente || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limiteUsosPorCliente: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Número máximo de veces que un cliente puede usar esta promoción
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidadMinima">Cantidad Mínima (opcional)</Label>
                <Input
                  id="cantidadMinima"
                  type="number"
                  min="0"
                  placeholder="Ej: 2 (para 2x1)"
                  value={formData.cantidadMinima || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidadMinima: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Cantidad mínima de productos para aplicar la promoción
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      <strong>Nota sobre combos/packs:</strong> Para crear combos con productos
                      específicos, necesitarás configurar los productos incluidos desde el módulo
                      de productos.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCrearEditar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarPromocion} className="bg-purple-600 hover:bg-purple-700">
              {modoEdicion ? 'Guardar Cambios' : 'Crear Promoción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Asignar Clientes */}
      <Dialog open={modalAsignarClientes} onOpenChange={setModalAsignarClientes}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Asignar Clientes a Promoción</DialogTitle>
            <DialogDescription>
              Selecciona los clientes que podrán ver y usar esta promoción personalizada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={busquedaClientes}
                onChange={(e) => setBusquedaClientes(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de clientes */}
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                    clientesSeleccionados.includes(cliente.id) ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => {
                    if (clientesSeleccionados.includes(cliente.id)) {
                      setClientesSeleccionados(
                        clientesSeleccionados.filter((id) => id !== cliente.id)
                      );
                    } else {
                      setClientesSeleccionados([...clientesSeleccionados, cliente.id]);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={clientesSeleccionados.includes(cliente.id)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p>{cliente.nombre}</p>
                    <p className="text-sm text-gray-500">{cliente.email}</p>
                  </div>
                  <Badge variant="outline">{cliente.segmento}</Badge>
                </div>
              ))}
            </div>

            {/* Contador de seleccionados */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {clientesSeleccionados.length} cliente(s) seleccionado(s)
              </span>
              {clientesSeleccionados.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClientesSeleccionados([])}
                >
                  Limpiar selección
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAsignarClientes(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAsignarClientes}
              disabled={clientesSeleccionados.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Asignar Clientes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Vista Previa */}
      <Dialog open={modalVistaPrevia} onOpenChange={setModalVistaPrevia}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa de Promoción</DialogTitle>
            <DialogDescription>Así verá el cliente esta promoción en la app</DialogDescription>
          </DialogHeader>

          {promocionSeleccionada && (
            <div className="space-y-4">
              {/* Simulación de tarjeta de promoción en app cliente */}
              <Card className="overflow-hidden">
                {promocionSeleccionada.imagen && (
                  <div className="relative h-40">
                    <ImageWithFallback
                      src={promocionSeleccionada.imagen}
                      alt={promocionSeleccionada.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {promocionSeleccionada.destacada && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Destacada
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3>{promocionSeleccionada.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {promocionSeleccionada.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getColorBadge(promocionSeleccionada.color)}>
                      {promocionSeleccionada.tipo.includes('porcentaje') &&
                        `${promocionSeleccionada.valor}% OFF`}
                      {promocionSeleccionada.tipo.includes('fijo') &&
                        `-${promocionSeleccionada.valor}€`}
                      {promocionSeleccionada.tipo === '2x1' && '2x1'}
                      {promocionSeleccionada.tipo === '3x2' && '3x2'}
                      {promocionSeleccionada.tipo === 'regalo' && '🎁 Regalo'}
                      {promocionSeleccionada.tipo === 'combo_pack' && '📦 Pack'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Válida hasta el{' '}
                      {new Date(promocionSeleccionada.fechaFin).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {promocionSeleccionada.horaInicio && promocionSeleccionada.horaFin && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        Horario: {promocionSeleccionada.horaInicio} -{' '}
                        {promocionSeleccionada.horaFin}
                      </span>
                    </div>
                  )}

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Usar Promoción
                  </Button>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Canal:</span>
                  <span>{getNombreCanal(promocionSeleccionada.canal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Público:</span>
                  <span>{getNombrePublico(promocionSeleccionada.publicoObjetivo)}</span>
                </div>
                {promocionSeleccionada.limiteUsosPorCliente && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Límite de usos:</span>
                    <span>{promocionSeleccionada.limiteUsosPorCliente}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setModalVistaPrevia(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Estadísticas */}
      <Dialog open={modalEstadisticas} onOpenChange={setModalEstadisticas}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estadísticas de Promociones</DialogTitle>
            <DialogDescription>
              Análisis general del rendimiento de tus promociones
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Promociones</p>
                    <p className="mt-1">{estadisticas.totalPromociones}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Activas</p>
                    <p className="mt-1 text-green-600">{estadisticas.promocionesActivas}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Usos</p>
                    <p className="mt-1">{estadisticas.totalUsos}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Clientes Impactados</p>
                    <p className="mt-1">{estadisticas.clientesImpactados}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Descuento Promedio</p>
                    <p className="mt-1">{estadisticas.descuentoPromedio.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Uso Promedio</p>
                    <p className="mt-1">
                      {(estadisticas.totalUsos / estadisticas.totalPromociones || 0).toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 5 promociones más usadas */}
            <div>
              <h3 className="mb-3">Top 5 Promociones Más Usadas</h3>
              <div className="space-y-2">
                {[...promociones]
                  .sort((a, b) => (b.vecesUsada || 0) - (a.vecesUsada || 0))
                  .slice(0, 5)
                  .map((promo, index) => (
                    <div
                      key={promo.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{promo.nombre}</p>
                        <p className="text-xs text-gray-500">{getNombreTipo(promo.tipo)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{promo.vecesUsada || 0}</p>
                        <p className="text-xs text-gray-500">usos</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Distribución por tipo */}
            <div>
              <h3 className="mb-3">Distribución por Tipo</h3>
              <div className="space-y-2">
                {Object.entries(
                  promociones.reduce((acc, p) => {
                    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([tipo, cantidad]) => (
                  <div key={tipo} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{getNombreTipo(tipo as TipoPromocion)}</span>
                        <span className="text-sm text-gray-500">{cantidad}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(cantidad / promociones.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setModalEstadisticas(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Confirmar Eliminar */}
      <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La promoción{' '}
              <strong>"{promocionSeleccionada?.nombre}"</strong> será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarPromocion}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
