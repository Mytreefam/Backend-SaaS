import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Lock, UserCog, Users, Mail } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';
import { getConfig } from '../config/white-label.config';

interface LoginViewProps {
  onLogin: (user: UserType) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      toast.error('Por favor, introduce email y contraseña');
      return;
    }
    
    // Simulación de login - en producción esto se conectaría a un backend
    const user: UserType = {
      id: Math.random().toString(36).substring(7),
      name: email.split('@')[0],
      email,
      role: 'cliente',
    };
    toast.success('¡Bienvenido! Accediendo...');
    onLogin(user);
  };

  const handleQuickLogin = (role: 'cliente' | 'trabajador' | 'gerente') => {
    const roleData = {
      cliente: { name: 'Pau Royo del Amor', email: 'cliente@demo.com' },
      trabajador: { name: 'Colaborador Demo', email: 'colaborador@demo.com' },
      gerente: { name: 'Gerente Demo', email: 'gerente@demo.com' }
    };

    const user: UserType = {
      id: Math.random().toString(36).substring(7),
      name: roleData[role].name,
      email: roleData[role].email,
      role,
    };
    toast.success(`Accediendo como ${roleData[role].name}`);
    onLogin(user);
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Iniciando sesión con ${provider}...`);
    // Simulamos login social exitoso
    setTimeout(() => {
      const user: UserType = {
        id: Math.random().toString(36).substring(7),
        name: 'Pau Royo del Amor',
        email: `pau.royo@${provider.toLowerCase()}.com`,
        role: 'cliente',
      };
      toast.success(`¡Conectado con ${provider}!`);
      onLogin(user);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Iconos SVG para redes sociales
  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <ImageWithFallback
              src={udarLogo}
              fallback={<User size={80} />}
              className="h-20"
            />
          </div>
          <h1 className="text-gray-700 mb-2 text-2xl">Disarmink S.L. - Hoy Pecamos</h1>
          <p className="text-gray-600">Sistema de Gestión Integral</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Lock size={16} /> : <Lock size={16} />}
                  </button>
                </div>
              </div>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 h-12 active:scale-95 transition-transform"
                onClick={handleLogin}
              >
                Entrar
              </Button>

              {/* Botones de acceso rápido */}
              <div className="pt-2 space-y-2">
                <p className="text-xs text-gray-500 text-center">Acceso rápido:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-target h-9 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    onClick={() => handleQuickLogin('cliente')}
                  >
                    <User className="w-3 h-3 mr-1" />
                    Cliente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-target h-9 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    onClick={() => handleQuickLogin('trabajador')}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Colaborador
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-target h-9 text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                    onClick={() => handleQuickLogin('gerente')}
                  >
                    <UserCog className="w-3 h-3 mr-1" />
                    Gerente
                  </Button>
                </div>
              </div>

              {/* Botones de login social */}
              <div className="pt-2 space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">O inicia sesión con</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-11 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <GoogleIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                    onClick={() => handleSocialLogin('Facebook')}
                  >
                    <FacebookIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                    onClick={() => handleSocialLogin('Apple')}
                  >
                    <AppleIcon />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Versión Mobile 1.0.0
        </p>
      </div>
    </div>
  );
}