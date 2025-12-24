import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronRight, ChevronDown, Building2, Tag, Store, Check, Filter, Calendar, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

// ============================================================================
// TIPOS DE DATOS
// ============================================================================

export interface SelectedContext {
  empresa_id: string;
  marca_id: string | null;
  punto_venta_id: string | null;
}

export interface FiltroAdicional {
  periodo: PeriodoFiltro;
  canales: string[];
  estados: string[];
  tipo: string | null;
}

export interface PeriodoFiltro {
  tipo: 'ultimos_30_dias' | 'este_mes' | 'mes_pasado' | 'este_trimestre' | 'este_año' | 'personalizado';
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface FiltroUniversalData {
  selectedContext: SelectedContext[];
  filtrosAdicionales: FiltroAdicional;
}

interface Empresa {
  empresa_id: string;
  codigo_empresa: string;
  nombre: string;
  marcas: Marca[];
}

interface Marca {
  marca_id: string;
  codigo_marca: string;
  nombre: string;
  empresa_id: string;
  puntos_venta: PuntoVenta[];
}

interface PuntoVenta {
  punto_venta_id: string;
  codigo_punto_venta: string;
  nombre_comercial: string;
  marca_id: string;
  empresa_id: string;
}

interface FiltroUniversalUDARProps {
  empresas?: Empresa[];
  selectedContext: SelectedContext[];
  filtrosAdicionales: FiltroAdicional;
  onChange: (newData: FiltroUniversalData) => void;
  
  // Configuración de módulo específico
  moduloConfig?: {
    mostrarPeriodo?: boolean;
    mostrarCanales?: boolean;
    mostrarEstados?: boolean;
    mostrarTipo?: boolean;
    opcionesCanales?: { value: string; label: string; }[];
    opcionesEstados?: { value: string; label: string; }[];
    opcionesTipo?: { value: string; label: string; }[];
  };
}

// ============================================================================
// DATOS MOCK (reemplazar con llamada a API/BBDD)
// ============================================================================

const EMPRESAS_MOCK: Empresa[] = [
  {
    empresa_id: 'EMP-001',
    codigo_empresa: 'DIS-001',
    nombre: 'Disarmink S.L.',
    marcas: [
      {
        marca_id: 'MRC-001',
        codigo_marca: 'MRC-MIO',
        nombre: 'Modomio',
        empresa_id: 'EMP-001',
        puntos_venta: [
          {
            punto_venta_id: 'PDV-TIANA',
            codigo_punto_venta: 'PDV-TIANA',
            nombre_comercial: 'Tiana',
            marca_id: 'MRC-001',
            empresa_id: 'EMP-001'
          },
          {
            punto_venta_id: 'PDV-BADALONA',
            codigo_punto_venta: 'PDV-BADALONA',
            nombre_comercial: 'Badalona',
            marca_id: 'MRC-001',
            empresa_id: 'EMP-001'
          }
        ]
      },
      {
        marca_id: 'MRC-002',
        codigo_marca: 'MRC-BBG',
        nombre: 'Blackburguer',
        empresa_id: 'EMP-001',
        puntos_venta: [
          {
            punto_venta_id: 'PDV-TIANA',
            codigo_punto_venta: 'PDV-TIANA',
            nombre_comercial: 'Tiana',
            marca_id: 'MRC-002',
            empresa_id: 'EMP-001'
          },
          {
            punto_venta_id: 'PDV-BADALONA',
            codigo_punto_venta: 'PDV-BADALONA',
            nombre_comercial: 'Badalona',
            marca_id: 'MRC-002',
            empresa_id: 'EMP-001'
          }
        ]
      }
    ]
  },
  {
    empresa_id: 'EMP-002',
    codigo_empresa: 'EMP-002',
    nombre: 'Eventos (PAU)',
    marcas: [
      {
        marca_id: 'MRC-003',
        codigo_marca: 'MRC-003',
        nombre: 'Catering Premium',
        empresa_id: 'EMP-002',
        puntos_venta: [
          {
            punto_venta_id: 'PDV-BCN',
            codigo_punto_venta: 'PDV-BCN',
            nombre_comercial: 'Barcelona Centro',
            marca_id: 'MRC-003',
            empresa_id: 'EMP-002'
          }
        ]
      }
    ]
  },
  {
    empresa_id: 'EMP-003',
    codigo_empresa: 'EMP-003',
    nombre: 'Construcción (PAU)',
    marcas: [
      {
        marca_id: 'MRC-004',
        codigo_marca: 'MRC-004',
        nombre: 'Obras y Reformas',
        empresa_id: 'EMP-003',
        puntos_venta: [
          {
            punto_venta_id: 'PDV-OF-BCN',
            codigo_punto_venta: 'PDV-OF-BCN',
            nombre_comercial: 'Oficina Barcelona',
            marca_id: 'MRC-004',
            empresa_id: 'EMP-003'
          }
        ]
      }
    ]
  }
];

const CANALES_DEFAULT = [
  { value: 'mostrador', label: 'Mostrador' },
  { value: 'app', label: 'App móvil' },
  { value: 'web', label: 'Web' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'delivery', label: 'Delivery (3ros)' }
];

const ESTADOS_DEFAULT = [
  { value: 'activo', label: 'Activo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function FiltroUniversalUDAR({
  empresas = EMPRESAS_MOCK,
  selectedContext,
  filtrosAdicionales,
  onChange,
  moduloConfig = {
    mostrarPeriodo: true,
    mostrarCanales: true,
    mostrarEstados: false,
    mostrarTipo: false,
    opcionesCanales: CANALES_DEFAULT,
    opcionesEstados: ESTADOS_DEFAULT,
    opcionesTipo: []
  }
}: FiltroUniversalUDARProps) {
  const [open, setOpen] = useState(false);
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [expandedMarcas, setExpandedMarcas] = useState<string[]>([]);

  // Estados para filtros adicionales
  const [periodo, setPeriodo] = useState<PeriodoFiltro>(filtrosAdicionales.periodo);
  const [canalesSeleccionados, setCanalesSeleccionados] = useState<string[]>(filtrosAdicionales.canales);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>(filtrosAdicionales.estados);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(filtrosAdicionales.tipo);

  // ============================================================================
  // LÓGICA DE SELECCIÓN DE CONTEXTO
  // ============================================================================

  const isEmpresaFullySelected = (empresaId: string): boolean => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;

    const hasEmpresaWideSelection = selectedContext.some(
      ctx => ctx.empresa_id === empresaId && ctx.marca_id === null && ctx.punto_venta_id === null
    );
    
    if (hasEmpresaWideSelection) return true;
    if (empresa.marcas.length === 0) return false;
    
    return empresa.marcas.every(marca => isMarcaFullySelected(empresaId, marca.marca_id));
  };

