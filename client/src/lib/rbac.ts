/**
 * 🔐 SISTEMA RBAC (Role-Based Access Control)
 * Control de acceso basado en roles y permisos granulares
 */

// ============================================
// TIPOS Y ENUMS
// ============================================

export enum Role {
  SUPER_ADMIN = 'super_admin',
  GERENTE = 'gerente',
  SUPERVISOR = 'supervisor',
  TRABAJADOR = 'trabajador',
  CLIENTE = 'cliente',
}

export enum Modulo {
  CLIENTES = 'clientes',
  EMPLEADOS = 'empleados',
  STOCK = 'stock',
  FACTURACION = 'facturacion',
  PROVEEDORES = 'proveedores',
  PRODUCTIVIDAD = 'productividad',
  ESCANDALLO = 'escandallo',
  CUENTA_RESULTADOS = 'cuenta_resultados',
  DASHBOARD = 'dashboard',
  PEDIDOS = 'pedidos',
  MATERIAL = 'material',
  INVENTARIO = 'inventario',
  CONFIGURACION = 'configuracion',
}

export enum Permiso {
  VER = 'ver',
  CREAR = 'crear',
  EDITAR = 'editar',
  ELIMINAR = 'eliminar',
  EXPORTAR = 'exportar',
  APROBAR = 'aprobar',
  CONFIGURAR = 'configurar',
}

export interface PermisoGranular {
  modulo: Modulo;
  permisos: Permiso[];
}

export interface RoleDefinition {
  nombre: Role;
  descripcion: string;
  nivel: number; // 1 = más alto, 5 = más bajo
  permisos: PermisoGranular[];
}

// ============================================
// DEFINICIÓN DE ROLES
// ============================================

export const ROLES_DEFINICION: Record<Role, RoleDefinition> = {
  [Role.SUPER_ADMIN]: {
    nombre: Role.SUPER_ADMIN,
    descripcion: 'Acceso total al sistema',
    nivel: 1,
    permisos: [
      // Tiene TODOS los permisos en TODOS los módulos
      ...Object.values(Modulo).map(modulo => ({
        modulo,
        permisos: Object.values(Permiso)
      }))
    ]
  },

  [Role.GERENTE]: {
    nombre: Role.GERENTE,
    descripcion: 'Gestión completa del negocio',
    nivel: 2,
    permisos: [
      {
        modulo: Modulo.CLIENTES,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.EMPLEADOS,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR, Permiso.APROBAR]
      },
      {
        modulo: Modulo.STOCK,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.FACTURACION,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR, Permiso.APROBAR]
      },
      {
        modulo: Modulo.PROVEEDORES,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.PRODUCTIVIDAD,
        permisos: [Permiso.VER, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.ESCANDALLO,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.CUENTA_RESULTADOS,
        permisos: [Permiso.VER, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.DASHBOARD,
        permisos: [Permiso.VER, Permiso.EXPORTAR]
      },
      {
        modulo: Modulo.CONFIGURACION,
        permisos: [Permiso.VER, Permiso.EDITAR, Permiso.CONFIGURAR]
      }
    ]
  },

  [Role.SUPERVISOR]: {
    nombre: Role.SUPERVISOR,
    descripcion: 'Supervisión de operaciones diarias',
    nivel: 3,
    permisos: [
      {
        modulo: Modulo.CLIENTES,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR]
      },
      {
        modulo: Modulo.EMPLEADOS,
        permisos: [Permiso.VER]
      },
      {
        modulo: Modulo.STOCK,
        permisos: [Permiso.VER, Permiso.EDITAR]
      },
      {
        modulo: Modulo.FACTURACION,
        permisos: [Permiso.VER, Permiso.CREAR]
      },
      {
        modulo: Modulo.PROVEEDORES,
        permisos: [Permiso.VER]
      },
      {
        modulo: Modulo.PEDIDOS,
        permisos: [Permiso.VER, Permiso.CREAR, Permiso.EDITAR, Permiso.APROBAR]
      },
      {
        modulo: Modulo.DASHBOARD,
        permisos: [Permiso.VER]
      }
    ]
  },

  [Role.TRABAJADOR]: {
    nombre: Role.TRABAJADOR,
    descripcion: 'Operaciones básicas del día a día',
    nivel: 4,
    permisos: [
      {
        modulo: Modulo.PEDIDOS,
        permisos: [Permiso.VER, Permiso.EDITAR]
      },
      {
        modulo: Modulo.MATERIAL,
        permisos: [Permiso.VER, Permiso.CREAR]
      },
      {
        modulo: Modulo.INVENTARIO,
        permisos: [Permiso.VER, Permiso.CREAR]
      }
    ]
  },

  [Role.CLIENTE]: {
    nombre: Role.CLIENTE,
    descripcion: 'Acceso limitado para clientes',
    nivel: 5,
    permisos: [
      {
        modulo: Modulo.PEDIDOS,
        permisos: [Permiso.VER, Permiso.CREAR]
      }
    ]
  }
};

