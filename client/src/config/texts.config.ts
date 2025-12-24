/**
 * 📝 CONFIGURACIÓN DE TEXTOS
 * Cambia TODOS los textos de la app aquí
 */

import type { TenantTexts } from '../types/tenant.types';

// ============================================
// 🇪🇸 ESPAÑOL - GENÉRICO
// ============================================
export const TEXTS_ES_GENERIC: TenantTexts = {
  login: {
    title: 'Bienvenido',
    subtitle: 'Inicia sesión para continuar',
    emailPlaceholder: 'correo@ejemplo.com',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    registerButton: 'Registrarse',
    forgotPassword: '¿Olvidaste tu contraseña?',
    orContinueWith: 'O continúa con',
  },
  
  onboarding: {
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: 'Empezar',
    slides: [
      {
        title: 'Bienvenido a tu nueva app',
        description: 'Gestiona todo desde un solo lugar',
      },
      {
        title: 'Fácil y rápido',
        description: 'Interfaz intuitiva y sencilla',
      },
      {
        title: '¡Listo para empezar!',
        description: 'Comienza a usar la app ahora',
      },
    ],
  },
  
  cliente: {
    dashboard: {
      title: 'Inicio',
      welcomeMessage: '¡Hola {name}!',
    },
    orders: {
      title: 'Mis Pedidos',
      emptyState: 'No tienes pedidos todavía',
      newOrderButton: 'Nuevo Pedido',
    },
    favorites: {
      title: 'Favoritos',
      emptyState: 'No tienes favoritos todavía',
    },
    profile: {
      title: 'Mi Perfil',
      editButton: 'Editar Perfil',
    },
  },
  
  trabajador: {
    dashboard: {
      title: 'Panel de Trabajo',
      welcomeMessage: '¡Hola {name}! Tienes {count} tareas pendientes',
    },
    tasks: {
      title: 'Mis Tareas',
      emptyState: 'No tienes tareas asignadas',
    },
    schedule: {
      title: 'Mi Horario',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Dashboard',
      welcomeMessage: '¡Hola {name}! Aquí está el resumen de hoy',
    },
    products: {
      title: 'Gestión de Productos',
      newProductButton: 'Nuevo Producto',
      emptyState: 'No hay productos todavía',
    },
    analytics: {
      title: 'Análisis y Estadísticas',
    },
    integrations: {
      title: 'Integraciones',
    },
    users: {
      title: 'Gestión de Usuarios',
      newUserButton: 'Nuevo Usuario',
    },
  },
  
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    logout: 'Cerrar Sesión',
    settings: 'Ajustes',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    actions: 'Acciones',
  },
};

// ============================================
// 🍕 ESPAÑOL - LA PIZZERÍA
// ============================================
export const TEXTS_ES_PIZZERIA: TenantTexts = {
  login: {
    title: 'Bienvenido a La Pizzería',
    subtitle: '¡La mejor pizza te espera!',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: 'Tu contraseña',
    loginButton: 'Entrar',
    registerButton: 'Crear cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    orContinueWith: 'O entra con',
  },
  
  onboarding: {
    skip: 'Omitir',
    next: 'Siguiente',
    getStarted: '¡Pedir ahora!',
    slides: [
      {
        title: 'Pizza artesanal italiana',
        description: 'Masa tradicional hecha cada día',
      },
      {
        title: 'Entrega en 30 minutos',
        description: 'O es gratis',
      },
      {
        title: '¡Empieza a pedir!',
        description: 'Tu pizza favorita a un clic',
      },
    ],
  },
  
  cliente: {
    dashboard: {
      title: 'Inicio',
      welcomeMessage: '¡Hola {name}! ¿Qué pizza te apetece hoy?',
    },
    orders: {
      title: 'Mis Pedidos',
      emptyState: 'Aún no has pedido ninguna pizza 🍕',
      newOrderButton: 'Pedir Pizza',
    },
    favorites: {
      title: 'Mis Favoritas',
      emptyState: 'Guarda tus pizzas favoritas aquí',
    },
    profile: {
      title: 'Mi Cuenta',
      editButton: 'Editar datos',
    },
  },
  
  trabajador: {
    dashboard: {
      title: 'Área de Trabajo',
      welcomeMessage: '¡Hola {name}! Tienes {count} pedidos en cocina',
    },
    tasks: {
      title: 'Pedidos en Cola',
      emptyState: 'No hay pedidos pendientes',
    },
    schedule: {
      title: 'Mis Turnos',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Panel de Control',
      welcomeMessage: '¡Hola {name}! Resumen del día',
    },
    products: {
      title: 'Menú',
      newProductButton: 'Nueva Pizza',
      emptyState: 'No hay pizzas en el menú',
    },
    analytics: {
      title: 'Estadísticas de Ventas',
    },
    integrations: {
      title: 'Plataformas de Delivery',
    },
    users: {
      title: 'Equipo',
      newUserButton: 'Nuevo Empleado',
    },
  },
  
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: '¡Listo!',
    logout: 'Salir',
    settings: 'Configuración',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    actions: 'Acciones',
  },
};

