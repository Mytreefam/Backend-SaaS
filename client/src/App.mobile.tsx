/**
 * APP MÓVIL - Punto de entrada principal
 * 
 * Flujo completo:
 * 1. Splash Screen (2s)
 * 2. Onboarding (solo primera vez)
 * 3. Login/Registro
 * 4. Solicitud de permisos
 * 5. App principal
 */

import { useState, useEffect } from 'react';
import { SplashScreen } from './components/mobile/SplashScreen';
import { Onboarding } from './components/mobile/Onboarding';
import { PermissionsRequest } from './components/mobile/PermissionsRequest';
import { LoginViewMobile } from './components/LoginViewMobile';
import { ClienteDashboard } from './components/ClienteDashboard';
import { TrabajadorDashboard } from './components/TrabajadorDashboard';
import { GerenteDashboard } from './components/GerenteDashboard';
import { Toaster } from 'sonner@2.0.3';
import { initializeTheme, getConfig } from './config/white-label.config';
import { initializeLanguage } from './config/i18n.config';
import { initializePermissionsService } from './services/permissions.service';
import { initOfflineService } from './services/offline.service';
import { initPushNotifications, initLocalNotifications } from './services/push-notifications.service';
import { ConnectionIndicator } from './components/mobile/ConnectionIndicator';
import { BreakpointIndicator } from './components/dev/BreakpointIndicator';
import { isDevelopment } from './lib/env-utils';

type AppState = 'splash' | 'onboarding' | 'login' | 'permissions' | 'app';

// Componente Toaster optimizado y reutilizable
const OptimizedToaster = () => (
  <Toaster 
    position="bottom-center" 
    richColors
    expand={false}
    visibleToasts={3}
    duration={3000}
    closeButton
    toastOptions={{
      style: {
        pointerEvents: 'auto',
      },
      classNames: {
        toast: 'group-[.toaster]:shadow-lg',
        title: 'group-[.toast]:text-sm group-[.toast]:font-medium',
        description: 'group-[.toast]:text-xs',
        actionButton: 'group-[.toast]:bg-teal-600',
        cancelButton: 'group-[.toast]:bg-gray-200',
        closeButton: 'group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-gray-200',
      },
    }}
  />
);

function AppMobile() {
  const config = getConfig();
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    // Inicializar configuraciones
    initializeTheme();
    initializeLanguage();
    initializePermissionsService();
    
    // Inicializar modo offline y notificaciones
    initOfflineService().catch(err => 
      console.error('Error inicializando offline service:', err)
    );
    initPushNotifications().catch(err =>
      console.error('Error inicializando push notifications:', err)
    );
    initLocalNotifications().catch(err =>
      console.error('Error inicializando local notifications:', err)
    );

    // ⚠️ TEMPORAL: SIEMPRE mostrar onboarding para desarrollo
    // TODO: Reactivar lógica de "hasSeenOnboarding" cuando esté listo
    // const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    // 💡 Si no ves el onboarding, limpia el localStorage:
    // Abre la consola (F12) y ejecuta: localStorage.clear()
    // Luego recarga la página (F5)
    
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Si hay usuario guardado, ir directo a app después del splash
        setTimeout(() => {
          setAppState('app');
        }, 2000);
        return;
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }

    // ✅ TEMPORAL: SIEMPRE mostrar onboarding (comentado el check)
    if (config.onboarding.enabled) {
      // Mostrar onboarding después del splash
      setTimeout(() => {
        setAppState('onboarding');
      }, 2000);
    } else {
      // Ir directo a login después del splash
      setTimeout(() => {
        setAppState('login');
      }, 2000);
    }
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSplashFinish = () => {
    // Ya se maneja en useEffect
  };

  const handleOnboardingFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setAppState('login');
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setAppState('login');
  };

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Ir a solicitud de permisos
    setAppState('permissions');
  };

  const handlePermissionsFinish = () => {
    setAppState('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAppState('login');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Splash Screen
  if (appState === 'splash') {
    return (
      <>
        <SplashScreen onFinish={handleSplashFinish} />
        <ConnectionIndicator />
        {isDevelopment && <BreakpointIndicator />}
        <OptimizedToaster />
      </>
    );
  }

  // Onboarding
  if (appState === 'onboarding') {
    return (
      <>
        <Onboarding
          onFinish={handleOnboardingFinish}
          onSkip={handleOnboardingSkip}
        />
        <ConnectionIndicator />
        {isDevelopment && <BreakpointIndicator />}
        <OptimizedToaster />
      </>
    );
  }

  // Login / Registro
  if (appState === 'login') {
    return (
      <>
        <LoginViewMobile onLogin={handleLogin} />
        <ConnectionIndicator />
        {isDevelopment && <BreakpointIndicator />}
        <OptimizedToaster />
      </>
    );
  }

  // Solicitud de permisos
  if (appState === 'permissions') {
    return (
      <>
        <PermissionsRequest
          onFinish={handlePermissionsFinish}
          onSkip={handlePermissionsFinish}
        />
        <ConnectionIndicator />
        {isDevelopment && <BreakpointIndicator />}
        <OptimizedToaster />
      </>
    );
  }

  // App principal
  if (appState === 'app' && currentUser) {
    return (
      <>
        {currentUser.role === 'cliente' && (
          <ClienteDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'trabajador' && (
          <TrabajadorDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'gerente' && (
          <GerenteDashboard user={currentUser} onLogout={handleLogout} />
        )}
        <ConnectionIndicator />
        {isDevelopment && <BreakpointIndicator />}
        <OptimizedToaster />
      </>
    );
  }

  // Fallback
  return null;
}

export default AppMobile;