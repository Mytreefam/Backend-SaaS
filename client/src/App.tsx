import React, { useState, useEffect, lazy, Suspense } from 'react';
import { SplashScreen } from './components/mobile/SplashScreen';
import { Onboarding } from './components/mobile/Onboarding';
import { PermissionsRequest } from './components/mobile/PermissionsRequest';
import { LoginViewMobile } from './components/LoginViewMobile';
import { LoadingFallback } from './components/LoadingFallback';
import { Toaster } from 'sonner@2.0.3';
import { APP_CONFIG, validateConfig } from './config/app.config';
import { ConnectionIndicator } from './components/mobile/ConnectionIndicator';
import { initOfflineService } from './services/offline.service';
import { initPushNotifications, initLocalNotifications } from './services/push-notifications.service';
import { useDeepLinks } from './hooks/useDeepLinks';
import { useLockPortrait } from './hooks/useOrientation';
import { useAppUpdate } from './hooks/useAppUpdate';
import { UpdateModal } from './components/mobile/UpdateModal';
import { analytics } from './services/analytics.service';
import { useTenant } from './hooks/useTenant';
import { CartProvider } from './contexts/CartContext';
import { ConfiguracionChatsProvider } from './contexts/ConfiguracionChatsContext';
import { StockProvider } from './contexts/StockContext';
import { ProductosProvider } from './contexts/ProductosContext';
import { CitasProvider } from './contexts/CitasContext';
import { CuponesProvider } from './contexts/CuponesContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { inicializarPedidosDemo } from './data/pedidos-demo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initWebVitals } from './lib/web-vitals';
import { inicializarCronJobs } from './services/cron-jobs';
import { getConfig } from './config/white-label.config';
import { inicializarMarcasDefault } from './utils/marcasHelper';
import { authApi } from './services/api';

// Lazy Loading de componentes pesados
const ClienteDashboard = lazy(() => import('./components/ClienteDashboard').then(m => ({ default: m.ClienteDashboard })));
const TrabajadorDashboard = lazy(() => import('./components/TrabajadorDashboard').then(m => ({ default: m.TrabajadorDashboard })));
const GerenteDashboard = lazy(() => import('./components/GerenteDashboard').then(m => ({ default: m.GerenteDashboard })));

