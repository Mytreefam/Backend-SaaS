/**
 * CONTROLADOR: Gestión de Empleados (RRHH)
 * Endpoints para gestionar empleados, fichajes, tareas y desempeño
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import bcrypt from 'bcryptjs';

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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
    });
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const [fichajesMes, tareasAsignadas, tareasCompletadas] = await Promise.all([
      prisma.fichaje.count({
        where: { empleadoId, fecha: { gte: startMonth } },
      }),
      prisma.tarea.count({
        where: { empleadoId },
      }),
      prisma.tarea.count({
        where: { empleadoId, estado: 'completada' },
      }),
    ]);

    return res.json({
      ...empleado,
      tareasAsignadas,
      tareasCompletadas,
      fichajesMes,
    });
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

    // Generar contraseña básica automática
    const passwordBasica = String(req.body?.password || 'udar2026');
    const passwordProvided = typeof req.body?.password === 'string' && req.body.password.trim().length > 0;
    const passwordHash = await bcrypt.hash(passwordBasica, 12);

    // Crear (o actualizar) identidad de login en `Cliente` para que pueda iniciar sesión como trabajador
    // Nota: el sistema de auth actual usa `Cliente` para todos los roles.
    const clienteExistente = await prisma.cliente.findUnique({ where: { email } });
    if (!clienteExistente) {
      await prisma.cliente.create({
        data: {
          codigo: `CLI-${Date.now()}`,
          nombre: nombre.trim(),
          email: email.trim(),
          password: passwordHash,
          telefono: telefono?.toString().trim() || null,
          role: 'trabajador',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre.trim()}`,
        },
      });
    } else {
      // Evitar “convertir” un cliente real en trabajador sin intención explícita
      if (clienteExistente.role === 'cliente') {
        return res.status(400).json({ error: 'El email ya existe como cliente. Usa otro email para el empleado.' });
      }
      // Si ya existe, al menos garantizamos que tenga role trabajador/gerente/cliente coherente
      // (no forzamos downgrade de gerente)
      if (clienteExistente.role !== 'gerente') {
        await prisma.cliente.update({
          where: { id: clienteExistente.id },
          data: {
            role: 'trabajador',
            nombre: clienteExistente.nombre || nombre.trim(),
            telefono: clienteExistente.telefono || (telefono?.toString().trim() || null),
            avatar: clienteExistente.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombre.trim()}`,
            // Solo actualizar password si el gerente lo proveyó explícitamente
            ...(passwordProvided ? { password: passwordHash } : {}),
          },
        });
      }
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
    res.status(201).json({
      ...nuevoEmpleado,
      password: passwordBasica, // se devuelve solo para UI de alta rápida (no persistir en frontend)
    });
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
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Whitelist para prevenir mass assignment
    const allowed = [
      'nombre',
      'email',
      'telefono',
      'foto',
      'puesto',
      'empresaId',
      'marcaId',
      'puntoVentaId',
      'horarioEntrada',
      'horarioSalida',
      'turno',
      'salarioBase',
      'estado',
      'fechaBaja',
    ] as const;

    const data: any = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        data[key] = (req.body as any)[key];
      }
    }

    const updated = await prisma.empleado.update({
      where: { id: empleadoId },
      data,
    });

    return res.json(updated);
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
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updated = await prisma.empleado.update({
      where: { id: empleadoId },
      data: { estado: 'inactivo', fechaBaja: new Date() },
    });

    return res.json({ ok: true, empleado: updated });
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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const where: any = { empleadoId };
    if (fecha_inicio || fecha_fin) {
      where.fecha = {};
      if (fecha_inicio) {
        const inicio = new Date(fecha_inicio as string);
        inicio.setUTCHours(0, 0, 0, 0);
        where.fecha.gte = inicio;
      }
      if (fecha_fin) {
        const fin = new Date(fecha_fin as string);
        fin.setUTCHours(23, 59, 59, 999);
        where.fecha.lte = fin;
      }
    }

    const fichajes = await prisma.fichaje.findMany({
      where,
      include: {
        empleado: { select: { id: true, nombre: true, puesto: true, foto: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const fichajesFormato = fichajes.map((f: any) => ({
      id: f.id,
      empleadoId: f.empleadoId,
      empleadoNombre: f.empleado?.nombre,
      empleadoPuesto: f.empleado?.puesto,
      empleadoFoto: f.empleado?.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(f.empleado?.nombre || 'Empleado')}`,
      puntoVentaId: f.puntoVentaId,
      puntoVentaNombre: f.puntoVentaId,
      tipo: f.tipo,
      fecha: f.fecha.toISOString().split('T')[0],
      horaTeorica: f.horaTeorica,
      horaReal: f.hora,
      diferenciaMinutos: f.diferenciaMinutos,
      validado: f.validado,
      observaciones: f.observaciones,
      creadoEn: f.creadoEn.toISOString(),
    }));

    return res.json(fichajesFormato);
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
    const fichajesFormato = fichajes.map((f: any) => ({
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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    if (!titulo) {
      return res.status(400).json({ error: 'titulo requerido' });
    }

    const asignadoPor = Number((req as any).user?.id || 0) || 0;
    const tarea = await prisma.tarea.create({
      data: {
        empleadoId,
        titulo: String(titulo),
        descripcion: descripcion ? String(descripcion) : null,
        prioridad: prioridad ? String(prioridad) : 'media',
        estado: 'pendiente',
        fechaLimite: fecha_limite ? new Date(String(fecha_limite)) : null,
        requiereReporte: Boolean(requiere_reporte),
        asignadoPor,
        requiereAprobacion: false,
      },
    });

    return res.status(201).json(tarea);
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
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const [tareasPendientes, tareasCompletadas, fichajes] = await Promise.all([
      prisma.tarea.count({ where: { empleadoId, estado: { in: ['pendiente', 'en_progreso'] } } }),
      prisma.tarea.count({ where: { empleadoId, estado: 'completada' } }),
      prisma.fichaje.findMany({
        where: { empleadoId, fecha: { gte: startMonth } },
        select: { diferenciaMinutos: true },
      }),
    ]);

    const diffs = fichajes.map((f) => Math.abs(f.diferenciaMinutos || 0));
    const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    const puntualidad = Math.max(0, 100 - Math.min(100, avgDiff * 2)); // heuristic basada en retraso medio
    const productividad = Math.min(100, tareasCompletadas * 2);
    const calidad_trabajo = Math.min(100, 80 + Math.floor((tareasCompletadas / Math.max(1, tareasCompletadas + tareasPendientes)) * 20));
    const puntuacion_global = Math.round((puntualidad + productividad + calidad_trabajo) / 3);

    return res.json({
      empleado_id: empleadoId,
      puntuacion_global,
      puntualidad: Math.round(puntualidad),
      productividad: Math.round(productividad),
      calidad_trabajo: Math.round(calidad_trabajo),
      tareas_completadas: tareasCompletadas,
      tareas_pendientes: tareasPendientes,
      horas_trabajadas_mes: null,
      horas_extra: null,
      incidencias: 0,
      valoraciones_clientes: null,
    });
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
    const where: any = {};
    if (empresa_id && empresa_id !== 'todas') where.empresaId = empresa_id;
    if (punto_venta_id && punto_venta_id !== 'todas') where.puntoVentaId = punto_venta_id;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [total, activos, inactivos, avgDesempeno, sumHorasMes, tareasPendientes, tareasCompletadas, fichajesHoy] =
      await Promise.all([
        prisma.empleado.count({ where }),
        prisma.empleado.count({ where: { ...where, estado: 'activo' } }),
        prisma.empleado.count({ where: { ...where, estado: 'inactivo' } }),
        prisma.empleado.aggregate({ where, _avg: { desempeno: true } }),
        prisma.empleado.aggregate({ where, _sum: { horasMes: true } }),
        prisma.tarea.count({ where: { estado: { in: ['pendiente', 'en_progreso'] } } }),
        prisma.tarea.count({ where: { estado: 'completada' } }),
        prisma.fichaje.count({ where: { fecha: { gte: todayStart, lte: todayEnd } } }),
      ]);

    return res.json({
      total_empleados: total,
      empleados_activos: activos,
      empleados_inactivos: inactivos,
      desempeño_promedio: Math.round((avgDesempeno._avg.desempeno || 0) * 100) / 100,
      horas_totales_mes: sumHorasMes._sum.horasMes || 0,
      tareas_pendientes: tareasPendientes,
      tareas_completadas: tareasCompletadas,
      fichajes_hoy: fichajesHoy,
      ausencias_mes: 0,
    });
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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) return res.status(400).json({ error: 'ID inválido' });

    const created = await prisma.empleadoModificacionContrato.create({
      data: {
        empleadoId,
        fechaInicio: new Date(String(fecha_inicio)),
        nuevoSalario: nuevo_salario != null ? Number(nuevo_salario) : null,
        nuevasFunciones: nuevas_funciones ? String(nuevas_funciones) : null,
        motivo: motivo ? String(motivo) : null,
        estado: 'registrado',
      },
    });

    res.status(201).json(created);
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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) return res.status(400).json({ error: 'ID inválido' });

    const created = await prisma.$transaction(async (tx) => {
      const fin = await tx.empleadoFinalizacionContrato.create({
        data: {
          empleadoId,
          fechaFinalizacion: new Date(String(fecha_finalizacion)),
          motivo: motivo ? String(motivo) : null,
          estado: 'registrado',
        },
      });
      await tx.empleado.update({
        where: { id: empleadoId },
        data: { estado: 'inactivo', fechaBaja: new Date(String(fecha_finalizacion)) },
      });
      return fin;
    });

    res.status(201).json(created);
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

    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) return res.status(400).json({ error: 'ID inválido' });

    const created = await prisma.empleadoRemuneracion.create({
      data: {
        empleadoId,
        motivo: String(motivo),
        importe: Number(importe),
        estado: 'registrado',
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error al crear remuneración:', error);
    res.status(500).json({ error: 'Error al registrar remuneración' });
  }
};

/**
 * POST /api/gerente/empleados/fichajes
 * Registrar un nuevo fichaje (entrada, salida, pausa, reanudación)
 */
