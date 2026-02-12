import { useEffect, useMemo, useState } from 'react';
import { gerenteConfigApi } from '../services/api';

type EmpresaCfg = any;

export function useGerenteEmpresasConfig() {
  const [empresasConfig, setEmpresasConfig] = useState<EmpresaCfg[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await gerenteConfigApi.empresas.list();
        if (cancelled) return;
        setEmpresasConfig(Array.isArray(list) ? list : []);
      } catch {
        if (cancelled) return;
        setEmpresasConfig([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
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
        out.push({
          id,
          nombre: String(m?.nombre || id).trim(),
          icono: m?.icono ? String(m.icono) : undefined,
        });
      }
    }
    return out;
  }, [empresasConfig]);

  const puntosVentaArray = useMemo(() => {
    const out: Array<{ id: string; nombre: string; empresaId: string; marcasIds: string[] }> = [];
    for (const e of empresasConfig || []) {
      const empresaId = String((e as any)?.id || '').trim();
      const pdvs = Array.isArray((e as any)?.puntosVenta) ? (e as any).puntosVenta : [];
      for (const pv of pdvs) {
        const id = String(pv?.id || '').trim();
        if (!id) continue;
        out.push({
          id,
          nombre: String(pv?.nombre || pv?.id || id).trim(),
          empresaId,
          marcasIds: Array.isArray(pv?.marcasIds) ? pv.marcasIds.map((x: any) => String(x)) : [],
        });
      }
    }
    return out;
  }, [empresasConfig]);

  const empresaNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of empresasArray) {
      const a = e.nombreFiscal;
      const b = e.nombreComercial;
      m.set(e.id, a && b ? `${a} - ${b}` : (a || b || e.id));
    }
    return m;
  }, [empresasArray]);

  const marcaInfoMap = useMemo(() => {
    const m = new Map<string, { nombre: string; icono?: string }>();
    for (const marca of marcasArray) m.set(marca.id, { nombre: marca.nombre, icono: marca.icono });
    return m;
  }, [marcasArray]);

  const pdvInfoMap = useMemo(() => {
    const m = new Map<string, { nombre: string; empresaId: string; marcasIds: string[] }>();
    for (const pv of puntosVentaArray) m.set(pv.id, { nombre: pv.nombre, empresaId: pv.empresaId, marcasIds: pv.marcasIds });
    return m;
  }, [puntosVentaArray]);

  const getNombreEmpresa = (empresaId: string) => empresaNameMap.get(empresaId) || empresaId;
  const getNombreMarca = (marcaId: string) => marcaInfoMap.get(marcaId)?.nombre || marcaId;
  const getIconoMarca = (marcaId: string) => marcaInfoMap.get(marcaId)?.icono || '🏷️';
  const getNombrePDV = (pdvId: string) => pdvInfoMap.get(pdvId)?.nombre || pdvId;
  const getNombrePDVConMarcas = (pdvId: string) => {
    const pv = pdvInfoMap.get(pdvId);
    if (!pv) return pdvId;
    const marcas = (pv.marcasIds || []).map((mid) => getNombreMarca(mid)).filter(Boolean);
    return marcas.length ? `${pv.nombre} - ${marcas.join(', ')}` : pv.nombre;
  };

  return {
    loading,
    empresasConfig,
    empresasArray,
    marcasArray,
    puntosVentaArray,
    getNombreEmpresa,
    getNombreMarca,
    getIconoMarca,
    getNombrePDV,
    getNombrePDVConMarcas,
  };
}

