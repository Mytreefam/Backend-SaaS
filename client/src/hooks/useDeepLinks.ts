import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

/**
 * Hook para manejar Deep Links en la app
 * Soporta esquemas: udaredge://, https://app.udaredge.com
 * 
 * Ejemplos de URLs:
 * - udaredge://pedido/123
 * - udaredge://reset-password?token=abc123
 * - udaredge://chat/456
 * - udaredge://producto/789
 * 
 * NOTA: Esta es una app React SPA, no Next.js
 * Los deep links simplemente muestran notificaciones por ahora
 * En producción, podrías integrar con react-router o state management
 */
export const useDeepLinks = () => {
  useEffect(() => {
    // Solo cargar Capacitor App en entorno nativo
    const setupDeepLinks = async () => {
      try {
        // Dynamic import para evitar errores en web
        const { App } = await import('@capacitor/app');
        
        const handleDeepLink = (event: { url: string }) => {
          const url = event.url;
          console.log('[DeepLink] URL recibida:', url);

          try {
            // Parsear la URL
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            const params = Object.fromEntries(urlObj.searchParams.entries());

            // Manejo de deep links según el path
            // En una app real, aquí navegarías o mostrarías modales
            if (path.startsWith('/pedido/')) {
              const pedidoId = path.split('/')[2];
              toast.success(`Deep Link: Abriendo pedido #${pedidoId}`);
              console.log('[DeepLink] Pedido ID:', pedidoId);
            } 
            else if (path.startsWith('/reset-password')) {
              const token = params.token;
              toast.info('Deep Link: Restableciendo contraseña...');
              console.log('[DeepLink] Reset token:', token);
            }
            else if (path.startsWith('/chat/')) {
              const chatId = path.split('/')[2];
              toast.success(`Deep Link: Abriendo chat #${chatId}`);
              console.log('[DeepLink] Chat ID:', chatId);
            }
            else if (path.startsWith('/producto/')) {
              const productoId = path.split('/')[2];
              toast.success(`Deep Link: Abriendo producto #${productoId}`);
              console.log('[DeepLink] Producto ID:', productoId);
            }
            else if (path.startsWith('/invitacion')) {
              const inviteToken = params.token;
              const empresaId = params.empresa;
              toast.success('Deep Link: Procesando invitación...');
              console.log('[DeepLink] Invite:', inviteToken, 'Empresa:', empresaId);
            }
            else if (path.startsWith('/notificacion/')) {
              const notifId = path.split('/')[2];
              toast.info(`Deep Link: Notificación #${notifId}`);
              console.log('[DeepLink] Notificación ID:', notifId);
            }
            else {
              toast.info('Deep Link recibido');
              console.warn('[DeepLink] Ruta no reconocida:', path);
            }
          } catch (error) {
            console.error('[DeepLink] Error parseando URL:', error);
            toast.error('Error al abrir el enlace');
          }
        };

        // Registrar listener
        const listener = await App.addListener('appUrlOpen', handleDeepLink);

        // Cleanup
        return () => {
          listener.remove();
        };
      } catch (error) {
        console.log('[DeepLink] No disponible en web (solo nativo)');
      }
    };

    setupDeepLinks();
  }, []);
};

/**
 * Función helper para generar deep links
 * Uso: generateDeepLink('pedido/123') → 'udaredge://pedido/123'
 */
export const generateDeepLink = (path: string, params?: Record<string, string>) => {
  const baseUrl = 'udaredge://';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const queryString = params 
    ? '?' + new URLSearchParams(params).toString() 
    : '';
  return `${baseUrl}${cleanPath}${queryString}`;
};