// ============================================
// FUNCIONES DE AUTORIZACIÓN
// ============================================

/**
 * Verifica si un rol tiene un permiso específico en un módulo
 */
export const tienePermiso = (
  rol: Role,
  modulo: Modulo,
  permiso: Permiso
): boolean => {
  const roleDefinition = ROLES_DEFINICION[rol];
  if (!roleDefinition) return false;

  const moduloPermisos = roleDefinition.permisos.find(p => p.modulo === modulo);
  if (!moduloPermisos) return false;

  return moduloPermisos.permisos.includes(permiso);
};

/**
 * Verifica múltiples permisos a la vez (requiere TODOS)
 */
export const tienePermisosMultiples = (
  rol: Role,
  modulo: Modulo,
  permisos: Permiso[]
): boolean => {
  return permisos.every(permiso => tienePermiso(rol, modulo, permiso));
};

/**
 * Verifica si tiene al menos uno de los permisos
 */
export const tieneAlgunPermiso = (
  rol: Role,
  modulo: Modulo,
  permisos: Permiso[]
): boolean => {
  return permisos.some(permiso => tienePermiso(rol, modulo, permiso));
};

/**
 * Obtiene todos los módulos a los que un rol tiene acceso
 */
export const obtenerModulosAccesibles = (rol: Role): Modulo[] => {
  const roleDefinition = ROLES_DEFINICION[rol];
  if (!roleDefinition) return [];

  return roleDefinition.permisos.map(p => p.modulo);
};

/**
 * Obtiene todos los permisos de un rol en un módulo específico
 */
export const obtenerPermisosModulo = (
  rol: Role,
  modulo: Modulo
): Permiso[] => {
  const roleDefinition = ROLES_DEFINICION[rol];
  if (!roleDefinition) return [];

  const moduloPermisos = roleDefinition.permisos.find(p => p.modulo === modulo);
  return moduloPermisos?.permisos || [];
};

/**
 * Verifica si un rol es superior a otro
 */
export const esSuperior = (rol1: Role, rol2: Role): boolean => {
  const nivel1 = ROLES_DEFINICION[rol1]?.nivel || 999;
  const nivel2 = ROLES_DEFINICION[rol2]?.nivel || 999;
  return nivel1 < nivel2; // Menor número = mayor jerarquía
};

/**
 * Verifica si puede gestionar usuarios de otro rol
 */
export const puedeGestionarRol = (rolGestor: Role, rolObjetivo: Role): boolean => {
  // Solo puedes gestionar roles de nivel inferior
  return esSuperior(rolGestor, rolObjetivo);
};

// ============================================
// HOOKS DE REACT
// ============================================

import { useMemo } from 'react';

/**
 * Hook para verificar permisos en componentes
 */
export const usePermiso = (
  rol: Role | null | undefined,
  modulo: Modulo,
  permiso: Permiso
): boolean => {
  return useMemo(() => {
    if (!rol) return false;
    return tienePermiso(rol, modulo, permiso);
  }, [rol, modulo, permiso]);
};

/**
 * Hook para obtener todos los permisos de un módulo
 */
export const usePermisosModulo = (
  rol: Role | null | undefined,
  modulo: Modulo
): Permiso[] => {
  return useMemo(() => {
    if (!rol) return [];
    return obtenerPermisosModulo(rol, modulo);
  }, [rol, modulo]);
};

/**
 * Hook para verificar acceso a un módulo
 */
export const useTieneAccesoModulo = (
  rol: Role | null | undefined,
  modulo: Modulo
): boolean => {
  return useMemo(() => {
    if (!rol) return false;
    const modulosAccesibles = obtenerModulosAccesibles(rol);
    return modulosAccesibles.includes(modulo);
  }, [rol, modulo]);
};