// ============================================
// ☕ ESPAÑOL - COFFEE HOUSE
// ============================================
export const TEXTS_ES_COFFEE: TenantTexts = {
  login: {
    title: 'Bienvenido a Coffee House',
    subtitle: 'El mejor café te está esperando',
    emailPlaceholder: 'email@ejemplo.com',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    registerButton: 'Únete ahora',
    forgotPassword: '¿Olvidaste tu contraseña?',
    orContinueWith: 'O continúa con',
  },
  
  onboarding: {
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: 'Empezar',
    slides: [
      {
        title: 'Café artesanal premium',
        description: 'Granos seleccionados de origen único',
      },
      {
        title: 'Prepara tu café perfecto',
        description: 'Personaliza cada detalle',
      },
      {
        title: '¡Disfruta tu café!',
        description: 'Pide y recoge en minutos',
      },
    ],
  },
  
  cliente: {
    dashboard: {
      title: 'Inicio',
      welcomeMessage: '¡Buenos días {name}! ☕',
    },
    orders: {
      title: 'Mis Pedidos',
      emptyState: 'Aún no has pedido tu café',
      newOrderButton: 'Pedir Café',
    },
    favorites: {
      title: 'Mis Favoritos',
      emptyState: 'Guarda tus cafés favoritos',
    },
    profile: {
      title: 'Mi Perfil',
      editButton: 'Editar',
    },
  },
  
  trabajador: {
    dashboard: {
      title: 'Área Barista',
      welcomeMessage: '¡Hola {name}! {count} cafés en cola',
    },
    tasks: {
      title: 'Pedidos Pendientes',
      emptyState: 'No hay pedidos',
    },
    schedule: {
      title: 'Mis Turnos',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Dashboard',
      welcomeMessage: '¡Hola {name}! Resumen de hoy',
    },
    products: {
      title: 'Carta',
      newProductButton: 'Nuevo Producto',
      emptyState: 'No hay productos',
    },
    analytics: {
      title: 'Análisis de Ventas',
    },
    integrations: {
      title: 'Integraciones',
    },
    users: {
      title: 'Equipo',
      newUserButton: 'Nuevo Barista',
    },
  },
  
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Preparando...',
    error: 'Error',
    success: '¡Listo!',
    logout: 'Salir',
    settings: 'Configuración',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    actions: 'Acciones',
  },
};

