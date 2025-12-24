// Sistema de Notificaciones para Promociones - Udar Edge
// Conectado con el sistema master de promociones

export type TipoNotificacion = 
  | 'nueva_promocion'      // Nueva promoción disponible
  | 'vencimiento_proximo'  // Promoción por vencer en 24h
  | 'activacion_horario'   // Promoción por horario (Happy Hour)
  | 'personalizada'        // Notificación manual del gerente
  | 'recordatorio';        // Recordatorio de promoción activa

export type EstadoNotificacion = 
  | 'programada'   // Pendiente de envío
  | 'enviada'      // Ya enviada
  | 'cancelada';   // Cancelada antes de enviar

export type CanalNotificacion = 
  | 'push'         // Notificación push en la app
  | 'email'        // Email (futuro)
  | 'sms'          // SMS (futuro)
  | 'in_app';      // Banner dentro de la app

export interface NotificacionPromocion {
  // Identificación
  id: string;
  tipo: TipoNotificacion;
  
  // Contenido
  titulo: string;
  mensaje: string;
  imagen?: string; // URL de imagen de la promoción
  
  // Promoción relacionada
  promocionId?: string;
  
  // Segmentación
  publicoObjetivo: string; // 'general', 'premium', 'nuevo', etc.
  clientesDestino?: string[]; // IDs específicos si es personalizada
  cantidadDestinatarios?: number; // Número estimado de receptores
  
  // Canal y estado
  canal: CanalNotificacion;
  estado: EstadoNotificacion;
  
  // Programación
  fechaCreacion: string;
  fechaProgramada?: string; // Para programar envío futuro
  fechaEnviada?: string;
  
  // Interacción
  enviadas: number; // Cantidad enviadas
  leidas: number; // Cantidad leídas
  clicsPromocion: number; // Clics en "Ver promoción"
  
  // Metadata
  creadaPor: string; // ID del gerente que la creó
  gerenteNombre?: string;
  automatica: boolean; // true si fue generada automáticamente
}

// ============================================
// NOTIFICACIONES MOCK - HISTORIAL DE EJEMPLO
// ============================================