export const crearFichaje = async (req: Request, res: Response) => {
  try {
    const { empleadoId, tipo, ubicacion, notas, fecha, hora, puntoVentaId } = req.body;

    if (!empleadoId || !tipo) {
      return res.status(400).json({ error: 'empleadoId y tipo son requeridos' });
    }

    const tiposValidos = ['entrada', 'salida', 'pausa', 'reanudacion'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de fichaje no válido' });
    }

    // Crear fichaje en BD
    const fichaje = await prisma.fichaje.create({
      data: {
        empleadoId: parseInt(empleadoId),
        tipo,
        fecha: fecha ? new Date(fecha) : new Date(),
        hora: hora || new Date().toTimeString().split(' ')[0],
        horaTeorica: hora || new Date().toTimeString().split(' ')[0],
        diferenciaMinutos: 0,
        observaciones: notas || null,
        validado: true,
        puntoVentaId: puntoVentaId ? puntoVentaId.toString() : 'PDV001',
      },
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    res.status(201).json({
      id: fichaje.id,
      empleadoId: fichaje.empleadoId,
      tipo: fichaje.tipo,
      fecha: fichaje.fecha.toISOString().split('T')[0],
      hora: fichaje.hora,
      notas: fichaje.observaciones,
    });
  } catch (error) {
    console.error('Error al crear fichaje:', error);
    res.status(500).json({ error: 'Error al registrar fichaje' });
  }
};