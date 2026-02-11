import { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Store, Monitor, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ModalSeleccionPuntoVenta, usePuntoVentaPreferido } from './ModalSeleccionPuntoVenta';
import { gerenteConfigApi, puntosVentaApi } from '../../services/api';

interface Marca {
  id: string;
  nombre: string;
  colorIdentidad: string;
}

interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  marcasDisponibles: Marca[];
  tpvsDisponibles: number;
  activo: boolean;
}

interface TPVInfo {
  id: string;
  numero: number;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
  usuario?: string;
  ultimaApertura?: string;
  marcas?: string[]; // Marcas configuradas en este terminal
}

interface ModalSeleccionTPVProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (puntoVentaId: string, tpvId: string, marcaSeleccionada?: string) => void;
}

export function ModalSeleccionTPV({ open, onOpenChange, onConfirmar }: ModalSeleccionTPVProps) {
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState<string>('');
  const [tpvSeleccionado, setTpvSeleccionado] = useState<string>('');
  const [modalPuntoVentaOpen, setModalPuntoVentaOpen] = useState(false);
  const [terminalSeleccionado, setTerminalSeleccionado] = useState<TPVInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([]);
  const [terminales, setTerminales] = useState<TPVInfo[]>([]);
  const [marcaMap, setMarcaMap] = useState<Record<string, Marca>>({});

  // Cargar PDVs y marcas desde backend (sin mocks)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([puntosVentaApi.getAll(), gerenteConfigApi.empresas.list()])
      .then(([pdvs, empresas]) => {
        if (cancelled) return;
        setPuntosVenta(
          (pdvs || []).map((p) => ({
            id: p.id,
            nombre: p.nombre,
            direccion: p.direccion,
            marcasDisponibles: (p.marcasIds || []).map((mid) => ({
              id: mid,
              nombre: mid,
              colorIdentidad: '#0d9488',
            })),
            tpvsDisponibles: 0,
            activo: p.activo,
          })),
        );

        const mm: Record<string, Marca> = {};
        (empresas || []).forEach((e: any) => {
          (e?.marcas || []).forEach((m: any) => {
            if (m?.id) {
              mm[String(m.id)] = {
                id: String(m.id),
                nombre: String(m.nombre || m.id),
                colorIdentidad: String(m.colorIdentidad || '#0d9488'),
              };
            }
          });
        });
        setMarcaMap(mm);
      })
      .catch((e) => {
        console.error('Error cargando PDVs/marcas:', e);
        if (!cancelled) setPuntosVenta([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Cargar terminales para PDV seleccionado (si no hay, crear por defecto)
  useEffect(() => {
    if (!open || !puntoVentaSeleccionado) {
      setTerminales([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const ensureDefaults = async () => {
      const list = await gerenteConfigApi.terminales.list({ puntoVentaId: puntoVentaSeleccionado });
      if (list.length > 0) return list;

      // Crear 3 terminales por defecto (persistentes)
      const created: any[] = [];
      for (let i = 1; i <= 3; i++) {
        const id = `${puntoVentaSeleccionado}-TPV${i}`;
        const terminal = await gerenteConfigApi.terminales.upsert({
          id,
          puntoVentaId: puntoVentaSeleccionado,
          numero: i,
          nombre: `Terminal ${i}${i === 1 ? ' - Principal' : ''}`,
          tipo: i === 1 ? 'principal' : 'secundario',
          estado: 'disponible',
          marcas: [],
          activo: true,
        });
        if (terminal) created.push(terminal);
      }
      return created;
    };

    ensureDefaults()
      .then((list) => {
        if (cancelled) return;
        setTerminales(
          (list || []).map((t: any) => ({
            id: t.id,
            numero: Number(t.numero || 0),
            estado: (t.estado || 'disponible') as any,
            usuario: undefined,
            ultimaApertura: t.ultimaApertura || undefined,
            marcas: Array.isArray(t.marcas) ? t.marcas.map(String) : [],
          })),
        );
      })
      .catch((e) => {
        console.error('Error cargando terminales:', e);
        if (!cancelled) setTerminales([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, puntoVentaSeleccionado]);

  const tpvsDisponibles = terminales;
  const { getPreferencia } = usePuntoVentaPreferido(tpvSeleccionado);

  const handleConfirmar = () => {
    if (puntoVentaSeleccionado && tpvSeleccionado) {
      const terminal = tpvsDisponibles.find(t => t.id === tpvSeleccionado);
      
      // Si el terminal tiene múltiples marcas, verificar preferencia o mostrar modal
      if (terminal && terminal.marcas && terminal.marcas.length > 1) {
        const preferencia = getPreferencia();
        
        if (preferencia) {
          // Hay preferencia guardada, usar directamente
          onConfirmar(puntoVentaSeleccionado, tpvSeleccionado, preferencia);
          onOpenChange(false);
          resetSelections();
        } else {
          // No hay preferencia, mostrar modal de selección
          setTerminalSeleccionado(terminal);
          setModalPuntoVentaOpen(true);
        }
      } else {
        // Terminal con una sola marca, confirmar directamente
        const marca = terminal?.marcas?.[0];
        onConfirmar(puntoVentaSeleccionado, tpvSeleccionado, marca);
        onOpenChange(false);
        resetSelections();
      }
    }
  };

  const resetSelections = () => {
    setPuntoVentaSeleccionado('');
    setTpvSeleccionado('');
    setTerminalSeleccionado(null);
  };

  const handleCancelar = () => {
    onOpenChange(false);
    resetSelections();
  };

  const handleConfirmarPuntoVenta = (marcaId: string, recordar: boolean) => {
    if (recordar && tpvSeleccionado) {
      // Guardar preferencia
      const { guardarPreferencia } = usePuntoVentaPreferido(tpvSeleccionado);
      guardarPreferencia(marcaId);
    }
    
    // Confirmar con la marca seleccionada
    onConfirmar(puntoVentaSeleccionado, tpvSeleccionado, marcaId);
    setModalPuntoVentaOpen(false);
    onOpenChange(false);
    resetSelections();
  };

  // Mapear marcas disponibles para el modal de selección
  const getPuntosVentaParaModal = () => {
    if (!terminalSeleccionado || !terminalSeleccionado.marcas || !puntoVentaSeleccionado) return [];
    
    // Obtener el punto de venta físico seleccionado
    const puntoVentaFisico = puntosVenta.find(pv => pv.id === puntoVentaSeleccionado);
    if (!puntoVentaFisico) return [];
    
    // Mapear cada marca disponible en el terminal
    return terminalSeleccionado.marcas.map(marcaNombre => {
      const marcaInfo =
        marcaMap[String(marcaNombre)] ||
        puntoVentaFisico.marcasDisponibles.find(m => m.id === marcaNombre || m.nombre === marcaNombre);
      return {
        id: marcaInfo?.id || marcaNombre,
        nombre: `${marcaNombre} - ${puntoVentaFisico.nombre}`,
        marca: marcaInfo?.nombre || marcaNombre,
        direccion: puntoVentaFisico.direccion
      };
    });
  };

  const getEstadoIcon = (estado: TPVInfo['estado']) => {
    switch (estado) {
      case 'disponible':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'ocupado':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'mantenimiento':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
  };

  const getEstadoLabel = (estado: TPVInfo['estado']) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible';
      case 'ocupado':
        return 'Ocupado';
      case 'mantenimiento':
        return 'Mantenimiento';
    }
  };

  const getEstadoColor = (estado: TPVInfo['estado']) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ocupado':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'mantenimiento':
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Store className="h-6 w-6 text-primary" />
              Selección de Punto de Venta y TPV
            </DialogTitle>
            <DialogDescription>
              Selecciona el punto de venta y el terminal TPV donde deseas abrir caja
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Paso 1: Selección de Punto de Venta */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Paso 1: Selecciona el Punto de Venta
            </Label>
            <RadioGroup value={puntoVentaSeleccionado} onValueChange={setPuntoVentaSeleccionado}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {puntosVenta.map((pv) => (
                  <Card
                    key={pv.id}
                    className={`cursor-pointer transition-all ${
                      puntoVentaSeleccionado === pv.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setPuntoVentaSeleccionado(pv.id);
                      setTpvSeleccionado(''); // Reset TPV selection when changing PV
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={pv.id} id={pv.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="w-full">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Label htmlFor={pv.id} className="cursor-pointer font-medium">
                                {pv.nombre}
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{pv.direccion}</p>
                            {/* Mostrar marcas disponibles */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {pv.marcasDisponibles.map((marca) => (
                                <Badge 
                                  key={marca.id} 
                                  variant="outline" 
                                  className="text-xs flex items-center gap-1.5"
                                  style={{ borderColor: marca.colorIdentidad }}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: marca.colorIdentidad }}
                                  />
                                  {marca.nombre}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {pv.tpvsDisponibles} TPVs disponibles
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Paso 2: Selección de TPV */}
          {puntoVentaSeleccionado && (
            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
              <Label className="text-base flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Paso 2: Selecciona el Terminal TPV
              </Label>
              <RadioGroup value={tpvSeleccionado} onValueChange={setTpvSeleccionado}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tpvsDisponibles.map((tpv) => (
                    <Card
                      key={tpv.id}
                      className={`cursor-pointer transition-all ${
                        tpv.estado === 'disponible'
                          ? tpvSeleccionado === tpv.id
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:border-gray-400'
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (tpv.estado === 'disponible') {
                          setTpvSeleccionado(tpv.id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={tpv.id}
                            id={tpv.id}
                            disabled={tpv.estado !== 'disponible'}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <Label
                                htmlFor={tpv.id}
                                className={`cursor-pointer font-medium ${
                                  tpv.estado !== 'disponible' ? 'cursor-not-allowed' : ''
                                }`}
                              >
                                TPV {tpv.numero}
                              </Label>
                              {getEstadoIcon(tpv.estado)}
                            </div>
                            <Badge
                              variant="outline"
                              className={`mt-2 text-xs ${getEstadoColor(tpv.estado)}`}
                            >
                              {getEstadoLabel(tpv.estado)}
                            </Badge>
                            {tpv.usuario && (
                              <p className="text-xs text-gray-600 mt-2">Usuario: {tpv.usuario}</p>
                            )}
                            {tpv.ultimaApertura && (
                              <p className="text-xs text-gray-500 mt-1">
                                Última apertura: {tpv.ultimaApertura}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!puntoVentaSeleccionado || !tpvSeleccionado}
          >
            Abrir Caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Modal de selección de punto de venta para terminales multimarca */}
    <ModalSeleccionPuntoVenta
      open={modalPuntoVentaOpen}
      onOpenChange={setModalPuntoVentaOpen}
      onConfirmar={handleConfirmarPuntoVenta}
      terminalId={tpvSeleccionado}
      puntosVentaDisponibles={getPuntosVentaParaModal()}
    />
  </>
  );
}
