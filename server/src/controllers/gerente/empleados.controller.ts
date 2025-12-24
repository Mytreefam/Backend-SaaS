/**
 * CONTROLADOR: Gestión de Empleados (RRHH)
 * Endpoints para gestionar empleados, fichajes, tareas y desempeño
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/gerente/empleados:
 *   get:
 *     summary: Obtener listado de empleados con filtros
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: punto_venta_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *         description: Panadero, Cajero, Repartidor
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo]
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empleado'
 */
export const obtenerEmpleados = async (req: Request, res: Response) => {
  try {
    const {
      empresa_id,
      punto_venta_id,
      puesto,
      estado,
      busqueda
    } = req.query;

    const where: any = {};
    
    if (empresa_id && empresa_id !== 'todas') {
      where.empresaId = empresa_id as string;
    }
    
    if (punto_venta_id && punto_venta_id !== 'todas') {
      where.puntoVentaId = punto_venta_id as string;
    }
    
    if (puesto) {
      where.puesto = puesto as string;
    }
    
    if (estado) {
      where.estado = estado as string;
    }
    
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda as string, mode: 'insensitive' } },
        { email: { contains: busqueda as string, mode: 'insensitive' } }
      ];
    }

    const empleados = await prisma.empleado.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

/**
 * GET /api/gerente/empleados/:id
 * Obtener detalle de un empleado específico
 */
export const obtenerEmpleadoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implementar con Prisma cuando exista modelo Empleado
    const empleado = {
      id,
      nombre: 'Carlos Ruiz',
      email: 'carlos.ruiz@example.com',
      telefono: '+34 612 345 678',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      puesto: 'Panadero',
      empresa_id: 'EMP-001',
      punto_venta_id: 'PDV-001',
      desempeño: 94,
      horas_mes: '160h',
      estado: 'activo',
      fecha_alta: new Date('2024-01-15'),
      horario_entrada: '09:00',
      horario_salida: '17:00',
      salario_base: 1800,
      tareas_asignadas: 12,
      tareas_completadas: 10,
      fichajes_mes: 22
    };

    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
};

/**
 * @swagger
 * /api/gerente/empleados:
 *   post:
 *     summary: Crear nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empleado'
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empleado'
 *       400:
 *         description: Datos inválidos
 */
