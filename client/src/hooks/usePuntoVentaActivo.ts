/**
 * 🏪 HOOK: usePuntoVentaActivo
 *
 * Fuente de verdad: backend (`/trabajador/fichajes/estado`).
 * IMPORTANTE: Los trabajadores solo pueden ver y gestionar pedidos
 * del punto de venta donde han fichado.
 */

import { useState, useEffect } from 'react';
import { authApi, fichajesApi } from '../services/api';

export function usePuntoVentaActivo() {
  const [puntoVentaId, setPuntoVentaId] = useState<string | null>(null);
  const [puntoVentaNombre, setPuntoVentaNombre] = useState<string | null>(null);
  const [fichado, setFichado] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const user = authApi.getCurrentUser();
    const empleadoId = Number(user?.id || 0);
    if (!Number.isFinite(empleadoId) || empleadoId <= 0) {
      setPuntoVentaId(null);
      setPuntoVentaNombre(null);
      setFichado(false);
      return;
    }

    const load = async () => {
      try {
        const estado = await fichajesApi.getEstadoDetallado(empleadoId);
        if (cancelled) return;
        setFichado(Boolean(estado.enTurno));
        setPuntoVentaId(estado.enTurno ? estado.puntoVentaId || null : null);
        setPuntoVentaNombre(estado.enTurno ? estado.puntoVentaNombre || null : null);
      } catch (error) {
        console.error('[usePuntoVentaActivo] Error al cargar estado de fichaje:', error);
        if (cancelled) return;
        setPuntoVentaId(null);
        setPuntoVentaNombre(null);
        setFichado(false);
      }
    };

    void load();
    const interval = window.setInterval(load, 15000); // mantener UI sincronizada
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return {
    puntoVentaId,
    puntoVentaNombre,
    fichado,
  };
}
