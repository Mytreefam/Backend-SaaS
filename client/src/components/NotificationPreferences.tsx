/**
 * PREFERENCIAS DE NOTIFICACIONES - Udar Edge
 * Componente universal para configurar notificaciones
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Volume2,
  VolumeX,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { NotificationPreferences as NotificationPreferencesType } from '../types/notifications.types';

interface NotificationPreferencesProps {
  usuarioId: string;
}

export function NotificationPreferences({ usuarioId }: NotificationPreferencesProps) {
  const { preferencias, loadPreferences, updatePreferences, loading } = useNotifications({
    usuarioId,
    autoLoad: false,
  });
  
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferencesType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Cargar preferencias al montar
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Sincronizar con preferencias cargadas
  useEffect(() => {
    if (preferencias) {
      setLocalPrefs(preferencias);
    }
  }, [preferencias]);
  
  // ==================== HANDLERS ====================
  
  const handleToggleCanal = (canal: keyof NotificationPreferencesType['canalesActivos']) => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      canalesActivos: {
        ...localPrefs.canalesActivos,
        [canal]: !localPrefs.canalesActivos[canal],
      },
    });
    setHasChanges(true);
  };
  
  const handleToggleTipo = (tipo: keyof NotificationPreferencesType['preferencias']) => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      preferencias: {
        ...localPrefs.preferencias,
        [tipo]: {
          ...localPrefs.preferencias[tipo],
          activo: !localPrefs.preferencias[tipo].activo,
        },
      },
    });
    setHasChanges(true);
  };
  
  const handleToggleSonido = (tipo: keyof NotificationPreferencesType['preferencias']) => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      preferencias: {
        ...localPrefs.preferencias,
        [tipo]: {
          ...localPrefs.preferencias[tipo],
          sonido: !localPrefs.preferencias[tipo].sonido,
        },
      },
    });
    setHasChanges(true);
  };
  
  const handleToggleHorarioSilencioso = () => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      horarioSilencioso: {
        ...localPrefs.horarioSilencioso,
        activo: !localPrefs.horarioSilencioso.activo,
      },
    });
    setHasChanges(true);
  };
  
  const handleChangeFrecuenciaEmail = (frecuencia: 'inmediato' | 'diario' | 'semanal') => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      frecuenciaEmail: frecuencia,
    });
    setHasChanges(true);
  };
  
  const handleToggleAgrupar = () => {
    if (!localPrefs) return;
    
    setLocalPrefs({
      ...localPrefs,
      agruparNotificaciones: !localPrefs.agruparNotificaciones,
    });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    if (!localPrefs) return;
    
    await updatePreferences(localPrefs);
    setHasChanges(false);
  };
  
  if (!localPrefs) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando preferencias...
      </div>
    );
  }
  
  // ==================== RENDER ====================
  
  return (
    <div className="space-y-6">
      {/* Canales de Notificación */}
      <Card>
        <CardHeader>
          <CardTitle>Canales de Notificación</CardTitle>
          <CardDescription>
            Elige por qué canales quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-900">Notificaciones por Email</p>
                <p className="text-gray-600 text-sm">
                  Recibe actualizaciones importantes por correo electrónico
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.canalesActivos.email}
              onCheckedChange={() => handleToggleCanal('email')}
            />
          </div>
          
          {/* Push */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-900">Notificaciones Push</p>
                <p className="text-gray-600 text-sm">
                  Alertas en tiempo real en la aplicación y dispositivo
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.canalesActivos.push}
              onCheckedChange={() => handleToggleCanal('push')}
            />
          </div>
          
          {/* SMS */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-900">Notificaciones SMS</p>
                <p className="text-gray-600 text-sm">
                  Mensajes de texto para alertas críticas
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.canalesActivos.sms}
              onCheckedChange={() => handleToggleCanal('sms')}
            />
          </div>
          
          {/* In-App */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-gray-900">Notificaciones en la App</p>
                <p className="text-gray-600 text-sm">
                  Centro de notificaciones dentro de la aplicación
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.canalesActivos.in_app}
              onCheckedChange={() => handleToggleCanal('in_app')}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tipos de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificaciones</CardTitle>
          <CardDescription>
            Activa o desactiva notificaciones por categoría
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(localPrefs.preferencias).map(([tipo, config]) => (
            <div
              key={tipo}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <p className="text-gray-900 capitalize">
                    {tipo === 'pedido' && '🛒 Pedidos'}
                    {tipo === 'stock' && '📦 Stock'}
                    {tipo === 'cita' && '📅 Citas'}
                    {tipo === 'promocion' && '🏷️ Promociones'}
                    {tipo === 'sistema' && '⚙️ Sistema'}
                    {tipo === 'pago' && '💳 Pagos'}
                    {tipo === 'alerta' && '⚠️ Alertas'}
                    {tipo === 'mensaje' && '💬 Mensajes'}
                    {tipo === 'rrhh' && '👥 Recursos Humanos'}
                    {tipo === 'invitacion' && '✉️ Invitaciones de Empleados'}
                    {tipo === 'fichaje' && '🕐 Fichajes y Horarios'}
                    {tipo === 'nomina' && '💰 Nóminas'}
                    {tipo === 'vacaciones' && '🏖️ Vacaciones y Ausencias'}
                    {tipo === 'formacion' && '📚 Formación'}
                  </p>
                  <p className="text-gray-600 text-xs">
                    Canales: {config.canales.join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleSonido(tipo as any)}
                  disabled={!config.activo}
                  title={config.sonido ? 'Silenciar' : 'Activar sonido'}
                >
                  {config.sonido ? (
                    <Volume2 className="w-4 h-4 text-teal-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
                
                <Switch
                  checked={config.activo}
                  onCheckedChange={() => handleToggleTipo(tipo as any)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Configuración Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Adicional</CardTitle>
          <CardDescription>
            Personaliza cómo y cuándo recibes notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Horario Silencioso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-gray-900">Horario Silencioso</p>
                  <p className="text-gray-600 text-sm">
                    No recibir notificaciones en ciertos horarios
                  </p>
                </div>
              </div>
              <Switch
                checked={localPrefs.horarioSilencioso.activo}
                onCheckedChange={handleToggleHorarioSilencioso}
              />
            </div>
            
            {localPrefs.horarioSilencioso.activo && (
              <div className="pl-12 space-y-2">
                <div className="flex items-center gap-3">
                  <Label className="w-20">Desde:</Label>
                  <span className="text-gray-900">{localPrefs.horarioSilencioso.inicio}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Label className="w-20">Hasta:</Label>
                  <span className="text-gray-900">{localPrefs.horarioSilencioso.fin}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Frecuencia Email */}
          {localPrefs.canalesActivos.email && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-gray-900">Frecuencia de Emails</p>
                <p className="text-gray-600 text-sm">
                  Con qué frecuencia agrupar emails
                </p>
              </div>
              <Select
                value={localPrefs.frecuenciaEmail}
                onValueChange={handleChangeFrecuenciaEmail}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inmediato">Inmediato</SelectItem>
                  <SelectItem value="diario">Resumen diario</SelectItem>
                  <SelectItem value="semanal">Resumen semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Agrupar Notificaciones */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-gray-900">Agrupar Notificaciones</p>
              <p className="text-gray-600 text-sm">
                Agrupar notificaciones similares para reducir interrupciones
              </p>
            </div>
            <Switch
              checked={localPrefs.agruparNotificaciones}
              onCheckedChange={handleToggleAgrupar}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Botón Guardar */}
      {hasChanges && (
        <div className="sticky bottom-6 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={loading}
            size="lg"
            className="shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );
}