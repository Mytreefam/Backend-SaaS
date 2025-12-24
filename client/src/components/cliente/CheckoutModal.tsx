/**
 * 🛒💳 MODAL DE CHECKOUT MEJORADO - EN 2 PASOS
 * 
 * PASO 1: Tipo de Entrega + Resumen
 * - Opción A: Entrega a Domicilio (con geolocalización)
 * - Opción B: Recogida en Tienda (recomendación por cercanía)
 * 
 * PASO 2: Datos de Entrega + Método de Pago
 * - Si Domicilio: Selector de direcciones guardadas
 * - Si Recogida: Selector de PDV ordenados por distancia
 * - Método de pago (Tarjeta, Bizum, Efectivo)
 * - Notas adicionales
 * 
 * Al confirmar:
 * - Crea el pedido con todos los datos
 * - Genera factura VeriFactu
 * - Limpia el carrito
 * - Muestra confirmación
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { stockIntegrationService } from '../../services/stock-integration.service';
import { 
  ShoppingBag,
  MapPin,
  Store,
  Navigation,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Check,
  Sparkles,
  MapPinned,
  AlertCircle,
  FileText,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { MisDirecciones, type Direccion } from './MisDirecciones';
import { asociarFactura } from '../../services/pedidos.service';
import { notificationsService } from '../../services/notifications.service';
import { toast } from 'sonner@2.0.3';
import { PagoProcesamientoModal } from './PagoProcesamientoModal';
import { PagoResultadoModal } from './PagoResultadoModal';

// ============================================
// INTERFACES
// ============================================

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pedidoId: string, facturaId: string) => void;
  userData: {
    id?: string | number;
    name: string;
    email: string;
    telefono?: string;
    direccion?: string;
  };
}

interface Marca {
  id: string;
  nombre: string;
  colorIdentidad: string;
}

interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  distancia?: number;
  tiempoEstimado?: number;
  latitud: number;
  longitud: number;
  marcasDisponibles: Marca[];
}

type MetodoPago = 'tarjeta' | 'bizum' | 'efectivo';
type TipoEntrega = 'domicilio' | 'recogida';

// ============================================
// DATOS MOCK - PDVs (desde ConfiguracionEmpresas del Gerente)
// ============================================

const puntosVentaMock: PuntoVenta[] = [
  {
    id: 'PDV-TIANA',
    nombre: 'Tiana',
    direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
    distancia: 0.8,
    tiempoEstimado: 15,
    latitud: 41.4933,
    longitud: 2.2633,
    marcasDisponibles: [
      {
        id: 'MRC-001',
        nombre: 'Modomio',
        colorIdentidad: '#FF6B35',
      },
      {
        id: 'MRC-002',
        nombre: 'Blackburguer',
        colorIdentidad: '#1A1A1A',
      },
    ],
  },
  {
    id: 'PDV-BADALONA',
    nombre: 'Badalona',
    direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
    distancia: 2.3,
    tiempoEstimado: 20,
    latitud: 41.4500,
    longitud: 2.2461,
    marcasDisponibles: [
      {
        id: 'MRC-001',
        nombre: 'Modomio',
        colorIdentidad: '#FF6B35',
      },
      {
        id: 'MRC-002',
        nombre: 'Blackburguer',
        colorIdentidad: '#1A1A1A',
      },
    ],
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function CheckoutModal({ isOpen, onClose, onSuccess, userData }: CheckoutModalProps) {
  // Estados principales
  const [paso, setPaso] = useState<1 | 2>(1);
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega | null>(null);
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState<PuntoVenta | null>(null);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('tarjeta');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // Estados de geolocalización
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lng: number } | null>(null);
  const [geolocalizando, setGeolocalizando] = useState(false);
  const [errorGeolocalizacion, setErrorGeolocalizacion] = useState<string | null>(null);
  const [puntosOrdenados, setPuntosOrdenados] = useState<PuntoVenta[]>(puntosVentaMock);

  // Carrito
  const {
    items,
    totalItems,
    subtotal,
    descuentoCupon,
    iva,
    total,
    cuponAplicado,
    clearCart,
    crearPedido, // ✅ Método para crear pedido con API backend
  } = useCart();

  // ============================================
  // GEOLOCALIZACIÓN
  // ============================================

  useEffect(() => {
    if (isOpen && !ubicacionUsuario) {
      obtenerUbicacion();
    }
  }, [isOpen]);

  const obtenerUbicacion = () => {
    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      setErrorGeolocalizacion('Tu navegador no soporta geolocalización');
      setPuntosOrdenados(puntosVentaMock);
      if (puntosVentaMock.length > 0) {
        setPuntoVentaSeleccionado(puntosVentaMock[0]);
      }
      return;
    }

    setGeolocalizando(true);
    setErrorGeolocalizacion(null);

    navigator.geolocation.getCurrentPosition(
      // Éxito
      (position) => {
        const { latitude, longitude } = position.coords;
        setUbicacionUsuario({ lat: latitude, lng: longitude });
        
        const puntosConDistancia = calcularDistancias(latitude, longitude);
        setPuntosOrdenados(puntosConDistancia);
        
        if (puntosConDistancia.length > 0) {
          setPuntoVentaSeleccionado(puntosConDistancia[0]);
        }
        
        setGeolocalizando(false);
        setErrorGeolocalizacion(null);
      },
      // Error
      (error) => {
        let mensajeError = 'No se pudo obtener tu ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensajeError = 'Permiso de ubicación denegado. Puedes seleccionar el punto de venta manualmente.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensajeError = 'Ubicación no disponible. Mostrando todos los puntos de venta.';
            break;
          case error.TIMEOUT:
            mensajeError = 'Tiempo de espera agotado. Mostrando todos los puntos de venta.';
            break;
          default:
            mensajeError = 'Error al obtener ubicación. Mostrando todos los puntos de venta.';
        }
        
        setErrorGeolocalizacion(mensajeError);
        setGeolocalizando(false);
        
        // Mostrar puntos sin ordenar por distancia
        setPuntosOrdenados(puntosVentaMock);
        if (puntosVentaMock.length > 0) {
          setPuntoVentaSeleccionado(puntosVentaMock[0]);
        }
      },
      // Opciones
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  const calcularDistancias = (lat: number, lng: number): PuntoVenta[] => {
    return puntosVentaMock.map(punto => {
      const distancia = calcularDistanciaHaversine(lat, lng, punto.latitud, punto.longitud);
      return {
        ...punto,
        distancia,
        tiempoEstimado: Math.round(distancia * 10)
      };
    }).sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
  };

  const calcularDistanciaHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ============================================
  // NAVEGACIÓN
  // ============================================

  const handleSeleccionarTipoEntrega = (tipo: TipoEntrega) => {
    setTipoEntrega(tipo);
    setPaso(2);
  };

  const handleVolverPaso1 = () => {
    setPaso(1);
    setTipoEntrega(null);
    setDireccionSeleccionada(null);
  };

  // ============================================
  // PROCESAR PEDIDO
  // ============================================

  const handleConfirmarPedido = async () => {
    // Validaciones
    if (!tipoEntrega) {
      toast.error('Selecciona un tipo de entrega');
      return;
    }

    if (tipoEntrega === 'recogida' && !puntoVentaSeleccionado) {
      toast.error('Selecciona un punto de venta');
      return;
    }

    // Ya no se necesita seleccionar marca - es interno del negocio

    if (tipoEntrega === 'domicilio' && !direccionSeleccionada) {
      toast.error('Selecciona una dirección de entrega');
      return;
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setProcesando(true);

    try {
      // ⭐ NUEVO: Validar stock ANTES de crear pedido
      const validacionStock = stockIntegrationService.validarStockDisponible(
        items.map(item => ({
          productoId: item.productoId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.precio * item.cantidad,
          opciones: item.opciones,
          observaciones: item.observaciones
        }))
      );

      if (!validacionStock.valido) {
        toast.error('Stock insuficiente', {
          description: validacionStock.errores.join('. ')
        });
        setProcesando(false);
        return;
      }

      // Mostrar advertencias si las hay
      if (validacionStock.advertencias.length > 0) {
        validacionStock.advertencias.forEach(adv => {
          toast.warning(adv);
        });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Preparar dirección de entrega
      let direccionEntrega = '';
      if (tipoEntrega === 'domicilio' && direccionSeleccionada) {
        const dir = direccionSeleccionada;
        direccionEntrega = `${dir.calle} ${dir.numero}`;
        if (dir.piso) direccionEntrega += `, ${dir.piso}º`;
        if (dir.puerta) direccionEntrega += ` ${dir.puerta}`;
        direccionEntrega += `, ${dir.codigoPostal} ${dir.ciudad}`;
      } else if (tipoEntrega === 'recogida' && puntoVentaSeleccionado) {
        direccionEntrega = puntoVentaSeleccionado.direccion;
      }

      // Crear pedido
      const nuevoPedido = crearPedido({
        clienteId: userData.id || 'CLI-001',
        clienteNombre: userData.name,
        clienteEmail: userData.email,
        clienteTelefono: userData.telefono || '',
        clienteDireccion: direccionEntrega,
        items: items,
        subtotal: subtotal,
        descuento: descuentoCupon,
        cuponAplicado: cuponAplicado?.codigo,
        iva: iva,
        total: total,
        metodoPago: metodoPago,
        tipoEntrega: tipoEntrega,
        observaciones: observaciones,
        puntoVentaId: tipoEntrega === 'recogida' ? puntoVentaSeleccionado?.id : undefined,
      });

      // ⭐ NUEVO: Descontar stock automáticamente
      const resultadoDescuento = stockIntegrationService.descontarStockPorPedido(
        nuevoPedido,
        userData.name
      );

      if (!resultadoDescuento.exito) {
        console.error('❌ Error al descontar stock:', resultadoDescuento.errores);
        toast.error('Error al actualizar inventario', {
          description: 'El pedido se creó pero hubo un problema con el stock'
        });
      } else {
        console.log('✅ Stock descontado:', resultadoDescuento.movimientosRegistrados);
      }

      // Generar factura si no es efectivo
      let facturaId = '';
      if (metodoPago !== 'efectivo') {
        facturaId = await generarFacturaVeriFactu(nuevoPedido);
        
        if (facturaId) {
          asociarFactura(nuevoPedido.id, facturaId);
        }
      }

      // Crear notificación
      try {
        await notificationsService.createNotification({
          usuarioId: String(userData.id || 'CLI-001'),
          titulo: '¡Pedido confirmado!',
          mensaje: `Tu pedido ${nuevoPedido.numero} ha sido confirmado y está siendo preparado.`,
          tipo: 'pedido',
          prioridad: 'alta',
          relacionId: nuevoPedido.id,
          relacionTipo: 'pedido',
          urlAccion: '/pedidos',
          canales: ['in_app', 'push'],
        });
      } catch (error) {
        console.error('Error al crear notificación:', error);
      }

      // Limpiar carrito
      clearCart();

      // Confirmación
      toast.success(
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">¡Pedido realizado correctamente!</p>
            <p className="text-sm text-gray-600">Nº Pedido: {nuevoPedido.numero || nuevoPedido.id}</p>
            {facturaId && (
              <p className="text-sm text-gray-600">Nº Factura: {facturaId}</p>
            )}
          </div>
        </div>,
        { duration: 5000 }
      );

      if (onSuccess) {
        onSuccess(nuevoPedido.id, facturaId);
      }

      onClose();

    } catch (error) {
      console.error('Error al procesar pedido:', error);
      toast.error('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // FACTURA VERIFACTU
  // ============================================

  const generarFacturaVeriFactu = async (pedido: any): Promise<string> => {
    const facturaId = `FAC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const empresa = {
      nombre: 'Udar Edge SL',
      cif: 'B12345678',
      direccion: 'Calle Principal 123, 28001 Madrid',
      telefono: '+34 912 345 678',
      email: 'info@udaredge.com',
    };

    const factura = {
      id: facturaId,
      numero: facturaId,
      serie: 'A',
      fecha: new Date().toISOString(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cliente: pedido.cliente,
      empresa: empresa,
      items: pedido.items.map((item: any) => ({
        descripcion: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.subtotal,
        ivaPorc: 21,
        ivaImporte: item.subtotal * 0.21,
        total: item.subtotal * 1.21,
      })),
      subtotal: pedido.subtotal,
      descuento: pedido.descuento,
      baseImponible: pedido.subtotal - pedido.descuento,
      iva: pedido.iva,
      total: pedido.total,
      verifactu: {
        hash: generarHashVeriFactu(facturaId, pedido.total),
        qr: `https://verifactu.gob.es/verify/${facturaId}`,
        estado: 'enviado',
        fechaEnvio: new Date().toISOString(),
      },
      pedidoId: pedido.id,
      metodoPago: pedido.metodoPago,
      estado: 'emitida',
    };

    const facturasGuardadas = JSON.parse(localStorage.getItem('udar-facturas') || '[]');
    facturasGuardadas.unshift(factura);
    localStorage.setItem('udar-facturas', JSON.stringify(facturasGuardadas));

    return facturaId;
  };

  const generarHashVeriFactu = (facturaId: string, total: number): string => {
    const str = `${facturaId}-${total}-${Date.now()}`;
    return btoa(str).substr(0, 64);
  };

  // ============================================
  // RESET AL CERRAR
  // ============================================

  useEffect(() => {
    if (!isOpen) {
      // Reset todos los estados al cerrar
      setPaso(1);
      setTipoEntrega(null);
      setDireccionSeleccionada(null);
      setPuntoVentaSeleccionado(null);
      setObservaciones('');
      setProcesando(false);
      setGeolocalizando(false);
      setErrorGeolocalizacion(null);
    }
  }, [isOpen]);

  // ============================================
  // RENDER - PASO 1
  // ============================================

  const renderPaso1 = () => (
    <div className="space-y-6">
      {/* Selector de Tipo de Entrega */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h3 className="font-medium">Tipo de Entrega</h3>
        </div>

        {/* Opción 1: Entrega a Domicilio */}
        <button
          onClick={() => handleSeleccionarTipoEntrega('domicilio')}
          className="w-full text-left p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base mb-1">Entrega a Domicilio</h4>
              <p className="text-sm text-gray-600 mb-2">
                Recibe tu pedido en la dirección que prefieras
              </p>
              <div className="flex items-center gap-2 text-xs text-purple-600">
                <Navigation className="w-3 h-3" />
                <span>Con geolocalización automática</span>
              </div>
              <Badge className="mt-2 bg-purple-100 text-purple-700 border-purple-300">
                Recomendado
              </Badge>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </button>

        {/* Opción 2: Recogida en Tienda */}
        <button
          onClick={() => handleSeleccionarTipoEntrega('recogida')}
          className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
              <Store className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base mb-1">Recogida en Tienda</h4>
              <p className="text-sm text-gray-600 mb-2">
                Recoge tu pedido en el punto de venta más cercano
              </p>
              <div className="flex items-center gap-2 text-xs text-teal-600">
                <Clock className="w-3 h-3" />
                <span>Listo en {puntosOrdenados[0]?.tiempoEstimado || 15} minutos</span>
              </div>
              {ubicacionUsuario && puntosOrdenados[0] && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <MapPinned className="w-3 h-3" />
                  <span>Más cercano: {puntosOrdenados[0].nombre} ({puntosOrdenados[0].distancia?.toFixed(1)} km)</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </button>
      </div>

      {/* Mensajes de estado de geolocalización */}
      {geolocalizando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-700 animate-pulse">
          <Navigation className="w-4 h-4 animate-spin" />
          <span>Obteniendo tu ubicación...</span>
        </div>
      )}
      
      {errorGeolocalizacion && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 mb-2">
            <AlertCircle className="w-4 h-4" />
            <strong>No se pudo obtener tu ubicación</strong>
          </div>
          <div className="pl-6">
            <p className="text-xs text-amber-700">{errorGeolocalizacion}</p>
          </div>
        </div>
      )}
      
      {ubicacionUsuario && !geolocalizando && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>Ubicación obtenida. Puntos de venta ordenados por cercanía.</span>
        </div>
      )}

      {/* Datos del Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Datos del Cliente</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{userData.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{userData.email}</span>
          </div>
          {userData.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{userData.telefono}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen del Pedido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <h3 className="font-medium">Resumen del Pedido</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {items.slice(0, 5).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.nombre} × {item.cantidad}
                </span>
                <span className="font-medium">€{(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            {items.length > 5 && (
              <div className="text-xs text-gray-500">
                + {items.length - 5} productos más...
              </div>
            )}
          </div>
          
          <Separator className="my-3" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            
            {descuentoCupon > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Descuentos
                </span>
                <span className="font-medium">-€{descuentoCupon.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">IVA (21%)</span>
              <span>€{iva.toFixed(2)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span className="text-teal-600">€{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // RENDER - PASO 2
  // ============================================

  const renderPaso2 = () => (
    <div className="space-y-6">
      {/* Indicador del tipo seleccionado */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          {tipoEntrega === 'domicilio' ? (
            <MapPin className="w-5 h-5 text-teal-600" />
          ) : (
            <Store className="w-5 h-5 text-teal-600" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {tipoEntrega === 'domicilio' ? 'Entrega a Domicilio' : 'Recogida en Tienda'}
            </p>
            <p className="text-sm text-teal-700">
              {tipoEntrega === 'domicilio' 
                ? 'Selecciona tu dirección de entrega'
                : 'Selecciona el punto de venta'
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVolverPaso1}
            className="bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:text-red-700 hover:border-red-400"
          >
            Modificar
          </Button>
        </div>
      </div>

      {/* Selector de Dirección o Punto de Venta */}
      {tipoEntrega === 'domicilio' ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium">Dirección de Entrega</h3>
            </div>
          </CardHeader>
          <CardContent>
            <MisDirecciones 
              onSeleccionarDireccion={setDireccionSeleccionada}
              direccionSeleccionada={direccionSeleccionada}
              modoSeleccion
              compacto
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-teal-600" />
              <h3 className="font-medium">Punto de Venta</h3>
            </div>
            {ubicacionUsuario ? (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ordenados por cercanía a tu ubicación
              </p>
            ) : errorGeolocalizacion ? (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sin geolocalización - Lista completa de puntos
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {puntosOrdenados.map((punto, index) => (
              <div key={punto.id} className="space-y-2">
                <button
                  onClick={() => {
                    setPuntoVentaSeleccionado(punto);
                  }}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    puntoVentaSeleccionado?.id === punto.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      puntoVentaSeleccionado?.id === punto.id ? 'bg-teal-600' : 'bg-gray-100'
                    }`}>
                      {puntoVentaSeleccionado?.id === punto.id ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Store className={`w-5 h-5 ${index === 0 && ubicacionUsuario ? 'text-teal-600' : 'text-gray-600'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{punto.nombre}</h4>
                        {index === 0 && ubicacionUsuario && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                            Más cercano
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{punto.direccion}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {punto.distancia && ubicacionUsuario && (
                          <span className="flex items-center gap-1">
                            <MapPinned className="w-3 h-3" />
                            {punto.distancia.toFixed(1)} km
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Listo en ~{punto.tiempoEstimado || 20} min
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Método de Pago */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <h3 className="font-medium">Método de Pago</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => setMetodoPago('tarjeta')}
            className={`w-full text-left p-3 border-2 rounded-lg transition-all flex items-center gap-3 ${
              metodoPago === 'tarjeta' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              metodoPago === 'tarjeta' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              {metodoPago === 'tarjeta' ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <CreditCard className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Tarjeta de crédito/débito</p>
              <p className="text-xs text-gray-600">Pago seguro con MONEI</p>
            </div>
          </button>

          <button
            onClick={() => setMetodoPago('bizum')}
            className={`w-full text-left p-3 border-2 rounded-lg transition-all flex items-center gap-3 ${
              metodoPago === 'bizum' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              metodoPago === 'bizum' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              {metodoPago === 'bizum' ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Smartphone className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Bizum</p>
              <p className="text-xs text-gray-600">Pago instantáneo</p>
            </div>
          </button>

          <button
            onClick={() => setMetodoPago('efectivo')}
            className={`w-full text-left p-3 border-2 rounded-lg transition-all flex items-center gap-3 ${
              metodoPago === 'efectivo' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              metodoPago === 'efectivo' ? 'bg-orange-600' : 'bg-gray-100'
            }`}>
              {metodoPago === 'efectivo' ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Banknote className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">Efectivo</p>
              <p className="text-xs text-gray-600">
                {tipoEntrega === 'domicilio' ? 'Pago en efectivo al recibir' : 'Pago al recoger en tienda'}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Pendiente de pago
            </Badge>
          </button>
        </CardContent>
      </Card>

      {/* Notas adicionales */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium">Notas adicionales (opcional)</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[80px] text-sm"
            placeholder="Ej: Sin cebolla, preferencias de horario de entrega, instrucciones especiales..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            Confirmar Pedido
          </DialogTitle>
          <DialogDescription>
            {paso === 1 
              ? 'Revisa los detalles de tu pedido y selecciona el tipo de entrega'
              : `Paso 2 de 2: Datos de ${tipoEntrega === 'domicilio' ? 'entrega' : 'recogida'}`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex-1 h-2 rounded-full ${paso >= 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded-full ${paso >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`} />
        </div>

        {/* Contenido según paso */}
        {paso === 1 ? renderPaso1() : renderPaso2()}

        {/* Footer */}
        <DialogFooter className="mt-6 flex-col gap-3">
          {paso === 2 && (
            <>
              {/* Botón secundario: Modificar (ROJO) - ARRIBA */}
              <Button
                variant="outline"
                onClick={handleVolverPaso1}
                disabled={procesando}
                className="w-full bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:text-red-700 hover:border-red-400"
              >
                Modificar entrega y pago
              </Button>

              {/* Botón principal: Confirmar Pedido (AZUL) - ABAJO */}
              <Button 
                onClick={handleConfirmarPedido}
                disabled={procesando}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar Pedido - €{total.toFixed(2)}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}