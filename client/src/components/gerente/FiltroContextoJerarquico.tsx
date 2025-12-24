import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronRight, ChevronDown, Building2, Tag, Store, Check } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  EMPRESAS, 
  MARCAS, 
  PUNTOS_VENTA,
  getNombreEmpresa,
  getNombreMarca,
  getNombrePDV
} from '../../constants/empresaConfig';

// ============================================================================
// TIPOS DE DATOS
// ============================================================================

export interface SelectedContext {
  empresa_id: string;
  marca_id: string | null;
  punto_venta_id: string | null;
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

interface FiltroContextoJerarquicoProps {
  empresas?: Empresa[];  // ← Opcional, usa EMPRESAS_MOCK por defecto
  selectedContext: SelectedContext[];
  onChange: (newContext: SelectedContext[]) => void;
}

// ============================================================================
// DATOS MOCK - Transformados desde empresaConfig.ts
// ============================================================================

const EMPRESAS_MOCK: Empresa[] = Object.values(EMPRESAS).map(empresa => {
  // Obtener todas las marcas de la empresa
  const marcasEmpresa = empresa.marcasIds.map(marcaId => {
    const marca = MARCAS[marcaId];
    if (!marca) return null;
    
    // Obtener PDVs que tienen esta marca
    const puntosVentaMarca = empresa.puntosVentaIds
      .map(pdvId => PUNTOS_VENTA[pdvId])
      .filter(pdv => pdv && pdv.marcasDisponibles.includes(marcaId))
      .map(pdv => ({
        punto_venta_id: pdv.id,
        codigo_punto_venta: pdv.codigo,
        nombre_comercial: pdv.nombre,
        marca_id: marca.id,
        empresa_id: empresa.id
      }));
    
    return {
      marca_id: marca.id,
      codigo_marca: marca.codigo,
      nombre: marca.nombre,
      empresa_id: empresa.id,
      puntos_venta: puntosVentaMarca
    };
  }).filter(Boolean) as Marca[];
  
  return {
    empresa_id: empresa.id,
    codigo_empresa: empresa.codigo,
    nombre: getNombreEmpresa(empresa.id),
    marcas: marcasEmpresa
  };
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function FiltroContextoJerarquico({
  empresas = EMPRESAS_MOCK,
  selectedContext,
  onChange
}: FiltroContextoJerarquicoProps) {
  const [open, setOpen] = useState(false);
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [expandedMarcas, setExpandedMarcas] = useState<string[]>([]);

  // ⭐ Auto-expandir empresas y marcas cuando se abre el filtro
  useEffect(() => {
    if (open && expandedEmpresas.length === 0) {
      // Expandir todas las empresas
      const todasEmpresas = empresas.map(e => e.empresa_id);
      setExpandedEmpresas(todasEmpresas);
      
      // Expandir todas las marcas
      const todasMarcas = empresas.flatMap(e => e.marcas.map(m => m.marca_id));
      setExpandedMarcas(todasMarcas);
    }
  }, [open, empresas]);

  // ============================================================================
  // LÓGICA DE SELECCIÓN
  // ============================================================================

  // Verificar si toda una empresa está seleccionada
  const isEmpresaFullySelected = (empresaId: string): boolean => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;

    // Si existe una selección de toda la empresa (sin marca ni PDV específico)
    const hasEmpresaWideSelection = selectedContext.some(
      ctx => ctx.empresa_id === empresaId && ctx.marca_id === null && ctx.punto_venta_id === null
    );
    
    if (hasEmpresaWideSelection) return true;

    // O si todas las marcas y sus PDV están seleccionados
    if (empresa.marcas.length === 0) return false;
    
    return empresa.marcas.every(marca => isMarcaFullySelected(empresaId, marca.marca_id));
  };

  // Verificar si toda una marca está seleccionada
  const isMarcaFullySelected = (empresaId: string, marcaId: string): boolean => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (!empresa) return false;
    
    const marca = empresa.marcas.find(m => m.marca_id === marcaId);
    if (!marca) return false;

    // Si existe una selección de toda la marca (sin PDV específico)
    const hasMarcaWideSelection = selectedContext.some(
      ctx => ctx.empresa_id === empresaId && ctx.marca_id === marcaId && ctx.punto_venta_id === null
    );
    
    if (hasMarcaWideSelection) return true;

    // O si todos los PDV están seleccionados
    if (marca.puntos_venta.length === 0) return false;
    
    return marca.puntos_venta.every(pdv => 
      isPuntoVentaSelected(empresaId, marcaId, pdv.punto_venta_id)
    );
  };

  // Verificar si un punto de venta está seleccionado
  const isPuntoVentaSelected = (empresaId: string, marcaId: string, pdvId: string): boolean => {
    return selectedContext.some(
      ctx => ctx.empresa_id === empresaId && 
             ctx.marca_id === marcaId && 
             ctx.punto_venta_id === pdvId
    );
  };

  // Estado parcial (indeterminado) para checkboxes
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

    if (isCurrentlySelected) {
      // DESELECCIONAR: eliminar todos los contextos de esta empresa
      const newContext = selectedContext.filter(ctx => ctx.empresa_id !== empresaId);
      onChange(newContext);
    } else {
      // SELECCIONAR: eliminar contextos parciales y añadir selección total de empresa
      const newContext = selectedContext.filter(ctx => ctx.empresa_id !== empresaId);
      newContext.push({
        empresa_id: empresaId,
        marca_id: null,
        punto_venta_id: null
      });
      onChange(newContext);
    }
  };