export const notificacionesHistorial: NotificacionPromocion[] = [
  {
    id: 'NOTIF-001',
    tipo: 'nueva_promocion',
    titulo: '🎉 ¡Nueva promoción disponible!',
    mensaje: 'Pack Croissants Familiares con 25% de descuento. ¡No te lo pierdas!',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    promocionId: 'PROMO-COMBO-001',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    canal: 'push',
    estado: 'enviada',
    fechaCreacion: '2025-11-28T09:00:00',
    fechaEnviada: '2025-11-28T09:15:00',
    enviadas: 450,
    leidas: 320,
    clicsPromocion: 185,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez',
    automatica: true
  },
  {
    id: 'NOTIF-002',
    tipo: 'activacion_horario',
    titulo: '⏰ Happy Hour Coffee - ¡Ya disponible!',
    mensaje: 'Café + Croissant por solo 2.50€. Válido hasta las 11:00',
    imagen: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    promocionId: 'PROMO-HORARIO-001',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    canal: 'push',
    estado: 'enviada',
    fechaCreacion: '2025-11-29T08:00:00',
    fechaEnviada: '2025-11-29T08:00:00',
    enviadas: 450,
    leidas: 280,
    clicsPromocion: 165,
    creadaPor: 'SYSTEM',
    gerenteNombre: 'Sistema Automático',
    automatica: true
  },
  {
    id: 'NOTIF-003',
    tipo: 'vencimiento_proximo',
    titulo: '⚠️ Última oportunidad',
    mensaje: '2x1 en Croissants termina hoy. ¡Aprovecha antes de que expire!',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    promocionId: 'PROMO-001',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    canal: 'push',
    estado: 'enviada',
    fechaCreacion: '2025-11-28T18:00:00',
    fechaEnviada: '2025-11-28T18:00:00',
    enviadas: 450,
    leidas: 395,
    clicsPromocion: 245,
    creadaPor: 'SYSTEM',
    gerenteNombre: 'Sistema Automático',
    automatica: true
  },
  {
    id: 'NOTIF-004',
    tipo: 'personalizada',
    titulo: '⭐ Oferta exclusiva Premium',
    mensaje: 'Como cliente Premium, disfruta de 30% de descuento VIP en todos nuestros productos',
    imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    promocionId: 'PROMO-003',
    publicoObjetivo: 'premium',
    cantidadDestinatarios: 87,
    canal: 'push',
    estado: 'enviada',
    fechaCreacion: '2025-11-27T14:00:00',
    fechaEnviada: '2025-11-27T14:30:00',
    enviadas: 87,
    leidas: 76,
    clicsPromocion: 58,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez',
    automatica: false
  },
  {
    id: 'NOTIF-005',
    tipo: 'recordatorio',
    titulo: '🎁 Recordatorio: 3x2 en Magdalenas',
    mensaje: 'No olvides que puedes llevar 3 magdalenas por el precio de 2',
    imagen: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400',
    promocionId: 'PROMO-009',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    canal: 'push',
    estado: 'enviada',
    fechaCreacion: '2025-11-27T16:00:00',
    fechaEnviada: '2025-11-27T16:00:00',
    enviadas: 450,
    leidas: 310,
    clicsPromocion: 178,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez',
    automatica: false
  },
  {
    id: 'NOTIF-006',
    tipo: 'nueva_promocion',
    titulo: '🆕 Nuevo: Combo Desayuno Completo',
    mensaje: 'Prueba nuestro nuevo combo: Café + 2 Croissants + Zumo por 5.50€',
    imagen: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    promocionId: 'PROMO-COMBO-003',
    publicoObjetivo: 'general',
    cantidadDestinatarios: 450,
    canal: 'push',
    estado: 'programada',
    fechaCreacion: '2025-11-29T10:00:00',
    fechaProgramada: '2025-11-30T08:00:00',
    enviadas: 0,
    leidas: 0,
    clicsPromocion: 0,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez',
    automatica: false
  }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

export const obtenerNotificacionesPorEstado = (estado: EstadoNotificacion): NotificacionPromocion[] => {
  return notificacionesHistorial.filter(n => n.estado === estado);
};

export const obtenerNotificacionesPorTipo = (tipo: TipoNotificacion): NotificacionPromocion[] => {
  return notificacionesHistorial.filter(n => n.tipo === tipo);
};

export const obtenerNotificacionesEnviadas = (): NotificacionPromocion[] => {
  return notificacionesHistorial.filter(n => n.estado === 'enviada');
};

export const obtenerNotificacionesProgramadas = (): NotificacionPromocion[] => {
  return notificacionesHistorial.filter(n => n.estado === 'programada');
};

export const calcularTasaApertura = (notificacion: NotificacionPromocion): number => {
  if (notificacion.enviadas === 0) return 0;
  return (notificacion.leidas / notificacion.enviadas) * 100;
};

export const calcularTasaClics = (notificacion: NotificacionPromocion): number => {
  if (notificacion.leidas === 0) return 0;
  return (notificacion.clicsPromocion / notificacion.leidas) * 100;
};

export const obtenerEstadisticasGlobales = () => {
  const enviadas = obtenerNotificacionesEnviadas();
  
  const totalEnviadas = enviadas.reduce((sum, n) => sum + n.enviadas, 0);
  const totalLeidas = enviadas.reduce((sum, n) => sum + n.leidas, 0);
  const totalClics = enviadas.reduce((sum, n) => sum + n.clicsPromocion, 0);
  
  return {
    totalNotificaciones: enviadas.length,
    totalEnviadas,
    totalLeidas,
    totalClics,
    tasaAperturaPromedio: totalEnviadas > 0 ? (totalLeidas / totalEnviadas) * 100 : 0,
    tasaClicsPromedio: totalLeidas > 0 ? (totalClics / totalLeidas) * 100 : 0
  };
};

// Template para crear nueva notificación
export const crearNotificacionTemplate = (
  tipo: TipoNotificacion,
  promocionId?: string
): Partial<NotificacionPromocion> => {
  return {
    id: `NOTIF-${Date.now()}`,
    tipo,
    promocionId,
    publicoObjetivo: 'general',
    canal: 'push',
    estado: 'programada',
    fechaCreacion: new Date().toISOString(),
    enviadas: 0,
    leidas: 0,
    clicsPromocion: 0,
    automatica: false
  };
};

// Simular envío de notificación
export const enviarNotificacion = (notificacion: NotificacionPromocion): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Notificación enviada:', notificacion.titulo);
      resolve(true);
    }, 1000);
  });
};

// ============================================
// NOTIFICACIONES PARA CLIENTE
// ============================================

export interface NotificacionCliente {
  id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  promocionId?: string;
  fecha: string;
  leida: boolean;
  tipo: TipoNotificacion;
}

// Notificaciones mock para un cliente específico
export const notificacionesCliente: NotificacionCliente[] = [
  {
    id: 'NOTIF-CLI-001',
    titulo: '🎉 ¡Nueva promoción disponible!',
    mensaje: 'Pack Croissants Familiares con 25% de descuento',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    promocionId: 'PROMO-COMBO-001',
    fecha: '2025-11-28T09:15:00',
    leida: true,
    tipo: 'nueva_promocion'
  },
  {
    id: 'NOTIF-CLI-002',
    titulo: '⏰ Happy Hour Coffee - ¡Ya disponible!',
    mensaje: 'Café + Croissant por solo 2.50€',
    imagen: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    promocionId: 'PROMO-HORARIO-001',
    fecha: '2025-11-29T08:00:00',
    leida: false,
    tipo: 'activacion_horario'
  },
  {
    id: 'NOTIF-CLI-003',
    titulo: '⚠️ Última oportunidad',
    mensaje: '2x1 en Croissants termina hoy',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
    promocionId: 'PROMO-001',
    fecha: '2025-11-28T18:00:00',
    leida: false,
    tipo: 'vencimiento_proximo'
  }
];

export const obtenerNotificacionesNoLeidas = (): NotificacionCliente[] => {
  return notificacionesCliente.filter(n => !n.leida);
};

export const marcarComoLeida = (notificacionId: string): void => {
  const notif = notificacionesCliente.find(n => n.id === notificacionId);
  if (notif) {
    notif.leida = true;
  }
};

export const contarNoLeidas = (): number => {
  return notificacionesCliente.filter(n => !n.leida).length;
};
