/**
 * 🏪 HOOK: usePuntoVentaActivo
 * 
 * Hook para obtener el punto de venta activo del trabajador fichado.
 * Lee el fichaje activo desde localStorage y retorna el ID del PDV.
 * 
 * IMPORTANTE: Los trabajadores solo pueden ver y gestionar pedidos
 * del punto de venta donde han fichado.
 */

import { useState, useEffect } from 'react';

interface FichajeActivo {
  id: string;
  trabajadorId: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  fechaEntrada: Date | string;
  horaEntrada: string;
  geolocalizacion?: {
    latitud: number;
    longitud: number;
    precision: number;
  };
  enPausa: boolean;
}

export function usePuntoVentaActivo() {
  const [puntoVentaId, setPuntoVentaId] = useState<string | null>(null);
  const [puntoVentaNombre, setPuntoVentaNombre] = useState<string | null>(null);
  const [fichado, setFichado] = useState(false);

  useEffect(() => {
    // Función para cargar el fichaje activo
    const cargarFichaje = () => {
      try {
        const fichajeGuardado = localStorage.getItem('fichaje_activo');
        
        if (fichajeGuardado) {
          const fichaje: FichajeActivo = JSON.parse(fichajeGuardado);
          setPuntoVentaId(fichaje.puntoVentaId);
          setPuntoVentaNombre(fichaje.puntoVentaNombre);
          setFichado(true);
        } else {
          setPuntoVentaId(null);
          setPuntoVentaNombre(null);
          setFichado(false);
        }
      } catch (error) {
        console.error('[usePuntoVentaActivo] Error al cargar fichaje:', error);
        setPuntoVentaId(null);
        setPuntoVentaNombre(null);
        setFichado(false);
      }
    };

    // Cargar al montar
    cargarFichaje();

    // Escuchar cambios en localStorage (para sincronizar entre tabs/componentes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fichaje_activo') {
        cargarFichaje();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    puntoVentaId,
    puntoVentaNombre,
    fichado,
  };
}