// ============================================
// 🍰 ESPAÑOL - HOY PECAMOS
// ============================================
export const TEXTS_ES_HOY_PECAMOS: TenantTexts = {
  login: {
    title: 'Bienvenido a Hoy Pecamos',
    subtitle: 'La mejor pizza y burger de la ciudad',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Entrar',
    registerButton: 'Crear cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    orContinueWith: 'O continúa con',
  },
  
  onboarding: {
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: '¡Pedir ahora!',
    slides: [
      {
        title: 'Análisis de Logo',
        description: 'Vista del logo en diferentes tamaños y contextos.',
      },
      {
        title: 'La mejor pizza artesanal',
        description: 'Masa fresca, ingredientes premium y horno de leña. El sabor italiano auténtico en cada bocado.',
      },
      {
        title: 'Burgers que enamoran',
        description: 'Carne 100% vacuno, pan artesanal y salsas caseras. Cada burger es una experiencia única.',
      },
      {
        title: 'Pedidos rápidos y fáciles',
        description: 'Pide desde tu móvil en segundos. Recoge en tienda o recibe a domicilio en minutos.',
      },
    ],
  },
  
  cliente: {
    dashboard: {
      title: '¡Hola {name}! 🍕',
      subtitle: '¿Qué te apetece hoy?',
      welcomeMessage: 'Bienvenido de nuevo',
      quickActions: 'Acciones rápidas',
      myOrders: 'Mis Pedidos',
      viewMenu: 'Ver Menú',
      promotions: 'Promociones',
    },
    
    orders: {
      title: 'Mis Pedidos',
      newOrder: 'Nuevo Pedido',
      orderHistory: 'Historial',
      activeOrders: 'Pedidos Activos',
      emptyState: 'Aún no has pedido... ¡prueba nuestras pizzas!',
      orderDetails: 'Detalles del Pedido',
      trackOrder: 'Seguir Pedido',
      cancelOrder: 'Cancelar',
      reorder: 'Repetir Pedido',
    },
    
    menu: {
      title: 'Nuestro Menú',
      categories: 'Categorías',
      search: 'Buscar plato...',
      addToCart: 'Añadir',
      viewDetails: 'Ver Detalles',
      pizzas: 'Pizzas',
      burgers: 'Burgers',
      drinks: 'Bebidas',
      desserts: 'Postres',
    },
    
    cart: {
      title: 'Tu Carrito',
      empty: 'Tu carrito está vacío',
      checkout: 'Realizar Pedido',
      total: 'Total',
      items: 'productos',
      addMore: 'Añadir más',
      clear: 'Vaciar carrito',
    },
    
    profile: {
      title: 'Mi Perfil',
      editProfile: 'Editar Perfil',
      myAddresses: 'Mis Direcciones',
      paymentMethods: 'Métodos de Pago',
      notifications: 'Notificaciones',
      preferences: 'Preferencias',
      logout: 'Cerrar Sesión',
    },
    
    favorites: {
      title: 'Favoritos',
      emptyState: 'Aún no tienes favoritos',
      addToFavorites: 'Añadir a Favoritos',
      removeFromFavorites: 'Quitar de Favoritos',
    },
  },
  
  trabajador: {
    dashboard: {
      title: '¡Hola {name}! 👨‍🍳',
      subtitle: 'Panel de Trabajo',
      pendingOrders: 'Pedidos Pendientes',
      myTasks: 'Mis Tareas',
      schedule: 'Mi Horario',
    },
    
    orders: {
      title: 'Pedidos',
      pending: 'Pendientes',
      inProgress: 'En Proceso',
      completed: 'Completados',
      markAsReady: 'Marcar como Listo',
      viewDetails: 'Ver Detalles',
    },
    
    tasks: {
      title: 'Tareas',
      myTasks: 'Mis Tareas',
      completed: 'Completadas',
      pending: 'Pendientes',
      addTask: 'Nueva Tarea',
      markAsDone: 'Marcar como Hecha',
    },
    
    schedule: {
      title: 'Mi Horario',
      today: 'Hoy',
      week: 'Semana',
      month: 'Mes',
      checkIn: 'Fichar Entrada',
      checkOut: 'Fichar Salida',
      totalHours: 'Horas Totales',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Panel de Control',
      subtitle: 'Gestión Completa',
      overview: 'Resumen General',
      analytics: 'Analítica',
      reports: 'Reportes',
    },
    
    products: {
      title: 'Menú',
      addProduct: 'Nuevo Plato',
      editProduct: 'Editar',
      deleteProduct: 'Eliminar',
      categories: 'Categorías',
      stock: 'Stock',
      price: 'Precio',
    },
    
    orders: {
      title: 'Gestión de Pedidos',
      allOrders: 'Todos los Pedidos',
      pending: 'Pendientes',
      completed: 'Completados',
      cancelled: 'Cancelados',
      totalRevenue: 'Ingresos Totales',
    },
    
    users: {
      title: 'Usuarios',
      employees: 'Empleados',
      customers: 'Clientes',
      addUser: 'Nuevo Usuario',
      editUser: 'Editar',
      roles: 'Roles',
    },
    
    settings: {
      title: 'Configuración',
      general: 'General',
      integrations: 'Integraciones',
      notifications: 'Notificaciones',
      billing: 'Facturación',
    },
  },
  
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: '¡Listo!',
    logout: 'Salir',
    settings: 'Configuración',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    actions: 'Acciones',
  },
};