// ============================================
// COMPONENTES DE AUTORIZACIÓN
// ============================================

interface ProtegerAccesoProps {
  rol: Role | null | undefined;
  modulo: Modulo;
  permiso: Permiso;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger contenido según permisos
 */
export const ProtegerAcceso = ({
  rol,
  modulo,
  permiso,
  children,
  fallback = null
}: ProtegerAccesoProps) => {
  const tieneAcceso = usePermiso(rol, modulo, permiso);

  if (!tieneAcceso) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ProtegerModuloProps {
  rol: Role | null | undefined;
  modulo: Modulo;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger módulo completo
 */
export const ProtegerModulo = ({
  rol,
  modulo,
  children,
  fallback = null
}: ProtegerModuloProps) => {
  const tieneAcceso = useTieneAccesoModulo(rol, modulo);

  if (!tieneAcceso) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ============================================
// MIDDLEWARE PARA RUTAS
// ============================================

export interface RutaProtegida {
  path: string;
  modulo: Modulo;
  permisoRequerido?: Permiso;
  rolesPermitidos?: Role[];
}

export const RUTAS_PROTEGIDAS: RutaProtegida[] = [
  {
    path: '/gerente/clientes',
    modulo: Modulo.CLIENTES,
    permisoRequerido: Permiso.VER,
    rolesPermitidos: [Role.SUPER_ADMIN, Role.GERENTE, Role.SUPERVISOR]
  },
  {
    path: '/gerente/equipo',
    modulo: Modulo.EMPLEADOS,
    permisoRequerido: Permiso.VER,
    rolesPermitidos: [Role.SUPER_ADMIN, Role.GERENTE]
  },
  {
    path: '/gerente/stock',
    modulo: Modulo.STOCK,
    permisoRequerido: Permiso.VER,
    rolesPermitidos: [Role.SUPER_ADMIN, Role.GERENTE, Role.SUPERVISOR]
  },
  {
    path: '/trabajador/pedidos',
    modulo: Modulo.PEDIDOS,
    permisoRequerido: Permiso.VER,
    rolesPermitidos: [Role.SUPER_ADMIN, Role.GERENTE, Role.SUPERVISOR, Role.TRABAJADOR]
  }
];

export const verificarAccesoRuta = (
  path: string,
  rol: Role | null | undefined
): boolean => {
  if (!rol) return false;

  const ruta = RUTAS_PROTEGIDAS.find(r => path.startsWith(r.path));
  if (!ruta) return true; // Ruta no protegida

  // Verificar si el rol está en los permitidos
  if (ruta.rolesPermitidos && !ruta.rolesPermitidos.includes(rol)) {
    return false;
  }

  // Verificar permiso específico
  if (ruta.permisoRequerido) {
    return tienePermiso(rol, ruta.modulo, ruta.permisoRequerido);
  }

  return true;
};

// ============================================
// UTILIDADES DE UI
// ============================================

/**
 * Obtiene el nombre legible de un rol
 */
export const nombreRol = (rol: Role): string => {
  const nombres: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'Super Administrador',
    [Role.GERENTE]: 'Gerente',
    [Role.SUPERVISOR]: 'Supervisor',
    [Role.TRABAJADOR]: 'Trabajador',
    [Role.CLIENTE]: 'Cliente'
  };
  return nombres[rol];
};

/**
 * Obtiene el color del badge según el rol
 */
export const colorRol = (rol: Role): string => {
  const colores: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'bg-purple-100 text-purple-800 border-purple-200',
    [Role.GERENTE]: 'bg-blue-100 text-blue-800 border-blue-200',
    [Role.SUPERVISOR]: 'bg-teal-100 text-teal-800 border-teal-200',
    [Role.TRABAJADOR]: 'bg-green-100 text-green-800 border-green-200',
    [Role.CLIENTE]: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colores[rol];
};

// ============================================
// EXPORTAR TODO
// ============================================

export default {
  Role,
  Modulo,
  Permiso,
  ROLES_DEFINICION,
  tienePermiso,
  tienePermisosMultiples,
  tieneAlgunPermiso,
  obtenerModulosAccesibles,
  obtenerPermisosModulo,
  esSuperior,
  puedeGestionarRol,
  usePermiso,
  usePermisosModulo,
  useTieneAccesoModulo,
  ProtegerAcceso,
  ProtegerModulo,
  verificarAccesoRuta,
  nombreRol,
  colorRol
};
