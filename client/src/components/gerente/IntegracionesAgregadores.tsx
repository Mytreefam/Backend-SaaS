/**
 * 🔌 INTEGRACIONES DE AGREGADORES - GERENTE
 * Panel para configurar y gestionar Monei, Glovo, Uber Eats, Just Eat, etc.
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  CreditCard,
  Truck,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Zap,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS
// ============================================

interface Agregador {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'pago' | 'delivery';
  logo: string;
  activo: boolean;
  conectado: boolean;
  comision: number;
  credenciales: {
    [key: string]: string;
  };
  config: {
    [key: string]: any;
  };
  estadisticas?: {
    pedidos_hoy: number;
    pedidos_mes: number;
    ingresos_mes: number;
  };
}

// ============================================
// DATOS MOCK
// ============================================

const AGREGADORES_DISPONIBLES: Agregador[] = [
  {
    id: 'monei',
    nombre: 'Monei',
    descripcion: 'Pasarela de pagos española con comisiones bajas',
    tipo: 'pago',
    logo: '💳',
    activo: false,
    conectado: false,
    comision: 1.4,
    credenciales: {
      apiKey: '',
      accountId: '',
      webhookSecret: ''
    },
    config: {
      currency: 'EUR',
      callbackUrl: 'https://miapp.com/webhooks/monei'
    }
  },
  {
    id: 'glovo',
    nombre: 'Glovo',
    descripcion: 'Plataforma de delivery y reparto',
    tipo: 'delivery',
    logo: '🛵',
    activo: false,
    conectado: false,
    comision: 25,
    credenciales: {
      apiKey: '',
      storeId: ''
    },
    config: {
      tiempoPreparacion: 15,
      radioEntrega: 5
    },
    estadisticas: {
      pedidos_hoy: 0,
      pedidos_mes: 0,
      ingresos_mes: 0
    }
  },
  {
    id: 'uber_eats',
    nombre: 'Uber Eats',
    descripcion: 'Delivery de comida a domicilio',
    tipo: 'delivery',
    logo: '🍔',
    activo: false,
    conectado: false,
    comision: 30,
    credenciales: {
      clientId: '',
      clientSecret: '',
      storeId: ''
    },
    config: {
      tiempoPreparacion: 15
    },
    estadisticas: {
      pedidos_hoy: 0,
      pedidos_mes: 0,
      ingresos_mes: 0
    }
  },
  {
    id: 'justeat',
    nombre: 'Just Eat',
    descripcion: 'Marketplace de comida a domicilio',
    tipo: 'delivery',
    logo: '🍕',
    activo: false,
    conectado: false,
    comision: 13,
    credenciales: {
      apiKey: '',
      restaurantId: ''
    },
    config: {
      tiempoPreparacion: 15
    },
    estadisticas: {
      pedidos_hoy: 0,
      pedidos_mes: 0,
      ingresos_mes: 0
    }
  }
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function IntegracionesAgregadores() {
  const [agregadores, setAgregadores] = useState<Agregador[]>(AGREGADORES_DISPONIBLES);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'pago' | 'delivery'>('todos');
  const [modalConfig, setModalConfig] = useState(false);
  const [agregadorEditando, setAgregadorEditando] = useState<Agregador | null>(null);
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);
  const [verificandoConexion, setVerificandoConexion] = useState<string | null>(null);

  // ============================================
  // CÁLCULOS
  // ============================================

  const agregadoresFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return agregadores;
    return agregadores.filter(a => a.tipo === filtroTipo);
  }, [agregadores, filtroTipo]);

  const estadisticasGlobales = useMemo(() => {
    const activos = agregadores.filter(a => a.activo);
    const conectados = agregadores.filter(a => a.conectado);
    
    const totalPedidos = agregadores.reduce((sum, a) => 
      sum + (a.estadisticas?.pedidos_mes || 0), 0
    );
    
    const totalIngresos = agregadores.reduce((sum, a) => 
      sum + (a.estadisticas?.ingresos_mes || 0), 0
    );

    return {
      total: agregadores.length,
      activos: activos.length,
      conectados: conectados.length,
      totalPedidos,
      totalIngresos
    };
  }, [agregadores]);

  // ============================================
  // FUNCIONES
  // ============================================

  const abrirModalConfig = (agregador: Agregador) => {
    setAgregadorEditando({ ...agregador });
    setModalConfig(true);
    setMostrarCredenciales(false);
  };

  const guardarConfiguracion = () => {
    if (!agregadorEditando) return;

    setAgregadores(agregadores.map(a => 
      a.id === agregadorEditando.id ? agregadorEditando : a
    ));

    toast.success(`Configuración de ${agregadorEditando.nombre} guardada`);
    setModalConfig(false);
  };

  const toggleActivo = (agregadorId: string) => {
    setAgregadores(agregadores.map(a =>
      a.id === agregadorId ? { ...a, activo: !a.activo } : a
    ));
    
    const agregador = agregadores.find(a => a.id === agregadorId);
    toast.success(`${agregador?.nombre} ${!agregador?.activo ? 'activado' : 'desactivado'}`);
  };

  const verificarConexion = async (agregadorId: string) => {
    setVerificandoConexion(agregadorId);
    
    // Simular verificación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAgregadores(agregadores.map(a =>
      a.id === agregadorId ? { ...a, conectado: true } : a
    ));
    
    toast.success('Conexión verificada correctamente');
    setVerificandoConexion(null);
  };

  const sincronizarMenu = async (agregadorId: string) => {
    toast.info('Sincronizando menú...');
    
    // Simular sincronización
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Menú sincronizado correctamente');
  };

  const copiarCredencial = (valor: string) => {
    navigator.clipboard.writeText(valor);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight">Integraciones</h1>
        <p className="text-sm text-gray-600 mt-1">
          Conecta tu negocio con plataformas de pago y delivery
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Integradas</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {estadisticasGlobales.activos}/{estadisticasGlobales.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Conectadas</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticasGlobales.conectados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Pedidos/Mes</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticasGlobales.totalPedidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Ingresos/Mes</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  {estadisticasGlobales.totalIngresos.toFixed(0)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pago">Pagos</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de Agregadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agregadoresFiltrados.map(agregador => (
          <Card key={agregador.id} className={agregador.activo ? 'border-teal-200' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{agregador.logo}</div>
                  <div>
                    <CardTitle className="text-lg">{agregador.nombre}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {agregador.descripcion}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={agregador.activo}
                  onCheckedChange={() => toggleActivo(agregador.id)}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Estado */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {agregador.conectado ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    {agregador.conectado ? 'Conectado' : 'No conectado'}
                  </span>
                </div>

                <Badge variant="outline" className="text-xs">
                  {agregador.tipo === 'pago' ? <CreditCard className="w-3 h-3 mr-1" /> : <Truck className="w-3 h-3 mr-1" />}
                  {agregador.comision}% comisión
                </Badge>
              </div>

              {/* Estadísticas (solo delivery) */}
              {agregador.tipo === 'delivery' && agregador.estadisticas && agregador.activo && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Hoy</p>
                    <p className="font-semibold">{agregador.estadisticas.pedidos_hoy}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Este mes</p>
                    <p className="font-semibold">{agregador.estadisticas.pedidos_mes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Ingresos</p>
                    <p className="font-semibold">{agregador.estadisticas.ingresos_mes}€</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrirModalConfig(agregador)}
                  className="flex-1"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar
                </Button>

                {agregador.activo && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verificarConexion(agregador.id)}
                      disabled={verificandoConexion === agregador.id}
                    >
                      {verificandoConexion === agregador.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </Button>

                    {agregador.tipo === 'delivery' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sincronizarMenu(agregador.id)}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Alerta si no está configurado */}
              {agregador.activo && !agregador.conectado && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Completa la configuración para conectar</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información Adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">¿Necesitas ayuda con las integraciones?</p>
              <p className="text-blue-700">
                Consulta nuestra{' '}
                <a href="#" className="underline">documentación técnica</a>
                {' '}o contacta con soporte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Configuración */}
      <Dialog open={modalConfig} onOpenChange={setModalConfig}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurar {agregadorEditando?.nombre}
            </DialogTitle>
            <DialogDescription>
              Completa los datos de conexión para activar esta integración
            </DialogDescription>
          </DialogHeader>

          {agregadorEditando && (
            <div className="space-y-6">
              {/* Credenciales */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Credenciales de API</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMostrarCredenciales(!mostrarCredenciales)}
                  >
                    {mostrarCredenciales ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.entries(agregadorEditando.credenciales).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={key}
                          type={mostrarCredenciales ? 'text' : 'password'}
                          value={value}
                          onChange={(e) => setAgregadorEditando({
                            ...agregadorEditando,
                            credenciales: {
                              ...agregadorEditando.credenciales,
                              [key]: e.target.value
                            }
                          })}
                          placeholder={`Introduce tu ${key}`}
                        />
                        {value && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copiarCredencial(value)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración Adicional */}
              {Object.keys(agregadorEditando.config).length > 0 && (
                <div>
                  <Label className="text-base mb-3 block">Configuración</Label>
                  <div className="space-y-3">
                    {Object.entries(agregadorEditando.config).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`config-${key}`} className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Input
                          id={`config-${key}`}
                          value={value}
                          onChange={(e) => setAgregadorEditando({
                            ...agregadorEditando,
                            config: {
                              ...agregadorEditando.config,
                              [key]: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enlaces Útiles */}
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium mb-2">Enlaces útiles:</p>
                <div className="space-y-1">
                  <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    Documentación de {agregadorEditando.nombre}
                  </a>
                  <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    ¿Dónde encontrar mis credenciales?
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setModalConfig(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarConfiguracion}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              Guardar Configuración
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IntegracionesAgregadores;
