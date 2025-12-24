/**
 * 📅 CONFIGURACIÓN DE CITAS (GERENTE)
 * Panel de configuración de disponibilidad, horarios, intervalos y capacidad
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Calendar,
  Clock, 
  Users,
  Save,
  Settings,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { ConfiguracionCitas, HorarioDisponibilidad, ServicioCita } from '../../types/cita.types';

interface ConfiguracionCitasProps {
  puntoVentaId: string;
}

export function ConfiguracionCitas({ puntoVentaId }: ConfiguracionCitasProps) {
  const { cargarConfiguracion, guardarConfiguracion, configuracion: configInicial } = useCitas();
  
  const [config, setConfig] = useState<ConfiguracionCitas | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState<string | null>(null);

  useEffect(() => {
    cargarConfiguracion(puntoVentaId);
  }, [puntoVentaId, cargarConfiguracion]);

  useEffect(() => {
    if (configInicial) {
      setConfig(configInicial);
    }
  }, [configInicial]);

  const handleGuardar = async () => {
    if (!config) return;

    setGuardando(true);
    
    try {
      guardarConfiguracion(config);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarHorario = (diaSemana: number, campo: keyof HorarioDisponibilidad, valor: any) => {
    if (!config) return;

    const nuevosHorarios = config.horarios.map(h => 
      h.diaSemana === diaSemana 
        ? { ...h, [campo]: valor }
        : h
    );

    setConfig({ ...config, horarios: nuevosHorarios });
  };

  const actualizarServicio = (servicioId: string, campo: keyof ServicioCita, valor: any) => {
    if (!config) return;

    const nuevosServicios = config.servicios.map(s => 
      s.id === servicioId 
        ? { ...s, [campo]: valor }
        : s
    );

    setConfig({ ...config, servicios: nuevosServicios });
  };

  const agregarServicio = () => {
    if (!config) return;

    const nuevoServicio: ServicioCita = {
      id: `SRV-${Date.now()}`,
      nombre: 'Nuevo Servicio',
      descripcion: '',
      duracionMinutos: 30,
      habilitado: true,
      orden: config.servicios.length + 1
    };

    setConfig({ 
      ...config, 
      servicios: [...config.servicios, nuevoServicio]
    });
    setEditandoServicio(nuevoServicio.id);
  };

  const eliminarServicio = (servicioId: string) => {
    if (!config) return;

    const nuevosServicios = config.servicios.filter(s => s.id !== servicioId);
    setConfig({ ...config, servicios: nuevosServicios });
    toast.info('Servicio eliminado');
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Configuración de Citas</h2>
          <p className="text-gray-600">
            Gestiona la disponibilidad, horarios y servicios del sistema de citas
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          className="bg-black hover:bg-black/90"
        >
          {guardando ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Configuración General */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" />
          <h3 className="text-lg font-medium">Configuración General</h3>
        </div>

        <div className="space-y-6">
          {/* Sistema habilitado */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sistema de Citas Habilitado</Label>
              <p className="text-sm text-gray-600">
                Los clientes podrán solicitar citas cuando esté habilitado
              </p>
            </div>
            <Switch
              checked={config.habilitado}
              onCheckedChange={(checked) => setConfig({ ...config, habilitado: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intervalo de tiempo */}
            <div>
              <Label htmlFor="intervalo">Intervalo de Tiempo (minutos)</Label>
              <Select
                value={config.intervaloMinutos.toString()}
                onValueChange={(value) => setConfig({ ...config, intervaloMinutos: parseInt(value) as any })}
              >
                <SelectTrigger id="intervalo" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Duración de cada slot de tiempo disponible
              </p>
            </div>

            {/* Capacidad simultánea */}
            <div>
              <Label htmlFor="capacidad">Capacidad Simultánea (PAX)</Label>
              <Input
                id="capacidad"
                type="number"
                min="1"
                max="10"
                value={config.capacidadSimultanea}
                onChange={(e) => setConfig({ ...config, capacidadSimultanea: parseInt(e.target.value) || 1 })}
                className="min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cuántos clientes pueden tener cita a la misma hora
              </p>
            </div>

            {/* Anticipación mínima */}
            <div>
              <Label htmlFor="anticipacionMin">Anticipación Mínima (días)</Label>
              <Input
                id="anticipacionMin"
                type="number"
                min="0"
                max="30"
                value={config.anticipacionMinimaDias}
                onChange={(e) => setConfig({ ...config, anticipacionMinimaDias: parseInt(e.target.value) || 0 })}
                className="min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Con cuántos días de antelación mínimo se puede pedir cita
              </p>
            </div>

            {/* Anticipación máxima */}
            <div>
              <Label htmlFor="anticipacionMax">Anticipación Máxima (días)</Label>
              <Input
                id="anticipacionMax"
                type="number"
                min="1"
                max="90"
                value={config.anticipacionMaximaDias}
                onChange={(e) => setConfig({ ...config, anticipacionMaximaDias: parseInt(e.target.value) || 30 })}
                className="min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hasta cuándo en el futuro se puede pedir cita
              </p>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Notificaciones</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Notificar Nuevas Citas</Label>
                <p className="text-sm text-gray-600">
                  Recibir notificación cuando un cliente solicite una cita
                </p>
              </div>
              <Switch
                checked={config.notificarNuevaCita}
                onCheckedChange={(checked) => setConfig({ ...config, notificarNuevaCita: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enviar Recordatorios</Label>
                <p className="text-sm text-gray-600">
                  Enviar recordatorio automático al cliente antes de la cita
                </p>
              </div>
              <Switch
                checked={config.notificarRecordatorio}
                onCheckedChange={(checked) => setConfig({ ...config, notificarRecordatorio: checked })}
              />
            </div>

            {config.notificarRecordatorio && (
              <div>
                <Label htmlFor="horasRecordatorio">Horas Antes del Recordatorio</Label>
                <Input
                  id="horasRecordatorio"
                  type="number"
                  min="1"
                  max="72"
                  value={config.horasAntesRecordatorio}
                  onChange={(e) => setConfig({ ...config, horasAntesRecordatorio: parseInt(e.target.value) || 24 })}
                  className="min-h-[44px]"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Horarios por día */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-medium">Horarios de Disponibilidad</h3>
        </div>

        <div className="space-y-3">
          {config.horarios.map((horario) => (
            <div 
              key={horario.diaSemana} 
              className={`p-4 rounded-lg border-2 transition-colors ${
                horario.habilitado ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Switch para habilitar/deshabilitar día */}
                <Switch
                  checked={horario.habilitado}
                  onCheckedChange={(checked) => actualizarHorario(horario.diaSemana, 'habilitado', checked)}
                  className="mt-1"
                />

                {/* Contenido del día */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{horario.nombreDia}</span>
                    {!horario.habilitado && (
                      <Badge variant="secondary" className="text-xs">
                        Cerrado
                      </Badge>
                    )}
                  </div>

                  {horario.habilitado && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hora inicio */}
                        <div>
                          <Label className="text-xs text-gray-600">Hora Inicio</Label>
                          <Input
                            type="time"
                            value={horario.horaInicio}
                            onChange={(e) => actualizarHorario(horario.diaSemana, 'horaInicio', e.target.value)}
                            className="min-h-[40px]"
                          />
                        </div>

                        {/* Hora fin */}
                        <div>
                          <Label className="text-xs text-gray-600">Hora Fin</Label>
                          <Input
                            type="time"
                            value={horario.horaFin}
                            onChange={(e) => actualizarHorario(horario.diaSemana, 'horaFin', e.target.value)}
                            className="min-h-[40px]"
                          />
                        </div>

                        {/* Descanso inicio (opcional) */}
                        <div>
                          <Label className="text-xs text-gray-600">Descanso Inicio (opcional)</Label>
                          <Input
                            type="time"
                            value={horario.descansoInicio || ''}
                            onChange={(e) => actualizarHorario(horario.diaSemana, 'descansoInicio', e.target.value || undefined)}
                            className="min-h-[40px]"
                          />
                        </div>

                        {/* Descanso fin (opcional) */}
                        <div>
                          <Label className="text-xs text-gray-600">Descanso Fin (opcional)</Label>
                          <Input
                            type="time"
                            value={horario.descansoFin || ''}
                            onChange={(e) => actualizarHorario(horario.diaSemana, 'descansoFin', e.target.value || undefined)}
                            className="min-h-[40px]"
                          />
                        </div>
                      </div>

                      {horario.descansoInicio && horario.descansoFin && (
                        <p className="text-xs text-gray-500">
                          Descanso: {horario.descansoInicio} - {horario.descansoFin}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Servicios disponibles */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="text-lg font-medium">Servicios Disponibles</h3>
          </div>
          <Button
            onClick={agregarServicio}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Servicio
          </Button>
        </div>

        <div className="space-y-3">
          {config.servicios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay servicios configurados. Añade uno para empezar.
            </div>
          ) : (
            config.servicios.map((servicio) => (
              <div 
                key={servicio.id} 
                className={`p-4 rounded-lg border-2 transition-colors ${
                  servicio.habilitado ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Switch para habilitar/deshabilitar servicio */}
                  <Switch
                    checked={servicio.habilitado}
                    onCheckedChange={(checked) => actualizarServicio(servicio.id, 'habilitado', checked)}
                    className="mt-1"
                  />

                  {/* Contenido del servicio */}
                  <div className="flex-1 space-y-3">
                    {editandoServicio === servicio.id ? (
                      <>
                        <Input
                          value={servicio.nombre}
                          onChange={(e) => actualizarServicio(servicio.id, 'nombre', e.target.value)}
                          placeholder="Nombre del servicio"
                          className="font-medium"
                        />
                        <Input
                          value={servicio.descripcion || ''}
                          onChange={(e) => actualizarServicio(servicio.id, 'descripcion', e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="text-sm"
                        />
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600">Duración (minutos)</Label>
                            <Input
                              type="number"
                              min="5"
                              step="5"
                              value={servicio.duracionMinutos}
                              onChange={(e) => actualizarServicio(servicio.id, 'duracionMinutos', parseInt(e.target.value) || 30)}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditandoServicio(null)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => eliminarServicio(servicio.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{servicio.nombre}</div>
                            {servicio.descripcion && (
                              <div className="text-sm text-gray-600 mt-1">{servicio.descripcion}</div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {servicio.duracionMinutos} min
                              </Badge>
                              {!servicio.habilitado && (
                                <Badge variant="secondary" className="text-xs bg-gray-200">
                                  Deshabilitado
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditandoServicio(servicio.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarServicio(servicio.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Guardar cambios (footer fijo) */}
      <div className="sticky bottom-0 bg-white border-t py-4 flex justify-end">
        <Button
          onClick={handleGuardar}
          disabled={guardando}
          size="lg"
          className="bg-black hover:bg-black/90"
        >
          {guardando ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Guardando Configuración...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
