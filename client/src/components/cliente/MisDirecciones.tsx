/**
 * 📍 GESTIÓN DE DIRECCIONES DEL CLIENTE
 * 
 * Componente para gestionar las direcciones guardadas del cliente.
 * Se puede acceder desde:
 * - Configuración > Cuenta > Mis Direcciones
 * - Modal de confirmación de pedido (seleccionar/añadir dirección)
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  MapPin,
  Home,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Check,
  Navigation,
  Star
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { clientesApi, type DireccionCreateInput, type DireccionUpdateInput } from '../../services/api/clientes.api';

// ============================================
// INTERFACES
// ============================================

export interface Direccion {
  id: number;
  tipo: 'casa' | 'trabajo' | 'otro';
  alias?: string;
  calle: string;
  numero: string;
  piso?: string;
  puerta?: string;
  codigoPostal: string;
  ciudad: string;
  provincia?: string;
  pais: string;
  notas?: string;
  latitud?: number;
  longitud?: number;
  esPredeterminada: boolean;
  fechaCreacion: string;
  fechaUltimoUso?: string;
}

interface MisDireccionesProps {
  clienteId?: string;
  onSeleccionarDireccion?: (direccion: Direccion) => void;
  direccionSeleccionada?: Direccion | null; // dirección actualmente seleccionada
  modoSeleccion?: boolean; // true cuando se llama desde modal de checkout
  compacto?: boolean; // true para vista compacta
}

// ============================================
// DATOS MOCK
// ============================================

// Nota: este módulo ahora persiste en backend (no mock).

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function MisDirecciones({ 
  clienteId,
  onSeleccionarDireccion,
  direccionSeleccionada = null,
  modoSeleccion = false,
  compacto = false
}: MisDireccionesProps) {
  console.log('[MIS DIRECCIONES] Componente montado. Modo:', { modoSeleccion, compacto });
  const clienteIdStr = useMemo(() => (clienteId !== undefined ? String(clienteId) : ''), [clienteId]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  console.log('[MIS DIRECCIONES] Direcciones cargadas:', direcciones.length);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [direccionEditando, setDireccionEditando] = useState<Direccion | null>(null);
  const [geolocalizando, setGeolocalizando] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Direccion>>({
    tipo: 'casa',
    pais: 'España',
    esPredeterminada: false
  });

  const refreshDirecciones = async () => {
    if (!clienteIdStr) return;
    setLoading(true);
    try {
      const dirs = await clientesApi.getDirecciones(clienteIdStr);
      setDirecciones(dirs as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDirecciones();
  }, [clienteIdStr]);

  // ============================================
  // FUNCIONES
  // ============================================

  const handleNuevaDireccion = () => {
    setDireccionEditando(null);
    setFormData({
      tipo: 'casa',
      pais: 'España',
      esPredeterminada: direcciones.length === 0 // Primera dirección es predeterminada
    });
    setModalAbierto(true);
  };

  const handleEditarDireccion = (direccion: Direccion) => {
    setDireccionEditando(direccion);
    setFormData(direccion);
    setModalAbierto(true);
  };

  const handleEliminarDireccion = (id: number) => {
    const direccionId = Number(id);
    const direccion = direcciones.find(d => d.id === direccionId);
    if (!direccion) return;

    if (direccion.esPredeterminada && direcciones.length > 1) {
      toast.error('No puedes eliminar la dirección predeterminada. Marca otra como predeterminada primero.');
      return;
    }

    clientesApi
      .deleteDireccion(clienteIdStr, direccionId)
      .then((ok) => {
        if (ok) {
          toast.success('Dirección eliminada correctamente');
          return refreshDirecciones();
        }
      })
      .catch(() => {});
  };

  const handleEstablecerPredeterminada = (id: number) => {
    const direccionId = Number(id);
    const payload: DireccionUpdateInput = { esPredeterminada: true };
    clientesApi
      .updateDireccion(clienteIdStr, direccionId, payload)
      .then((updated) => {
        if (updated) {
          toast.success('Dirección predeterminada actualizada');
          return refreshDirecciones();
        }
      })
      .catch(() => {});
  };

  const handleGeolocalizar = () => {
    setGeolocalizando(true);
    
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      setGeolocalizando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // En una app real, aquí harías reverse geocoding para obtener la dirección
        setFormData({
          ...formData,
          latitud: latitude,
          longitud: longitude
        });
        
        toast.success('Ubicación obtenida correctamente');
        setGeolocalizando(false);
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        toast.error('No se pudo obtener tu ubicación. Por favor, permite el acceso.');
        setGeolocalizando(false);
      }
    );
  };

  const handleGuardarDireccion = async () => {
    if (!clienteIdStr) {
      toast.error('No se pudo determinar el cliente. Vuelve a iniciar sesión.');
      return;
    }
    // Validaciones
    if (!formData.calle || !formData.numero || !formData.codigoPostal || !formData.ciudad) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (direccionEditando) {
      const payload: DireccionUpdateInput = {
        tipo: formData.tipo,
        alias: formData.alias,
        calle: formData.calle,
        numero: formData.numero,
        piso: formData.piso,
        puerta: formData.puerta,
        codigoPostal: formData.codigoPostal,
        ciudad: formData.ciudad,
        provincia: formData.provincia,
        pais: formData.pais,
        notas: formData.notas,
        latitud: formData.latitud,
        longitud: formData.longitud,
        esPredeterminada: formData.esPredeterminada,
      };

      const updated = await clientesApi.updateDireccion(clienteIdStr, direccionEditando.id, payload);
      if (updated) {
        toast.success('Dirección actualizada correctamente');
        await refreshDirecciones();
      }
    } else {
      const payload: DireccionCreateInput = {
        tipo: formData.tipo || 'casa',
        alias: formData.alias ?? null,
        calle: formData.calle!,
        numero: formData.numero!,
        piso: formData.piso ?? null,
        puerta: formData.puerta ?? null,
        codigoPostal: formData.codigoPostal!,
        ciudad: formData.ciudad!,
        provincia: formData.provincia || formData.ciudad!,
        pais: formData.pais || 'España',
        notas: formData.notas ?? null,
        latitud: formData.latitud ?? null,
        longitud: formData.longitud ?? null,
        esPredeterminada: Boolean(formData.esPredeterminada),
      };

      const created = await clientesApi.createDireccion(clienteIdStr, payload);

      if (created) {
        toast.success('Dirección añadida correctamente');
        await refreshDirecciones();
      }
    }

    setModalAbierto(false);
  };

  const handleSeleccionar = (direccion: Direccion) => {
    if (onSeleccionarDireccion) {
      onSeleccionarDireccion(direccion);
      toast.success(`Dirección seleccionada: ${direccion.alias || direccion.calle}`);
    }
  };

  const formatearDireccionCompleta = (dir: Direccion): string => {
    let direccion = `${dir.calle} ${dir.numero}`;
    if (dir.piso) direccion += `, ${dir.piso}º`;
    if (dir.puerta) direccion += ` ${dir.puerta}`;
    direccion += `, ${dir.codigoPostal} ${dir.ciudad}`;
    return direccion;
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'casa': return <Home className="w-5 h-5" />;
      case 'trabajo': return <Briefcase className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-600">
        Cargando direcciones...
      </div>
    );
  }

  const direccionModal = (
    <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {direccionEditando ? 'Editar Dirección' : 'Nueva Dirección'}
          </DialogTitle>
          <DialogDescription>
            {direccionEditando 
              ? 'Modifica los datos de tu dirección'
              : 'Añade una nueva dirección de entrega'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo y Alias */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de dirección</Label>
              <select
                id="tipo"
                className="w-full p-2 border rounded-md"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'casa' | 'trabajo' | 'otro' })}
              >
                <option value="casa">Casa</option>
                <option value="trabajo">Trabajo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alias">Alias (opcional)</Label>
              <Input
                id="alias"
                placeholder="Ej: Mi casa, Oficina..."
                value={formData.alias || ''}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          {/* Botón de Geolocalización */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGeolocalizar}
            disabled={geolocalizando}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {geolocalizando ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </Button>

          {/* Calle y Número */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="calle">Calle *</Label>
              <Input
                id="calle"
                placeholder="Nombre de la calle"
                value={formData.calle || ''}
                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                placeholder="Nº"
                value={formData.numero || ''}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Piso y Puerta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="piso">Piso (opcional)</Label>
              <Input
                id="piso"
                placeholder="Ej: 3"
                value={formData.piso || ''}
                onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="puerta">Puerta (opcional)</Label>
              <Input
                id="puerta"
                placeholder="Ej: B"
                value={formData.puerta || ''}
                onChange={(e) => setFormData({ ...formData, puerta: e.target.value })}
              />
            </div>
          </div>

          {/* Código Postal y Ciudad */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">Código Postal *</Label>
              <Input
                id="codigoPostal"
                placeholder="28001"
                value={formData.codigoPostal || ''}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                placeholder="Madrid"
                value={formData.ciudad || ''}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Provincia y País */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia</Label>
              <Input
                id="provincia"
                placeholder="Madrid"
                value={formData.provincia || formData.ciudad || ''}
                onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais || 'España'}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              />
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales (opcional)</Label>
            <textarea
              id="notas"
              className="w-full p-2 border rounded-md min-h-[80px]"
              placeholder="Ej: Portero automático, código de acceso, instrucciones especiales..."
              value={formData.notas || ''}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>

          {/* Checkbox predeterminada */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="predeterminada"
              checked={formData.esPredeterminada || false}
              onChange={(e) => setFormData({ ...formData, esPredeterminada: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor="predeterminada" className="cursor-pointer">
              Establecer como dirección predeterminada
            </Label>
          </div>

          {formData.latitud && formData.longitud && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              ✓ Ubicación geolocalizada: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setModalAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarDireccion}>
            {direccionEditando ? 'Guardar Cambios' : 'Añadir Dirección'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (compacto) {
    // Vista compacta para el modal de checkout
    return (
      <>
        <div className="space-y-3">
          {direcciones.map(direccion => {
            const isSelected = direccionSeleccionada?.id === direccion.id;
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600'
                    }`}>
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        getIconoTipo(direccion.tipo)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{direccion.alias || direccion.tipo}</p>
                        {direccion.esPredeterminada && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Predeterminada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{formatearDireccionCompleta(direccion)}</p>
                      {direccion.notas && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{direccion.notas}</p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-teal-600 shrink-0" />
                  )}
                </div>
              </>
            );

            if (onSeleccionarDireccion) {
              return (
                <button
                  key={direccion.id}
                  onClick={() => handleSeleccionar(direccion)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={direccion.id}
                className={`w-full text-left p-4 border-2 rounded-lg ${
                  isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {content}
              </div>
            );
          })}
          
          <Button
            onClick={handleNuevaDireccion}
            variant="outline"
            className="w-full border-dashed border-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir nueva dirección
          </Button>
        </div>

        {direccionModal}
      </>
    );
  }

  // Vista completa para la página de configuración
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mis Direcciones
              </CardTitle>
              <CardDescription>
                Gestiona tus direcciones de entrega guardadas
              </CardDescription>
            </div>
            <Button onClick={handleNuevaDireccion}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Dirección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {direcciones.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tienes direcciones guardadas</p>
              <Button 
                onClick={handleNuevaDireccion} 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir primera dirección
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {direcciones.map(direccion => (
                <Card key={direccion.id} className={direccion.esPredeterminada ? 'border-2 border-yellow-300' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                        {getIconoTipo(direccion.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">
                                {direccion.alias || `Mi ${direccion.tipo}`}
                              </h3>
                              {direccion.esPredeterminada && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Star className="w-3 h-3 mr-1" />
                                  Predeterminada
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatearDireccionCompleta(direccion)}
                            </p>
                            {direccion.notas && (
                              <p className="text-xs text-gray-500 mt-1">
                                Notas: {direccion.notas}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditarDireccion(direccion)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEliminarDireccion(direccion.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {!direccion.esPredeterminada && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEstablecerPredeterminada(direccion.id)}
                            className="mt-2"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Establecer como predeterminada
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para añadir/editar dirección */}
      {direccionModal}
    </div>
  );
}
