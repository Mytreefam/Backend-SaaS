import { Request, Response } from 'express';
import prisma from '../../prisma/client';

function nowPlusDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function randomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `UDAR-${part(4)}-${part(4)}`;
}

function buildLink(req: Request, invitacionId: string): string {
  // Uses current host; behind Nginx it will be correct if proxy headers are set.
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '';
  const origin = host ? `${proto}://${host}` : '';
  return `${origin}/aceptar-invitacion?token=${encodeURIComponent(invitacionId)}`;
}

export async function crearInvitacion(req: Request, res: Response) {
  const body = req.body || {};
  const empresaId = String(body.empresaId || body.empresa_id || '').trim();
  const empresaNombre = body.empresaNombre ? String(body.empresaNombre) : undefined;
  const metodo = String(body.metodo || 'email');
  const email = String(body.email || '').trim().toLowerCase();

  if (!empresaId) return res.status(400).json({ success: false, error: 'empresaId requerido' });
  if (!email) return res.status(400).json({ success: false, error: 'email requerido' });

  const id = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const fechaExpiracion = nowPlusDays(7);

  const data: any = {
    id,
    empresaId,
    empresaNombre: empresaNombre || null,
    metodo,
    email,
    nombre: body.nombre ? String(body.nombre) : null,
    apellidos: body.apellidos ? String(body.apellidos) : null,
    puesto: body.puesto ? String(body.puesto) : null,
    departamento: body.departamento ? String(body.departamento) : null,
    estado: 'pendiente',
    fechaExpiracion,
    creadoPor: body.creadoPor ? String(body.creadoPor) : null,
    creadoPorNombre: body.creadoPorNombre ? String(body.creadoPorNombre) : null,
    notas: body.notas ? String(body.notas) : null,
    horasSemanales: body.horasSemanales != null ? Number(body.horasSemanales) : null,
    tipoContrato: body.tipoContrato ? String(body.tipoContrato) : null,
  };

  if (metodo === 'codigo') {
    data.codigoInvitacion = randomCode();
  } else if (metodo === 'email') {
    data.linkInvitacion = buildLink(req, id);
  } else if (metodo === 'preregistro') {
    // We keep these fields for compatibility, but you should NOT rely on them for real auth.
    data.usuarioTemporal = email.split('@')[0];
    data.passwordTemporal = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  const invitacion = await prisma.invitacionEmpleado.create({ data });
  return res.json(invitacion);
}

export async function listInvitaciones(req: Request, res: Response) {
  const empresaId = String(req.query.empresa_id || req.query.empresaId || '').trim();
  if (!empresaId) return res.status(400).json({ success: false, error: 'empresa_id requerido' });

  // Auto-expire pending invites past expiration
  await prisma.invitacionEmpleado.updateMany({
    where: { empresaId, estado: 'pendiente', fechaExpiracion: { lt: new Date() } },
    data: { estado: 'expirada' },
  });

  const invitaciones = await prisma.invitacionEmpleado.findMany({
    where: { empresaId },
    orderBy: { fechaCreacion: 'desc' },
  });
  return res.json(invitaciones);
}

export async function getEstadisticas(req: Request, res: Response) {
  const empresaId = String(req.query.empresa_id || req.query.empresaId || '').trim();
  if (!empresaId) return res.status(400).json({ success: false, error: 'empresa_id requerido' });

  const all = await prisma.invitacionEmpleado.findMany({ where: { empresaId } });
  const byEstado = (estado: string) => all.filter((x) => x.estado === estado).length;

  return res.json({
    total: all.length,
    pendientes: byEstado('pendiente'),
    aceptadas: byEstado('aceptada'),
    rechazadas: byEstado('rechazada'),
    expiradas: byEstado('expirada'),
    canceladas: byEstado('cancelada'),
  });
}

export async function cancelar(req: Request, res: Response) {
  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ success: false, error: 'id requerido' });
  const invitacion = await prisma.invitacionEmpleado.update({
    where: { id },
    data: { estado: 'cancelada' },
  });
  return res.json(invitacion);
}

export async function reenviar(req: Request, res: Response) {
  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ success: false, error: 'id requerido' });

  const invitacion = await prisma.invitacionEmpleado.findUnique({ where: { id } });
  if (!invitacion) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  const fechaExpiracion = nowPlusDays(7);
  const updated = await prisma.invitacionEmpleado.update({
    where: { id },
    data: {
      fechaExpiracion,
      // refresh link for email method
      linkInvitacion: invitacion.metodo === 'email' ? buildLink(req, id) : invitacion.linkInvitacion,
      estado: invitacion.estado === 'expirada' ? 'pendiente' : invitacion.estado,
    },
  });
  return res.json(updated);
}

export async function limpiarExpiradas(req: Request, res: Response) {
  const empresaId = String(req.query.empresa_id || req.query.empresaId || '').trim();
  if (!empresaId) return res.status(400).json({ success: false, error: 'empresa_id requerido' });

  const r = await prisma.invitacionEmpleado.updateMany({
    where: { empresaId, estado: 'pendiente', fechaExpiracion: { lt: new Date() } },
    data: { estado: 'expirada' },
  });
  return res.json({ actualizadas: r.count });
}

