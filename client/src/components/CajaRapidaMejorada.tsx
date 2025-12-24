import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Package, CreditCard, Check, Clock, User, Phone, Mail, MapPin, Users, Volume2, VolumeX, TrendingUp, UserCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Pedido, PermisosTPV } from './TPV360Master';
import { obtenerTodosPedidos } from '../services/pedidos.service';
import { obtenerTurnosEsperando, atenderTurno, completarTurno, type TurnoSinPedido } from '../services/turnos-sin-pedido.service';

interface CajaRapidaMejoradaProps {
  pedidos: Pedido[];
  onMarcarListo: (pedidoId: string) => void;
  onMarcarEntregado: (pedidoId: string) => void;
  permisos: PermisosTPV;
}

export function CajaRapidaMejorada({ 
  pedidos: pedidosProp, 
  onMarcarListo, 
  onMarcarEntregado,
  permisos 
}: CajaRapidaMejoradaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [notificacionesMostradas, setNotificacionesMostradas] = useState<Set<string>>(new Set());
  const [sonidoActivado, setSonidoActivado] = useState(() => {
    const saved = localStorage.getItem('caja_rapida_sonido');
    return saved === null ? true : saved === 'true';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ultimosClientesPresentesRef = useRef<Set<string>>(new Set());
  const [pedidosActualizados, setPedidosActualizados] = useState<any[]>([]);
  const [turnosSinPedido, setTurnosSinPedido] = useState<TurnoSinPedido[]>([]);
  const ultimosTurnosPresentesRef = useRef<Set<string>>(new Set());

  // Sincronizar pedidos del servicio con los props
  useEffect(() => {
    const cargarPedidos = () => {
      try {
        const pedidosServicio = obtenerTodosPedidos();
        // Convertir pedidos del servicio al formato que espera el componente
        const pedidosFormateados = pedidosServicio.map(p => ({
          id: p.id,
          codigo: p.numero || p.id.substring(0, 10),
          cliente: p.cliente,
          items: p.items.map(item => ({
            producto: {
              id: item.productoId || item.nombre,
              nombre: item.nombre,
              precio: item.precio,
              categoria: '',
              stock: 0,
              activo: true,
              visible_tpv: true
            },
            cantidad: item.cantidad,
            subtotal: item.subtotal
          })),
          total: p.total,
          estado: p.estado as any,
          origenPedido: p.origenPedido === 'app' ? 'app' : p.origenPedido === 'tpv' ? 'presencial' : 'web',
          metodoPago: p.metodoPago as any,
          pagado: p.estadoPago === 'pagado',
          fechaCreacion: new Date(p.fecha),
          geolocalizacionValidada: p.geolocalizacionValidada,
          fechaGeolocalizacion: p.fechaGeolocalizacion
        }));
        setPedidosActualizados(pedidosFormateados);
      } catch (error) {
        console.error('Error cargando pedidos del servicio:', error);
      }
    };

    // Cargar al montar y cada 2 segundos para mantener sincronizado
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 2000);
    return () => clearInterval(interval);
  }, []);

  // Usar pedidos del servicio si están disponibles, sino usar los props
  const pedidos = pedidosActualizados.length > 0 ? pedidosActualizados : pedidosProp;

  // 🎫 Sincronizar turnos sin pedido
  useEffect(() => {
    const cargarTurnos = () => {
      try {
        const turnos = obtenerTurnosEsperando();
        setTurnosSinPedido(turnos);
      } catch (error) {
        console.error('Error cargando turnos sin pedido:', error);
      }
    };

    // Cargar al montar
    cargarTurnos();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => cargarTurnos();
    window.addEventListener('turnos-sin-pedido-updated', handleStorageChange);

    // Polling cada 2 segundos para mantener sincronizado
    const interval = setInterval(cargarTurnos, 2000);

    return () => {
      window.removeEventListener('turnos-sin-pedido-updated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 🔔 Detectar nuevos turnos sin pedido y reproducir sonido
  useEffect(() => {
    const turnosPresentes = new Set(turnosSinPedido.map(t => t.id));

    // Detectar nuevos turnos
    const nuevosTurnos = [...turnosPresentes].filter(
      id => !ultimosTurnosPresentesRef.current.has(id)
    );

    if (nuevosTurnos.length > 0 && sonidoActivado && audioRef.current) {
      // Reproducir sonido
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Error reproduciendo sonido:', err));
    }

    // Actualizar referencia
    ultimosTurnosPresentesRef.current = turnosPresentes;
  }, [turnosSinPedido, sonidoActivado]);

  // Inicializar sonido
  useEffect(() => {
    // Crear elemento de audio para notificación
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiDYIGWm+7O24ax0FO5Po9L52JAoqedDx4pVKCxhfuO7mvGcdBzKL0fPZkTwKFl24796ybh0FPJXo9LpxIAorftDx4JNKCxhfuO7mvmwdBzKM0vPajzwKF2C37tepbh0FO5Xn9LlxIgoufdDx4pVKCxhfuO7nvmwdBzKM0vPajTsKF1+37terbh0FO5Xn9LpxIgoufdDx4ZRJCxhfuO7nvmwdBzKM0vPajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIgotfdDx4ZRJCxhfuO7nvmwdBzKM0/PajTsKGF+37derbh0FO5Xn9LpwIg==');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Detectar nuevos clientes presentes y reproducir sonido
  useEffect(() => {
    const clientesPresentes = new Set(
      pedidos
        .filter(p => p.geolocalizacionValidada && p.origenPedido === 'app')
        .map(p => p.id)
    );

    // Detectar nuevos clientes
    const nuevosClientes = [...clientesPresentes].filter(
      id => !ultimosClientesPresentesRef.current.has(id)
    );

    if (nuevosClientes.length > 0 && sonidoActivado && audioRef.current) {
      // Reproducir sonido
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Error reproduciendo sonido:', err));
    }

    // Actualizar referencia
    ultimosClientesPresentesRef.current = clientesPresentes;
  }, [pedidos, sonidoActivado]);

  // Toggle sonido
  const toggleSonido = () => {
    const nuevoEstado = !sonidoActivado;
    setSonidoActivado(nuevoEstado);
    localStorage.setItem('caja_rapida_sonido', nuevoEstado.toString());
    toast.info(nuevoEstado ? 'Sonido activado' : 'Sonido desactivado');
  };

  // Escuchar notificaciones de clientes presentes y turnos sin pedido
  useEffect(() => {
    const checkNotificaciones = () => {
      try {
        const notificacionesTPV = JSON.parse(localStorage.getItem('notificaciones_tpv') || '[]');
        
        // Notificaciones de clientes con pedido
        const nuevasNotificacionesPedidos = notificacionesTPV.filter(
          (notif: any) => !notif.leida && notif.tipo === 'cliente_presente' && !notificacionesMostradas.has(notif.id)
        );

        nuevasNotificacionesPedidos.forEach((notif: any) => {
          toast.success(
            `🎯 ${notif.clienteNombre} ha llegado al negocio`,
            { 
              description: `Pedido ${notif.codigoPedido} listo para atender`,
              duration: 6000,
              action: {
                label: 'Ver pedido',
                onClick: () => {
                  // Buscar el pedido
                  setBusqueda(notif.codigoPedido);
                }
              }
            }
          );

          // Marcar como mostrada
          setNotificacionesMostradas(prev => new Set([...prev, notif.id]));

          // Marcar como leída en localStorage
          const notificacionesActualizadas = notificacionesTPV.map((n: any) => 
            n.id === notif.id ? { ...n, leida: true } : n
          );
          localStorage.setItem('notificaciones_tpv', JSON.stringify(notificacionesActualizadas));
        });

        // Notificaciones de turnos sin pedido
        const nuevasNotificacionesTurnos = notificacionesTPV.filter(
          (notif: any) => !notif.leida && notif.tipo === 'turno_sin_pedido' && !notificacionesMostradas.has(notif.id)
        );

        nuevasNotificacionesTurnos.forEach((notif: any) => {
          toast.info(
            `👤 ${notif.clienteNombre} ha llegado sin pedido`,
            { 
              description: 'Cliente esperando atención',
              duration: 6000
            }
          );

          // Marcar como mostrada
          setNotificacionesMostradas(prev => new Set([...prev, notif.id]));

          // Marcar como leída en localStorage
          const notificacionesActualizadas = notificacionesTPV.map((n: any) => 
            n.id === notif.id ? { ...n, leida: true } : n
          );
          localStorage.setItem('notificaciones_tpv', JSON.stringify(notificacionesActualizadas));
        });
      } catch (error) {
        console.error('Error al verificar notificaciones TPV:', error);
      }
    };

    // Verificar al montar y cada 3 segundos
    checkNotificaciones();
    const interval = setInterval(checkNotificaciones, 3000);

    return () => clearInterval(interval);
  }, [notificacionesMostradas]);

  // Filtrar pedidos según búsqueda universal
  const pedidosFiltrados = pedidos.filter(pedido => {
    const busquedaLower = busqueda.toLowerCase();
    return (
      pedido.codigo.toLowerCase().includes(busquedaLower) ||
      pedido.cliente.nombre.toLowerCase().includes(busquedaLower) ||
      pedido.cliente.telefono.includes(busqueda) ||
      pedido.cliente.email?.toLowerCase().includes(busquedaLower) ||
      pedido.id.toLowerCase().includes(busquedaLower)
    );
  });

  // Separar pedidos:
  // AZULES: Pendientes de cobrar (app pero pagado=false)
  // NARANJAS: Pagados en app (app y pagado=true)
  const pedidosPendientesCobro = pedidosFiltrados
    .filter(p => p.origenPedido === 'app' && !p.pagado)
    .sort((a, b) => {
      // Prioridad 1: Clientes presentes primero
      if (a.geolocalizacionValidada && !b.geolocalizacionValidada) return -1;
      if (!a.geolocalizacionValidada && b.geolocalizacionValidada) return 1;
      // Prioridad 2: Más antiguos primero
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
    });
  
  const pedidosPagadosApp = pedidosFiltrados
    .filter(p => p.origenPedido === 'app' && p.pagado)
    .sort((a, b) => {
      // Prioridad 1: Clientes presentes primero
      if (a.geolocalizacionValidada && !b.geolocalizacionValidada) return -1;
      if (!a.geolocalizacionValidada && b.geolocalizacionValidada) return 1;
      // Prioridad 2: Más antiguos primero
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
    });

  // Calcular clientes esperando (pedidos + turnos sin pedido)
  const clientesEsperando = pedidos.filter(
    p => p.geolocalizacionValidada && p.origenPedido === 'app' && 
    (p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo')
  );
  
  // Total de clientes esperando (con pedido + sin pedido)
  const totalClientesEsperando = clientesEsperando.length + turnosSinPedido.length;

  // Calcular tiempo promedio de espera
  const calcularTiempoPromedioEspera = (): number => {
    if (clientesEsperando.length === 0) return 0;
    
    const tiempoTotal = clientesEsperando.reduce((acc, pedido) => {
      if (!pedido.fechaGeolocalizacion) return acc;
      const tiempoEspera = Date.now() - new Date(pedido.fechaGeolocalizacion).getTime();
      return acc + tiempoEspera;
    }, 0);
    
    return Math.floor(tiempoTotal / clientesEsperando.length / 60000); // en minutos
  };

  const tiempoPromedioEspera = calcularTiempoPromedioEspera();

  const handleAccionPedido = (pedido: Pedido) => {
    if (pedido.pagado) {
      // Pedidos pagados: marcar como entregado
      onMarcarEntregado(pedido.id);
    } else {
      // Pedidos pendientes: cobrar
      toast.info('Redirigiendo a cobro de pedido...');
      // Aquí se podría abrir un modal de cobro o redirigir al TPV
    }
  };

  // 🎫 Gestión de turnos sin pedido
  const handleAtenderTurno = (turnoId: string, clienteNombre: string) => {
    const success = atenderTurno(turnoId);
    if (success) {
      toast.success(`Atendiendo a ${clienteNombre}`);
    }
  };

  const handleCompletarTurno = (turnoId: string, clienteNombre: string) => {
    const success = completarTurno(turnoId);
    if (success) {
      toast.success(`Turno de ${clienteNombre} completado`);
    }
  };

  const formatearTiempo = (fecha: Date): string => {
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos === 1) return '1 min';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `${horas}h ${minutos % 60}m`;
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header con buscador universal */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Caja Rápida - Pedidos App
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSonido}
              className="shrink-0"
              title={sonidoActivado ? 'Desactivar sonido' : 'Activar sonido'}
            >
              {sonidoActivado ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <Input
              placeholder="Buscar código, nombre, teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-3xl sm:text-4xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidosPendientesCobro.length}
            </p>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              <span className="hidden sm:inline">Pendientes de Cobrar</span>
              <span className="sm:hidden">Pendientes</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-3xl sm:text-4xl text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidosPagadosApp.length}
            </p>
            <p className="text-xs sm:text-sm text-orange-700 mt-1">
              <span className="hidden sm:inline">Pagados - Listos Entregar</span>
              <span className="sm:hidden">Pagados</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              <p className="text-3xl sm:text-4xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {totalClientesEsperando}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-green-700">
              <span className="hidden sm:inline">Clientes Presentes</span>
              <span className="sm:hidden">Presentes</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
              <p className="text-3xl sm:text-4xl text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {tiempoPromedioEspera}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-purple-700">
              <span className="hidden sm:inline">Tiempo Espera (min)</span>
              <span className="sm:hidden">Espera (min)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* LISTA AZUL: Pendientes de Cobrar */}
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="hidden sm:inline">Pendientes de Cobrar</span>
                <span className="sm:hidden">Pendientes</span>
              </CardTitle>
              <Badge className="bg-blue-500 text-white text-xs sm:text-sm">
                {pedidosPendientesCobro.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[700px] overflow-y-auto">
            {pedidosPendientesCobro.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay pedidos pendientes de cobro</p>
              </div>
            ) : (
              pedidosPendientesCobro.map(pedido => (
                <Card key={pedido.id} className="border-2 border-blue-400 bg-blue-50/50">
                  <CardContent className="p-3 sm:p-4">
                    {/* Código de pedido GRANDE */}
                    <div className="text-center mb-2 sm:mb-3 pb-2 sm:pb-3 border-b-2 border-dashed border-blue-300">
                      <p className="text-3xl sm:text-4xl text-blue-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {pedido.codigo}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge className="bg-blue-600 text-white text-xs sm:text-sm">
                          PAGO EN TIENDA
                        </Badge>
                        {pedido.geolocalizacionValidada && (
                          <Badge className="bg-green-600 text-white text-xs sm:text-sm animate-pulse">
                            <MapPin className="w-3 h-3 mr-1" />
                            CLIENTE PRESENTE
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Información del cliente */}
                    <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span className="font-medium truncate">{pedido.cliente.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span>{pedido.cliente.telefono}</span>
                      </div>
                      {pedido.cliente.email && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="truncate">{pedido.cliente.email}</span>
                        </div>
                      )}
                      {pedido.geolocalizacionValidada && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                          <span>¡Cliente presente en tienda!</span>
                        </div>
                      )}
                    </div>

                    {/* Lista de items */}
                    <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 text-xs sm:text-sm">
                      <p className="font-medium text-gray-700 mb-1">Productos:</p>
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-2">
                          <span className="text-gray-700 truncate">
                            {item.cantidad}x {item.producto.nombre}
                          </span>
                          <span className="text-gray-900 font-medium whitespace-nowrap">
                            {item.subtotal.toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2 mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base font-medium">Total a cobrar:</span>
                      <span className="text-xl sm:text-2xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {pedido.total.toFixed(2)}€
                      </span>
                    </div>

                    {/* Tiempo esperando */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                      <Clock className="w-3 h-3" />
                      <span>Esperando {formatearTiempo(pedido.fechaCreacion)}</span>
                    </div>

                    {/* Botón de acción */}
                    <Button
                      onClick={() => handleAccionPedido(pedido)}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-sm"
                      disabled={!permisos.cobrar_pedidos}
                    >
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Cobrar Pedido
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* LISTA NARANJA: Pagados - Listos para Entregar */}
        <Card className="border-2 border-orange-300">
          <CardHeader className="bg-orange-50 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <span className="hidden sm:inline">Pagados en App</span>
                <span className="sm:hidden">Pagados</span>
              </CardTitle>
              <Badge className="bg-orange-500 text-white text-xs sm:text-sm">
                {pedidosPagadosApp.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[700px] overflow-y-auto">
            {pedidosPagadosApp.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay pedidos pagados pendientes</p>
              </div>
            ) : (
              pedidosPagadosApp.map(pedido => (
                <Card key={pedido.id} className="border-2 border-orange-400 bg-orange-50/50">
                  <CardContent className="p-3 sm:p-4">
                    {/* Código de pedido GRANDE */}
                    <div className="text-center mb-2 sm:mb-3 pb-2 sm:pb-3 border-b-2 border-dashed border-orange-300">
                      <p className="text-3xl sm:text-4xl text-orange-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {pedido.codigo}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge className="bg-orange-600 text-white text-xs sm:text-sm">
                          PAGADO ONLINE
                        </Badge>
                        {pedido.geolocalizacionValidada && (
                          <Badge className="bg-green-600 text-white text-xs sm:text-sm animate-pulse">
                            <MapPin className="w-3 h-3 mr-1" />
                            CLIENTE PRESENTE
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Estado del pedido */}
                    <div className="mb-2 sm:mb-3">
                      {pedido.estado === 'en_preparacion' && (
                        <Badge className="bg-yellow-100 text-yellow-800 w-full justify-center py-1 text-xs sm:text-sm">
                          En Preparación
                        </Badge>
                      )}
                      {pedido.estado === 'listo' && (
                        <Badge className="bg-green-100 text-green-800 w-full justify-center py-1 text-xs sm:text-sm">
                          Listo para Entregar
                        </Badge>
                      )}
                    </div>

                    {/* Información del cliente */}
                    <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span className="font-medium truncate">{pedido.cliente.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span>{pedido.cliente.telefono}</span>
                      </div>
                      {pedido.cliente.email && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="truncate">{pedido.cliente.email}</span>
                        </div>
                      )}
                      {pedido.geolocalizacionValidada && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                          <span>¡Cliente presente en tienda!</span>
                        </div>
                      )}
                    </div>

                    {/* Lista de items */}
                    <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 text-xs sm:text-sm">
                      <p className="font-medium text-gray-700 mb-1">Productos:</p>
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-2">
                          <span className="text-gray-700 truncate">
                            {item.cantidad}x {item.producto.nombre}
                          </span>
                          <span className="text-gray-900 font-medium whitespace-nowrap">
                            {item.subtotal.toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2 mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base font-medium">Total:</span>
                      <span className="text-xl sm:text-2xl text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {pedido.total.toFixed(2)}€
                      </span>
                    </div>

                    {/* Método de pago */}
                    {pedido.metodoPago && (
                      <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="capitalize">{pedido.metodoPago}</span>
                      </div>
                    )}

                    {/* Tiempo esperando */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                      <Clock className="w-3 h-3" />
                      <span>Preparado hace {formatearTiempo(pedido.fechaCreacion)}</span>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-2">
                      {pedido.estado === 'en_preparacion' && permisos.marcar_como_listo && (
                        <Button
                          onClick={() => onMarcarListo(pedido.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar como Listo
                        </Button>
                      )}
                      {pedido.estado === 'listo' && (
                        <Button
                          onClick={() => handleAccionPedido(pedido)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Entregar Pedido
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* LISTA PÚRPURA: Clientes sin Pedido */}
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-purple-50 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="hidden sm:inline">Clientes sin Pedido</span>
                <span className="sm:hidden">Sin Pedido</span>
              </CardTitle>
              <Badge className="bg-purple-500 text-white text-xs sm:text-sm">
                {turnosSinPedido.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[700px] overflow-y-auto">
            {turnosSinPedido.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay clientes sin pedido esperando</p>
              </div>
            ) : (
              turnosSinPedido.map(turno => (
                <Card key={turno.id} className="border-2 border-purple-400 bg-purple-50/50">
                  <CardContent className="p-3 sm:p-4">
                    {/* Turno ID */}
                    <div className="text-center mb-2 sm:mb-3 pb-2 sm:pb-3 border-b-2 border-dashed border-purple-300">
                      <p className="text-2xl sm:text-3xl text-purple-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        TURNO #{turno.id.slice(-6).toUpperCase()}
                      </p>
                      <Badge className="bg-purple-600 text-white text-xs sm:text-sm">
                        {turno.estado === 'esperando' ? 'ESPERANDO' : 'ATENDIENDO'}
                      </Badge>
                    </div>

                    {/* Información del cliente */}
                    <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span className="font-medium truncate">{turno.clienteNombre}</span>
                      </div>
                      {turno.clienteTelefono && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span>{turno.clienteTelefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                        <span>Cliente presente en tienda</span>
                      </div>
                    </div>

                    {/* Motivo (si existe) */}
                    {turno.motivo && (
                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Motivo:</span>{' '}
                          {turno.motivo === 'compra' && 'Compra en mostrador'}
                          {turno.motivo === 'consulta' && 'Consulta'}
                          {turno.motivo === 'recogida' && 'Recogida'}
                          {turno.motivo === 'otro' && 'Otro'}
                        </p>
                      </div>
                    )}

                    {/* Notas (si existen) */}
                    {turno.notas && (
                      <div className="mb-2 sm:mb-3 p-2 bg-purple-100 rounded text-xs sm:text-sm">
                        <p className="text-purple-900">{turno.notas}</p>
                      </div>
                    )}

                    {/* Tiempo esperando */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                      <Clock className="w-3 h-3" />
                      <span>
                        {turno.estado === 'esperando' 
                          ? `Esperando ${formatearTiempo(new Date(turno.fechaLlegada))}`
                          : `Atendiendo desde ${formatearTiempo(new Date(turno.fechaAtencion!))}`
                        }
                      </span>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-2">
                      {turno.estado === 'esperando' && (
                        <Button
                          onClick={() => handleAtenderTurno(turno.id, turno.clienteNombre)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Atender Cliente
                        </Button>
                      )}
                      {turno.estado === 'atendiendo' && (
                        <Button
                          onClick={() => handleCompletarTurno(turno.id, turno.clienteNombre)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Completar Atención
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