export const crearEmpleado = async (req: Request, res: Response) => {
  try {
    // Obtener datos del body
    let nombre = req.body.nombre;
    let email = req.body.email;
    let apellidos = req.body.apellidos || '';
    let telefono = req.body.telefono || '';
    let puesto = req.body.puesto || 'Empleado';
    let empresaId = req.body.empresaId || 'EMP-001';
    let puntoVentaId = req.body.puntoVentaId || 'PDV001';

    // Limpiar espacios
    nombre = nombre ? nombre.toString().trim() : '';
    email = email ? email.toString().trim().toLowerCase() : '';

    console.log('📝 Datos recibidos:', { nombre, email, apellidos });

    // Validaciones estrictas
    if (!nombre || nombre.length === 0) {
      console.log('❌ Nombre vacío');
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    if (!email || email.length === 0 || !email.includes('@')) {
      console.log('❌ Email vacío o inválido');
      return res.status(400).json({ error: 'El email es obligatorio y debe ser válido' });
    }

    // Verificar que el email no exista
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { email }
    });

    if (empleadoExistente) {
      console.log('❌ Email ya registrado');
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear empleado
    const nuevoEmpleado = await prisma.empleado.create({
      data: {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono?.toString().trim() || '',
        foto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre.trim()}`,
        puesto: puesto.toString().trim(),
        empresaId: empresaId.toString().trim(),
        puntoVentaId: puntoVentaId.toString().trim(),
        horarioEntrada: '09:00',
        horarioSalida: '17:00',
        salarioBase: 1000,
        estado: 'activo',
        desempeno: 0,
        horasMes: 160
      }
    });

    console.log('✅ Empleado creado:', nuevoEmpleado.id);
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('❌ Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
};

/**
 * @swagger
 * /api/gerente/empleados/{id}:
 *   put:
 *     summary: Actualizar datos de empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empleado'
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       404:
 *         description: Empleado no encontrado
 */
export const actualizarEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // TODO: Actualizar en base de datos
    const empleadoActualizado = {
      id,
      ...datosActualizados,
      fecha_modificacion: new Date()
    };

    res.json(empleadoActualizado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};

/**
 * DELETE /api/gerente/empleados/:id
 * Eliminar (desactivar) un empleado
 */
export const eliminarEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Soft delete - cambiar estado a 'inactivo'
    res.json({ message: 'Empleado desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

/**
 * GET /api/gerente/empleados/:id/fichajes
 * Obtener fichajes de un empleado
 */
export const obtenerFichajesEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    // TODO: Implementar con modelo Fichaje
    const fichajes = [
      {
        id: 'F-001',
        empleado_id: id,
        tipo: 'entrada', // entrada, salida, descanso
        fecha: new Date(),
        hora: '09:05',
        hora_teorica: '09:00',
        diferencia_minutos: 5,
        punto_venta_id: 'PDV-001',
        validado: true
      }
    ];

    res.json(fichajes);
  } catch (error) {
    console.error('Error al obtener fichajes:', error);
    res.status(500).json({ error: 'Error al obtener fichajes' });
  }
};

/**
 * GET /api/gerente/fichajes
 * Obtener todos los fichajes del equipo (filtrados por fecha si se indica)
 */
export const obtenerTodosFichajes = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Construir filtro de fechas
    const where: any = {};
    if (fecha_inicio || fecha_fin) {
      where.AND = [];
      
      if (fecha_inicio) {
        // Convertir fecha inicio a UTC inicio del día
        const inicio = new Date(fecha_inicio as string);
        inicio.setUTCHours(0, 0, 0, 0);
        where.AND.push({
          fecha: {
            gte: inicio
          }
        });
      }
      
      if (fecha_fin) {
        // Convertir fecha fin a UTC final del día
        const fin = new Date(fecha_fin as string);
        fin.setUTCHours(23, 59, 59, 999);
        where.AND.push({
          fecha: {
            lte: fin
          }
        });
      }
    }

    // Obtener fichajes de la base de datos con información del empleado
    const fichajes = await prisma.fichaje.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            puesto: true,
            foto: true,
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Transformar los datos para que coincidan con el formato esperado en el frontend
    const fichajesFormato = fichajes.map(f => ({
      id: f.id,
      empleadoId: f.empleadoId,
      empleadoNombre: f.empleado.nombre,
      empleadoPuesto: f.empleado.puesto,
      empleadoFoto: f.empleado.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.empleado.nombre}`,
      puntoVentaId: f.puntoVentaId,
      puntoVentaNombre: f.puntoVentaId, // TODO: Obtener nombre real del punto de venta si existe relación
      tipo: f.tipo,
      fecha: f.fecha.toISOString().split('T')[0],
      horaTeorica: f.horaTeorica,
      horaReal: f.hora,
      diferenciaMinutos: f.diferenciaMinutos,
      validado: f.validado,
      observaciones: f.observaciones,
      creadoEn: f.creadoEn.toISOString()
    }));

    res.json(fichajesFormato);
  } catch (error) {
    console.error('Error al obtener fichajes:', error);
    res.status(500).json({ error: 'Error al obtener fichajes' });
  }
};

/**
 * POST /api/gerente/empleados/:id/tareas
 * Asignar una tarea a un empleado
 */
export const asignarTarea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      prioridad,
      fecha_limite,
      requiere_reporte
    } = req.body;

    // TODO: Crear en tabla Tareas
    const tarea = {
      id: `T-${Date.now()}`,
      empleado_id: id,
      titulo,
      descripcion,
      prioridad,
      fecha_limite,
      requiere_reporte,
      estado: 'pendiente',
      fecha_asignacion: new Date()
    };

    res.status(201).json(tarea);
  } catch (error) {
    console.error('Error al asignar tarea:', error);
    res.status(500).json({ error: 'Error al asignar tarea' });
  }
};

