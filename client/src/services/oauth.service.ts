/**
 * SERVICIO DE OAUTH
 * 
 * Gestiona autenticación con:
 * - Google Sign-In
 * - Facebook Login
 * - Apple Sign In
 * - Biometría (huella/Face ID)
 */

import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'apple' | 'biometric';
  accessToken?: string;
}

export interface OAuthConfig {
  google: {
    clientId: string;
    clientIdIOS?: string;
    clientIdAndroid?: string;
  };
  facebook: {
    appId: string;
  };
  apple: {
    clientId: string;
    redirectUri: string;
  };
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const OAUTH_CONFIG: OAuthConfig = {
  google: {
    // TODO: Reemplazar con tus client IDs reales
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    clientIdIOS: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    clientIdAndroid: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  },
  facebook: {
    // TODO: Reemplazar con tu Facebook App ID
    appId: 'YOUR_FACEBOOK_APP_ID',
  },
  apple: {
    // TODO: Reemplazar con tu Apple Service ID
    clientId: 'com.udaredge.app',
    redirectUri: 'https://udaredge.com/auth/apple/callback',
  },
};

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

/**
 * Inicia sesión con Google
 */
export async function signInWithGoogle(): Promise<OAuthUser> {
  console.log('🔐 Iniciando Google Sign-In...');

  if (!Capacitor.isNativePlatform()) {
    return signInWithGoogleWeb();
  }

  try {
    // En nativo, usar el plugin @codetrix-studio/capacitor-google-auth
    // npm install @codetrix-studio/capacitor-google-auth
    
    // const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    
    // await GoogleAuth.initialize({
    //   clientId: OAUTH_CONFIG.google.clientId,
    //   scopes: ['profile', 'email'],
    // });
    
    // const result = await GoogleAuth.signIn();
    
    // return {
    //   id: result.id,
    //   email: result.email,
    //   name: result.displayName || result.name || '',
    //   avatar: result.imageUrl,
    //   provider: 'google',
    //   accessToken: result.authentication.accessToken,
    // };

    // SIMULACIÓN PARA DESARROLLO
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'google_' + Math.random().toString(36).substring(7),
      email: 'pau.royo@gmail.com',
      name: 'Pau Royo del Amor',
      avatar: 'https://ui-avatars.com/api/?name=Pau+Royo+del+Amor&background=4285F4&color=fff',
      provider: 'google',
    };
  } catch (error: any) {
    console.error('Error en Google Sign-In:', error);
    
    if (error.message?.includes('popup_closed_by_user')) {
      throw new Error('Login cancelado por el usuario');
    }
    
    throw new Error('Error al iniciar sesión con Google');
  }
}

/**
 * Google Sign-In para web/PWA
 */
async function signInWithGoogleWeb(): Promise<OAuthUser> {
  console.log('🌐 Google Sign-In Web...');

  // TODO: Implementar con Google Identity Services
  // https://developers.google.com/identity/gsi/web/guides/overview
  
  // SIMULACIÓN
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: 'google_web_' + Math.random().toString(36).substring(7),
    email: 'pau.royo@gmail.com',
    name: 'Pau Royo del Amor',
    avatar: 'https://ui-avatars.com/api/?name=Pau+Royo+del+Amor&background=4285F4&color=fff',
    provider: 'google',
  };
}

/**
 * Cierra sesión de Google
 */
export async function signOutGoogle(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
    // await GoogleAuth.signOut();
    console.log('✅ Sesión de Google cerrada');
  } catch (error) {
    console.error('Error cerrando sesión de Google:', error);
  }
}

// ============================================================================
// FACEBOOK LOGIN
// ============================================================================

/**
 * Inicia sesión con Facebook
 */
export async function signInWithFacebook(): Promise<OAuthUser> {
  console.log('🔐 Iniciando Facebook Login...');

  if (!Capacitor.isNativePlatform()) {
    return signInWithFacebookWeb();
  }

  try {
    // En nativo, usar el plugin @capacitor-community/facebook-login
    // npm install @capacitor-community/facebook-login
    
    // const { FacebookLogin } = await import('@capacitor-community/facebook-login');
    
    // await FacebookLogin.initialize({ appId: OAUTH_CONFIG.facebook.appId });
    
    // const result = await FacebookLogin.login({
    //   permissions: ['email', 'public_profile'],
    // });
    
    // if (result.accessToken) {
    //   // Obtener datos del usuario
    //   const response = await fetch(
    //     `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${result.accessToken.token}`
    //   );
    //   const userData = await response.json();
    //   
    //   return {
    //     id: userData.id,
    //     email: userData.email,
    //     name: userData.name,
    //     avatar: userData.picture?.data?.url,
    //     provider: 'facebook',
    //     accessToken: result.accessToken.token,
    //   };
    // }

    // SIMULACIÓN
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'fb_' + Math.random().toString(36).substring(7),
      email: 'pau.royo@facebook.com',
      name: 'Pau Royo del Amor',
      avatar: 'https://ui-avatars.com/api/?name=Pau+Royo+del+Amor&background=1877F2&color=fff',
      provider: 'facebook',
    };
  } catch (error: any) {
    console.error('Error en Facebook Login:', error);
    
    if (error.message?.includes('user_cancelled')) {
      throw new Error('Login cancelado por el usuario');
    }
    
    throw new Error('Error al iniciar sesión con Facebook');
  }
}

