/**
 * 🛡️ ROUTE GUARDS - Protección de Rutas por Rol
 * 
 * HOC (Higher-Order Component) para proteger componentes
 * según el rol del usuario
 */

import React from 'react';
import type { UserRole } from '../App';

interface GuardProps {
  currentUser: { role: UserRole; name: string } | null;
  allowedRoles: Exclude<UserRole, null>[];
}

/**
 * HOC que protege un componente validando el rol del usuario
 * 
 * @param Component - Componente a proteger
 * @param allowedRoles - Roles permitidos para acceder al componente
 * @returns Componente protegido con validación de roles
 * 
 * @example
 * ```tsx
 * const GerenteDashboardProtected = withRoleGuard(GerenteDashboard, ['gerente']);
 * 
 * // En el render:
 * <GerenteDashboardProtected currentUser={currentUser} {...props} />
 * ```
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Exclude<UserRole, null>[]
) {
  return function GuardedComponent(props: P & { currentUser: { role: UserRole; name: string } | null }) {
    const { currentUser, ...restProps } = props;
    
    // ========================================================================
    // CASO 1: No hay usuario logueado
    // ========================================================================
    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔒 Acceso Restringido
              </h2>
              <p className="text-gray-600 mb-6">
                Debes iniciar sesión para acceder a esta página
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#ED1C24] text-white rounded-lg hover:bg-[#D11820] transition-colors font-medium"
            >
              Ir al Login
            </button>
          </div>
        </div>
      );
    }
    
    // ========================================================================
    // CASO 2: Usuario no tiene permiso (rol no autorizado)
    // ========================================================================
    if (!allowedRoles.includes(currentUser.role as Exclude<UserRole, null>)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ⛔ Acceso Denegado
              </h2>
              <p className="text-gray-600 mb-4">
                No tienes permisos para acceder a esta sección
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Usuario:</span>
                  <span className="font-medium text-gray-900">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Tu rol:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Roles permitidos:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {allowedRoles.join(', ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                ← Volver
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cambiar de usuario
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // ========================================================================
    // CASO 3: Usuario autorizado - Renderizar componente
    // ========================================================================
    return <Component {...(restProps as P)} />;
  };
}

/**
 * HOC simplificado solo para gerente
 */
export function requireGerente<P extends object>(Component: React.ComponentType<P>) {
  return withRoleGuard(Component, ['gerente']);
}

/**
 * HOC simplificado solo para trabajador
 */
export function requireTrabajador<P extends object>(Component: React.ComponentType<P>) {
  return withRoleGuard(Component, ['trabajador']);
}

/**
 * HOC simplificado solo para cliente
 */
export function requireCliente<P extends object>(Component: React.ComponentType<P>) {
  return withRoleGuard(Component, ['cliente']);
}

/**
 * HOC para permitir staff (trabajador o gerente)
 */
export function requireStaff<P extends object>(Component: React.ComponentType<P>) {
  return withRoleGuard(Component, ['trabajador', 'gerente']);
}

/**
 * HOC para permitir cualquier usuario autenticado
 */
export function requireAuth<P extends object>(Component: React.ComponentType<P>) {
  return withRoleGuard(Component, ['cliente', 'trabajador', 'gerente']);
}
