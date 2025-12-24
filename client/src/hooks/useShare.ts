import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Hook para compartir contenido usando la API nativa
 * Funciona en web (Web Share API) y móvil (Capacitor Share)
 */
export const useShare = () => {
  
  /**
   * Compartir texto simple
   */
  const shareText = async (text: string, title?: string) => {
    try {
      if (!Capacitor.isNativePlatform() && !navigator.share) {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado al portapapeles');
        return;
      }

      await Share.share({
        title: title || 'Udar Edge',
        text: text,
        dialogTitle: 'Compartir',
      });

      console.log('[Share] Contenido compartido exitosamente');
    } catch (error: any) {
      if (error?.message !== 'Share canceled') {
        console.error('[Share] Error al compartir:', error);
        toast.error('Error al compartir');
      }
    }
  };

  /**
   * Compartir enlace con título y descripción
   */
  const shareLink = async (url: string, title: string, text?: string) => {
    try {
      if (!Capacitor.isNativePlatform() && !navigator.share) {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
        return;
      }

      await Share.share({
        title: title,
        text: text || title,
        url: url,
        dialogTitle: 'Compartir enlace',
      });

      console.log('[Share] Enlace compartido exitosamente');
    } catch (error: any) {
      if (error?.message !== 'Share canceled') {
        console.error('[Share] Error al compartir enlace:', error);
        toast.error('Error al compartir enlace');
      }
    }
  };

  /**
   * Compartir pedido
   */
  const sharePedido = async (pedidoId: string, total: number) => {
    const url = `udaredge://pedido/${pedidoId}`;
    const text = `¡He realizado un pedido por ${total.toFixed(2)}€! 🛒\n\nVer detalles: ${url}`;
    await shareText(text, 'Mi pedido en Udar Edge');
  };

  /**
   * Compartir producto
   */
  const shareProducto = async (productoId: string, nombre: string, precio: number) => {
    const url = `udaredge://producto/${productoId}`;
    const text = `${nombre} - ${precio.toFixed(2)}€\n\n¡Mira este producto! ${url}`;
    await shareText(text, nombre);
  };

  /**
   * Compartir invitación de equipo
   */
  const shareInvitacionEquipo = async (inviteToken: string, empresaNombre: string) => {
    const url = `udaredge://invitacion?token=${inviteToken}&empresa=${empresaNombre}`;
    const text = `¡Te invito a unirte al equipo de ${empresaNombre} en Udar Edge! 🚀\n\nÚnete aquí: ${url}`;
    await shareText(text, `Invitación a ${empresaNombre}`);
  };

  /**
   * Compartir ticket/factura
   */
  const shareTicket = async (ticketId: string, total: number, fecha: string) => {
    const text = `Ticket #${ticketId}\nTotal: ${total.toFixed(2)}€\nFecha: ${fecha}\n\nGenerado por Udar Edge`;
    await shareText(text, `Ticket #${ticketId}`);
  };

  /**
   * Verificar si se puede compartir
   */
  const canShare = () => {
    return Capacitor.isNativePlatform() || !!navigator.share;
  };

  return {
    shareText,
    shareLink,
    sharePedido,
    shareProducto,
    shareInvitacionEquipo,
    shareTicket,
    canShare,
  };
};