/**
 * Facebook Login para web/PWA
 */
async function signInWithFacebookWeb(): Promise<OAuthUser> {
  console.log('🌐 Facebook Login Web...');

  // TODO: Implementar con Facebook SDK for JavaScript
  // https://developers.facebook.com/docs/javascript/quickstart
  
  // SIMULACIÓN
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: 'fb_web_' + Math.random().toString(36).substring(7),
    email: 'pau.royo@facebook.com',
    name: 'Pau Royo del Amor',
    avatar: 'https://ui-avatars.com/api/?name=Pau+Royo+del+Amor&background=1877F2&color=fff',
    provider: 'facebook',
  };
}

/**
 * Cierra sesión de Facebook
 */
export async function signOutFacebook(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // const { FacebookLogin } = await import('@capacitor-community/facebook-login');
    // await FacebookLogin.logout();
    console.log('✅ Sesión de Facebook cerrada');
  } catch (error) {
    console.error('Error cerrando sesión de Facebook:', error);
  }
}

// ============================================================================
// APPLE SIGN IN
// ============================================================================

/**
 * Inicia sesión con Apple (solo iOS 13+)
 */
export async function signInWithApple(): Promise<OAuthUser> {
  console.log('🔐 Iniciando Apple Sign In...');

  if (Capacitor.getPlatform() !== 'ios') {
    throw new Error('Apple Sign In solo disponible en iOS');
  }

  try {
    // En iOS, usar el plugin @capacitor-community/apple-sign-in
    // npm install @capacitor-community/apple-sign-in
    
    // const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
    
    // const result = await SignInWithApple.authorize({
    //   clientId: OAUTH_CONFIG.apple.clientId,
    //   redirectURI: OAUTH_CONFIG.apple.redirectUri,
    //   scopes: 'email name',
    // });
    
    // return {
    //   id: result.response.user,
    //   email: result.response.email || '',
    //   name: result.response.givenName + ' ' + result.response.familyName,
    //   provider: 'apple',
    //   accessToken: result.response.identityToken,
    // };

    // SIMULACIÓN
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: 'apple_' + Math.random().toString(36).substring(7),
      email: 'pau.royo@privaterelay.appleid.com',
      name: 'Pau Royo del Amor',
      avatar: 'https://ui-avatars.com/api/?name=Pau+Royo+del+Amor&background=000000&color=fff',
      provider: 'apple',
    };
  } catch (error: any) {
    console.error('Error en Apple Sign In:', error);
    
    if (error.code === '1001') {
      throw new Error('Login cancelado por el usuario');
    }
    
    throw new Error('Error al iniciar sesión con Apple');
  }
}

// ============================================================================
// BIOMETRÍA
// ============================================================================

/**
 * Verifica disponibilidad de biometría
 */
export async function isBiometricAvailable(): Promise<boolean> {
  // En desarrollo web, simular que está disponible para testing
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Verificar si el navegador soporta Web Authentication API (para testing)
      return !!(window.PublicKeyCredential);
    }
    return false;
  }

  // En plataforma nativa, la biometría se habilitará cuando se instale el plugin
  // TODO: Descomentar cuando se instale @capacitor-community/native-biometric
  console.log('⚠️ Biometría nativa disponible solo después de instalar el plugin');
  return false;
  
  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric } = await import('@capacitor-community/native-biometric');
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.error('Error verificando biometría:', error);
    return false;
  }
  */
}

/**
 * Obtiene el tipo de biometría disponible
 */
export async function getBiometricType(): Promise<'fingerprint' | 'face' | 'iris' | null> {
  // En desarrollo, simular fingerprint para testing
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'fingerprint';
    }
    return null;
  }

  // TODO: Descomentar cuando se instale el plugin
  console.log('⚠️ Tipo de biometría disponible después de instalar el plugin');
  return null;

  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric, BiometryType } = await import('@capacitor-community/native-biometric');
    const result = await NativeBiometric.isAvailable();
    
    if (!result.isAvailable) {
      return null;
    }

    switch (result.biometryType) {
      case BiometryType.TOUCH_ID:
      case BiometryType.FINGERPRINT:
        return 'fingerprint';
      case BiometryType.FACE_ID:
      case BiometryType.FACE_AUTHENTICATION:
        return 'face';
      case BiometryType.IRIS_AUTHENTICATION:
        return 'iris';
      default:
        return null;
    }
  } catch (error) {
    console.error('Error obteniendo tipo de biometría:', error);
    return null;
  }
  */
}

/**
 * Autentica con biometría
 */