export type UserRole = 'cliente' | 'trabajador' | 'gerente' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type AppState = 'splash' | 'onboarding' | 'login' | 'permissions' | 'app';

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // 🐛 DEBUG: Log para ver el estado
  console.log('🚀 App render - appState:', appState, 'currentUser:', currentUser);

  const config = getConfig();

  // Sistema Multi-Tenant / White-Label
  const { tenant, branding, texts } = useTenant();

  // ============================================================================
  // WRAPPER DE PROVIDERS GLOBALES
  // ============================================================================
  
  const GlobalProviders = ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary>
      <StockProvider>
        <ProductosProvider>
          <PedidosProvider>
            <ConfiguracionChatsProvider>
              <CitasProvider>
                <CuponesProvider>
                  <CartProvider>
                    {children}
                  </CartProvider>
                </CuponesProvider>
              </CitasProvider>
            </ConfiguracionChatsProvider>
          </PedidosProvider>
        </ProductosProvider>
      </StockProvider>
    </ErrorBoundary>
  );

  // Activar Deep Links (solo funciona en nativo, ignorado en web)
  useDeepLinks();

  // Bloquear orientación en portrait (vertical)
  useLockPortrait();

  // Verificar actualizaciones
  const { versionInfo, goToStore } = useAppUpdate();

  // Configuración PWA/Mobile y validación
  useEffect(() => {
    // Validar configuración
    validateConfig();

    // Inicializar Analytics
    analytics.initialize();

    // Inicializar Web Vitals monitoring
    initWebVitals();
    
    // Inicializar Sistema de Marcas MADRE
    inicializarMarcasDefault();

    // Inicializar datos de demostración (pedidos)
    inicializarPedidosDemo();

    // Inicializar cron jobs
    inicializarCronJobs();

    // Cargar test helpers para Caja Rápida
    import('./utils/test-helpers-caja-rapida').catch(() => {
      // Ignorar errores si no se puede cargar
    });

    // Configurar viewport para mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevenir pull-to-refresh nativo (lo manejamos nosotros)
    document.body.style.overscrollBehavior = 'none';

    // Inicializar servicios offline y notificaciones
    initOfflineService().catch(() => {
      // Error handler - logged internamente
    });
    initPushNotifications().catch(() => {
      // Error handler - logged internamente
    });
    initLocalNotifications().catch(() => {
      // Error handler - logged internamente
    });

    // Log app info en desarrollo
    if (APP_CONFIG.features.debug) {
      console.info(`🚀 ${APP_CONFIG.app.name} v${APP_CONFIG.app.version}`);
    }

    // FLUJO DE INICIO: Splash → Onboarding → Login o App (si ya hay sesión)
    setTimeout(() => {
      // Si hay usuario autenticado, ir directo a la app
      const isAuth = authApi.isAuthenticated();
      const user = authApi.getCurrentUser();
      if (isAuth && user) {
        setCurrentUser(user);
        setAppState('app');
      } else if (config.onboarding.enabled) {
        setAppState('onboarding');
      } else {
        setAppState('login');
      }
    }, 2000); // 2 segundos de splash
  }, []);

  // Mostrar modal de actualización si hay nueva versión
  useEffect(() => {
    if (versionInfo?.updateAvailable) {
      setShowUpdateModal(true);
    }
  }, [versionInfo]);

  const handleLogin = (user: User) => {
    console.log('🔐 Login exitoso, usuario:', user);
    setCurrentUser(user);
    setAppState('app'); // ✅ Ir directo a app para desarrollo
    // Analytics: Login
    analytics.setUserId(user.id);
    analytics.logLogin('email');
    analytics.logScreenView('Dashboard', user.role);
  };

  const handleLogout = async () => {
    // ✅ Llamar al API de logout
    await authApi.logout();
    
    setCurrentUser(null);
    setAppState('login');
  };

  const handleCambiarRol = (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: nuevoRol
      });
    }
  };

  const handleOnboardingFinish = () => {
    setAppState('login');
  };

  const handleOnboardingSkip = () => {
    setAppState('login');
  };

  const handlePermissionsFinish = () => {
    setAppState('app');
  };

  // ============================================================================
  // RENDER POR ESTADOS
  // ============================================================================

  const OptimizedToaster = () => (
    <Toaster 
      position="top-center" 
      richColors
      expand={false}
      visibleToasts={1}
      duration={1500}
      closeButton
      gap={8}
      offset={16}
      toastOptions={{
        style: {
          pointerEvents: 'auto',
        },
        classNames: {
          toast: 'group-[.toaster]:shadow-lg group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top-2',
          title: 'group-[.toast]:text-sm group-[.toast]:font-medium',
          description: 'group-[.toast]:text-xs',
          actionButton: 'group-[.toast]:bg-teal-600',
          cancelButton: 'group-[.toast]:bg-gray-200',
          closeButton: 'group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-gray-200',
        },
      }}
    />
  );

  // SPLASH SCREEN
  if (appState === 'splash') {
    return (
      <GlobalProviders>
        <SplashScreen onFinish={() => {
          console.log('🎬 SplashScreen onFinish llamado, cambiando a login');
          setAppState('login'); // ✅ Cambiar directo a login para testing
        }} />
        <ConnectionIndicator />
        <OptimizedToaster />
      </GlobalProviders>
    );
  }

  // ONBOARDING
  if (appState === 'onboarding') {
    return (
      <GlobalProviders>
        <Onboarding 
          onFinish={handleOnboardingFinish}
          onSkip={handleOnboardingSkip}
        />
        <ConnectionIndicator />
        <OptimizedToaster />
      </GlobalProviders>
    );
  }

  // LOGIN
  if (appState === 'login') {
    return (
      <GlobalProviders>
        <LoginViewMobile onLogin={handleLogin} />
        <ConnectionIndicator />
        <OptimizedToaster />
      </GlobalProviders>
    );
  }

  // PERMISOS
  if (appState === 'permissions') {
    return (
      <GlobalProviders>
        <PermissionsRequest 
          onFinish={handlePermissionsFinish}
          onSkip={handlePermissionsFinish}
        />
        <ConnectionIndicator />
        <OptimizedToaster />
      </GlobalProviders>
    );
  }

  // APP PRINCIPAL
  if (appState === 'app' && currentUser) {
    console.log('🏠 Renderizando APP con usuario:', currentUser.role);
    return (
      <GlobalProviders>
        {currentUser.role === 'cliente' && (
          <Suspense fallback={<LoadingFallback />}>
            <ClienteDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
          </Suspense>
        )}
        {currentUser.role === 'trabajador' && (
          <Suspense fallback={<LoadingFallback />}>
            <TrabajadorDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
          </Suspense>
        )}
        {currentUser.role === 'gerente' && (
          <Suspense fallback={<LoadingFallback />}>
            <GerenteDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
          </Suspense>
        )}
      
        <ConnectionIndicator />
        
        {/* Modal de actualización */}
        <UpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          currentVersion={versionInfo?.current || '1.0.0'}
          latestVersion={versionInfo?.latest || '1.0.0'}
          changelog={versionInfo?.changelog}
          isRequired={versionInfo?.updateRequired || false}
          onUpdate={goToStore}
        />
        
        <OptimizedToaster />
      </GlobalProviders>
    );
  }

  // FALLBACK
  return null;
}

export default App;