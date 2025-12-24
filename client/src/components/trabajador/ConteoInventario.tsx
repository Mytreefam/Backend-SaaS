import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  QrCode,
  Search,
  Camera,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Pause,
  Send,
  AlertCircle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UbicacionPendiente {
  id: string;
  codigo: string;
  almacen: string;
  completada: boolean;
  skus: number;
  contados: number;
}

interface SKUConteo {
  id: string;
  codigo: string;
  nombre: string;
  imagen?: string;
  ubicacion: string;
  stockSistema: number;
  stockFisico?: number;
  diferencia?: number;
  notas?: string;
  foto?: File;
  contado: boolean;
}

export function ConteoInventario() {
  const [sesionActiva, setSesionActiva] = useState(true);
  const [modoConteo, setModoConteo] = useState<'ubicacion' | 'detalle' | null>('ubicacion');
  const [ubicacionActual, setUbicacionActual] = useState<string | null>(null);
  const [busquedaSKU, setBusquedaSKU] = useState('');
  const [skuSeleccionado, setSkuSeleccionado] = useState<SKUConteo | null>(null);
  const [cantidadContada, setCantidadContada] = useState('');
  const [notasConteo, setNotasConteo] = useState('');
  const [fotoConteo, setFotoConteo] = useState<File | null>(null);

  // Datos de la sesión
  const sesion = {
    id: 'INV-2025-11',
    nombre: 'Inventario Cíclico - Zona A',
    tipo: 'Cíclico (ABC)',
    almacen: '01 Taller',
    fechaInicio: '2025-11-11T08:00:00',
    fechaLimite: '2025-11-11T18:00:00',
    responsable: 'Carlos Méndez',
    progreso: 45,
    ubicacionesTotales: 12,
    ubicacionesCompletadas: 5,
    tiempoEstimado: '2h 30min'
  };

  const ubicaciones: UbicacionPendiente[] = [
    { id: 'U001', codigo: 'A-12', almacen: '01 Taller', completada: true, skus: 8, contados: 8 },
    { id: 'U002', codigo: 'A-13', almacen: '01 Taller', completada: true, skus: 6, contados: 6 },
    { id: 'U003', codigo: 'A-14', almacen: '01 Taller', completada: false, skus: 10, contados: 3 },
    { id: 'U004', codigo: 'A-15', almacen: '01 Taller', completada: false, skus: 5, contados: 0 },
    { id: 'U005', codigo: 'B-05', almacen: '01 Taller', completada: false, skus: 12, contados: 0 },
  ];

  const skusUbicacion: SKUConteo[] = [
    {
      id: 'S001',
      codigo: 'ACE-5W30-5L',
      nombre: 'Aceite Motor 5W30 - 5L',
      ubicacion: 'A-14-03',
      stockSistema: 15,
      contado: false
    },
    {
      id: 'S002',
      codigo: 'FIL-ACE-UNI',
      nombre: 'Filtro de Aceite Universal',
      ubicacion: 'A-14-02',
      stockSistema: 8,
      stockFisico: 7,
      diferencia: -1,
      notas: 'Un filtro dañado',
      contado: true
    },
    {
      id: 'S003',
      codigo: 'FRE-DEL-205',
      nombre: 'Pastillas de Freno Delanteras',
      ubicacion: 'A-14-01',
      stockSistema: 6,
      stockFisico: 6,
      diferencia: 0,
      contado: true
    },
  ];

  const handleEscanearUbicacion = () => {
    toast.info('Escaneando QR de ubicación...');
    setTimeout(() => {
      const ubicacion = ubicaciones.find(u => !u.completada);
      if (ubicacion) {
        setUbicacionActual(ubicacion.codigo);
        setModoConteo('detalle');
        toast.success(`Ubicación ${ubicacion.codigo} cargada`);
      }
    }, 1000);
  };

  const handleBuscarUbicacion = () => {
    const ubicacion = ubicaciones.find(u => u.codigo.toLowerCase().includes(busquedaSKU.toLowerCase()));
    if (ubicacion) {
      setUbicacionActual(ubicacion.codigo);
      setModoConteo('detalle');
      toast.success(`Ubicación ${ubicacion.codigo} cargada`);
    } else {
      toast.error('Ubicación no encontrada');
    }
  };

  const handleSeleccionarUbicacion = (codigo: string) => {
    setUbicacionActual(codigo);
    setModoConteo('detalle');
  };

  const handleEscanearSKU = () => {
    toast.info('Escaneando código de barras...');
    setTimeout(() => {
      const sku = skusUbicacion.find(s => !s.contado);
      if (sku) {
        setSkuSeleccionado(sku);
        toast.success(`SKU ${sku.codigo} escaneado`);
      }
    }, 1000);
  };

  const handleBuscarSKU = () => {
    const sku = skusUbicacion.find(s => 
      s.codigo.toLowerCase().includes(busquedaSKU.toLowerCase()) ||
      s.nombre.toLowerCase().includes(busquedaSKU.toLowerCase())
    );
    if (sku) {
      setSkuSeleccionado(sku);
      setBusquedaSKU('');
      toast.success(`SKU encontrado: ${sku.codigo}`);
    } else {
      toast.error('SKU no encontrado en esta ubicación');
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoConteo(e.target.files[0]);
      toast.success('Foto adjuntada');
    }
  };

  const handleGuardarConteo = () => {
    if (!skuSeleccionado) return;

    if (!cantidadContada) {
      toast.error('Introduce la cantidad contada');
      return;
    }

    const cantidad = parseInt(cantidadContada);
    const diferencia = cantidad - skuSeleccionado.stockSistema;

    const conteo = {
      skuId: skuSeleccionado.id,
      codigo: skuSeleccionado.codigo,
      ubicacion: skuSeleccionado.ubicacion,
      stockSistema: skuSeleccionado.stockSistema,
      stockFisico: cantidad,
      diferencia,
      notas: notasConteo,
      foto: fotoConteo?.name,
      fecha: new Date().toISOString(),
      responsable: sesion.responsable
    };

    console.log('[CONTEO INVENTARIO] Guardando conteo:', conteo);

    if (Math.abs(diferencia) > 0) {
      toast.warning(`Diferencia detectada: ${diferencia > 0 ? '+' : ''}${diferencia} unidades`);
    } else {
      toast.success('Cantidad coincide con el sistema');
    }

    // Reset
    setSkuSeleccionado(null);
    setCantidadContada('');
    setNotasConteo('');
    setFotoConteo(null);
  };

  const handlePausar = () => {
    toast.info('Sesión pausada. Puedes retomarla más tarde.');
    console.log('[CONTEO INVENTARIO] Sesión pausada:', {
      sesionId: sesion.id,
      progreso: sesion.progreso,
      responsable: sesion.responsable
    });
  };

  const handleEnviarRevision = () => {
    toast.success('Conteo enviado a revisión del Gerente');
    console.log('[CONTEO INVENTARIO] Enviado a revisión:', {
      sesionId: sesion.id,
      ubicacionesCompletadas: sesion.ubicacionesCompletadas,
      ubicacionesTotales: sesion.ubicacionesTotales,
      responsable: sesion.responsable
    });
  };

  const handleVolverUbicaciones = () => {
    setModoConteo('ubicacion');
    setUbicacionActual(null);
    setSkuSeleccionado(null);
    setCantidadContada('');
    setNotasConteo('');
    setFotoConteo(null);
  };

  // ============= ESTADÍSTICAS CALCULADAS DINÁMICAMENTE =============

  const estadisticas = useMemo(() => {
    // GRUPO 1: Progreso de ubicaciones
    const totalUbicaciones = ubicaciones.length;
    const ubicacionesCompletadas = ubicaciones.filter(u => u.completada).length;
    const ubicacionesPendientes = totalUbicaciones - ubicacionesCompletadas;
    const progresoUbicaciones = totalUbicaciones > 0 ? (ubicacionesCompletadas / totalUbicaciones) * 100 : 0;

    // GRUPO 2: SKUs
    const totalSKUs = ubicaciones.reduce((sum, u) => sum + u.skus, 0);
    const skusContados = ubicaciones.reduce((sum, u) => sum + u.contados, 0);
    const skusPendientes = totalSKUs - skusContados;
    const progresoSKUs = totalSKUs > 0 ? (skusContados / totalSKUs) * 100 : 0;

    // GRUPO 3: SKUs con diferencias (en la ubicación actual)
    const skusConDiferencia = skusUbicacion.filter(s => s.contado && s.diferencia !== 0).length;
    const skusConDiferenciaPositiva = skusUbicacion.filter(s => s.contado && (s.diferencia || 0) > 0).length;
    const skusConDiferenciaNegativa = skusUbicacion.filter(s => s.contado && (s.diferencia || 0) < 0).length;
    const skusSinDiferencia = skusUbicacion.filter(s => s.contado && s.diferencia === 0).length;

    // GRUPO 4: Diferencias acumuladas
    const diferenciaTotal = skusUbicacion.reduce((sum, s) => sum + (s.diferencia || 0), 0);
    const diferenciaAbsoluta = skusUbicacion.reduce((sum, s) => sum + Math.abs(s.diferencia || 0), 0);

    // GRUPO 5: Tiempo estimado
    const skusPorHora = skusContados > 0 ? skusContados / 1 : 0; // Asumiendo 1 hora trabajada
    const tiempoRestanteHoras = skusPorHora > 0 ? skusPendientes / skusPorHora : 0;

    // GRUPO 6: Precisión
    const tasaPrecision = skusContados > 0 ? (skusSinDiferencia / skusContados) * 100 : 0;

    // GRUPO 7: SKUs en ubicación actual
    const skusTotalesUbicacionActual = skusUbicacion.length;
    const skusContadosUbicacionActual = skusUbicacion.filter(s => s.contado).length;
    const progresoUbicacionActual = skusTotalesUbicacionActual > 0 
      ? (skusContadosUbicacionActual / skusTotalesUbicacionActual) * 100 
      : 0;

    // GRUPO 8: Almacenes únicos
    const almacenesUnicos = [...new Set(ubicaciones.map(u => u.almacen))].length;

    return {
      totalUbicaciones,
      ubicacionesCompletadas,
      ubicacionesPendientes,
      progresoUbicaciones,
      totalSKUs,
      skusContados,
      skusPendientes,
      progresoSKUs,
      skusConDiferencia,
      skusConDiferenciaPositiva,
      skusConDiferenciaNegativa,
      skusSinDiferencia,
      diferenciaTotal,
      diferenciaAbsoluta,
      tiempoRestanteHoras,
      tasaPrecision,
      skusTotalesUbicacionActual,
      skusContadosUbicacionActual,
      progresoUbicacionActual,
      almacenesUnicos,
    };
  }, [ubicaciones, skusUbicacion]);

  if (!sesionActiva) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              No hay sesiones activas
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              El Gerente no te ha asignado ningún conteo de inventario
            </p>
            <Button variant="outline" disabled>
              Esperando asignación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header de sesión */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {sesion.nombre}
              </h2>
              <p className="text-sm text-purple-100">{sesion.id}</p>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {sesion.tipo}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-100">Progreso</span>
              <span className="font-medium">{sesion.progreso}% completado</span>
            </div>
            <Progress value={sesion.progreso} className="h-2 bg-white/20" />
            <div className="flex items-center justify-between text-xs text-purple-100">
              <span>{sesion.ubicacionesCompletadas} de {sesion.ubicacionesTotales} ubicaciones</span>
              <span><Clock className="w-3 h-3 inline mr-1" />{sesion.tiempoEstimado}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs CALCULADOS DINÁMICAMENTE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Ubicaciones</p>
                <p className="text-gray-900 text-xl">{estadisticas.ubicacionesCompletadas}/{estadisticas.totalUbicaciones}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.progresoUbicaciones.toFixed(0)}%
                </p>
              </div>
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">SKUs</p>
                <p className="text-gray-900 text-xl">{estadisticas.skusContados}/{estadisticas.totalSKUs}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.progresoSKUs.toFixed(0)}%
                </p>
              </div>
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Diferencias</p>
                <p className="text-gray-900 text-xl">{estadisticas.skusConDiferencia}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.diferenciaTotal > 0 ? '+' : ''}{estadisticas.diferenciaTotal}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs">Precisión</p>
                <p className="text-gray-900 text-xl">{estadisticas.tasaPrecision.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.skusSinDiferencia} exactos
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESTADÍSTICAS ADICIONALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <p className="text-sm">Progreso General</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Ubicaciones</span>
                <span className="text-xs text-gray-900">{estadisticas.progresoUbicaciones.toFixed(0)}%</span>
              </div>
              <Progress value={estadisticas.progresoUbicaciones} className="h-2" />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">SKUs</span>
                <span className="text-xs text-gray-900">{estadisticas.progresoSKUs.toFixed(0)}%</span>
              </div>
              <Progress value={estadisticas.progresoSKUs} className="h-2" />
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-sm text-blue-600">
                {estadisticas.ubicacionesPendientes} ubicaciones
              </p>
              <p className="text-sm text-gray-900">
                {estadisticas.skusPendientes} SKUs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm">Diferencias Detectadas</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Con diferencia</span>
              <Badge className="bg-orange-100 text-orange-800">
                {estadisticas.skusConDiferencia}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sobrantes (+)</span>
              <Badge className="bg-green-100 text-green-800">
                {estadisticas.skusConDiferenciaPositiva}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Faltantes (-)</span>
              <Badge className="bg-red-100 text-red-800">
                {estadisticas.skusConDiferenciaNegativa}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sin diferencia</span>
              <Badge className="bg-teal-100 text-teal-800">
                {estadisticas.skusSinDiferencia}
              </Badge>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Diferencia absoluta</p>
              <p className="text-sm text-gray-900">{estadisticas.diferenciaAbsoluta} unidades</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm">Resumen</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Almacenes</p>
              <p className="text-sm text-gray-900">{estadisticas.almacenesUnicos}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Tasa de precisión</p>
              <p className="text-lg text-green-600">{estadisticas.tasaPrecision.toFixed(1)}%</p>
            </div>
            {estadisticas.tiempoRestanteHoras > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Tiempo estimado restante</p>
                <p className="text-sm text-blue-600">
                  {estadisticas.tiempoRestanteHoras.toFixed(1)}h
                </p>
              </div>
            )}
            <div className="mt-3 p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-800">
                Sesión: {sesion.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MODO: SELECCIÓN DE UBICACIÓN ===== */}
      {modoConteo === 'ubicacion' && (
        <>
          {/* Escanear/Buscar ubicación */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={handleEscanearUbicacion}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <QrCode className="w-6 h-6 mr-2" />
                Escanear QR de ubicación
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O buscar manualmente</span>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Ej: A-14"
                    value={busquedaSKU}
                    onChange={(e) => setBusquedaSKU(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarUbicacion()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleBuscarUbicacion} variant="outline">
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de ubicaciones */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 px-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ubicaciones pendientes
            </h3>
            {ubicaciones.map((ubicacion) => (
              <Card 
                key={ubicacion.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  ubicacion.completada ? 'opacity-60' : ''
                }`}
                onClick={() => !ubicacion.completada && handleSeleccionarUbicacion(ubicacion.codigo)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        ubicacion.completada 
                          ? 'bg-green-100' 
                          : ubicacion.contados > 0 
                            ? 'bg-orange-100' 
                            : 'bg-blue-100'
                      }`}>
                        {ubicacion.completada ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <MapPin className={`w-6 h-6 ${
                            ubicacion.contados > 0 ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 font-mono">
                            {ubicacion.codigo}
                          </span>
                          {ubicacion.completada && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                              Completa
                            </Badge>
                          )}
                          {!ubicacion.completada && ubicacion.contados > 0 && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                              En progreso
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {ubicacion.contados} de {ubicacion.skus} SKUs contados
                        </p>
                      </div>
                    </div>
                    {!ubicacion.completada && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ===== MODO: CONTEO DE SKUs EN UBICACIÓN ===== */}
      {modoConteo === 'detalle' && ubicacionActual && (
        <>
          {/* Header de ubicación actual */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Button
                  onClick={handleVolverUbicaciones}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Ubicaciones
                </Button>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Ubicación actual
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold text-blue-900 font-mono" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {ubicacionActual}
              </h2>
              <p className="text-sm text-blue-700 mt-1">
                {skusUbicacion.filter(s => s.contado).length} de {skusUbicacion.length} SKUs contados
              </p>
            </CardContent>
          </Card>

          {/* Escanear/Buscar SKU */}
          {!skuSeleccionado && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={handleEscanearSKU}
                  className="w-full h-14 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <QrCode className="w-6 h-6 mr-2" />
                  Escanear código de barras
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O buscar por código</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Código SKU..."
                      value={busquedaSKU}
                      onChange={(e) => setBusquedaSKU(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBuscarSKU()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleBuscarSKU} variant="outline">
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario de conteo */}
          {skuSeleccionado && (
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4 space-y-4">
                {/* SKU info */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={skuSeleccionado.imagen} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {skuSeleccionado.codigo.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 font-mono">{skuSeleccionado.codigo}</p>
                    <p className="text-sm text-gray-600">{skuSeleccionado.nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {skuSeleccionado.ubicacion}
                    </p>
                  </div>
                </div>

                {/* Stock del sistema */}
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-700">
                    <strong>Stock en sistema:</strong> {skuSeleccionado.stockSistema} unidades
                  </AlertDescription>
                </Alert>

                {/* Cantidad contada */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad-contada" className="text-base font-medium">
                    Cantidad física contada *
                  </Label>
                  <Input
                    id="cantidad-contada"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cantidadContada}
                    onChange={(e) => setCantidadContada(e.target.value)}
                    className="text-lg h-12"
                    autoFocus
                  />
                </div>

                {/* Mostrar diferencia */}
                {cantidadContada && (
                  <Alert className={`${
                    parseInt(cantidadContada) === skuSeleccionado.stockSistema
                      ? 'border-green-200 bg-green-50'
                      : 'border-orange-200 bg-orange-50'
                  }`}>
                    <AlertCircle className={`h-4 w-4 ${
                      parseInt(cantidadContada) === skuSeleccionado.stockSistema
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`} />
                    <AlertDescription className={`text-sm ${
                      parseInt(cantidadContada) === skuSeleccionado.stockSistema
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}>
                      {parseInt(cantidadContada) === skuSeleccionado.stockSistema ? (
                        <strong>✓ Cantidad correcta - Coincide con el sistema</strong>
                      ) : (
                        <>
                          <strong>Diferencia detectada:</strong> {
                            parseInt(cantidadContada) - skuSeleccionado.stockSistema > 0 ? '+' : ''
                          }{parseInt(cantidadContada) - skuSeleccionado.stockSistema} unidades
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas (opcional)</Label>
                  <Textarea
                    id="notas"
                    placeholder="Observaciones sobre el conteo..."
                    value={notasConteo}
                    onChange={(e) => setNotasConteo(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Foto */}
                <div className="space-y-2">
                  <Label htmlFor="foto">Adjuntar foto (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFotoChange}
                      className="flex-1"
                    />
                    {fotoConteo && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <Camera className="w-3 h-3 mr-1" />
                        Adjunta
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setSkuSeleccionado(null);
                      setCantidadContada('');
                      setNotasConteo('');
                      setFotoConteo(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGuardarConteo}
                    disabled={!cantidadContada}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de SKUs de la ubicación */}
          {!skuSeleccionado && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 px-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                SKUs en esta ubicación
              </h3>
              {skusUbicacion.map((sku) => (
                <Card 
                  key={sku.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    sku.contado ? 'opacity-60' : ''
                  }`}
                  onClick={() => !sku.contado && setSkuSeleccionado(sku)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={sku.imagen} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {sku.codigo.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 font-mono truncate">
                          {sku.codigo}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{sku.nombre}</p>
                        {sku.contado && sku.diferencia !== undefined && (
                          <p className={`text-xs mt-1 ${
                            sku.diferencia === 0 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {sku.diferencia === 0 ? '✓ Correcto' : `Dif: ${sku.diferencia > 0 ? '+' : ''}${sku.diferencia}`}
                          </p>
                        )}
                      </div>
                      {sku.contado ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            onClick={handlePausar}
            variant="outline"
            className="flex-1"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </Button>
          <Button
            onClick={handleEnviarRevision}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={sesion.progreso < 100}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar a revisión
          </Button>
        </div>
      </div>
    </div>
  );
}
