/**
 * ================================================================
 * COMPONENTE: GESTIÓN DE INVITACIONES PENDIENTES
 * ================================================================
 * Muestra y gestiona todas las invitaciones de empleados
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Mail,
  Hash,
  UserPlus,
  MoreVertical,
  Copy,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { invitacionesService } from '../../services/invitaciones.service';
import { InvitacionEmpleado, EstadisticasInvitaciones } from '../../types/invitaciones.types';

interface InvitacionesPendientesProps {
  empresaId: string;
  onRecargar?: () => void;
}

export function InvitacionesPendientes({ empresaId, onRecargar }: InvitacionesPendientesProps) {
  const [invitaciones, setInvitaciones] = useState<InvitacionEmpleado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasInvitaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [invitacionACancelar, setInvitacionACancelar] = useState<string | null>(null);

  useEffect(() => {
    cargarInvitaciones();
  }, [empresaId]);

  const cargarInvitaciones = async () => {
    setLoading(true);
    try {
      const [invs, stats] = await Promise.all([
        invitacionesService.getInvitacionesPorEmpresa(empresaId),
        invitacionesService.getEstadisticas(empresaId)
      ]);
      
      // Ordenar por fecha de creación (más recientes primero)
      invs.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
      
      setInvitaciones(invs);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar invitaciones:', error);
      toast.error('Error al cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async (invitacionId: string) => {
    try {
      await invitacionesService.reenviarInvitacion(invitacionId);
      await cargarInvitaciones();
    } catch (error) {
      console.error('Error al reenviar:', error);
    }
  };

  const handleCancelar = async () => {
    if (!invitacionACancelar) return;
    
    try {
      await invitacionesService.cancelarInvitacion(invitacionACancelar);
      await cargarInvitaciones();
      onRecargar?.();
    } catch (error) {
      console.error('Error al cancelar:', error);
    } finally {
      setInvitacionACancelar(null);
    }
  };

  const copiarInfo = (invitacion: InvitacionEmpleado) => {
    let texto = '';
    
    if (invitacion.metodo === 'email' && invitacion.linkInvitacion) {
      texto = invitacion.linkInvitacion;
    } else if (invitacion.metodo === 'codigo' && invitacion.codigoInvitacion) {
      texto = invitacion.codigoInvitacion;
    } else if (invitacion.metodo === 'preregistro' && invitacion.credencialesTemporales) {
      texto = `Usuario: ${invitacion.credencialesTemporales.usuario}\nContraseña: ${invitacion.credencialesTemporales.password}`;
    }
    
    navigator.clipboard.writeText(texto);
    toast.success('Copiado al portapapeles');
  };

  const limpiarExpiradas = async () => {
    const cantidad = await invitacionesService.limpiarExpiradas(empresaId);
    if (cantidad > 0) {
      await cargarInvitaciones();
    }
  };

  // Filtrar invitaciones
  const invitacionesFiltradas = invitaciones.filter(inv => {
    // Filtro de búsqueda
    if (busqueda) {
      const textoLower = busqueda.toLowerCase();
      if (
        !inv.email.toLowerCase().includes(textoLower) &&
        !inv.puesto?.toLowerCase().includes(textoLower) &&
        !inv.departamento?.toLowerCase().includes(textoLower) &&
        !(inv.nombre?.toLowerCase() || '').includes(textoLower)
      ) {
        return false;
      }
    }
    
    // Filtro de estado
    if (filtroEstado !== 'todas' && inv.estado !== filtroEstado) {
      return false;
    }
    
    return true;
  });

  const getBadgeEstado = (estado: string) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aceptada: 'bg-green-100 text-green-800 border-green-200',
      rechazada: 'bg-red-100 text-red-800 border-red-200',
      expirada: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelada: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <Badge variant="outline" className={colores[estado as keyof typeof colores] || ''}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const getIconoMetodo = (metodo: string) => {
    const iconos = {
      email: <Mail className="h-4 w-4" />,
      codigo: <Hash className="h-4 w-4" />,
      preregistro: <UserPlus className="h-4 w-4" />,
    };
    return iconos[metodo as keyof typeof iconos] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl">{estadisticas.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-2xl">{estadisticas.pendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aceptadas</p>
                  <p className="text-2xl">{estadisticas.aceptadas}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expiradas</p>
                  <p className="text-2xl">{estadisticas.expiradas}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tasa aceptación</p>
                  <p className="text-2xl">{estadisticas.tasaAceptacion.toFixed(0)}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de invitaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invitaciones de empleados</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={limpiarExpiradas}
              >
                Limpiar expiradas
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cargarInvitaciones}
              >
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email, nombre, puesto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filtroEstado === 'todas' ? 'Todas' : filtroEstado}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltroEstado('todas')}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroEstado('pendiente')}>
                  Pendientes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroEstado('aceptada')}>
                  Aceptadas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroEstado('expirada')}>
                  Expiradas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroEstado('cancelada')}>
                  Canceladas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabla */}
          {invitacionesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {invitaciones.length === 0 ? (
                <>
                  <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay invitaciones creadas</p>
                  <p className="text-sm">Crea tu primera invitación para comenzar</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No se encontraron resultados</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email / Empleado</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha creación</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitacionesFiltradas.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inv.email}</p>
                          {inv.nombre && (
                            <p className="text-sm text-gray-500">
                              {inv.nombre} {inv.apellidos}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{inv.puesto}</p>
                          <p className="text-xs text-gray-500">{inv.departamento}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIconoMetodo(inv.metodo)}
                          <span className="text-sm capitalize">{inv.metodo}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getBadgeEstado(inv.estado)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(inv.fechaCreacion), 'dd MMM yyyy', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(inv.fechaExpiracion), 'dd MMM yyyy', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {inv.estado === 'pendiente' && (
                              <>
                                <DropdownMenuItem onClick={() => copiarInfo(inv)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar {inv.metodo === 'email' ? 'link' : inv.metodo === 'codigo' ? 'código' : 'credenciales'}
                                </DropdownMenuItem>
                                {inv.metodo === 'email' && (
                                  <DropdownMenuItem onClick={() => handleReenviar(inv.id)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Reenviar email
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => setInvitacionACancelar(inv.id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar invitación
                                </DropdownMenuItem>
                              </>
                            )}
                            {inv.estado === 'aceptada' && inv.fechaAceptacion && (
                              <DropdownMenuItem disabled>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aceptada el {format(new Date(inv.fechaAceptacion), 'dd/MM/yyyy', { locale: es })}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación de cancelación */}
      <AlertDialog open={!!invitacionACancelar} onOpenChange={() => setInvitacionACancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado no podrá usar esta invitación para registrarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar} className="bg-red-600 hover:bg-red-700">
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
