import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Fingerprint,
  User,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  FileText,
  MapPin,
  Briefcase,
  Globe,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ACTIVE_TENANT } from '../config/tenant.config';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  authenticateWithBiometric,
  getCredentialsWithBiometric,
  saveCredentialsForBiometric,
  isBiometricAvailable,
  getBiometricType,
  sendOAuthTokenToBackend,
} from '../services/oauth.service';
import { authApi } from '../services/api';
import { clientesApi } from '../services/api';
import { SelectorMarcaCliente } from './cliente/SelectorMarcaCliente';
import { DevilHeartLogo } from './icons/DevilHeartLogo';

// Importar logos HoyPecamos (igual que SplashScreen)
import logoHoyPecamos from 'figma:asset/a3428b28dbe9517759563dab398d0145766bcbf4.png';
import textoHoyPecamos from 'figma:asset/c51377fad35836fd711cff8bb83c268403db4cac.png';

interface LoginViewMobileProps {
  onLogin: (user: UserType) => void;
}

type AuthView = 'welcome' | 'login' | 'register' | 'select-marca';

export function LoginViewMobile({ onLogin }: LoginViewMobileProps) {
  const config = ACTIVE_TENANT;
  
  // Estado
  const [view, setView] = useState<AuthView>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'iris' | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserType | null>(null); // Usuario pendiente de seleccionar marca
  
  // Registro
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [hasCompany, setHasCompany] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [cif, setCif] = useState('');
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [website, setWebsite] = useState('');

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
    
    if (available) {
      const type = await getBiometricType();
      setBiometricType(type);
    }
  };

  // ============================================================================
  // FUNCIONES DE AUTENTICACIÓN
  // ============================================================================

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      // Llamar a la API real de login
      const userData = await authApi.login({ email, password, remember: rememberMe });

      // Guardar credenciales para biometría si el usuario quiere
      if (rememberMe && biometricAvailable) {
        try {
          await saveCredentialsForBiometric(email, password);
          toast.success('Credenciales guardadas para biometría');
        } catch (error) {
          console.error('Error guardando credenciales:', error);
        }
      }

      // Verificar si ya tiene marca seleccionada
      const marcaPreferida = localStorage.getItem('cliente_marca_preferida');
      if (!marcaPreferida && userData.role === 'cliente') {
        setPendingUser(userData);
        setView('select-marca');
      } else {
        onLogin(userData);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validaciones
    if (!email || !password || !fullName) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (showCompanyFields && !companyName) {
      toast.error('Por favor, ingresa el nombre de tu empresa');
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);

      // Conectar con el web service de registro
      const cliente = await clientesApi.create({
        nombre: fullName,
        email,
        password,
        telefono: phone || undefined,
        // Puedes agregar más campos si el backend los soporta
      });

      if (!cliente) {
        toast.error('No se pudo registrar el usuario.');
        return;
      }

      const successMessage = hasCompany 
        ? `¡Bienvenido a ${config.appName}, ${companyName}! 🎉`
        : `¡Bienvenido a ${config.appName}! 🎉`;
      toast.success(successMessage);

      // Guardar usuario pendiente de seleccionar marca
      setPendingUser({
        id: cliente.id,
        name: cliente.nombre,
        email: cliente.email,
        role: cliente.role || 'cliente',
      });
      setView('select-marca');
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    toast.info(`Conectando con ${provider}...`);
    
    try {
      setLoading(true);

      let oauthUser;
      
      if (provider === 'google') {
        oauthUser = await signInWithGoogle();
      } else if (provider === 'facebook') {
        oauthUser = await signInWithFacebook();
      } else if (provider === 'apple') {
        oauthUser = await signInWithApple();
      } else {
        throw new Error('Provider no soportado');
      }

      // Enviar token al backend y obtener JWT
      const { token, refreshToken } = await sendOAuthTokenToBackend(oauthUser);
      
      // Guardar tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Convertir a User de la app
      const user: UserType = {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email,
        role: 'cliente',
      };

      toast.success(`¡Conectado con ${provider}!`);
      onLogin(user);
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      
      if (error.message?.includes('cancelado')) {
        toast.info('Login cancelado');
      } else {
        toast.error(error.message || 'Error al conectar con ' + provider);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      toast.error('Biometría no disponible en este dispositivo');
      return;
    }

    const biometricName = biometricType === 'face' ? 'Face ID' : 'huella digital';
    toast.info(`Usa tu ${biometricName} para iniciar sesión`);
    
    try {
      // Autenticar con biometría
      const authenticated = await authenticateWithBiometric(
        `Inicia sesión en ${config.appName}`
      );

      if (!authenticated) {
        toast.error('Autenticación cancelada');
        return;
      }

      // Obtener credenciales guardadas
      const credentials = await getCredentialsWithBiometric();
      
      if (!credentials) {
        toast.error('No hay credenciales guardadas. Por favor, inicia sesión normalmente primero.');
        return;
      }

      // Hacer login con las credenciales (en producción, llamar a la API)
      await new Promise(resolve => setTimeout(resolve, 500));

      const user: UserType = {
        id: 'biometric-user',
        name: credentials.username.split('@')[0],
        email: credentials.username,
        role: 'cliente',
      };

      toast.success('¡Autenticado con biometría!');
      onLogin(user);
    } catch (error: any) {
      console.error('Biometric error:', error);
      toast.error(error.message || 'No se pudo autenticar con biometría');
    }
  };

  // ============================================================================
  // VISTAS
  // ============================================================================

  // Vista de Bienvenida
  if (view === 'welcome') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.branding.colors.background} 0%, ${config.branding.colors.background}F5 50%, ${config.branding.colors.background} 100%)`
        }}
      >
        {/* Resplandor rojo de fondo */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${config.branding.colors.primary}80 0%, transparent 60%)`
          }}
        />
        
        {/* Círculos decorativos con color corporativo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.05 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ backgroundColor: config.branding.colors.primary }}
        />
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Logo dinámico del tenant con glow effect */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-12 relative flex flex-col items-center gap-4"
            >
              {/* Glow rojo detrás del logo - MÁS SUTIL */}
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  opacity: [0.08, 0.18, 0.08]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-8 rounded-full blur-3xl"
                style={{ 
                  backgroundColor: config.branding.colors.primary,
                  top: '-1.5rem'
                }}
              />
              
              {/* Segundo glow más pequeño - MÁS SUTIL */}
              <motion.div
                animate={{ 
                  scale: [1, 1.12, 1],
                  opacity: [0.05, 0.12, 0.05]
                }}
                transition={{ 
                  duration: 2.8, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -inset-6 rounded-full blur-2xl"
                style={{ 
                  backgroundColor: config.branding.colors.primary,
                  top: '-1rem'
                }}
              />
              
              {/* 🔥 LOGO HOY PECAMOS con máscara radial - NÍTIDO Y SUTIL */}
              {typeof config.branding.logo === 'string' && config.branding.logo.startsWith('figma:asset') ? (
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <motion.img 
                    src={logoHoyPecamos} 
                    alt={config.branding.appName} 
                    className="w-48 h-48 object-contain"
                    animate={{
                      filter: [
                        `brightness(1.1) contrast(1.08) drop-shadow(0 0 15px ${config.branding.colors.primary}40)`,
                        `brightness(1.15) contrast(1.12) drop-shadow(0 0 22px ${config.branding.colors.primary}55)`,
                        `brightness(1.1) contrast(1.08) drop-shadow(0 0 15px ${config.branding.colors.primary}40)`
                      ]
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      filter: `brightness(1.1) contrast(1.08) drop-shadow(0 0 15px ${config.branding.colors.primary}40)`,
                      WebkitMaskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
                      maskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                  
                  {/* 🔥 TEXTO "HOY PECAMOS" debajo del logo - SUTIL */}
                  <motion.img
                    src={textoHoyPecamos}
                    alt="Hoy Pecamos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      filter: [
                        `brightness(1.05) contrast(1.05) drop-shadow(0 0 10px ${config.branding.colors.primary}30)`,
                        `brightness(1.1) contrast(1.08) drop-shadow(0 0 18px ${config.branding.colors.primary}45)`,
                        `brightness(1.05) contrast(1.05) drop-shadow(0 0 10px ${config.branding.colors.primary}30)`
                      ]
                    }}
                    transition={{ 
                      opacity: { delay: 0.3, duration: 0.5 },
                      y: { delay: 0.3, duration: 0.5 },
                      filter: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-40 object-contain"
                    style={{
                      filter: `brightness(1.05) contrast(1.05) drop-shadow(0 0 10px ${config.branding.colors.primary}30)`,
                      WebkitMaskImage: 'radial-gradient(ellipse 120% 80% at center, black 68%, transparent 88%)',
                      maskImage: 'radial-gradient(ellipse 120% 80% at center, black 68%, transparent 88%)',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                </div>
              ) : config.branding.logo === 'devil-heart' ? (
                <div className="flex flex-col items-center gap-3 w-full relative z-10">
                  <DevilHeartLogo 
                    className="w-40 h-40" 
                    animate={false}
                    color={config.branding.colors.primary}
                  />
                  <h1
                    className="text-3xl tracking-widest"
                    style={{
                      color: config.branding.colors.primary,
                      fontFamily: config.branding.fonts.heading,
                      textShadow: `0 0 15px ${config.branding.colors.primary}80`,
                      letterSpacing: '0.2em'
                    }}
                  >
                    HOY PECAMOS
                  </h1>
                </div>
              ) : (
                <motion.div 
                  className="w-40 h-40 flex items-center justify-center relative z-10"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-9xl" style={{ filter: `drop-shadow(0 0 30px ${config.branding.colors.primary})` }}>
                    {config.branding.logo}
                  </span>
                </motion.div>
              )}
            </motion.div>

            <p 
              className="text-xl mt-4"
              style={{ 
                color: config.branding.colors.primary,
                fontFamily: config.branding.fonts.body,
                textShadow: `0 0 10px ${config.branding.colors.primary}40`
              }}
            >
              {config.branding.tagline}
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Biometría (si disponible) */}
            {biometricAvailable && (
              <Button
                size="lg"
                onClick={handleBiometricLogin}
                disabled={loading}
                className="w-full py-6 text-lg shadow-xl"
                style={{
                  backgroundColor: config.branding.colors.primary,
                  color: config.branding.colors.primaryForeground,
                  boxShadow: `0 10px 40px ${config.branding.colors.primary}60`
                }}
              >
                <Fingerprint className="w-6 h-6 mr-3" />
                Usar {biometricType === 'face' ? 'Face ID' : 'Huella Digital'}
              </Button>
            )}

            {/* Iniciar Sesión */}
            <Button
              size="lg"
              onClick={() => setView('login')}
              disabled={loading}
              className="w-full py-6 text-lg shadow-xl"
              style={{
                backgroundColor: config.branding.colors.primary,
                color: config.branding.colors.primaryForeground,
                boxShadow: `0 10px 40px ${config.branding.colors.primary}60`
              }}
            >
              <Mail className="w-6 h-6 mr-3" />
              Iniciar Sesión
            </Button>

            {/* Crear Cuenta */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView('register')}
              disabled={loading}
              className="w-full py-6 text-lg backdrop-blur-xl"
              style={{
                backgroundColor: `${config.branding.colors.foreground}15`,
                borderColor: config.branding.colors.primary,
                borderWidth: '2px',
                color: config.branding.colors.foreground
              }}
            >
              <User className="w-6 h-6 mr-3" />
              Crear Cuenta Nueva
            </Button>
          </motion.div>

          {/* Divisor */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div 
                className="w-full border-t"
                style={{ borderColor: `${config.branding.colors.foreground}30` }}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-4"
                style={{
                  backgroundColor: config.branding.colors.primary,
                  color: config.branding.colors.primaryForeground
                }}
              >
                O continúa con
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Google */}
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="bg-white hover:bg-gray-50 p-4 border-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="bg-white hover:bg-gray-50 p-4 border-none"
            >
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Button>

            {/* Apple */}
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              className="bg-white hover:bg-gray-50 p-4 border-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Vista de Login
  if (view === 'login') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.branding.colors.background} 0%, ${config.branding.colors.background}F5 50%, ${config.branding.colors.background} 100%)`
        }}
      >
        {/* Resplandor rojo de fondo */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${config.branding.colors.primary}60 0%, transparent 70%)`
          }}
        />
        
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => setView('welcome')}
              className="mb-4"
              style={{ color: config.branding.colors.foreground }}
            >
              ← Volver
            </Button>
            <h2 
              className="text-3xl mb-2"
              style={{ 
                color: config.branding.colors.foreground,
                fontFamily: config.branding.fonts.heading
              }}
            >
              Bienvenido de vuelta
            </h2>
            <p style={{ color: `${config.branding.colors.foreground}80` }}>
              Inicia sesión para continuar
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border"
            style={{
              backgroundColor: `${config.branding.colors.foreground}10`,
              borderColor: `${config.branding.colors.primary}30`
            }}
          >
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 py-6"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 py-6"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <button className="text-sm text-teal-600 hover:text-teal-700">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Login */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-6 text-lg shadow-lg"
            >
              {loading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Link a Registro */}
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setView('register')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Crear cuenta
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Vista de Registro
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => setView('welcome')}
              className="mb-4 text-gray-600"
            >
              ← Volver
            </Button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Crear cuenta
            </h2>
            <p className="text-gray-600">
              Empieza gratis hoy mismo
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5"
          >
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700">Nombre completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-11 py-6"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 py-6"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-11 py-6"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 py-6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón para añadir información de empresa */}
            {!showCompanyFields ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCompanyFields(true);
                  setHasCompany(true);
                }}
                className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 text-gray-600 hover:text-teal-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir información de empresa (opcional)
              </Button>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Cabecera colapsable */}
                <div className="flex items-center justify-between">
                  <Label className="text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    Información de tu empresa
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCompanyFields(false);
                      setHasCompany(false);
                      setCompanyName('');
                      setCif('');
                      setAddress('');
                      setSector('');
                      setWebsite('');
                    }}
                    className="touch-target text-gray-500 hover:text-gray-700"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>

                {/* Nombre de empresa */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-700">Nombre del negocio *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Restaurante La Buena Mesa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-11 py-6"
                    />
                  </div>
                </div>

                {/* CIF/NIF */}
                <div className="space-y-2">
                  <Label htmlFor="cif" className="text-gray-700">CIF/NIF</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="cif"
                      type="text"
                      placeholder="B12345678"
                      value={cif}
                      onChange={(e) => setCif(e.target.value)}
                      className="pl-11 py-6"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Calle Principal 123, Madrid"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-11 py-6"
                    />
                  </div>
                </div>

                {/* Sector */}
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-gray-700">Sector</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="sector"
                      type="text"
                      placeholder="Hostelería, Retail, Servicios..."
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="pl-11 py-6"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-700">Sitio web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://tuempresa.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="pl-11 py-6"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón Registro */}
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-6 text-lg shadow-lg"
            >
              {loading ? (
                'Creando cuenta...'
              ) : (
                <>
                  Crear mi cuenta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Link a Login */}
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setView('login')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Iniciar sesión
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Vista de Selección de Marca
  if (view === 'select-marca') {
    return (
      <SelectorMarcaCliente
        onMarcaSelected={(marcaId) => {
          if (pendingUser) {
            // Guardar la marca seleccionada
            localStorage.setItem('cliente_marca_preferida', marcaId);
            
            const userWithMarca: UserType = {
              ...pendingUser,
              marca: marcaId,
            };
            onLogin(userWithMarca);
          }
        }}
      />
    );
  }

  return null;
}