/**
 * GET /api/gerente/empleados/:id/desempeño
 * Obtener métricas de desempeño de un empleado
 */
export const obtenerDesempeño = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const desempeño = {
      empleado_id: id,
      puntuacion_global: 94,
      puntualidad: 92,
      productividad: 95,
      calidad_trabajo: 96,
      tareas_completadas: 48,
      tareas_pendientes: 2,
      horas_trabajadas_mes: 160,
      horas_extra: 5,
      incidencias: 1,
      valoraciones_clientes: 4.8
    };

    res.json(desempeño);
  } catch (error) {
    console.error('Error al obtener desempeño:', error);
    res.status(500).json({ error: 'Error al obtener desempeño' });
  }
};

/**
 * GET /api/gerente/empleados/estadisticas
 * Obtener estadísticas generales del equipo
 */
export const obtenerEstadisticasEquipo = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id } = req.query;

    const estadisticas = {
      total_empleados: 8,
      empleados_activos: 8,
      empleados_inactivos: 0,
      desempeño_promedio: 91,
      horas_totales_mes: 1280,
      tareas_pendientes: 5,
      tareas_completadas: 85,
      fichajes_hoy: 8,
      ausencias_mes: 2
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
/**
 * @swagger
 * /api/gerente/empleados/{id}/modificaciones:
 *   post:
 *     summary: Registrar modificación de contrato
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               nuevo_salario:
 *                 type: number
 *               nuevas_funciones:
 *                 type: string
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modificación registrada
 *       400:
 *         description: Datos inválidos
 */
export const crearModificacionContrato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, nuevo_salario, nuevas_funciones, motivo } = req.body;

    if (!fecha_inicio) {
      return res.status(400).json({ error: 'Fecha de inicio requerida' });
    }

    // TODO: Guardar en BD con Prisma
    const modificacion = {
      id: `MOD-${Date.now()}`,
      empleado_id: id,
      fecha_inicio,
      nuevo_salario,
      nuevas_funciones,
      motivo,
      estado: 'registrado',
      fecha_registro: new Date()
    };

    res.status(201).json(modificacion);
  } catch (error) {
    console.error('Error al crear modificación:', error);
    res.status(500).json({ error: 'Error al registrar modificación' });
  }
};

/**
 * @swagger
 * /api/gerente/empleados/{id}/finalizaciones:
 *   post:
 *     summary: Registrar finalización de contrato
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_finalizacion:
 *                 type: string
 *                 format: date
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Finalización registrada
 *       400:
 *         description: Datos inválidos
 */
export const crearFinalizacionContrato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fecha_finalizacion, motivo } = req.body;

    if (!fecha_finalizacion) {
      return res.status(400).json({ error: 'Fecha de finalización requerida' });
    }

    // TODO: Cambiar estado del empleado a 'inactivo' en BD
    const finalizacion = {
      id: `FIN-${Date.now()}`,
      empleado_id: id,
      fecha_finalizacion,
      motivo,
      estado: 'registrado',
      fecha_registro: new Date()
    };

    res.status(201).json(finalizacion);
  } catch (error) {
    console.error('Error al crear finalización:', error);
    res.status(500).json({ error: 'Error al registrar finalización' });
  }
};

/**
 * @swagger
 * /api/gerente/empleados/{id}/remuneraciones:
 *   post:
 *     summary: Registrar remuneración adicional
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *               importe:
 *                 type: number
 *     responses:
 *       201:
 *         description: Remuneración registrada
 *       400:
 *         description: Datos inválidos
 */
export const crearRemuneracion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo, importe } = req.body;

    if (!motivo || !importe) {
      return res.status(400).json({ error: 'Motivo e importe requeridos' });
    }

    // TODO: Guardar en BD con Prisma
    const remuneracion = {
      id: `REM-${Date.now()}`,
      empleado_id: id,
      motivo,
      importe: parseFloat(importe),
      estado: 'registrado',
      fecha_registro: new Date()
    };

    res.status(201).json(remuneracion);
  } catch (error) {
    console.error('Error al crear remuneración:', error);
    res.status(500).json({ error: 'Error al registrar remuneración' });
  }
};