// ============================================
// 🇬🇧 INGLÉS - GENÉRICO
// ============================================
export const TEXTS_EN_GENERIC: TenantTexts = {
  login: {
    title: 'Welcome',
    subtitle: 'Sign in to continue',
    emailPlaceholder: 'email@example.com',
    passwordPlaceholder: 'Password',
    loginButton: 'Sign In',
    registerButton: 'Sign Up',
    forgotPassword: 'Forgot your password?',
    orContinueWith: 'Or continue with',
  },
  
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    slides: [
      {
        title: 'Welcome to your new app',
        description: 'Manage everything from one place',
      },
      {
        title: 'Easy and fast',
        description: 'Intuitive and simple interface',
      },
      {
        title: 'Ready to start!',
        description: 'Start using the app now',
      },
    ],
  },
  
  cliente: {
    dashboard: {
      title: 'Home',
      welcomeMessage: 'Hi {name}!',
    },
    orders: {
      title: 'My Orders',
      emptyState: 'No orders yet',
      newOrderButton: 'New Order',
    },
    favorites: {
      title: 'Favorites',
      emptyState: 'No favorites yet',
    },
    profile: {
      title: 'My Profile',
      editButton: 'Edit Profile',
    },
  },
  
  trabajador: {
    dashboard: {
      title: 'Work Panel',
      welcomeMessage: 'Hi {name}! You have {count} pending tasks',
    },
    tasks: {
      title: 'My Tasks',
      emptyState: 'No assigned tasks',
    },
    schedule: {
      title: 'My Schedule',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Dashboard',
      welcomeMessage: 'Hi {name}! Here\'s today\'s summary',
    },
    products: {
      title: 'Product Management',
      newProductButton: 'New Product',
      emptyState: 'No products yet',
    },
    analytics: {
      title: 'Analytics',
    },
    integrations: {
      title: 'Integrations',
    },
    users: {
      title: 'User Management',
      newUserButton: 'New User',
    },
  },
  
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    logout: 'Logout',
    settings: 'Settings',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    actions: 'Actions',
  },
};

// ============================================
// ⚙️ CONFIGURACIÓN ACTIVA
// ============================================

/**
 * 🎯 CAMBIA AQUÍ PARA SELECCIONAR LOS TEXTOS ACTIVOS
 */
export const ACTIVE_TEXTS: TenantTexts = TEXTS_ES_GENERIC;

// ============================================
// 📚 TODOS LOS TEXTOS DISPONIBLES
// ============================================
export const ALL_TEXTS = {
  'es-generic': TEXTS_ES_GENERIC,
  'es-pizzeria': TEXTS_ES_PIZZERIA,
  'es-coffee': TEXTS_ES_COFFEE,
  'es-hoy-pecamos': TEXTS_ES_HOY_PECAMOS,
  'en-generic': TEXTS_EN_GENERIC,
};

export type TextsKey = keyof typeof ALL_TEXTS;

// ============================================
// 🔧 HELPER: Reemplazar variables en textos
// ============================================
export function replaceTextVars(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key]?.toString() || match;
  });
}