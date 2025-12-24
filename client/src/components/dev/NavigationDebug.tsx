import { useEffect, useState } from 'react';

/**
 * 🔍 Componente de Debug para Navegación Móvil
 * 
 * Este componente ayuda a diagnosticar problemas de navegación mostrando:
 * - Ancho actual de la ventana
 * - Breakpoint activo de Tailwind
 * - Qué componentes de navegación deberían estar visibles
 * - Si los componentes existen en el DOM
 * 
 * USO:
 * Importar en cualquier Dashboard y añadir al JSX:
 * <NavigationDebug />
 * 
 * REMOVER en producción.
 */
export function NavigationDebug() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [bottomNavExists, setBottomNavExists] = useState(false);
  const [sidebarExists, setSidebarExists] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    const checkElements = () => {
      // Buscar BottomNav en el DOM
      const bottomNav = document.querySelector('nav.fixed.bottom-0');
      setBottomNavExists(!!bottomNav);
      
      // Buscar Sidebar en el DOM
      const sidebar = document.querySelector('aside');
      setSidebarExists(!!sidebar);
    };

    handleResize();
    checkElements();

    window.addEventListener('resize', handleResize);
    
    // Verificar elementos cada 500ms
    const interval = setInterval(checkElements, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const getBreakpoint = () => {
    if (width < 640) return 'xs (móvil pequeño)';
    if (width < 768) return 'sm (móvil)';
    if (width < 1024) return 'md (tablet)';
    if (width < 1280) return 'lg (desktop)';
    if (width < 1536) return 'xl (desktop grande)';
    return '2xl (pantalla muy grande)';
  };

  const getShouldShow = () => {
    if (width < 768) {
      return {
        sidebar: false,
        bottomNav: true,
        reason: 'Móvil: BottomNav visible, Sidebar oculto'
      };
    } else {
      return {
        sidebar: true,
        bottomNav: false,
        reason: 'Tablet/Desktop: Sidebar visible, BottomNav oculto'
      };
    }
  };

  const shouldShow = getShouldShow();

  return (
    <div className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-2xl z-[9999] max-w-sm text-xs font-mono border-4 border-yellow-400">
      <div className="font-bold text-base mb-3 text-yellow-300">
        🚨 NAVIGATION DEBUG
      </div>
      
      <div className="space-y-2">
        <div>
          <div className="text-gray-400">Viewport:</div>
          <div className="text-white font-bold">
            {width} × {height}px
          </div>
        </div>

        <div>
          <div className="text-gray-400">Breakpoint:</div>
          <div className="text-green-400 font-bold">
            {getBreakpoint()}
          </div>
        </div>

        <div className="border-t border-yellow-400 pt-2 mt-2">
          <div className="text-yellow-200 mb-1 font-bold">Deberían estar visibles:</div>
          <div className="space-y-1">
            <div className={shouldShow.sidebar ? 'text-green-300' : 'text-red-300'}>
              {shouldShow.sidebar ? '✅' : '❌'} Sidebar (debe estar: {shouldShow.sidebar ? 'VISIBLE' : 'OCULTO'})
            </div>
            <div className={shouldShow.bottomNav ? 'text-green-300' : 'text-red-300'}>
              {shouldShow.bottomNav ? '✅' : '❌'} BottomNav (debe estar: {shouldShow.bottomNav ? 'VISIBLE' : 'OCULTO'})
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-400 pt-2 mt-2">
          <div className="text-yellow-200 mb-1 font-bold">¿Existen en el DOM?</div>
          <div className="space-y-1">
            <div className={sidebarExists ? 'text-green-300' : 'text-red-300 font-bold'}>
              {sidebarExists ? '✅' : '🚨'} Sidebar: {sidebarExists ? 'EXISTE' : 'NO EXISTE'}
            </div>
            <div className={bottomNavExists ? 'text-green-300' : 'text-red-300 font-bold'}>
              {bottomNavExists ? '✅' : '🚨'} BottomNav: {bottomNavExists ? 'EXISTE' : 'NO EXISTE'}
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-400 pt-2 mt-2">
          <div className="text-yellow-200">Razón:</div>
          <div className="text-white text-[11px] leading-tight font-bold">
            {shouldShow.reason}
          </div>
        </div>

        <div className="border-t border-yellow-400 pt-2 mt-2">
          <div className="text-yellow-200 mb-1">Clases Tailwind:</div>
          <div className="space-y-1 text-[10px]">
            <div>
              <span className="text-yellow-300">md:hidden (BottomNav)</span> = {width < 768 ? '✅ Visible' : '❌ Oculto'}
            </div>
            <div>
              <span className="text-yellow-300">hidden md:flex (Sidebar)</span> = {width >= 768 ? '✅ Visible' : '❌ Oculto'}
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-400 pt-2 mt-2 bg-black/30 -m-4 p-4 rounded-b-lg">
          <div className="text-yellow-300 text-[11px] leading-tight font-bold">
            🚨 DIAGNÓSTICO:
            {!bottomNavExists && !sidebarExists && (
              <div className="mt-1 text-white">
                ¡NO HAY NAVEGACIÓN! Los componentes no se están renderizando.
              </div>
            )}
            {!bottomNavExists && width < 768 && (
              <div className="mt-1 text-white">
                BottomNav debería estar visible pero NO EXISTE en el DOM.
              </div>
            )}
            {!sidebarExists && width >= 768 && (
              <div className="mt-1 text-white">
                Sidebar debería estar visible pero NO EXISTE en el DOM.
              </div>
            )}
            {bottomNavExists && width < 768 && (
              <div className="mt-1 text-green-300">
                ✅ BottomNav existe y debería estar visible
              </div>
            )}
            {sidebarExists && width >= 768 && (
              <div className="mt-1 text-green-300">
                ✅ Sidebar existe y debería estar visible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
