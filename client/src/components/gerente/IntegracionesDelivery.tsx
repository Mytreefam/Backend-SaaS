/**
 * 🚀 PANEL DE INTEGRACIONES DE DELIVERY
 * Gestión de conexiones con plataformas de delivery
 * CONECTADO A BACKEND API
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  Save,
  Download,
  Upload,
  TrendingUp,
  Clock,
  Package,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { integracionesApi } from '../../services/api';
import { useProductos } from '../../contexts/ProductosContext';

// Tipos para datos del backend
interface PlataformaConfig {
  id: number;
  nombre: string;
  tipo: string;
  logo: string;
  activa: boolean;
  estado: 'conectada' | 'desconectada' | 'error';
  credenciales: {
    apiKey?: string;
    storeId?: string;
    accessToken?: string;
  };
  configuracion: {
    sincronizarPrecios: boolean;
    sincronizarStock: boolean;
    sincronizarDisponibilidad: boolean;
    sincronizarImagenes: boolean;
    margenPrecio?: number;
  };
  ultimaSincronizacion: string | null;
  mensajeError: string | null;
}

interface LogSincronizacion {
  id: number;
  plataformaId: number;
  plataformaNombre: string;
  accion: string;
  productoNombre: string;
  estado: 'exitoso' | 'error' | 'pendiente';
  mensaje: string | null;
  timestamp: string;
}

interface Estadisticas {
  plataformasActivas: number;
  plataformasTotal: number;
  sincronizacionesRecientes: number;
  tasaExito: number;
}

export function IntegracionesDelivery() {
  const [configuraciones, setConfiguraciones] = useState<PlataformaConfig[]>([]);
  const [plataformaSeleccionada, setPlataformaSeleccionada] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogSincronizacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    plataformasActivas: 0,
    plataformasTotal: 0,
    sincronizacionesRecientes: 0,
    tasaExito: 0
  });
  const [sincronizando, setSincronizando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const { productos } = useProductos();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Cargar plataformas desde API
      const plataformasRes = await integracionesApi.getPlataformas();
      if (plataformasRes.success && plataformasRes.data) {
        setConfiguraciones(plataformasRes.data);
      }

      // Cargar historial de sincronización
      const historialRes = await integracionesApi.getHistorial();
      if (historialRes.success && historialRes.data) {
        setLogs(historialRes.data);
      }

      // Cargar estadísticas
      const statsRes = await integracionesApi.getEstadisticas();
      if (statsRes.success && statsRes.data) {
        setEstadisticas(statsRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos de integraciones:', error);
      toast.error('Error al cargar datos de integraciones');
    } finally {
      setCargando(false);
    }
  };

  const handleTogglePlataforma = async (plataformaId: number, activa: boolean) => {
    try {
      const res = await integracionesApi.togglePlataforma(plataformaId, activa);
      if (res.success) {
        cargarDatos();
        const plataforma = configuraciones.find(c => c.id === plataformaId);
        toast.success(
          `${activa ? '✅ Activada' : '⏸️ Desactivada'} sincronización con ${plataforma?.nombre || 'plataforma'}`
        );
      }
    } catch (error) {
      toast.error('Error al cambiar estado de plataforma');
    }
  };

  const handleGuardarCredenciales = async (plataformaId: number, credenciales: any) => {
    try {
      const res = await integracionesApi.actualizarPlataforma(plataformaId, { 
        credenciales,
        estado: 'conectada'
      });
      if (res.success) {
        cargarDatos();
        toast.success('Credenciales guardadas correctamente');
      }
    } catch (error) {
      toast.error('Error al guardar credenciales');
    }
  };

  const handleSincronizarTodo = async () => {
    setSincronizando(true);
    toast.info('🔄 Iniciando sincronización masiva...');

    try {
      // Sincronizar con cada plataforma activa
      const plataformasActivas = configuraciones.filter(c => c.activa);
      let exitosos = 0;
      let errores = 0;

      for (const plataforma of plataformasActivas) {
        const res = await integracionesApi.sincronizarProductos(plataforma.id, productos as any);
        if (res.success) {
          exitosos++;
        } else {
          errores++;
        }
      }
      
      toast.success(
        `✅ Sincronización completada: ${exitosos} plataformas exitosas, ${errores} errores`,
        { duration: 5000 }
      );
      
      cargarDatos();
    } catch (error) {
      toast.error('Error en la sincronización masiva');
    } finally {
      setSincronizando(false);
    }
  };

  const handleLimpiarHistorial = async () => {
    // Por ahora solo limpiamos localmente
    setLogs([]);
    toast.success('Historial limpiado');
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2">Cargando integraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Integraciones de Delivery</h2>
        <p className="text-sm text-gray-600">
          Gestiona las conexiones con plataformas de reparto externas
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plataformas Activas</p>
                <p className="text-2xl mt-1">
                  {estadisticas.plataformasActivas}/{estadisticas.plataformasTotal}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Última Hora</p>
                <p className="text-2xl mt-1">{estadisticas.sincronizacionesRecientes}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl mt-1">{estadisticas.tasaExito}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl mt-1">{productos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón de Sincronización Masiva */}
      <div className="flex justify-end">
        <Button
          onClick={handleSincronizarTodo}
          disabled={sincronizando || estadisticas.plataformasActivas === 0}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${sincronizando ? 'animate-spin' : ''}`} />
          {sincronizando ? 'Sincronizando...' : 'Sincronizar Todos los Productos'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plataformas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
          <TabsTrigger value="logs">Historial de Sincronización</TabsTrigger>
        </TabsList>

        {/* Tab: Plataformas */}
        <TabsContent value="plataformas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {configuraciones.map((config) => (
              <Card key={config.id} className={config.activa ? 'border-teal-200' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{config.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{config.nombre}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {config.estado === 'conectada' && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Conectada
                            </Badge>
                          )}
                          {config.estado === 'error' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {config.estado === 'desconectada' && (
                            <Badge variant="outline" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Desconectada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={config.activa}
                      onCheckedChange={(checked) => handleTogglePlataforma(config.id, checked)}
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Configuración de Sincronización */}
                  <div className="space-y-2">
                    <p className="text-sm mb-2">Sincronizar:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.configuracion.sincronizarPrecios && (
                        <Badge variant="outline" className="text-xs">Precios</Badge>
                      )}
                      {config.configuracion.sincronizarStock && (
                        <Badge variant="outline" className="text-xs">Stock</Badge>
                      )}
                      {config.configuracion.sincronizarDisponibilidad && (
                        <Badge variant="outline" className="text-xs">Disponibilidad</Badge>
                      )}
                      {config.configuracion.sincronizarImagenes && (
                        <Badge variant="outline" className="text-xs">Imágenes</Badge>
                      )}
                    </div>
                  </div>

                  {/* Margen de Precio */}
                  {config.configuracion.margenPrecio && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1">Margen de Precio</p>
                      <p className="text-lg text-purple-900">+{config.configuracion.margenPrecio}%</p>
                    </div>
                  )}

                  {/* Última Sincronización */}
                  {config.ultimaSincronizacion && (
                    <div className="text-xs text-gray-500">
                      Última sincronización: {new Date(config.ultimaSincronizacion).toLocaleString('es-ES')}
                    </div>
                  )}

                  {/* Mensaje de Error */}
                  {config.mensajeError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-700">{config.mensajeError}</p>
                    </div>
                  )}

                  {/* Botón Configurar */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setPlataformaSeleccionada(config.id)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Sincronización</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLimpiarHistorial}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay registros de sincronización</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border ${
                        log.estado === 'exitoso'
                          ? 'bg-green-50 border-green-200'
                          : log.estado === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {log.estado === 'exitoso' && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                            {log.estado === 'error' && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <p className="text-sm">
                              <span className="capitalize">{log.accion}</span>: {log.productoNombre}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Badge variant="outline" className="text-xs">
                              {log.plataformaNombre || 'Plataforma'}
                            </Badge>
                            <span>{new Date(log.timestamp).toLocaleString('es-ES')}</span>
                          </div>
                          {log.mensaje && (
                            <p className="text-xs text-gray-600 mt-1">{log.mensaje}</p>
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
      </Tabs>

      {/* Modal de Configuración de Plataforma (simplificado) */}
      {plataformaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Configurar {configuraciones.find(c => c.id === plataformaSeleccionada)?.nombre}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPlataformaSeleccionada(null)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Configura las credenciales y opciones de sincronización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Nota:</strong> Las credenciales se almacenan localmente. 
                  En producción, deberías usar variables de entorno seguras.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Ingresa tu API Key"
                    defaultValue={configuraciones.find(c => c.id === plataformaSeleccionada)?.credenciales.apiKey || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="storeId">Store / Restaurant ID</Label>
                  <Input
                    id="storeId"
                    placeholder="ID de tu tienda o restaurante"
                    defaultValue={configuraciones.find(c => c.id === plataformaSeleccionada)?.credenciales.storeId || ''}
                  />
                </div>

                <div>
                  <Label htmlFor="accessToken">Access Token (opcional)</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Access token OAuth"
                    defaultValue={configuraciones.find(c => c.id === plataformaSeleccionada)?.credenciales.accessToken || ''}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPlataformaSeleccionada(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    const apiKey = (document.getElementById('apiKey') as HTMLInputElement)?.value;
                    const storeId = (document.getElementById('storeId') as HTMLInputElement)?.value;
                    const accessToken = (document.getElementById('accessToken') as HTMLInputElement)?.value;

                    handleGuardarCredenciales(plataformaSeleccionada, {
                      apiKey,
                      storeId,
                      accessToken
                    });
                    setPlataformaSeleccionada(null);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