  const handleToggleMarca = (empresaId: string, marcaId: string) => {
    const isCurrentlySelected = isMarcaFullySelected(empresaId, marcaId);

    if (isCurrentlySelected) {
      // DESELECCIONAR: eliminar todos los contextos de esta marca
      const newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && (ctx.marca_id === marcaId || ctx.marca_id === null))
      );
      onChange(newContext);
    } else {
      // SELECCIONAR: eliminar contextos parciales de esta marca y añadir selección total
      let newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === marcaId)
      );
      
      // Eliminar también selección total de empresa si existe
      newContext = newContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === null)
      );
      
      newContext.push({
        empresa_id: empresaId,
        marca_id: marcaId,
        punto_venta_id: null
      });
      onChange(newContext);
    }
  };

  const handleTogglePuntoVenta = (empresaId: string, marcaId: string, pdvId: string) => {
    const isCurrentlySelected = isPuntoVentaSelected(empresaId, marcaId, pdvId);

    if (isCurrentlySelected) {
      // DESELECCIONAR: eliminar este PDV específico
      const newContext = selectedContext.filter(
        ctx => !(ctx.empresa_id === empresaId && ctx.marca_id === marcaId && ctx.punto_venta_id === pdvId)
      );
      onChange(newContext);
    } else {
      // SELECCIONAR: añadir este PDV
      let newContext = [...selectedContext];
      
      // Eliminar selecciones más amplias que incluyan este PDV
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
      onChange(newContext);
    }
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

    // Contar elementos únicos
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
    
    if (empresasUnicas.size > 0) {
      parts.push(`${empresasUnicas.size} empresa${empresasUnicas.size > 1 ? 's' : ''}`);
    }
    if (marcasUnicas.size > 0) {
      parts.push(`${marcasUnicas.size} marca${marcasUnicas.size > 1 ? 's' : ''}`);
    }
    if (pdvsUnicos.size > 0) {
      parts.push(`${pdvsUnicos.size} PDV${pdvsUnicos.size > 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'Ninguna selección';
  };

  const getSelectedCount = (): number => {
    return selectedContext.length;
  };

  // ============================================================================
  // ACCIONES RÁPIDAS
  // ============================================================================

  const handleSeleccionarTodo = () => {
    onChange([]);
  };

  const handleLimpiarSeleccion = () => {
    onChange([]);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="min-w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="truncate">{getSelectionSummary()}</span>
          </div>
          {getSelectedCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getSelectedCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-4 border-b">
            <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Filtro de Contexto
            </h4>
            <div className="flex gap-2">
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
          </div>

          {/* Lista jerárquica */}
          <ScrollArea className="flex-1">
            <div className="p-2">
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
                        onClick={() => handleToggleMarca(empresa.empresa_id, 'TODAS')}
                      >
                        <input
                          type="checkbox"
                          checked={isEmpresaFullySelected(empresa.empresa_id)}
                          onChange={() => handleToggleMarca(empresa.empresa_id, 'TODAS')}
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
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">
              Selección actual: <strong>{getSelectionSummary()}</strong>
            </div>
            <Button 
              onClick={() => setOpen(false)} 
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// DOCUMENTACIÓN TÉCNICA
// ============================================================================

/*
INTEGRACIÓN CON MAKE / BBDD
============================

1. ESTRUCTURA DE DATOS ENVIADA A MAKE:
--------------------------------------
{
  "user_id": "uuid-pau",
  "rol_global": "GerenteGeneral",
  "selected_context": [
    {
      "empresa_id": "EMP-001",
      "marca_id": null,
      "punto_venta_id": null
    },
    {
      "empresa_id": "EMP-002",
      "marca_id": "MRC-003",
      "punto_venta_id": "PDV-BCN"
    }
  ],
  "timestamp": "2025-11-26T10:30:00Z"
}

2. INTERPRETACIÓN DE NULLABLES:
--------------------------------
• empresa_id: "EMP-001", marca_id: null, punto_venta_id: null
  → TODAS las marcas y PDV de EMP-001

• empresa_id: "EMP-001", marca_id: "MRC-001", punto_venta_id: null
  → TODOS los PDV de la marca MRC-001

• empresa_id: "EMP-001", marca_id: "MRC-001", punto_venta_id: "PDV-TIANA"
  → SOLO el PDV-TIANA de la marca MRC-001

• selected_context: []
  → TODAS las empresas, marcas y PDV (sin filtro)

3. QUERY SQL PARA FILTRAR DATOS:
---------------------------------
-- Función auxiliar para verificar si un registro cumple el filtro
CREATE OR REPLACE FUNCTION match_context_filter(
  p_empresa_id VARCHAR,
  p_marca_id VARCHAR,
  p_punto_venta_id VARCHAR,
  p_selected_context JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  context_item JSONB;
BEGIN
  -- Si no hay filtro, mostrar todo
  IF jsonb_array_length(p_selected_context) = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el registro coincide con algún contexto seleccionado
  FOR context_item IN SELECT * FROM jsonb_array_elements(p_selected_context)
  LOOP
    -- Verificar empresa
    IF (context_item->>'empresa_id') = p_empresa_id THEN
      
      -- Si marca_id es null en el contexto, incluye todas las marcas
      IF (context_item->>'marca_id') IS NULL THEN
        RETURN TRUE;
      END IF;
      
      -- Verificar marca
      IF (context_item->>'marca_id') = p_marca_id THEN
        
        -- Si punto_venta_id es null en el contexto, incluye todos los PDV
        IF (context_item->>'punto_venta_id') IS NULL THEN
          RETURN TRUE;
        END IF;
        
        -- Verificar punto de venta exacto
        IF (context_item->>'punto_venta_id') = p_punto_venta_id THEN
          RETURN TRUE;
        END IF;
        
      END IF;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso en consulta de EBITDA
SELECT 
  pv.empresa_id,
  pv.marca_id,
  pv.punto_venta_id,
  SUM(ventas) as total_ventas,
  SUM(costes) as total_costes,
  SUM(ventas - costes) as ebitda
FROM datos_financieros df
INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
WHERE match_context_filter(
  pv.empresa_id, 
  pv.marca_id, 
  pv.punto_venta_id,
  :selected_context::JSONB
)
GROUP BY pv.empresa_id, pv.marca_id, pv.punto_venta_id;

4. ENDPOINT API:
----------------
POST /api/gerente/dashboard/filter
{
  "selected_context": [...]
}

Response:
{
  "kpis": {
    "ebitda": 125000,
    "margen": 34.5,
    "nps": 8.4,
    ...
  },
  "filtered_by": "2 empresas, 3 marcas, 5 PDVs"
}

5. EVENTOS MAKE:
----------------
• Evento: context_filter_changed
• Trigger: Cuando el usuario aplica el filtro
• Acciones:
  1. Recalcular KPIs con nuevo filtro
  2. Actualizar gráficos EBITDA
  3. Filtrar datos de tablas
  4. Guardar preferencia de filtro en usuario

6. CACHÉ Y OPTIMIZACIÓN:
------------------------
• Cachear resultados por combinación de selected_context
• Invalidar caché cuando cambian datos financieros
• Pre-calcular agregaciones comunes (por empresa, por marca)
*/
