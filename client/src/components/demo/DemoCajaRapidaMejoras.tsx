import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle2, Info, Users, TrendingUp, Volume2, SortAsc } from 'lucide-react';

/**
 * Componente de demostración de las mejoras implementadas en Caja Rápida
 * Este componente muestra un resumen visual de las 4 mejoras principales
 */
export function DemoCajaRapidaMejoras() {
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const mejoras = [
    {
      id: 1,
      titulo: 'Ordenamiento Automático',
      icono: <SortAsc className="w-6 h-6 text-blue-600" />,
      descripcion: 'Los pedidos con clientes presentes aparecen primero en ambas listas',
      color: 'blue',
      ejemplo: 'Cliente presente → Primera posición'
    },
    {
      id: 2,
      titulo: 'Contador de Clientes',
      icono: <Users className="w-6 h-6 text-green-600" />,
      descripcion: 'Card verde que muestra cuántos clientes están esperando en tienda',
      color: 'green',
      ejemplo: '3 clientes presentes'
    },
    {
      id: 3,
      titulo: 'Sonido de Alerta',
      icono: <Volume2 className="w-6 h-6 text-orange-600" />,
      descripcion: 'Alerta sonora cuando un nuevo cliente confirma su llegada (configurable)',
      color: 'orange',
      ejemplo: '🔊 Beep al detectar cliente'
    },
    {
      id: 4,
      titulo: 'Tiempo de Espera',
      icono: <TrendingUp className="w-6 h-6 text-purple-600" />,
      descripcion: 'Dashboard morado con tiempo promedio de espera de clientes presentes',
      color: 'purple',
      ejemplo: '5 minutos promedio'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' }
    };
    return colors[color] || colors.blue;
  };

  if (!mostrarDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setMostrarDemo(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg"
        >
          <Info className="w-4 h-4 mr-2" />
          Ver Mejoras Implementadas
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              🎯 Mejoras Implementadas - Caja Rápida TPV
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setMostrarDemo(false)}
              className="text-white hover:bg-teal-800"
            >
              ✕
            </Button>
          </div>
          <p className="text-teal-100 text-sm mt-2">
            Sistema de notificaciones "Ya estoy aquí" optimizado para máxima eficiencia
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Banner de estado */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  ✅ 4 mejoras implementadas y funcionando
                </p>
                <p className="text-sm text-green-700">
                  Sistema completamente operativo y sincronizado en tiempo real
                </p>
              </div>
            </div>
          </div>

          {/* Grid de mejoras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mejoras.map((mejora) => {
              const colors = getColorClasses(mejora.color);
              return (
                <Card key={mejora.id} className={`border-2 ${colors.border} ${colors.bg}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center shrink-0 border-2 ${colors.border}`}>
                        {mejora.icono}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${colors.text}`}>
                            {mejora.titulo}
                          </h3>
                          <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                            {mejora.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {mejora.descripcion}
                        </p>
                        <div className={`text-xs ${colors.text} font-mono bg-white/50 px-2 py-1 rounded`}>
                          {mejora.ejemplo}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Flujo de funcionamiento */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">🔄 Flujo de Funcionamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Cliente confirma llegada</p>
                  <p className="text-sm text-gray-600">Click en "Ya estoy aquí" → Geolocalización validada</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">TPV detecta automáticamente</p>
                  <p className="text-sm text-gray-600">Sonido de alerta 🔊 + Toast notification + Reordenamiento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Trabajador atiende prioritariamente</p>
                  <p className="text-sm text-gray-600">Pedido aparece primero + Badge verde parpadeante</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Completado</p>
                  <p className="text-sm text-gray-600">Métricas actualizadas + Cliente satisfecho</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas técnicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">2s</p>
              <p className="text-xs text-gray-600">Actualización</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">3s</p>
              <p className="text-xs text-gray-600">Notificaciones</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">Real-time</p>
              <p className="text-xs text-gray-600">Tiempo espera</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">Auto</p>
              <p className="text-xs text-gray-600">Ordenamiento</p>
            </div>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setMostrarDemo(false)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Entendido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
