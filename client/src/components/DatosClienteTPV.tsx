import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  UserPlus, 
  UserX,
  Clock,
  Star,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================
// INTERFACES
// ============================================

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  ultimaVisita?: Date;
  totalPedidos?: number;
}

interface Turno {
  id: string;
  codigo: string; // A22, A23, etc.
  cliente: Cliente;
  posicion: number;
  estado: 'esperando' | 'siguiente' | 'llamado';
  horaLlegada: Date;
}

interface DatosClienteTPVProps {
  permisos: {
    crear_cliente: boolean;
    editar_cliente: boolean;
    ver_historial: boolean;
  };
  onClienteSeleccionado: (cliente: Cliente | null) => void;
  onTurnoLlamado?: (turno: Turno) => void;
  onAtenderSinDatos?: () => void;
}

// ============================================
// COMPONENTE MAESTRO
// ============================================

export function DatosClienteTPV({ 
  permisos, 
  onClienteSeleccionado,
  onTurnoLlamado,
  onAtenderSinDatos
}: DatosClienteTPVProps) {
  
  // Estados de búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  
  // Estados de formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados de turnos
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: 'T001',
      codigo: 'A22',
      cliente: { 
        id: 'CLI001', 
        nombre: 'María García López', 
        telefono: '678 123 456',
        email: 'maria@email.com',
        totalPedidos: 15
      },
      posicion: 1,
      estado: 'siguiente',
      horaLlegada: new Date(Date.now() - 300000)
    },
    {
      id: 'T002',
      codigo: 'A23',
      cliente: { 
        id: 'CLI002', 
        nombre: 'Carlos Martínez Ruiz', 
        telefono: '645 987 321',
        totalPedidos: 8
      },
      posicion: 2,
      estado: 'esperando',
      horaLlegada: new Date(Date.now() - 180000)
    },
    {
      id: 'T003',
      codigo: 'A24',
      cliente: { 
        id: 'CLI003', 
        nombre: 'Ana Rodríguez Pérez', 
        telefono: '612 456 789',
        email: 'ana@email.com',
        totalPedidos: 3
      },
      posicion: 3,
      estado: 'esperando',
      horaLlegada: new Date(Date.now() - 60000)
    },
    {
      id: 'T004',
      codigo: 'A25',
      cliente: { 
        id: 'CLI004', 
        nombre: 'Jorge López Sánchez', 
        telefono: '698 741 852',
        totalPedidos: 1
      },
      posicion: 4,
      estado: 'esperando',
      horaLlegada: new Date(Date.now() - 30000)
    }
  ]);

  // Base de datos de clientes (simulada)
  const clientesRegistrados: Cliente[] = [
    {
      id: 'CLI001',
      nombre: 'María García López',
      telefono: '678 123 456',
      email: 'maria.garcia@email.com',
      direccion: 'Calle Mayor 45, 3°B, Madrid',
      ultimaVisita: new Date(Date.now() - 86400000),
      totalPedidos: 15
    },
    {
      id: 'CLI002',
      nombre: 'Carlos Martínez Ruiz',
      telefono: '645 987 321',
      email: 'carlos.martinez@email.com',
      direccion: 'Av. de la Castellana 120, Madrid',
      ultimaVisita: new Date(Date.now() - 172800000),
      totalPedidos: 8
    },
    {
      id: 'CLI003',
      nombre: 'Ana Rodríguez Pérez',
      telefono: '612 456 789',
      email: 'ana.rodriguez@email.com',
      direccion: 'Plaza España 8, 2°A, Madrid',
      ultimaVisita: new Date(Date.now() - 259200000),
      totalPedidos: 3
    },
    {
      id: 'CLI004',
      nombre: 'Jorge López Sánchez',
      telefono: '698 741 852',
      email: 'jorge.lopez@email.com',
      ultimaVisita: new Date(Date.now() - 345600000),
      totalPedidos: 1
    },
    {
      id: 'CLI005',
      nombre: 'Laura Fernández González',
      telefono: '633 258 147',
      email: 'laura.fernandez@email.com',
      direccion: 'Calle Alcalá 200, 5°C, Madrid',
      ultimaVisita: new Date(Date.now() - 432000000),
      totalPedidos: 22
    }
  ];

  // ============================================
  // FUNCIONES DE BÚSQUEDA
  // ============================================

  useEffect(() => {
    if (busqueda.length >= 2) {
      setBuscando(true);
      // Simular búsqueda con delay
      const timer = setTimeout(() => {
        const resultados = clientesRegistrados.filter(cliente => {
          const searchLower = busqueda.toLowerCase();
          return (
            cliente.nombre.toLowerCase().includes(searchLower) ||
            cliente.telefono.replace(/\s/g, '').includes(busqueda.replace(/\s/g, '')) ||
            cliente.email?.toLowerCase().includes(searchLower)
          );
        });
        
        // También buscar en turnos
        const resultadosTurnos = turnos
          .filter(t => t.codigo.toLowerCase().includes(busqueda.toLowerCase()))
          .map(t => t.cliente);
        
        const todosResultados = [...resultados, ...resultadosTurnos];
        const unicos = Array.from(new Map(todosResultados.map(c => [c.id, c])).values());
        
        setResultadosBusqueda(unicos);
        setBuscando(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResultadosBusqueda([]);
      setBuscando(false);
    }
  }, [busqueda]);

  // ============================================
  // FUNCIONES DE ACCIONES
  // ============================================

  const seleccionarCliente = (cliente: Cliente) => {
    onClienteSeleccionado(cliente);
    toast.success(`Cliente seleccionado: ${cliente.nombre}`);
    setBusqueda('');
    setResultadosBusqueda([]);
  };

  const guardarNuevoCliente = () => {
    if (!permisos.crear_cliente) {
      toast.error('No tienes permisos para crear clientes');
      return;
    }

    if (!nombreCompleto || !telefono) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    const nuevoCliente: Cliente = {
      id: `CLI-${Date.now()}`,
      nombre: nombreCompleto,
      telefono: telefono,
      email: email || undefined,
      totalPedidos: 0
    };

    onClienteSeleccionado(nuevoCliente);
    toast.success(`Cliente ${nuevoCliente.nombre} creado y seleccionado`);

    // Limpiar formulario
    setNombreCompleto('');
    setTelefono('');
    setEmail('');
    setBusqueda('');
  };

  const atenderSinDatos = () => {
    const clienteAnonimo: Cliente = {
      id: `CLI-ANONIMO-${Date.now()}`,
      nombre: 'Cliente sin datos',
      telefono: 'N/A'
    };

    onClienteSeleccionado(clienteAnonimo);
    if (onAtenderSinDatos) {
      onAtenderSinDatos();
    }
    toast.success('Atendiendo cliente sin datos registrados');
  };

  const llamarTurno = (turno: Turno) => {
    setTurnos(turnos.map(t => 
      t.id === turno.id 
        ? { ...t, estado: 'llamado' }
        : t
    ));

    onClienteSeleccionado(turno.cliente);
    
    if (onTurnoLlamado) {
      onTurnoLlamado(turno);
    }

    toast.success(`Turno ${turno.codigo} llamado - ${turno.cliente.nombre}`);
  };

  const formatearTiempoEspera = (fecha: Date): string => {
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos === 1) return '1 min';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `${horas}h ${minutos % 60}m`;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ============================================ */}
      {/* BLOQUE IZQUIERDO: BÚSQUEDA Y FORMULARIO */}
      {/* ============================================ */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                Datos del Cliente
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* BUSCADOR UNIVERSAL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente por nombre, teléfono, email o turno..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Resultados de búsqueda */}
              {busqueda.length >= 2 && (
                <div className="border rounded-lg mt-2 max-h-[300px] overflow-y-auto">
                  {buscando ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm">Buscando...</p>
                    </div>
                  ) : resultadosBusqueda.length > 0 ? (
                    <div className="divide-y">
                      {resultadosBusqueda.map(cliente => (
                        <button
                          key={cliente.id}
                          onClick={() => seleccionarCliente(cliente)}
                          className="w-full p-4 hover:bg-teal-50 transition-colors text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{cliente.nombre}</p>
                                {cliente.totalPedidos && cliente.totalPedidos > 10 && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{cliente.telefono}</span>
                                </div>
                                {cliente.email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{cliente.email}</span>
                                  </div>
                                )}
                                {cliente.totalPedidos !== undefined && (
                                  <p className="text-xs text-gray-500">
                                    {cliente.totalPedidos} pedidos anteriores
                                  </p>
                                )}
                              </div>
                            </div>
                            <User className="w-5 h-5 text-gray-400 ml-3" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No se encontraron clientes</p>
                      {permisos.crear_cliente && (
                        <p className="text-xs mt-1 text-gray-400">
                          Completa el formulario abajo para crear uno nuevo
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FORMULARIO NUEVO CLIENTE - Solo si tiene permisos */}
            {permisos.crear_cliente && (
              <>
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="w-5 h-5 text-teal-600" />
                    <p className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Crear Nuevo Cliente
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreCompleto" className="text-sm font-medium">
                        Nombre Completo *
                      </Label>
                      <Input
                        id="nombreCompleto"
                        placeholder="Ej: María García López"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-medium">
                        Teléfono *
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="Ej: 678 123 456"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email (opcional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ej: maria@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={guardarNuevoCliente}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Guardar Cliente
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* BOTÓN ATENDER SIN DATOS - Siempre visible */}
            <div className={permisos.crear_cliente ? 'border-t pt-6' : ''}>
              <Button
                onClick={atenderSinDatos}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-50"
              >
                <UserX className="w-4 h-4 mr-2" />
                Atender sin Datos
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Para clientes que no desean proporcionar información
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================ */}
      {/* BLOQUE DERECHO: TURNOS EN ESPERA */}
      {/* ============================================ */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Turnos en Espera
                </span>
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                {turnos.length} en cola
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {turnos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay turnos en espera</p>
                </div>
              ) : (
                turnos.map(turno => (
                  <Card 
                    key={turno.id} 
                    className={`border-2 transition-all ${
                      turno.estado === 'siguiente' 
                        ? 'border-orange-500 bg-orange-50' 
                        : turno.estado === 'llamado'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header con turno y etiqueta */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p 
                            className={`text-3xl mb-1 ${
                              turno.estado === 'siguiente' 
                                ? 'text-orange-700' 
                                : turno.estado === 'llamado'
                                  ? 'text-green-700'
                                  : 'text-gray-700'
                            }`}
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                          >
                            {turno.codigo}
                          </p>
                          {turno.estado === 'siguiente' && (
                            <Badge className="bg-orange-600 text-white">
                              SIGUIENTE
                            </Badge>
                          )}
                          {turno.estado === 'llamado' && (
                            <Badge className="bg-green-600 text-white">
                              LLAMADO
                            </Badge>
                          )}
                          {turno.estado === 'esperando' && turno.posicion > 1 && (
                            <Badge variant="outline" className="border-gray-400 text-gray-700">
                              Posición {turno.posicion}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Indicador VIP */}
                        {turno.cliente.totalPedidos && turno.cliente.totalPedidos > 10 && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Star className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>

                      {/* Información del cliente */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="font-medium text-gray-900">
                            {turno.cliente.nombre}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{turno.cliente.telefono}</span>
                        </div>
                        {turno.cliente.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{turno.cliente.email}</span>
                          </div>
                        )}
                        {turno.cliente.totalPedidos !== undefined && (
                          <p className="text-xs text-gray-500">
                            {turno.cliente.totalPedidos} pedidos anteriores
                          </p>
                        )}
                      </div>

                      {/* Tiempo de espera */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 pb-3 border-b">
                        <Clock className="w-3 h-3" />
                        <span>Esperando {formatearTiempoEspera(turno.horaLlegada)}</span>
                      </div>

                      {/* Botón de acción */}
                      <Button
                        onClick={() => llamarTurno(turno)}
                        disabled={turno.estado === 'llamado'}
                        className={`w-full ${
                          turno.estado === 'siguiente'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : turno.estado === 'llamado'
                              ? 'bg-green-600'
                              : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                      >
                        {turno.estado === 'llamado' ? (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Turno Llamado
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Llamar Turno
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