  const isMarcaFullySelected = (empresaId: string, marcaId: string): boolean => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;
    
    const marca = empresa.marcas.find(m => m.marca_id === marcaId);
    if (!marca) return false;

    const hasMarcaWideSelection = selectedContext.some(
      ctx => ctx.empresa_id === empresaId && ctx.marca_id === marcaId && ctx.punto_venta_id === null
    );
    
    if (hasMarcaWideSelection) return true;
    if (marca.puntos_venta.length === 0) return false;
    
    return marca.puntos_venta.every(pdv => 
      isPuntoVentaSelected(empresaId, marcaId, pdv.punto_venta_id)
    );
  };

  const isPuntoVentaSelected = (empresaId: string, marcaId: string, pdvId: string): boolean => {
    return selectedContext.some(
      ctx => ctx.empresa_id === empresaId && 
             ctx.marca_id === marcaId && 
             ctx.punto_venta_id === pdvId
    );
  };

  const isEmpresaPartiallySelected = (empresaId: string): boolean => {
    if (isEmpresaFullySelected(empresaId)) return false;
    
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;

    return empresa.marcas.some(marca => 
      isMarcaFullySelected(empresaId, marca.marca_id) || 
      isMarcaPartiallySelected(empresaId, marca.marca_id)
    );
  };

  const isMarcaPartiallySelected = (empresaId: string, marcaId: string): boolean => {
    if (isMarcaFullySelected(empresaId, marcaId)) return false;
    
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;
    
    const marca = empresa.marcas.find(m => m.marca_id === marcaId);
    if (!marca) return false;

    return marca.puntos_venta.some(pdv => 
      isPuntoVentaSelected(empresaId, marcaId, pdv.punto_venta_id)
    );
  };

  // ============================================================================
  // HANDLERS DE SELECCIÓN
  // ============================================================================

  const handleToggleEmpresa = (empresaId: string) => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return;

    const isCurrentlySelected = isEmpresaFullySelected(empresaId);
    let newContext: SelectedContext[];

    if (isCurrentlySelected) {
      newContext = selectedContext.filter(ctx => ctx.empresa_id !== empresaId);
    } else {
      newContext = selectedContext.filter(ctx => ctx.empresa_id !== empresaId);
      newContext.push({
        empresa_id: empresaId,
        marca_id: null,
        punto_venta_id: null
      });
    }

    emitChange(newContext);
  };

  const handleToggleMarca = (empresaId: string, marcaId: string) => {
    const isCurrentlySelected = isMarcaFullySelected(empresaId, marcaId);
    let newContext: SelectedContext[];

    if (isCurrentlySelected) {
      newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && (ctx.marca_id === marcaId || ctx.marca_id === null))
      );
    } else {
      newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === marcaId)
      );
      
      newContext = newContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === null)
      );
      
      newContext.push({
        empresa_id: empresaId,
        marca_id: marcaId,
        punto_venta_id: null
      });
    }

    emitChange(newContext);
  };

  const handleTogglePuntoVenta = (empresaId: string, marcaId: string, pdvId: string) => {
    const isCurrentlySelected = isPuntoVentaSelected(empresaId, marcaId, pdvId);
    let newContext: SelectedContext[];

    if (isCurrentlySelected) {
      newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === marcaId && ctx.punto_venta_id === pdvId)
      );
    } else {
      newContext = [...selectedContext];
      
      newContext = newContext.filter(
        ctx => !(
          ctx.empresa_id === empresaId && 
          (ctx.marca_id === null || (ctx.marca_id === marcaId && ctx.punto_venta_id === null))
        )
      );
      
      newContext.push({
        empresa_id: empresaId,
        marca_id: marcaId,
        punto_venta_id: pdvId
      });
    }

    emitChange(newContext);
  };

  // ============================================================================
  // HANDLERS DE FILTROS ADICIONALES
  // ============================================================================

  const handlePeriodoChange = (tipo: string) => {
    const nuevoPeriodo: PeriodoFiltro = {
      tipo: tipo as any,
      fecha_inicio: null,
      fecha_fin: null
    };

    // Calcular fechas automáticas según el tipo
    const hoy = new Date();
    
    switch (tipo) {
      case 'ultimos_30_dias':
        nuevoPeriodo.fecha_fin = hoy.toISOString().split('T')[0];
        const hace30 = new Date(hoy);
        hace30.setDate(hace30.getDate() - 30);
        nuevoPeriodo.fecha_inicio = hace30.toISOString().split('T')[0];
        break;
      case 'este_mes':
        nuevoPeriodo.fecha_inicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
        nuevoPeriodo.fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'mes_pasado':
        const mesPasado = new Date(hoy);
        mesPasado.setMonth(mesPasado.getMonth() - 1);
        nuevoPeriodo.fecha_inicio = `${mesPasado.getFullYear()}-${String(mesPasado.getMonth() + 1).padStart(2, '0')}-01`;
        const ultimoDia = new Date(mesPasado.getFullYear(), mesPasado.getMonth() + 1, 0);
        nuevoPeriodo.fecha_fin = ultimoDia.toISOString().split('T')[0];
        break;
    }

    setPeriodo(nuevoPeriodo);
    emitChange(selectedContext, nuevoPeriodo, canalesSeleccionados, estadosSeleccionados, tipoSeleccionado);
  };

  const handleCanalToggle = (canal: string) => {
    const nuevosCanales = canalesSeleccionados.includes(canal)
      ? canalesSeleccionados.filter(c => c !== canal)
      : [...canalesSeleccionados, canal];
    
    setCanalesSeleccionados(nuevosCanales);
    emitChange(selectedContext, periodo, nuevosCanales, estadosSeleccionados, tipoSeleccionado);
  };

  const handleEstadoToggle = (estado: string) => {
    const nuevosEstados = estadosSeleccionados.includes(estado)
      ? estadosSeleccionados.filter(e => e !== estado)
      : [...estadosSeleccionados, estado];
    
    setEstadosSeleccionados(nuevosEstados);
    emitChange(selectedContext, periodo, canalesSeleccionados, nuevosEstados, tipoSeleccionado);
  };

  // ============================================================================
  // HELPERS DE EXPANSIÓN
  // ============================================================================

  const toggleEmpresaExpansion = (empresaId: string) => {
    setExpandedEmpresas(prev => 
      prev.includes(empresaId) 
        ? prev.filter(id => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  const toggleMarcaExpansion = (marcaId: string) => {
    setExpandedMarcas(prev => 
      prev.includes(marcaId) 
        ? prev.filter(id => id !== marcaId)
        : [...prev, marcaId]
    );
  };

  // ============================================================================
  // HELPERS DE VISUALIZACIÓN
  // ============================================================================

  const getSelectionSummary = (): string => {
    if (selectedContext.length === 0) {
      return 'Todas las empresas';
    }

    const empresasUnicas = new Set(selectedContext.map(ctx => ctx.empresa_id));
    const marcasUnicas = new Set(
      selectedContext
        .filter(ctx => ctx.marca_id !== null)
        .map(ctx => `${ctx.empresa_id}-${ctx.marca_id}`)
    );
    const pdvsUnicos = new Set(
      selectedContext
        .filter(ctx => ctx.punto_venta_id !== null)
        .map(ctx => `${ctx.empresa_id}-${ctx.marca_id}-${ctx.punto_venta_id}`)
    );

    const parts: string[] = [];
    
    if (empresasUnicas.size > 0 && selectedContext.some(ctx => ctx.marca_id === null)) {
      parts.push(`${empresasUnicas.size} empresa${empresasUnicas.size > 1 ? 's' : ''}`);
    }
    if (marcasUnicas.size > 0) {
      parts.push(`${marcasUnicas.size} marca${marcasUnicas.size > 1 ? 's' : ''}`);
    }
    if (pdvsUnicos.size > 0) {
      parts.push(`${pdvsUnicos.size} PDV${pdvsUnicos.size > 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'Selección personalizada';
  };

  const getFiltrosActivosCount = (): number => {
    let count = selectedContext.length > 0 ? 1 : 0;
    if (canalesSeleccionados.length > 0) count++;
    if (estadosSeleccionados.length > 0) count++;
    if (tipoSeleccionado) count++;
    return count;
  };

  const getPeriodoLabel = (): string => {
    switch (periodo.tipo) {
      case 'ultimos_30_dias': return 'Últimos 30 días';
      case 'este_mes': return 'Este mes';
      case 'mes_pasado': return 'Mes pasado';
      case 'este_trimestre': return 'Este trimestre';
      case 'este_año': return 'Este año';
      case 'personalizado': return 'Personalizado';
      default: return 'Seleccionar periodo';
    }
  };

  // ============================================================================
  // ACCIONES RÁPIDAS
  // ============================================================================

  const handleSeleccionarTodo = () => {
    emitChange([]);
  };

  const handleLimpiarSeleccion = () => {
    emitChange([]);
    setCanalesSeleccionados([]);
    setEstadosSeleccionados([]);
    setTipoSeleccionado(null);
  };

  // ============================================================================
  // EMIT CHANGE
  // ============================================================================

  const emitChange = (
    newContext: SelectedContext[],
    newPeriodo: PeriodoFiltro = periodo,
    newCanales: string[] = canalesSeleccionados,
    newEstados: string[] = estadosSeleccionados,
    newTipo: string | null = tipoSeleccionado
  ) => {
    onChange({
      selectedContext: newContext,
      filtrosAdicionales: {
        periodo: newPeriodo,
        canales: newCanales,
        estados: newEstados,
        tipo: newTipo
      }
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Botón principal del filtro */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full sm:min-w-[280px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="truncate">{getSelectionSummary()}</span>
            </div>
            {getFiltrosActivosCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-teal-600 text-white">
                {getFiltrosActivosCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[95vw] sm:w-[500px] p-0" align="start">
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-semibold text-sm mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Filtro Universal UDAR
              </h4>
              <div className="flex gap-2 mb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSeleccionarTodo}
                  className="flex-1"
                >
                  Todas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLimpiarSeleccion}
                  className="flex-1"
                >
                  Limpiar
                </Button>
              </div>

              {/* Periodo */}
              {moduloConfig.mostrarPeriodo && (
                <div className="mb-3">
                  <Label className="text-xs text-gray-600 mb-1 block">Periodo</Label>
                  <Select value={periodo.tipo} onValueChange={handlePeriodoChange}>
                    <SelectTrigger className="w-full h-9">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ultimos_30_dias">Últimos 30 días</SelectItem>
                      <SelectItem value="este_mes">Este mes</SelectItem>
                      <SelectItem value="mes_pasado">Mes pasado</SelectItem>
                      <SelectItem value="este_trimestre">Este trimestre</SelectItem>
                      <SelectItem value="este_año">Este año</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  {periodo.tipo === 'personalizado' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-xs text-gray-600">Desde</Label>
                        <Input 
                          type="date" 
                          className="h-8 text-xs"
                          value={periodo.fecha_inicio || ''}
                          onChange={(e) => {
                            const newPeriodo = { ...periodo, fecha_inicio: e.target.value };
                            setPeriodo(newPeriodo);
                            emitChange(selectedContext, newPeriodo, canalesSeleccionados, estadosSeleccionados, tipoSeleccionado);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Hasta</Label>
                        <Input 
                          type="date" 
                          className="h-8 text-xs"
                          value={periodo.fecha_fin || ''}
                          onChange={(e) => {
                            const newPeriodo = { ...periodo, fecha_fin: e.target.value };
                            setPeriodo(newPeriodo);
                            emitChange(selectedContext, newPeriodo, canalesSeleccionados, estadosSeleccionados, tipoSeleccionado);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Área de scroll: Contexto jerárquico */}
            <ScrollArea className="flex-1">
              <div className="p-3">
                <Label className="text-xs text-gray-600 mb-2 block uppercase tracking-wide">
                  Contexto de Negocio
                </Label>
                
                {empresas.map(empresa => (
                  <div key={empresa.empresa_id} className="mb-1">
                    {/* NIVEL 1: EMPRESA */}
                    <div className="flex items-center gap-1 hover:bg-gray-50 rounded p-2">
                      <button
                        onClick={() => toggleEmpresaExpansion(empresa.empresa_id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedEmpresas.includes(empresa.empresa_id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div 
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => handleToggleEmpresa(empresa.empresa_id)}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isEmpresaFullySelected(empresa.empresa_id)}
                            onChange={() => handleToggleEmpresa(empresa.empresa_id)}
                            className="w-4 h-4 cursor-pointer"
                            style={{
                              accentColor: isEmpresaPartiallySelected(empresa.empresa_id) ? '#f59e0b' : undefined
                            }}
                          />
                          {isEmpresaPartiallySelected(empresa.empresa_id) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-2 h-0.5 bg-orange-600" />
                            </div>
                          )}
                        </div>
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">
                          {empresa.nombre}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {empresa.codigo_empresa}
                        </Badge>
                      </div>
                    </div>

                    {/* NIVEL 2: MARCAS */}
                    {expandedEmpresas.includes(empresa.empresa_id) && (
                      <div className="ml-6 mt-1">
                        <div 
                          className="flex items-center gap-2 hover:bg-gray-50 rounded p-2 mb-1 cursor-pointer"
                          onClick={() => handleToggleEmpresa(empresa.empresa_id)}
                        >
                          <input
                            type="checkbox"
                            checked={isEmpresaFullySelected(empresa.empresa_id)}
                            onChange={() => handleToggleEmpresa(empresa.empresa_id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 italic">
                            Todas las marcas
                          </span>
                        </div>

                        {empresa.marcas.map(marca => (
                          <div key={marca.marca_id} className="mb-1">
                            <div className="flex items-center gap-1 hover:bg-gray-50 rounded p-2">
                              <button
                                onClick={() => toggleMarcaExpansion(marca.marca_id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {expandedMarcas.includes(marca.marca_id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              
                              <div 
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => handleToggleMarca(empresa.empresa_id, marca.marca_id)}
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={isMarcaFullySelected(empresa.empresa_id, marca.marca_id)}
                                    onChange={() => handleToggleMarca(empresa.empresa_id, marca.marca_id)}
                                    className="w-4 h-4 cursor-pointer"
                                    style={{
                                      accentColor: isMarcaPartiallySelected(empresa.empresa_id, marca.marca_id) ? '#f59e0b' : undefined
                                    }}
                                  />
                                  {isMarcaPartiallySelected(empresa.empresa_id, marca.marca_id) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-2 h-0.5 bg-orange-600" />
                                    </div>
                                  )}
                                </div>
                                <Tag className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">
                                  {marca.nombre}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {marca.codigo_marca}
                                </Badge>
                              </div>
                            </div>

                            {/* NIVEL 3: PUNTOS DE VENTA */}
                            {expandedMarcas.includes(marca.marca_id) && (
                              <div className="ml-6 mt-1">
                                <div 
                                  className="flex items-center gap-2 hover:bg-gray-50 rounded p-2 mb-1 cursor-pointer"
                                  onClick={() => handleToggleMarca(empresa.empresa_id, marca.marca_id)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isMarcaFullySelected(empresa.empresa_id, marca.marca_id)}
                                    onChange={() => handleToggleMarca(empresa.empresa_id, marca.marca_id)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                  <Store className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 italic">
                                    Todos los puntos de venta
                                  </span>
                                </div>

                                {marca.puntos_venta.map(pdv => (
                                  <div 
                                    key={pdv.punto_venta_id}
                                    className="flex items-center gap-2 hover:bg-gray-50 rounded p-2 ml-6 cursor-pointer"
                                    onClick={() => handleTogglePuntoVenta(empresa.empresa_id, marca.marca_id, pdv.punto_venta_id)}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isPuntoVentaSelected(empresa.empresa_id, marca.marca_id, pdv.punto_venta_id)}
                                      onChange={() => handleTogglePuntoVenta(empresa.empresa_id, marca.marca_id, pdv.punto_venta_id)}
                                      className="w-4 h-4 cursor-pointer"
                                    />
                                    <Store className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">
                                      {pdv.nombre_comercial}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {pdv.codigo_punto_venta}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* CANALES */}
                {moduloConfig.mostrarCanales && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs text-gray-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                      <ShoppingCart className="w-3 h-3" />
                      Canales de Venta
                    </Label>
                    <div className="space-y-2">
                      {moduloConfig.opcionesCanales?.map(canal => (
                        <div 
                          key={canal.value}
                          className="flex items-center gap-2 hover:bg-gray-50 rounded p-2 cursor-pointer"
                          onClick={() => handleCanalToggle(canal.value)}
                        >
                          <Checkbox
                            checked={canalesSeleccionados.includes(canal.value)}
                            onCheckedChange={() => handleCanalToggle(canal.value)}
                          />
                          <span className="text-sm">{canal.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ESTADOS */}
                {moduloConfig.mostrarEstados && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs text-gray-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Estados
                    </Label>
                    <div className="space-y-2">
                      {moduloConfig.opcionesEstados?.map(estado => (
                        <div 
                          key={estado.value}
                          className="flex items-center gap-2 hover:bg-gray-50 rounded p-2 cursor-pointer"
                          onClick={() => handleEstadoToggle(estado.value)}
                        >
                          <Checkbox
                            checked={estadosSeleccionados.includes(estado.value)}
                            onCheckedChange={() => handleEstadoToggle(estado.value)}
                          />
                          <span className="text-sm">{estado.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TIPO */}
                {moduloConfig.mostrarTipo && moduloConfig.opcionesTipo && moduloConfig.opcionesTipo.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-xs text-gray-600 mb-2 block">Tipo</Label>
                    <Select value={tipoSeleccionado || ''} onValueChange={setTipoSeleccionado}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduloConfig.opcionesTipo.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">
                <strong>Filtros activos:</strong> {getSelectionSummary()}
                {canalesSeleccionados.length > 0 && ` • ${canalesSeleccionados.length} canales`}
                {estadosSeleccionados.length > 0 && ` • ${estadosSeleccionados.length} estados`}
              </div>
              <Button 
                onClick={() => setOpen(false)} 
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges de filtros activos */}
      {selectedContext.length > 0 && (
        <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
          {getSelectionSummary()}
        </Badge>
      )}
      {canalesSeleccionados.length > 0 && (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          {canalesSeleccionados.length} canal{canalesSeleccionados.length > 1 ? 'es' : ''}
        </Badge>
      )}
      {estadosSeleccionados.length > 0 && (
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
          {estadosSeleccionados.length} estado{estadosSeleccionados.length > 1 ? 's' : ''}
        </Badge>
      )}
      {periodo.tipo !== 'este_mes' && (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
          <Calendar className="w-3 h-3 mr-1" />
          {getPeriodoLabel()}
        </Badge>
      )}
    </div>
  );
}
