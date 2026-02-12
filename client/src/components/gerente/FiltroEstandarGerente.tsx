/**
 * 🔍 FILTRO ESTÁNDAR PARA PERFIL GERENTE
 * Componente reutilizable con filtros de Empresa, PDV y Marca
 * Usado en todos los módulos del perfil gerente
 */

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Filter, ChevronDown } from 'lucide-react';
import { gerenteConfigApi } from '../../services/api';

interface FiltroEstandarGerenteProps {
  onFiltrosChange?: (filtros: string[]) => void;
  onBusquedaChange?: (busqueda: string) => void;
  placeholder?: string;
  mostrarBusqueda?: boolean;
  className?: string;
}

export function FiltroEstandarGerente({
  onFiltrosChange,
  onBusquedaChange,
  placeholder = 'Buscar...',
  mostrarBusqueda = true,
  className = ''
}: FiltroEstandarGerenteProps) {
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [empresasConfig, setEmpresasConfig] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await gerenteConfigApi.empresas.list();
        if (cancelled) return;
        setEmpresasConfig(Array.isArray(list) ? list : []);
      } catch {
        if (cancelled) return;
        setEmpresasConfig([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const empresasArray = useMemo(() => {
    return (empresasConfig || [])
      .map((e: any) => ({
        id: String(e?.id || '').trim(),
        nombreFiscal: String(e?.nombreFiscal || '').trim(),
        nombreComercial: String(e?.nombreComercial || '').trim(),
      }))
      .filter((e: any) => e.id);
  }, [empresasConfig]);

  const marcasArray = useMemo(() => {
    const out: Array<{ id: string; nombre: string; icono?: string }> = [];
    for (const e of empresasConfig || []) {
      const marcas = Array.isArray((e as any)?.marcas) ? (e as any).marcas : [];
      for (const m of marcas) {
        const id = String(m?.id || '').trim();
        if (!id) continue;
        out.push({ id, nombre: String(m?.nombre || id).trim(), icono: m?.icono ? String(m.icono) : undefined });
      }
    }
    return out;
  }, [empresasConfig]);

  const puntosVentaArray = useMemo(() => {
    const out: Array<{ id: string; nombre: string; marcasIds: string[] }> = [];
    for (const e of empresasConfig || []) {
      const pdvs = Array.isArray((e as any)?.puntosVenta) ? (e as any).puntosVenta : [];
      for (const pv of pdvs) {
        const id = String(pv?.id || '').trim();
        if (!id) continue;
        out.push({
          id,
          nombre: String(pv?.nombre || pv?.id || id).trim(),
          marcasIds: Array.isArray(pv?.marcasIds) ? pv.marcasIds.map((x: any) => String(x)) : [],
        });
      }
    }
    return out;
  }, [empresasConfig]);

  const empresaNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of empresasArray) {
      m.set(e.id, `${e.nombreFiscal} - ${e.nombreComercial}`.trim().replace(/^\s*-\s*$/, e.id));
    }
    return m;
  }, [empresasArray]);

  const marcaInfoMap = useMemo(() => {
    const m = new Map<string, { nombre: string; icono?: string }>();
    for (const marca of marcasArray) m.set(marca.id, { nombre: marca.nombre, icono: marca.icono });
    return m;
  }, [marcasArray]);

  const getNombreEmpresa = (id: string) => empresaNameMap.get(id) || id;
  const getNombreMarca = (id: string) => marcaInfoMap.get(id)?.nombre || id;
  const getIconoMarca = (id: string) => marcaInfoMap.get(id)?.icono || '🏷️';
  const getNombrePDVConMarcas = (pdvId: string) => {
    const pdv = puntosVentaArray.find((p) => p.id === pdvId);
    if (!pdv) return pdvId;
    const marcas = (pdv.marcasIds || []).map((mid) => getNombreMarca(mid)).filter(Boolean);
    return marcas.length ? `${pdv.nombre} - ${marcas.join(', ')}` : pdv.nombre;
  };

  const handleFiltroChange = (nuevosFiltros: string[]) => {
    setFiltrosSeleccionados(nuevosFiltros);
    onFiltrosChange?.(nuevosFiltros);
  };

  const handleBusquedaChange = (nuevaBusqueda: string) => {
    setBusqueda(nuevaBusqueda);
    onBusquedaChange?.(nuevaBusqueda);
  };

  const toggleFiltro = (id: string) => {
    const nuevosFiltros = filtrosSeleccionados.includes(id)
      ? filtrosSeleccionados.filter(item => item !== id)
      : [...filtrosSeleccionados, id];
    handleFiltroChange(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    handleFiltroChange([]);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${className}`}>
      {/* Filtro Multiselección */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-between gap-2 w-full sm:w-auto h-10"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                {filtrosSeleccionados.length === 0 
                  ? 'Filtros' 
                  : `${filtrosSeleccionados.length} filtro${filtrosSeleccionados.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            {/* Empresa */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
              {empresasArray.map(empresa => (
                <div key={empresa.id} className="flex items-center gap-2 mb-2">
                  <Checkbox 
                    id={`empresa-${empresa.id}`}
                    checked={filtrosSeleccionados.includes(empresa.id)}
                    onCheckedChange={() => toggleFiltro(empresa.id)}
                  />
                  <label htmlFor={`empresa-${empresa.id}`} className="text-sm cursor-pointer">
                    🏢 {getNombreEmpresa(empresa.id)}
                  </label>
                </div>
              ))}
            </div>

            {/* Puntos de Venta */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
              <div className="space-y-2">
                {puntosVentaArray.map(pdv => (
                  <div key={pdv.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={`pdv-${pdv.id}`}
                      checked={filtrosSeleccionados.includes(pdv.id)}
                      onCheckedChange={() => toggleFiltro(pdv.id)}
                    />
                    <label htmlFor={`pdv-${pdv.id}`} className="text-sm cursor-pointer">
                      📍 {getNombrePDVConMarcas(pdv.id)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Marcas */}
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
              <div className="space-y-2">
                {marcasArray.map(marca => (
                  <div key={marca.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={`marca-${marca.id}`}
                      checked={filtrosSeleccionados.includes(marca.id)}
                      onCheckedChange={() => toggleFiltro(marca.id)}
                    />
                    <label htmlFor={`marca-${marca.id}`} className="text-sm cursor-pointer">
                      {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón limpiar */}
            {filtrosSeleccionados.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Búsqueda */}
      {mostrarBusqueda && (
        <Input
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => handleBusquedaChange(e.target.value)}
          className="flex-1 h-10"
        />
      )}

      {/* Mostrar filtros activos como badges */}
      {filtrosSeleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {filtrosSeleccionados.map(id => {
            let label = '';
            if (empresaNameMap.has(id)) label = getNombreEmpresa(id);
            else if (puntosVentaArray.some((p) => p.id === id)) label = getNombrePDVConMarcas(id);
            else if (marcaInfoMap.has(id)) label = getNombreMarca(id);
            
            return (
              <Badge key={id} variant="outline" className="text-xs">
                {label}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
