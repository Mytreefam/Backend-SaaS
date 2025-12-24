// 🚀 EJEMPLO DE USO RÁPIDO - Sistema de Promociones Udar Edge
// Copia y pega estos ejemplos en tus páginas

// ============================================
// 📊 EJEMPLO 1: Dashboard Analytics (Gerente)
// ============================================

import DashboardAnalyticsPromociones from '@/components/DashboardAnalyticsPromociones';

export function PaginaAnalyticsGerente() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1>Panel de Control - Gerente</h1>
      </header>

      {/* Dashboard */}
      <main>
        <DashboardAnalyticsPromociones />
      </main>
    </div>
  );
}

// ============================================
// 📲 EJEMPLO 2: Notificaciones (Gerente)
// ============================================

import GestionNotificacionesPromo from '@/components/GestionNotificacionesPromo';

export function PaginaNotificacionesGerente() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1>Gestión de Notificaciones</h1>
      </header>

      <main>
        <GestionNotificacionesPromo />
      </main>
    </div>
  );
}

// ============================================
// 🔔 EJEMPLO 3: Header con Notificaciones de Promociones (Cliente)
// ============================================

import NotificacionesPromocionesCliente from '@/components/NotificacionesPromocionesCliente';
import { useRouter } from 'next/navigation';

export function HeaderCliente() {
  const router = useRouter();

  const handleVerPromocion = (promocionId: string) => {
    console.log('Navegar a promoción:', promocionId);
    // Opción 1: Navegar a página de promoción
    router.push(`/promociones/${promocionId}`);
    
    // Opción 2: Abrir modal con detalles
    // setPromocionSeleccionada(promocionId);
    // setMostrarModal(true);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <h1>Udar Edge</h1>
        </div>

        {/* Navegación */}
        <nav className="flex items-center gap-4">
          <a href="/pedidos">Mis Pedidos</a>
          <a href="/productos">Productos</a>
          
          {/* Notificaciones de Promociones - Badge automático */}
          <NotificacionesPromocionesCliente onVerPromocion={handleVerPromocion} />
          
          <a href="/perfil">Mi Perfil</a>
        </nav>
      </div>
    </header>
  );
}

// ============================================
// 🛒 EJEMPLO 4: TPV con Promociones
// ============================================

// El TPV ya está integrado en TPV360Master.tsx
// Solo necesitas importarlo y usarlo:

import TPV360Master from '@/components/TPV360Master';

export function PaginaTPV() {
  return (
    <div className="h-screen bg-gray-50">
      <TPV360Master />
    </div>
  );
}

// Las promociones se aplican automáticamente:
// - Se muestran en panel lateral
// - Se aplican al agregar productos
// - Se visualizan en el carrito
// - Se guardan en el pedido

// ============================================
// 📱 EJEMPLO 5: Página de Promociones (Cliente)
// ============================================

import { promocionesDisponibles, obtenerPromocionesActivas } from '@/data/promociones-disponibles';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Clock, Users, Sparkles } from 'lucide-react';

