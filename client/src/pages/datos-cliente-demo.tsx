import { useState } from 'react';
import { DatosClienteTPV } from '../components/DatosClienteTPV';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, User, Lock } from 'lucide-react';

// Perfiles de ejemplo
const PERFILES = {
  gerente: {
    nombre: 'Gerente - Permisos Completos',
    permisos: {
      crear_cliente: true,
      editar_cliente: true,
      ver_historial: true
    }
  },
  trabajador: {
    nombre: 'Trabajador - Permisos Limitados',
    permisos: {
      crear_cliente: true,
      editar_cliente: false,
      ver_historial: true
    }
  },
  cajero: {
    nombre: 'Cajero - Solo Lectura',
    permisos: {
      crear_cliente: false,
      editar_cliente: false,
      ver_historial: false
    }
  }
};

export default function DatosClienteDemo() {
  const [perfilActivo, setPerfilActivo] = useState<keyof typeof PERFILES>('gerente');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  const perfil = PERFILES[perfilActivo];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-teal-200">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              TPV 360 - Datos del Cliente (Componente Unificado)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Un solo componente con variantes por permisos. El diseño y estructura son idénticos para todos los roles.
            </p>
          </CardHeader>
          <CardContent>
            {/* Selector de Perfil */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Gerente */}
              <button
                onClick={() => setPerfilActivo('gerente')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'gerente'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium">Gerente</p>
                    <p className="text-xs text-gray-600">Todos los permisos</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">Crear ✓</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">Editar ✓</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ver ✓</Badge>
                </div>
              </button>

              {/* Trabajador */}
              <button
                onClick={() => setPerfilActivo('trabajador')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'trabajador'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Trabajador</p>
                    <p className="text-xs text-gray-600">Permisos limitados</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">Crear ✓</Badge>
                  <Badge className="bg-red-100 text-red-800 text-xs">Editar ✗</Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ver ✓</Badge>
                </div>
              </button>

              {/* Cajero */}
              <button
                onClick={() => setPerfilActivo('cajero')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  perfilActivo === 'cajero'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cajero</p>
                    <p className="text-xs text-gray-600">Solo lectura</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge className="bg-red-100 text-red-800 text-xs">Crear ✗</Badge>
                  <Badge className="bg-red-100 text-red-800 text-xs">Editar ✗</Badge>
                  <Badge className="bg-red-100 text-red-800 text-xs">Ver ✗</Badge>
                </div>
              </button>
            </div>

            {/* Info del cliente seleccionado */}
            {clienteSeleccionado && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-1">
                  ✓ Cliente Seleccionado
                </p>
                <p className="text-lg font-medium text-green-900">
                  {clienteSeleccionado.nombre}
                </p>
                <p className="text-sm text-green-700">
                  {clienteSeleccionado.telefono}
                  {clienteSeleccionado.email && ` • ${clienteSeleccionado.email}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Componente Unificado */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <DatosClienteTPV
              permisos={perfil.permisos}
              onClienteSeleccionado={(cliente) => {
                setClienteSeleccionado(cliente);
                console.log('Cliente seleccionado:', cliente);
              }}
              onTurnoLlamado={(turno) => {
                console.log('Turno llamado:', turno);
              }}
              onAtenderSinDatos={() => {
                console.log('Atendiendo sin datos');
              }}
            />
          </CardContent>
        </Card>

        {/* Información técnica */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              📋 Características del Componente Unificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-900 mb-2">✅ Estructura Unificada:</p>
                <ul className="space-y-1 text-blue-800 ml-4">
                  <li>• Mismo layout para todos los roles</li>
                  <li>• Buscador universal idéntico</li>
                  <li>• Mismas tipografías (Poppins)</li>
                  <li>• Mismos colores y spacing</li>
                  <li>• Mismo componente base</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-2">🔒 Sistema de Permisos:</p>
                <ul className="space-y-1 text-blue-800 ml-4">
                  <li>• crear_cliente: Muestra/oculta formulario</li>
                  <li>• editar_cliente: Habilita edición</li>
                  <li>• ver_historial: Muestra historial</li>
                  <li>• Botón "Atender sin datos" siempre visible</li>
                  <li>• Sin duplicación de código</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-2">🎨 Bloque Izquierdo:</p>
                <ul className="space-y-1 text-blue-800 ml-4">
                  <li>• Buscador con resultados en tiempo real</li>
                  <li>• Formulario solo si tiene permisos</li>
                  <li>• Botón "Atender sin datos" siempre</li>
                  <li>• Búsqueda por nombre, teléfono, email, turno</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-900 mb-2">📋 Bloque Derecho:</p>
                <ul className="space-y-1 text-blue-800 ml-4">
                  <li>• Tarjetas de turnos unificadas</li>
                  <li>• Etiquetas "SIGUIENTE" y "Posición X"</li>
                  <li>• Indicadores VIP para clientes frecuentes</li>
                  <li>• Tiempo de espera en tiempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
