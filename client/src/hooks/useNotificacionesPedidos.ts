/**
 * 🔔 HOOK: Notificaciones de Pedidos en Tiempo Real
 * 
 * Se suscribe a cambios en pedidos y muestra notificaciones
 * según el rol del usuario
 */

import { useEffect, useRef } from 'react';
import { usePedidos, type Pedido } from '../contexts/PedidosContext';
import { toast } from 'sonner@2.0.3';
import type { UserRole } from '../App';

interface UseNotificacionesPedidosOptions {
  rol: UserRole;
  userId?: string;
  mutedEstados?: string[]; // Estados que no generan notificación
  playSound?: boolean;
}

export function useNotificacionesPedidos(options: UseNotificacionesPedidosOptions) {
  const { suscribirseACambios } = usePedidos();
  const { rol, userId, mutedEstados = [], playSound = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio
  useEffect(() => {
    if (playSound && typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3');
    }
  }, [playSound]);

  useEffect(() => {
    // Solo suscribirse si hay un rol válido
    if (!rol) return;

    const unsuscribe = suscribirseACambios((pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => {
      // No notificar si el estado está en la lista de muted
      if (mutedEstados.includes(pedido.estado)) return;

      // Manejar notificaciones según rol
      switch (rol) {
        case 'trabajador':
        case 'gerente':
          handleNotificacionStaff(pedido, tipo);
          break;

        case 'cliente':
          handleNotificacionCliente(pedido, tipo, userId);
          break;
      }
    });

    // Cleanup
    return unsuscribe;
  }, [rol, userId, suscribirseACambios, mutedEstados]);

  // ============================================================================
  // NOTIFICACIONES PARA STAFF (Trabajador/Gerente)
  // ============================================================================

  const handleNotificacionStaff = (pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => {
    switch (tipo) {
      case 'creado':
        // Nuevo pedido recibido
        toast.success('🔔 Nuevo pedido recibido', {
          description: `Pedido #${pedido.numero.toString().padStart(4, '0')} - ${pedido.clienteNombre}`,
          duration: 10000,
          action: {
            label: 'Ver',
            onClick: () => {
              // Navegar al pedido (usando hash navigation)
              const currentHash = window.location.hash;
              if (currentHash.includes('gerente')) {
                window.location.hash = `#/gerente/pedidos/${pedido.id}`;
              } else if (currentHash.includes('trabajador')) {
                window.location.hash = `#/trabajador/pedidos/${pedido.id}`;
              }
            },
          },
        });

        // Reproducir sonido
        playNotificationSound();
        break;

      case 'actualizado':
        // Solo notificar cambios importantes
        if (pedido.estado === 'cancelado') {
          toast.warning('⚠️ Pedido cancelado', {
            description: `Pedido #${pedido.numero.toString().padStart(4, '0')}`,
            duration: 5000,
          });
        }
        // No notificar otros cambios al staff (demasiado ruido)
        break;

      case 'cancelado':
        toast.error('❌ Pedido cancelado', {
          description: `Pedido #${pedido.numero.toString().padStart(4, '0')} - ${pedido.clienteNombre}`,
          duration: 5000,
        });
        break;
    }
  };

  // ============================================================================
  // NOTIFICACIONES PARA CLIENTE
  // ============================================================================

  const handleNotificacionCliente = (pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado', currentUserId?: string) => {
    // Solo notificar pedidos del cliente actual
    if (pedido.clienteId !== currentUserId) return;

    switch (tipo) {
      case 'creado':
        // Confirmación de pedido creado
        toast.success('✅ Pedido realizado correctamente', {
          description: `Tu pedido #${pedido.numero.toString().padStart(4, '0')} está siendo procesado`,
          duration: 5000,
        });
        break;

      case 'actualizado':
        // Notificar cambios de estado importantes
        const mensajesEstado: Record<string, { titulo: string; descripcion: string; icon: string }> = {
          confirmado: {
            titulo: '✅ Pedido confirmado',
            descripcion: 'Tu pedido ha sido confirmado y está siendo preparado',
            icon: '✅',
          },
          preparando: {
            titulo: '👨‍🍳 Preparando tu pedido',
            descripcion: 'Estamos preparando tu pedido con mucho cariño',
            icon: '👨‍🍳',
          },
          listo: {
            titulo: '🎉 ¡Pedido listo!',
            descripcion: 'Tu pedido está listo para recoger/entrega',
            icon: '🎉',
          },
          enviado: {
            titulo: '🚗 En camino',
            descripcion: 'Tu pedido está en camino',
            icon: '🚗',
          },
          entregado: {
            titulo: '✅ Pedido entregado',
            descripcion: '¡Disfruta tu pedido!',
            icon: '🎉',
          },
        };

        const mensajeEstado = mensajesEstado[pedido.estado];
        if (mensajeEstado) {
          toast.info(`${mensajeEstado.icon} ${mensajeEstado.titulo}`, {
            description: `Pedido #${pedido.numero.toString().padStart(4, '0')} - ${mensajeEstado.descripcion}`,
            duration: 7000,
          });

          // Reproducir sonido en estados importantes
          if (['listo', 'enviado'].includes(pedido.estado)) {
            playNotificationSound();
          }
        }
        break;

      case 'cancelado':
        toast.error('❌ Pedido cancelado', {
          description: `Tu pedido #${pedido.numero.toString().padStart(4, '0')} ha sido cancelado`,
          duration: 5000,
        });
        break;
    }
  };

  // ============================================================================
  // REPRODUCIR SONIDO
  // ============================================================================

  const playNotificationSound = () => {
    if (audioRef.current && playSound) {
      audioRef.current.play().catch((error) => {
        // Ignorar errores de autoplay (navegadores modernos lo bloquean)
        console.debug('No se pudo reproducir el sonido de notificación:', error);
      });
    }
  };
}
