/**
 * 📊 ACTIVIDAD RECIENTE Y TIMELINE
 * Muestra un feed de actividades y acciones recientes del usuario/sistema
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import {
  Clock,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TipoAccion, NivelSeveridad, EntidadTipo, RegistroAuditoria } from '../../lib/audit-log';

// ============================================
// TIPOS
// ============================================

export interface ActividadItem {
  id: string;
  tipo: TipoAccion;
  entidad_tipo: EntidadTipo;
  usuario_nombre: string;
  usuario_avatar?: string;
  descripcion: string;
  timestamp: Date;
  severidad?: NivelSeveridad;
  metadata?: {
    entidad_nombre?: string;
    cambios?: string[];
    valor?: number;
  };
}

// ============================================
// UTILIDADES
// ============================================

const obtenerIconoAccion = (tipo: TipoAccion): React.ReactNode => {
  const iconos: Record<TipoAccion, React.ReactNode> = {
    [TipoAccion.CREAR]: <Plus className="w-4 h-4" />,
    [TipoAccion.LEER]: <FileText className="w-4 h-4" />,
    [TipoAccion.ACTUALIZAR]: <Edit className="w-4 h-4" />,
    [TipoAccion.ELIMINAR]: <Trash2 className="w-4 h-4" />,
    [TipoAccion.LOGIN]: <CheckCircle2 className="w-4 h-4" />,
    [TipoAccion.LOGOUT]: <XCircle className="w-4 h-4" />,
    [TipoAccion.LOGIN_FALLIDO]: <AlertCircle className="w-4 h-4" />,
    [TipoAccion.CAMBIO_CONTRASEÑA]: <Settings className="w-4 h-4" />,
    [TipoAccion.EXPORTAR]: <Download className="w-4 h-4" />,
    [TipoAccion.IMPORTAR]: <FileText className="w-4 h-4" />,
    [TipoAccion.APROBAR]: <CheckCircle2 className="w-4 h-4" />,
    [TipoAccion.RECHAZAR]: <XCircle className="w-4 h-4" />,
    [TipoAccion.CAMBIO_CONFIG]: <Settings className="w-4 h-4" />,
    [TipoAccion.CAMBIO_PERMISOS]: <Settings className="w-4 h-4" />,
    [TipoAccion.CAMBIO_ROL]: <Users className="w-4 h-4" />,
    [TipoAccion.SINCRONIZAR]: <Clock className="w-4 h-4" />,
    [TipoAccion.BACKUP]: <FileText className="w-4 h-4" />,
    [TipoAccion.RESTORE]: <FileText className="w-4 h-4" />
  };
  return iconos[tipo] || <Clock className="w-4 h-4" />;
};

const obtenerIconoEntidad = (tipo: EntidadTipo): React.ReactNode => {
  const iconos: Record<EntidadTipo, React.ReactNode> = {
    [EntidadTipo.CLIENTE]: <Users className="w-4 h-4" />,
    [EntidadTipo.EMPLEADO]: <Users className="w-4 h-4" />,
    [EntidadTipo.PRODUCTO]: <Package className="w-4 h-4" />,
    [EntidadTipo.PEDIDO]: <ShoppingCart className="w-4 h-4" />,
    [EntidadTipo.FACTURA]: <DollarSign className="w-4 h-4" />,
    [EntidadTipo.PROVEEDOR]: <Package className="w-4 h-4" />,
    [EntidadTipo.STOCK]: <Package className="w-4 h-4" />,
    [EntidadTipo.USUARIO]: <Users className="w-4 h-4" />,
    [EntidadTipo.CONFIGURACION]: <Settings className="w-4 h-4" />,
    [EntidadTipo.ROL]: <Settings className="w-4 h-4" />,
    [EntidadTipo.PERMISO]: <Settings className="w-4 h-4" />
  };
  return iconos[tipo];
};

const obtenerColorSeveridad = (severidad?: NivelSeveridad): string => {
  if (!severidad) return 'bg-gray-100 text-gray-700 border-gray-200';
  
  const colores: Record<NivelSeveridad, string> = {
    [NivelSeveridad.INFO]: 'bg-blue-50 text-blue-700 border-blue-200',
    [NivelSeveridad.WARNING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [NivelSeveridad.ERROR]: 'bg-red-50 text-red-700 border-red-200',
    [NivelSeveridad.CRITICAL]: 'bg-red-100 text-red-800 border-red-300'
  };
  return colores[severidad];
};

const obtenerColorAccion = (tipo: TipoAccion): string => {
  if (tipo === TipoAccion.CREAR) return 'bg-green-100 text-green-700';
  if (tipo === TipoAccion.ACTUALIZAR) return 'bg-blue-100 text-blue-700';
  if (tipo === TipoAccion.ELIMINAR) return 'bg-red-100 text-red-700';
  if (tipo === TipoAccion.APROBAR) return 'bg-teal-100 text-teal-700';
  if (tipo === TipoAccion.RECHAZAR) return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-700';
};

const formatearTiempoRelativo = (fecha: Date): string => {
  const ahora = new Date();
  const diff = ahora.getTime() - fecha.getTime();
  const segundos = Math.floor(diff / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (segundos < 60) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ActividadRecienteProps {
  actividades: ActividadItem[] | RegistroAuditoria[];
  maxItems?: number;
  mostrarFiltros?: boolean;
  altura?: string;
}

export const ActividadReciente = ({
  actividades,
  maxItems = 50,
  mostrarFiltros = false,
  altura = '600px'
}: ActividadRecienteProps) => {
  // Convertir RegistroAuditoria a ActividadItem si es necesario
  const actividadesNormalizadas: ActividadItem[] = useMemo(() => {
    return actividades.slice(0, maxItems).map(act => {
      if ('accion' in act) {
        // Es un RegistroAuditoria
        return {
          id: act.id,
          tipo: act.accion,
          entidad_tipo: act.entidad_tipo,
          usuario_nombre: act.usuario_nombre,
          descripcion: act.descripcion,
          timestamp: act.timestamp,
          severidad: act.severidad,
          metadata: {
            entidad_nombre: act.entidad_nombre
          }
        };
      }
      // Ya es ActividadItem
      return act;
    });
  }, [actividades, maxItems]);

  // Agrupar por día
  const actividadesAgrupadas = useMemo(() => {
    const grupos: Record<string, ActividadItem[]> = {};

    actividadesNormalizadas.forEach(act => {
      const fecha = new Date(act.timestamp);
      const clave = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(act);
    });

    return Object.entries(grupos);
  }, [actividadesNormalizadas]);

  if (actividadesNormalizadas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No hay actividad reciente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimas {actividadesNormalizadas.length} acciones realizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: altura }} className="px-6">
          <div className="space-y-6 py-4">
            {actividadesAgrupadas.map(([fecha, items]) => (
              <div key={fecha}>
                {/* Encabezado de día */}
                <div className="sticky top-0 bg-white z-10 pb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    {fecha}
                  </div>
                </div>

                {/* Timeline de actividades */}
                <div className="space-y-3">
                  {items.map((actividad, index) => (
                    <div key={actividad.id} className="flex gap-3 group">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarImage src={actividad.usuario_avatar} />
                          <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                            {actividad.usuario_nombre.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Usuario y acción */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                {actividad.usuario_nombre}
                              </span>
                              <div className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                                obtenerColorAccion(actividad.tipo)
                              )}>
                                {obtenerIconoAccion(actividad.tipo)}
                                <span className="capitalize">
                                  {actividad.tipo.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {actividad.descripcion}
                            </p>

                            {/* Metadata adicional */}
                            {actividad.metadata?.entidad_nombre && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  {obtenerIconoEntidad(actividad.entidad_tipo)}
                                  <span>{actividad.metadata.entidad_nombre}</span>
                                </div>
                              </div>
                            )}

                            {/* Cambios realizados */}
                            {actividad.metadata?.cambios && actividad.metadata.cambios.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {actividad.metadata.cambios.map((cambio, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {cambio}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Timestamp */}
                          <div className="flex-shrink-0 text-xs text-gray-400">
                            {formatearTiempoRelativo(new Date(actividad.timestamp))}
                          </div>
                        </div>

                        {/* Badge de severidad si es importante */}
                        {actividad.severidad && actividad.severidad !== NivelSeveridad.INFO && (
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', obtenerColorSeveridad(actividad.severidad))}
                            >
                              {actividad.severidad.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ============================================
// VERSIÓN COMPACTA
// ============================================

export const ActividadRecienteCompacta = ({
  actividades,
  maxItems = 5
}: {
  actividades: ActividadItem[] | RegistroAuditoria[];
  maxItems?: number;
}) => {
  const actividadesLimitadas = actividades.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {actividadesLimitadas.map((act) => {
        const actividad = 'accion' in act
          ? {
              id: act.id,
              tipo: act.accion,
              usuario_nombre: act.usuario_nombre,
              descripcion: act.descripcion,
              timestamp: act.timestamp
            }
          : act;

        return (
          <div
            key={actividad.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              obtenerColorAccion(actividad.tipo)
            )}>
              {obtenerIconoAccion(actividad.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {actividad.descripcion}
              </p>
              <p className="text-xs text-gray-500">
                {formatearTiempoRelativo(new Date(actividad.timestamp))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActividadReciente;