export function PaginaPromocionesCliente() {
  const promocionesActivas = obtenerPromocionesActivas();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            Promociones Activas
          </h1>
          <p className="text-sm text-gray-600">
            {promocionesActivas.length} promociones disponibles para ti
          </p>
        </div>

        {/* Grid de Promociones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promocionesActivas.map((promo) => (
            <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Imagen */}
              {promo.imagen && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={promo.imagen} 
                    alt={promo.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{promo.nombre}</h3>
                  {promo.destacada && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Destacada
                    </Badge>
                  )}
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-3">
                  {promo.descripcion}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {promo.tipo}
                  </span>
                  {promo.horaInicio && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {promo.horaInicio} - {promo.horaFin}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {promo.vecesUsada} usos
                  </span>
                </div>

                {/* Botón */}
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Usar Ahora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📊 EJEMPLO 6: Ver Datos de una Promoción Específica
// ============================================

import { promocionesDisponibles } from '@/data/promociones-disponibles';
import { metricasPromociones } from '@/data/analytics-promociones';

export function DetallePromocion({ promocionId }: { promocionId: string }) {
  // Obtener datos de la promoción
  const promocion = promocionesDisponibles.find(p => p.id === promocionId);
  const metricas = metricasPromociones.find(m => m.promocionId === promocionId);

  if (!promocion) return <div>Promoción no encontrada</div>;

  return (
    <div className="p-6">
      <h2>{promocion.nombre}</h2>
      <p>{promocion.descripcion}</p>

      {/* Métricas (solo si existen) */}
      {metricas && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">ROI</p>
            <p className={`font-medium ${metricas.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metricas.roi.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conversión</p>
            <p className="font-medium">{metricas.tasaConversion.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ventas</p>
            <p className="font-medium">{metricas.ventasTotales.toFixed(2)}€</p>
          </div>
        </div>
      )}

      {/* Productos del combo */}
      {promocion.productosIncluidos && (
        <div className="mt-4">
          <h3>Productos incluidos:</h3>
          <ul>
            {promocion.productosIncluidos.map((producto) => (
              <li key={producto.id}>
                {producto.nombre} - {producto.precioOriginal.toFixed(2)}€
              </li>
            ))}
          </ul>
          {promocion.precioCombo && (
            <p className="font-medium text-teal-600 mt-2">
              Precio combo: {promocion.precioCombo.toFixed(2)}€
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 🎯 EJEMPLO 7: Filtrar Promociones por Segmento
// ============================================

import { promocionesDisponibles, type PublicoObjetivo } from '@/data/promociones-disponibles';

export function PromocionesParaCliente({ 
  clienteId, 
  segmento 
}: { 
  clienteId: string; 
  segmento: PublicoObjetivo 
}) {
  // Filtrar promociones para este cliente
  const promocionesDisponiblesCliente = promocionesDisponibles.filter(promo => {
    // Solo activas
    if (!promo.activa) return false;

    // Verificar público objetivo
    if (promo.publicoObjetivo === 'general') return true;
    if (promo.publicoObjetivo === segmento) return true;
    
    // Promociones personalizadas
    if (promo.publicoObjetivo === 'personalizado') {
      return promo.clientesAsignados?.includes(clienteId);
    }

    return false;
  });

  return (
    <div>
      <h2>Promociones para ti ({promocionesDisponiblesCliente.length})</h2>
      {/* Renderizar promociones */}
    </div>
  );
}

// ============================================
// ⏰ EJEMPLO 8: Verificar Promociones por Horario
// ============================================

import { promocionesDisponibles } from '@/data/promociones-disponibles';

export function PromocionesHorarioActual() {
  const ahora = new Date();
  const horaActual = ahora.toTimeString().slice(0, 5); // "14:30"

  // Filtrar promociones activas en este horario
  const promocionesHorario = promocionesDisponibles.filter(promo => {
    if (!promo.activa) return false;
    
    // Si tiene restricción de horario
    if (promo.horaInicio && promo.horaFin) {
      return horaActual >= promo.horaInicio && horaActual <= promo.horaFin;
    }
    
    // Si no tiene restricción, está disponible
    return true;
  });

  return (
    <div>
      <h2>Promociones disponibles ahora ({promocionesHorario.length})</h2>
      <p className="text-sm text-gray-600">Hora actual: {horaActual}</p>
      
      {promocionesHorario.map(promo => (
        <div key={promo.id}>
          {promo.nombre}
          {promo.horaInicio && (
            <span className="text-xs text-orange-600">
              ⏰ {promo.horaInicio} - {promo.horaFin}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// 📈 EJEMPLO 9: Mostrar Top 3 Promociones
// ============================================

import { obtenerTopPromociones } from '@/data/analytics-promociones';

export function TopPromociones() {
  const top3 = obtenerTopPromociones(3);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-medium mb-4">🏆 Top 3 Promociones</h3>
      
      <div className="space-y-3">
        {top3.map((promo, index) => (
          <div key={promo.promocionId} className="flex items-center gap-3">
            {/* Medalla */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-medium
              ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                index === 1 ? 'bg-gray-100 text-gray-700' : 
                'bg-orange-100 text-orange-700'}
            `}>
              {index + 1}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-medium text-sm">{promo.promocionNombre}</p>
              <p className="text-xs text-gray-500">
                {promo.vecesUsada} usos • ROI: {promo.roi.toFixed(1)}%
              </p>
            </div>

            {/* Ventas */}
            <div className="text-right">
              <p className="font-medium text-teal-600">
                {promo.ventasTotales.toFixed(2)}€
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 🔔 EJEMPLO 10: Enviar Notificación (Backend)
// ============================================

import { enviarNotificacion, crearNotificacionTemplate } from '@/data/notificaciones-promociones';

export async function enviarNotificacionNuevaPromocion(promocionId: string) {
  // Crear notificación desde template
  const notificacion = {
    ...crearNotificacionTemplate('nueva_promocion', promocionId),
    titulo: '🎉 ¡Nueva promoción disponible!',
    mensaje: 'Tenemos una nueva oferta especial para ti',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez',
  };

  // Enviar (función mock - reemplazar con lógica real)
  const exito = await enviarNotificacion(notificacion as any);
  
  if (exito) {
    console.log('Notificación enviada correctamente');
    return true;
  } else {
    console.error('Error al enviar notificación');
    return false;
  }
}

// ============================================
// 💡 TIPS DE USO
// ============================================

/*
1. COMPONENTES LISTOS PARA USAR:
   ✅ DashboardAnalyticsPromociones - Dashboard completo del gerente
   ✅ GestionNotificacionesPromo - Panel de notificaciones del gerente
   ✅ NotificacionesPromocionesCliente - Badge de notificaciones de promociones para el cliente
   ✅ TPV360Master - TPV con promociones integradas

2. DATOS DISPONIBLES:
   ✅ promocionesDisponibles - Array con 14 promociones
   ✅ metricasPromociones - Array con métricas de 5 promociones
   ✅ notificacionesHistorial - Historial de notificaciones enviadas
   ✅ notificacionesCliente - Notificaciones para un cliente
   ✅ tendenciaTemporal - 15 días de tendencias
   ✅ analisisHorario - 12 franjas horarias
   ✅ analisisPorSegmento - 4 segmentos de clientes

3. FUNCIONES ÚTILES:
   ✅ obtenerPromocionesActivas() - Solo promociones activas
   ✅ obtenerTopPromociones(n) - Top N promociones por ventas
   ✅ calcularPromedios() - ROI, conversión, margen promedio
   ✅ calcularTotales() - Ventas, descuentos, margen total
   ✅ obtenerMejorHorario() - Horario con más usos
   ✅ obtenerMejorSegmento() - Segmento más rentable

4. INTEGRACIÓN CON BACKEND:
   - Reemplazar arrays mock con queries a Supabase
   - Implementar enviarNotificacion() con Firebase/OneSignal
   - Crear cron jobs para notificaciones automáticas
   - Actualizar métricas en tiempo real

5. PERSONALIZACIÓN:
   - Colores del sistema en /styles/globals.css
   - Todos los componentes usan Tailwind CSS
   - Recharts para gráficas (personalizable)
   - Iconos de lucide-react (reemplazables)
*/

export default function EjemplosUsoRapido() {
  return (
    <div className="p-6">
      <h1>Ejemplos de Uso - Sistema de Promociones</h1>
      <p>Ver código fuente de este archivo para ejemplos completos</p>
    </div>
  );
}
