import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Clock, User, MapPin, Check, X, RefreshCw } from 'lucide-react';

interface Turno {
  id: string;
  codigo: string; // P001-P999
  cliente: {
    nombre: string;
    telefono?: string;
  };
  estado: 'en_cola' | 'llamado' | 'atendido' | 'cancelado';
  origenPedido: 'presencial' | 'app';
  geolocalizacionValidada?: boolean;
  horaAsignacion: Date;
  horaLlamada?: Date;
  puntoVentaId: string;
}

interface GestionTurnosProps {
  puntoVentaId: string;
  onLlamarTurno?: (turno: Turno) => void;
}

export function GestionTurnos({ puntoVentaId, onLlamarTurno }: GestionTurnosProps) {
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: 'T001',
      codigo: 'P001',
      cliente: { nombre: 'María García', telefono: '678123456' },
      estado: 'en_cola',
      origenPedido: 'app',
      geolocalizacionValidada: true,
      horaAsignacion: new Date(Date.now() - 600000),
      puntoVentaId
    },
    {
      id: 'T002',
      codigo: 'P002',
      cliente: { nombre: 'Carlos Martínez' },
      estado: 'en_cola',
      origenPedido: 'presencial',
      horaAsignacion: new Date(Date.now() - 300000),
      puntoVentaId
    },
    {
      id: 'T003',
      codigo: 'P003',
      cliente: { nombre: 'Ana López', telefono: '645987321' },
      estado: 'llamado',
      origenPedido: 'app',
      geolocalizacionValidada: true,
      horaAsignacion: new Date(Date.now() - 120000),
      horaLlamada: new Date(Date.now() - 60000),
      puntoVentaId
    },
  ]);

  const [contadorTurnos, setContadorTurnos] = useState(4);
  const [busqueda, setBusqueda] = useState('');

  // Generar nuevo código de turno
  const generarCodigoTurno = (): string => {
    const numero = contadorTurnos.toString().padStart(3, '0');
    return `P${numero}`;
  };

  // Asignar turno presencial
  const asignarTurnoPresencial = (nombreCliente: string) => {
    const nuevoTurno: Turno = {
      id: `T${Date.now()}`,
      codigo: generarCodigoTurno(),
      cliente: { nombre: nombreCliente || 'Cliente sin nombre' },
      estado: 'en_cola',
      origenPedido: 'presencial',
      horaAsignacion: new Date(),
      puntoVentaId
    };

    setTurnos([...turnos, nuevoTurno]);
    setContadorTurnos(contadorTurnos + 1);
  };

  // Simular cliente llegando con geolocalización (desde app)
  const simularClienteApp = () => {
    const nuevoTurno: Turno = {
      id: `T${Date.now()}`,
      codigo: generarCodigoTurno(),
      cliente: { 
        nombre: `Cliente App ${contadorTurnos}`,
        telefono: `6${Math.floor(Math.random() * 100000000)}`
      },
      estado: 'en_cola',
      origenPedido: 'app',
      geolocalizacionValidada: true,
      horaAsignacion: new Date(),
      puntoVentaId
    };

    setTurnos([...turnos, nuevoTurno]);
    setContadorTurnos(contadorTurnos + 1);
  };

  // Llamar turno
  const llamarTurno = (turno: Turno) => {
    setTurnos(turnos.map(t => 
      t.id === turno.id 
        ? { ...t, estado: 'llamado', horaLlamada: new Date() }
        : t
    ));

    if (onLlamarTurno) {
      onLlamarTurno(turno);
    }
  };

  // Marcar como atendido
  const marcarAtendido = (turnoId: string) => {
    setTurnos(turnos.map(t => 
      t.id === turnoId ? { ...t, estado: 'atendido' } : t
    ));
  };

  // Cancelar turno
  const cancelarTurno = (turnoId: string) => {
    setTurnos(turnos.map(t => 
      t.id === turnoId ? { ...t, estado: 'cancelado' } : t
    ));
  };

  // Filtrar turnos por búsqueda
  const turnosFiltrados = turnos.filter(t => 
    t.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.cliente.telefono?.includes(busqueda)
  );

  // Separar por estado
  const turnosEnCola = turnosFiltrados.filter(t => t.estado === 'en_cola');
  const turnosLlamados = turnosFiltrados.filter(t => t.estado === 'llamado');
  const turnosAtendidos = turnosFiltrados.filter(t => t.estado === 'atendido');

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_cola':
        return <Badge className="bg-blue-100 text-blue-800">En Cola</Badge>;
      case 'llamado':
        return <Badge className="bg-orange-100 text-orange-800">Llamado</Badge>;
      case 'atendido':
        return <Badge className="bg-green-100 text-green-800">Atendido</Badge>;
      case 'cancelado':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatearTiempoEspera = (fecha: Date): string => {
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos === 1) return '1 min';
    return `${minutos} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Gestión de Turnos
              </CardTitle>
              <CardDescription>
                Sistema de turnos P001-P999 con reset diario
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => asignarTurnoPresencial('Cliente Presencial')}
                variant="outline"
              >
                + Turno Presencial
              </Button>
              <Button 
                onClick={simularClienteApp}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Simular Cliente App
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {turnosEnCola.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">En Cola</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {turnosLlamados.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Llamados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {turnosAtendidos.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Atendidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {contadorTurnos - 1}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total Hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por código, nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Turnos en Cola */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Turnos en Cola ({turnosEnCola.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {turnosEnCola.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay turnos en cola</p>
              </div>
            ) : (
              turnosEnCola.map(turno => (
                <Card key={turno.id} className="bg-blue-50 border-2 border-blue-300">
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <p className="text-3xl text-blue-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {turno.codigo}
                      </p>
                      <Badge className="bg-blue-500 text-white text-xs">
                        {turno.origenPedido === 'app' ? 'APP' : 'PRESENCIAL'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{turno.cliente.nombre}</span>
                      </div>
                      {turno.origenPedido === 'app' && turno.geolocalizacionValidada && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <MapPin className="w-3 h-3" />
                          <span>Geolocalización OK</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Esperando {formatearTiempoEspera(turno.horaAsignacion)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => llamarTurno(turno)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 touch-target"
                        size="sm"
                      >
                        Llamar
                      </Button>
                      <Button
                        onClick={() => cancelarTurno(turno.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-9 touch-target"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Turnos Llamados */}
      {turnosLlamados.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              Turnos Llamados ({turnosLlamados.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {turnosLlamados.map(turno => (
                <Card key={turno.id} className="bg-orange-50 border-2 border-orange-300">
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <p className="text-3xl text-orange-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {turno.codigo}
                      </p>
                      <Badge className="bg-orange-500 text-white text-xs">
                        LLAMADO
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{turno.cliente.nombre}</span>
                      </div>
                      {turno.horaLlamada && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>
                            Llamado hace {formatearTiempoEspera(turno.horaLlamada)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => marcarAtendido(turno.id)}
                      className="w-full bg-green-600 hover:bg-green-700 h-9 touch-target"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar Atendido
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
