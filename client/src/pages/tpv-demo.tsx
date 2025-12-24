import { useState } from 'react';
import { TPV360Master, PermisosTPV } from '../components/TPV360Master';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Shield, Lock } from 'lucide-react';

// Perfiles predefinidos
const PERFILES = {
  gerente: {
    nombre: 'Gerente - Acceso Completo',
    usuario: 'Juan Pérez',
    rol: 'Gerente',
    permisos: {
      cobrar_pedidos: true,
      marcar_como_listo: true,
      gestionar_caja_rapida: true,
      hacer_retiradas: true,
      arqueo_caja: true,
      cierre_caja: true,
      ver_informes_turno: true,
      acceso_operativa: true,
      reimprimir_tickets: true,
    } as PermisosTPV
  },
  trabajadorAvanzado: {
    nombre: 'Trabajador Avanzado',
    usuario: 'María López',
    rol: 'Trabajador',
    permisos: {
      cobrar_pedidos: true,
      marcar_como_listo: true,
      gestionar_caja_rapida: true,
      hacer_retiradas: false,
      arqueo_caja: true,
      cierre_caja: false,
      ver_informes_turno: true,
      acceso_operativa: true,
      reimprimir_tickets: true,
    } as PermisosTPV
  },
  cajeroBasico: {
    nombre: 'Cajero Básico',
    usuario: 'Carlos Martínez',
    rol: 'Cajero',
    permisos: {
      cobrar_pedidos: true,
      marcar_como_listo: false,
      gestionar_caja_rapida: false,
      hacer_retiradas: false,
      arqueo_caja: false,
      cierre_caja: false,
      ver_informes_turno: false,
      acceso_operativa: false,
      reimprimir_tickets: false,
    } as PermisosTPV
  }
};

export default function TPVDemo() {
  const [perfilActivo, setPerfilActivo] = useState<keyof typeof PERFILES>('gerente');

  const perfil = PERFILES[perfilActivo];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Selector de Perfil */}
        <Card className="border-2 border-teal-200">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Demo TPV 360 - Selector de Perfiles
            </CardTitle>
            <p className="text-sm text-gray-600">
              Selecciona un perfil para ver cómo el TPV se adapta según los permisos asignados
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gerente */}
              <button
                onClick={() => setPerfilActivo('gerente')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'gerente'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Gerente</p>
                    <p className="text-xs text-gray-600">Acceso Completo</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <Badge className="bg-green-100 text-green-800 mr-1">9/9 Permisos</Badge>
                  <p className="text-gray-600 mt-2">
                    Acceso total a todas las funcionalidades del sistema
                  </p>
                </div>
              </button>

              {/* Trabajador Avanzado */}
              <button
                onClick={() => setPerfilActivo('trabajadorAvanzado')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'trabajadorAvanzado'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Trabajador</p>
                    <p className="text-xs text-gray-600">Acceso Avanzado</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <Badge className="bg-blue-100 text-blue-800 mr-1">7/9 Permisos</Badge>
                  <p className="text-gray-600 mt-2">
                    Gestión completa del TPV y operativa, sin cierre de caja
                  </p>
                </div>
              </button>

              {/* Cajero Básico */}
              <button
                onClick={() => setPerfilActivo('cajeroBasico')}
                className={`p-6 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'cajeroBasico'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Cajero</p>
                    <p className="text-xs text-gray-600">Acceso Básico</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <Badge className="bg-orange-100 text-orange-800 mr-1">1/9 Permisos</Badge>
                  <p className="text-gray-600 mt-2">
                    Solo cobro de pedidos. Sin acceso a gestión avanzada
                  </p>
                </div>
              </button>
            </div>

            {/* Detalle de permisos */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-3">Permisos del perfil seleccionado:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(perfil.permisos).map(([permiso, activo]) => (
                  <div 
                    key={permiso} 
                    className={`flex items-center gap-2 p-2 rounded ${
                      activo ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {activo ? '✓' : '✗'}
                    <span>{permiso.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TPV 360 */}
        <TPV360Master
          permisos={perfil.permisos}
          nombreUsuario={perfil.usuario}
          rolUsuario={perfil.rol}
          puntoVentaId="PDV-001"
        />
      </div>
    </div>
  );
}