export async function authenticateWithBiometric(reason?: string): Promise<boolean> {
  // En desarrollo, simular autenticación exitosa para testing
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      toast.info('Simulando autenticación biométrica (modo desarrollo)');
      return true;
    }
    toast.error('Biometría solo disponible en dispositivos móviles');
    return false;
  }

  // TODO: Descomentar cuando se instale el plugin
  toast.error('Plugin de biometría no instalado aún');
  return false;

  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric } = await import('@capacitor-community/native-biometric');
    
    const result = await NativeBiometric.verifyIdentity({
      reason: reason || 'Por favor, autentícate para continuar',
      title: 'Autenticación requerida',
      subtitle: 'Udar Edge',
      description: 'Usa tu huella o Face ID',
    });

    return result.verified;
  } catch (error: any) {
    console.error('Error en autenticación biométrica:', error);
    
    if (error.code === 10 || error.code === 'user_cancel') {
      // Usuario canceló
      return false;
    }
    
    throw new Error('Error en autenticación biométrica');
  }
  */
}

/**
 * Guarda credenciales de forma segura para biometría
 */
export async function saveCredentialsForBiometric(
  username: string,
  password: string
): Promise<void> {
  // En desarrollo, guardar en localStorage (NO USAR EN PRODUCCIÓN)
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      localStorage.setItem('biometric_username', username);
      localStorage.setItem('biometric_password', btoa(password)); // Base64 básico
      console.log('✅ Credenciales guardadas en localStorage (modo desarrollo)');
    }
    return;
  }

  // TODO: Descomentar cuando se instale el plugin
  console.log('⚠️ Guardado de credenciales disponible después de instalar el plugin');
  
  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric } = await import('@capacitor-community/native-biometric');
    
    await NativeBiometric.setCredentials({
      username,
      password,
      server: 'udaredge.com',
    });

    console.log('✅ Credenciales guardadas para biometría');
  } catch (error) {
    console.error('Error guardando credenciales:', error);
    throw error;
  }
  */
}

/**
 * Obtiene credenciales guardadas (requiere biometría)
 */
export async function getCredentialsWithBiometric(): Promise<{
  username: string;
  password: string;
} | null> {
  // En desarrollo, obtener de localStorage
  if (!Capacitor.isNativePlatform()) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const username = localStorage.getItem('biometric_username');
      const password = localStorage.getItem('biometric_password');
      
      if (username && password) {
        return {
          username,
          password: atob(password), // Decodificar base64
        };
      }
    }
    return null;
  }

  // TODO: Descomentar cuando se instale el plugin
  console.log('⚠️ Obtención de credenciales disponible después de instalar el plugin');
  return null;

  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric } = await import('@capacitor-community/native-biometric');
    
    const credentials = await NativeBiometric.getCredentials({
      server: 'udaredge.com',
    });

    return {
      username: credentials.username,
      password: credentials.password,
    };
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    return null;
  }
  */
}

/**
 * Elimina credenciales guardadas
 */
export async function deleteStoredCredentials(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // En desarrollo, limpiar localStorage
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      localStorage.removeItem('biometric_username');
      localStorage.removeItem('biometric_password');
      console.log('✅ Credenciales eliminadas de localStorage (modo desarrollo)');
    }
    return;
  }

  // TODO: Descomentar cuando se instale el plugin
  console.log('⚠️ Eliminación de credenciales disponible después de instalar el plugin');
  
  /*
  // DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
  try {
    const { NativeBiometric } = await import('@capacitor-community/native-biometric');
    
    await NativeBiometric.deleteCredentials({
      server: 'udaredge.com',
    });

    console.log('✅ Credenciales eliminadas');
  } catch (error) {
    console.error('Error eliminando credenciales:', error);
  }
  */
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Envía el token de OAuth al backend
 */
export async function sendOAuthTokenToBackend(
  user: OAuthUser
): Promise<{ token: string; refreshToken: string }> {
  try {
    // TODO: Conectar con API real
    console.log('📤 Enviando OAuth token al backend:', user);

    // const response = await fetch('/api/auth/oauth', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     provider: user.provider,
    //     accessToken: user.accessToken,
    //     email: user.email,
    //     name: user.name,
    //   }),
    // });
    
    // const data = await response.json();
    // return {
    //   token: data.token,
    //   refreshToken: data.refreshToken,
    // };

    // SIMULACIÓN
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      token: 'mock_jwt_token_' + Math.random().toString(36),
      refreshToken: 'mock_refresh_token_' + Math.random().toString(36),
    };
  } catch (error) {
    console.error('Error enviando OAuth token:', error);
    throw error;
  }
}

/**
 * Cierra sesión de todos los providers
 */
export async function signOutAllProviders(): Promise<void> {
  await Promise.allSettled([
    signOutGoogle(),
    signOutFacebook(),
    deleteStoredCredentials(),
  ]);
  
  console.log('✅ Sesión cerrada de todos los providers');
}