/**
 * CONTROLLER: Chat y Mensajería
 * Chat interno, notificaciones y comunicación de equipo
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// CONVERSACIONES
// ============================================
export const obtenerConversaciones = async (req: Request, res: Response) => {
  try {
    const { usuarioId, tipo, empresaId } = req.query;

    // Obtener empleados para simular conversaciones
    const empleados = await prisma.empleado.findMany({
      where: {
        estado: 'activo',
      },
      take: 10,
    });

    const conversaciones = [
      {
        id: 1,
        tipo: 'individual',
        participantes: [
          { id: 1, nombre: 'Gerente', avatar: null, rol: 'gerente' },
          { id: 2, nombre: empleados[0]?.nombre || 'María García', avatar: null, rol: 'encargado' },
        ],
        ultimoMensaje: {
          id: 101,
          contenido: '¿Revisaste el cierre de caja de ayer?',
          remitente: empleados[0]?.nombre || 'María García',
          fecha: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          leido: false,
        },
        mensajesNoLeidos: 2,
        activa: true,
      },
      {
        id: 2,
        tipo: 'grupo',
        nombre: 'Equipo Cocina',
        participantes: [
          { id: 1, nombre: 'Gerente', avatar: null, rol: 'gerente' },
          { id: 3, nombre: empleados[1]?.nombre || 'Pedro López', avatar: null, rol: 'cocinero' },
          { id: 4, nombre: empleados[2]?.nombre || 'Ana Martín', avatar: null, rol: 'cocinero' },
        ],
        ultimoMensaje: {
          id: 102,
          contenido: 'El pedido de esta tarde está listo',
          remitente: empleados[1]?.nombre || 'Pedro López',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          leido: true,
        },
        mensajesNoLeidos: 0,
        activa: true,
      },
      {
        id: 3,
        tipo: 'grupo',
        nombre: 'Anuncios Generales',
        participantes: [],
        ultimoMensaje: {
          id: 103,
          contenido: 'Reunión de equipo mañana a las 9:00',
          remitente: 'Gerente',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          leido: true,
        },
        mensajesNoLeidos: 0,
        activa: true,
      },
    ];

    res.json({
      success: true,
      data: conversaciones,
      total: conversaciones.length,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo conversaciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const obtenerConversacionPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversacion = {
      id: Number(id),
      tipo: 'individual',
      participantes: [
        { id: 1, nombre: 'Gerente', avatar: null, rol: 'gerente' },
        { id: 2, nombre: 'María García', avatar: null, rol: 'encargado' },
      ],
      mensajes: [
        {
          id: 1,
          contenido: 'Buenos días, ¿cómo va el turno?',
          remitenteId: 1,
          remitenteNombre: 'Gerente',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          leido: true,
        },
        {
          id: 2,
          contenido: 'Todo bien, mucho movimiento hoy',
          remitenteId: 2,
          remitenteNombre: 'María García',
          fecha: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          leido: true,
        },
        {
          id: 3,
          contenido: '¿Revisaste el cierre de caja de ayer?',
          remitenteId: 2,
          remitenteNombre: 'María García',
          fecha: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          leido: false,
        },
      ],
    };

    res.json({
      success: true,
      data: conversacion,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo conversación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearConversacion = async (req: Request, res: Response) => {
  try {
    const { tipo, participantes, nombre } = req.body;

    const nuevaConversacion = {
      id: Date.now(),
      tipo,
      nombre: nombre || null,
      participantes,
      mensajes: [],
      creadaEn: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: nuevaConversacion,
      message: 'Conversación creada',
    });
  } catch (error: any) {
    console.error('❌ Error creando conversación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// MENSAJES
// ============================================
export const enviarMensaje = async (req: Request, res: Response) => {
  try {
    const { conversacionId } = req.params;
    const { contenido, adjuntos } = req.body;

    const nuevoMensaje = {
      id: Date.now(),
      conversacionId: Number(conversacionId),
      contenido,
      adjuntos: adjuntos || [],
      remitenteId: 1, // Usuario actual
      remitenteNombre: 'Gerente',
      fecha: new Date().toISOString(),
      leido: false,
      entregado: true,
    };

    res.status(201).json({
      success: true,
      data: nuevoMensaje,
      message: 'Mensaje enviado',
    });
  } catch (error: any) {
    console.error('❌ Error enviando mensaje:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const marcarMensajesLeidos = async (req: Request, res: Response) => {
  try {
    const { conversacionId } = req.params;

    res.json({
      success: true,
      message: `Mensajes de conversación ${conversacionId} marcados como leídos`,
    });
  } catch (error: any) {
    console.error('❌ Error marcando mensajes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const eliminarMensaje = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: `Mensaje ${id} eliminado`,
    });
  } catch (error: any) {
    console.error('❌ Error eliminando mensaje:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// TICKETS DE SOPORTE
// ============================================
export const obtenerTickets = async (req: Request, res: Response) => {
  try {
    const { estado, prioridad, empresaId } = req.query;

    const tickets = [
      {
        id: 1,
        asunto: 'Error en cierre de caja',
        descripcion: 'No puedo cerrar la caja, aparece error de conexión',
        estado: 'abierto',
        prioridad: 'alta',
        categoria: 'técnico',
        creadoPor: 'María García',
        creadoPorId: 2,
        asignadoA: 'Soporte Técnico',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        respuestas: 1,
      },
      {
        id: 2,
        asunto: 'Solicitud de vacaciones',
        descripcion: 'Quiero solicitar vacaciones del 15 al 25 de agosto',
        estado: 'pendiente',
        prioridad: 'media',
        categoria: 'rrhh',
        creadoPor: 'Pedro López',
        creadoPorId: 3,
        asignadoA: 'RRHH',
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        respuestas: 0,
      },
      {
        id: 3,
        asunto: 'Problema con impresora tickets',
        descripcion: 'La impresora no imprime correctamente los tickets',
        estado: 'resuelto',
        prioridad: 'baja',
        categoria: 'técnico',
        creadoPor: 'Ana Martín',
        creadoPorId: 4,
        asignadoA: 'Soporte Técnico',
        fechaCreacion: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        fechaActualizacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        respuestas: 3,
      },
    ];

    let filtrados = tickets;
    if (estado) filtrados = filtrados.filter(t => t.estado === estado);
    if (prioridad) filtrados = filtrados.filter(t => t.prioridad === prioridad);

    res.json({
      success: true,
      data: filtrados,
      total: filtrados.length,
      resumen: {
        abiertos: tickets.filter(t => t.estado === 'abierto').length,
        pendientes: tickets.filter(t => t.estado === 'pendiente').length,
        resueltos: tickets.filter(t => t.estado === 'resuelto').length,
      },
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearTicket = async (req: Request, res: Response) => {
  try {
    const { asunto, descripcion, categoria, prioridad, adjuntos } = req.body;

    const nuevoTicket = {
      id: Date.now(),
      asunto,
      descripcion,
      categoria,
      prioridad: prioridad || 'media',
      estado: 'abierto',
      adjuntos: adjuntos || [],
      creadoPor: 'Usuario actual',
      creadoPorId: 1,
      fechaCreacion: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: nuevoTicket,
      message: 'Ticket creado correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error creando ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const responderTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contenido, adjuntos, cerrar } = req.body;

    const respuesta = {
      id: Date.now(),
      ticketId: Number(id),
      contenido,
      adjuntos: adjuntos || [],
      autor: 'Gerente',
      fecha: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: {
        respuesta,
        ticketCerrado: cerrar || false,
      },
      message: 'Respuesta enviada',
    });
  } catch (error: any) {
    console.error('❌ Error respondiendo ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const actualizarEstadoTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, prioridad, asignadoA } = req.body;

    res.json({
      success: true,
      data: {
        id: Number(id),
        estado,
        prioridad,
        asignadoA,
        fechaActualizacion: new Date().toISOString(),
      },
      message: 'Ticket actualizado',
    });
  } catch (error: any) {
    console.error('❌ Error actualizando ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// ANUNCIOS
// ============================================
export const obtenerAnuncios = async (req: Request, res: Response) => {
  try {
    const { empresaId, activos } = req.query;

    const anuncios = [
      {
        id: 1,
        titulo: 'Reunión mensual de equipo',
        contenido: 'Recordamos que la reunión mensual será el próximo lunes a las 9:00.',
        tipo: 'informativo',
        prioridad: 'normal',
        autor: 'Gerente',
        fechaPublicacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fechaExpiracion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        activo: true,
        leidos: 8,
        totalDestinatarios: 12,
      },
      {
        id: 2,
        titulo: 'Nuevo protocolo de limpieza',
        contenido: 'Se ha actualizado el protocolo de limpieza. Por favor revisar el documento adjunto.',
        tipo: 'importante',
        prioridad: 'alta',
        autor: 'RRHH',
        fechaPublicacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        fechaExpiracion: null,
        activo: true,
        leidos: 12,
        totalDestinatarios: 12,
      },
    ];

    res.json({
      success: true,
      data: anuncios,
      total: anuncios.length,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo anuncios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearAnuncio = async (req: Request, res: Response) => {
  try {
    const { titulo, contenido, tipo, prioridad, destinatarios, fechaExpiracion, adjuntos } = req.body;

    const nuevoAnuncio = {
      id: Date.now(),
      titulo,
      contenido,
      tipo: tipo || 'informativo',
      prioridad: prioridad || 'normal',
      destinatarios: destinatarios || 'todos',
      adjuntos: adjuntos || [],
      autor: 'Gerente',
      fechaPublicacion: new Date().toISOString(),
      fechaExpiracion,
      activo: true,
    };

    res.status(201).json({
      success: true,
      data: nuevoAnuncio,
      message: 'Anuncio publicado',
    });
  } catch (error: any) {
    console.error('❌ Error creando anuncio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const eliminarAnuncio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: `Anuncio ${id} eliminado`,
    });
  } catch (error: any) {
    console.error('❌ Error eliminando anuncio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
