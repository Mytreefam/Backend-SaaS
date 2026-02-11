import type { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../../prisma/client';

// ============================================================================
// EMPRESAS / MARCAS / PDV (fuente de verdad en BD)
// ============================================================================

export const listEmpresasConfig = async (_req: Request, res: Response) => {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { id: 'asc' },
      include: {
        marcas: { where: { activo: true }, orderBy: { id: 'asc' } },
        puntosVenta: { where: { activo: true }, orderBy: { id: 'asc' } },
      },
    });

    const data = empresas.map((e) => ({
      id: e.id,
      codigo: e.codigo ?? undefined,
      nombreFiscal: e.nombreFiscal,
      nombreComercial: e.nombreComercial ?? undefined,
      cif: e.cif ?? undefined,
      domicilioFiscal: e.domicilioFiscal ?? undefined,
      logoComercial: e.logoComercial ?? undefined,
      activo: e.activo,
      marcas: e.marcas.map((m) => ({
        id: m.id,
        codigo: m.codigo ?? undefined,
        nombre: m.nombre,
        colorIdentidad: m.colorIdentidad ?? undefined,
        icono: m.icono ?? undefined,
        logoUrl: m.logoUrl ?? undefined,
        activo: m.activo,
      })),
      puntosVenta: e.puntosVenta.map((pv) => ({
        id: pv.id,
        nombre: pv.nombre,
        direccion: pv.direccion,
        latitud: pv.latitud,
        longitud: pv.longitud,
        empresaId: pv.empresaId,
        marcasIds: pv.marcasIds,
        // Compat con UI legacy que espera 1 marca principal
        marcaId: pv.marcasIds?.[0] ?? null,
        activo: pv.activo,
      })),
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('listEmpresasConfig error:', error);
    return res.status(500).json({ success: false, error: 'EMPRESAS_LIST_FAILED' });
  }
};

export const upsertEmpresaConfig = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: id requerido' });

    const activo = body.activo !== false;
    const nombreFiscal = String(body.nombreFiscal || '').trim();
    if (!nombreFiscal) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: nombreFiscal requerido' });

    const marcasInput = Array.isArray(body.marcas) ? body.marcas : [];
    const puntosVentaInput = Array.isArray(body.puntosVenta) ? body.puntosVenta : [];

    const empresa = await prisma.$transaction(async (tx) => {
      const e = await tx.empresa.upsert({
        where: { id },
        update: {
          activo,
          codigo: typeof body.codigo === 'string' ? body.codigo : undefined,
          nombreFiscal,
          nombreComercial: typeof body.nombreComercial === 'string' ? body.nombreComercial : undefined,
          cif: typeof body.cif === 'string' ? body.cif : undefined,
          domicilioFiscal: typeof body.domicilioFiscal === 'string' ? body.domicilioFiscal : undefined,
          logoComercial: typeof body.logoComercial === 'string' ? body.logoComercial : undefined,
        },
        create: {
          id,
          activo,
          codigo: typeof body.codigo === 'string' ? body.codigo : null,
          nombreFiscal,
          nombreComercial: typeof body.nombreComercial === 'string' ? body.nombreComercial : null,
          cif: typeof body.cif === 'string' ? body.cif : null,
          domicilioFiscal: typeof body.domicilioFiscal === 'string' ? body.domicilioFiscal : null,
          logoComercial: typeof body.logoComercial === 'string' ? body.logoComercial : null,
        },
      });

      // MARCAS: upsert + delete missing
      const marcaIds = marcasInput
        .map((m: any) => String(m?.id || '').trim())
        .filter(Boolean);

      for (const mRaw of marcasInput) {
        const marcaId = String(mRaw?.id || '').trim();
        const nombre = String(mRaw?.nombre || '').trim();
        if (!marcaId || !nombre) continue;
        await tx.marca.upsert({
          where: { id: marcaId },
          update: {
            empresaId: id,
            activo: mRaw?.activo !== false && activo,
            codigo: typeof mRaw?.codigo === 'string' ? mRaw.codigo : undefined,
            nombre,
            colorIdentidad: typeof mRaw?.colorIdentidad === 'string' ? mRaw.colorIdentidad : undefined,
            icono: typeof mRaw?.icono === 'string' ? mRaw.icono : undefined,
            logoUrl: typeof mRaw?.logoUrl === 'string' ? mRaw.logoUrl : undefined,
          },
          create: {
            id: marcaId,
            empresaId: id,
            activo: mRaw?.activo !== false && activo,
            codigo: typeof mRaw?.codigo === 'string' ? mRaw.codigo : null,
            nombre,
            colorIdentidad: typeof mRaw?.colorIdentidad === 'string' ? mRaw.colorIdentidad : null,
            icono: typeof mRaw?.icono === 'string' ? mRaw.icono : null,
            logoUrl: typeof mRaw?.logoUrl === 'string' ? mRaw.logoUrl : null,
          },
        });
      }

      // Eliminar marcas que ya no existen en el payload (solo dentro de esta empresa)
      if (marcaIds.length > 0) {
        await tx.marca.deleteMany({
          where: { empresaId: id, id: { notIn: marcaIds } },
        });
      }

      // PDV: create/update by (empresaId + nombre + direccion)
      const normalize = (s: any) => String(s || '').trim();
      const pvKeys = new Set<string>();

      for (const pvRaw of puntosVentaInput) {
        const nombre = normalize(pvRaw?.nombre);
        const direccion = normalize(pvRaw?.direccion);
        const marcaId = normalize(pvRaw?.marcaId);
        if (!nombre || !direccion) continue;

        const key = `${nombre.toLowerCase()}|${direccion.toLowerCase()}`;
        pvKeys.add(key);

        const existing = await tx.puntoVenta.findFirst({
          where: { empresaId: id, nombre, direccion },
          select: { id: true, marcasIds: true },
        });

        const marcasIds = Array.from(
          new Set([...(existing?.marcasIds || []), ...(marcaId ? [marcaId] : [])].filter(Boolean))
        );

        if (existing) {
          await tx.puntoVenta.update({
            where: { id: existing.id },
            data: {
              activo: pvRaw?.activo !== false && activo,
              marcasIds,
            },
          });
        } else {
          const newId = typeof pvRaw?.id === 'string' && pvRaw.id.trim()
            ? pvRaw.id.trim()
            : `PDV-${id}-${crypto.randomUUID()}`;

          await tx.puntoVenta.create({
            data: {
              id: newId,
              empresaId: id,
              nombre,
              direccion,
              latitud: Number.isFinite(Number(pvRaw?.latitud)) ? Number(pvRaw.latitud) : 0,
              longitud: Number.isFinite(Number(pvRaw?.longitud)) ? Number(pvRaw.longitud) : 0,
              marcasIds,
              activo: pvRaw?.activo !== false && activo,
            },
          });
        }
      }

      // Si mandan lista de PDVs, borrar los que no están (solo de esta empresa)
      if (puntosVentaInput.length > 0) {
        const existingPVs = await tx.puntoVenta.findMany({
          where: { empresaId: id },
          select: { id: true, nombre: true, direccion: true },
        });
        const toDelete = existingPVs
          .filter((pv) => !pvKeys.has(`${pv.nombre.toLowerCase()}|${pv.direccion.toLowerCase()}`))
          .map((pv) => pv.id);
        if (toDelete.length > 0) {
          await tx.puntoVenta.deleteMany({ where: { id: { in: toDelete } } });
        }
      }

      return e;
    });

    const fresh = await prisma.empresa.findUnique({
      where: { id: empresa.id },
      include: { marcas: { orderBy: { id: 'asc' } }, puntosVenta: { orderBy: { id: 'asc' } } },
    });

    return res.status(200).json({
      success: true,
      data: fresh
        ? {
            id: fresh.id,
            codigo: fresh.codigo ?? undefined,
            nombreFiscal: fresh.nombreFiscal,
            nombreComercial: fresh.nombreComercial ?? undefined,
            cif: fresh.cif ?? undefined,
            domicilioFiscal: fresh.domicilioFiscal ?? undefined,
            logoComercial: fresh.logoComercial ?? undefined,
            activo: fresh.activo,
            marcas: fresh.marcas.map((m) => ({
              id: m.id,
              codigo: m.codigo ?? undefined,
              nombre: m.nombre,
              colorIdentidad: m.colorIdentidad ?? undefined,
              icono: m.icono ?? undefined,
              logoUrl: m.logoUrl ?? undefined,
              activo: m.activo,
            })),
            puntosVenta: fresh.puntosVenta.map((pv) => ({
              id: pv.id,
              nombre: pv.nombre,
              direccion: pv.direccion,
              empresaId: pv.empresaId,
              marcasIds: pv.marcasIds,
              marcaId: pv.marcasIds?.[0] ?? null,
              activo: pv.activo,
            })),
          }
        : null,
    });
  } catch (error) {
    console.error('upsertEmpresaConfig error:', error);
    return res.status(500).json({ success: false, error: 'EMPRESA_UPSERT_FAILED' });
  }
};

export const deleteEmpresaConfig = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'INVALID_ID' });
    await prisma.$transaction(async (tx) => {
      await tx.marca.deleteMany({ where: { empresaId: id } });
      await tx.puntoVenta.deleteMany({ where: { empresaId: id } });
      await tx.empresa.delete({ where: { id } });
    });
    return res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('deleteEmpresaConfig error:', error);
    return res.status(500).json({ success: false, error: 'EMPRESA_DELETE_FAILED' });
  }
};

// ============================================================================
// AGENTES EXTERNOS (config JSON)
// ============================================================================

export const listAgentesExternosConfig = async (_req: Request, res: Response) => {
  try {
    const agentes = await prisma.agenteExternoConfiguracion.findMany({ orderBy: { id: 'asc' } });
    return res.status(200).json({ success: true, data: agentes.map((a) => ({ id: a.id, ...((a.data as any) || {}), activo: a.activo })) });
  } catch (error) {
    console.error('listAgentesExternosConfig error:', error);
    return res.status(500).json({ success: false, error: 'AGENTES_LIST_FAILED' });
  }
};

export const upsertAgenteExternoConfig = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: id requerido' });

    const activo = body.activo !== false;
    const data = { ...body };
    delete (data as any).id;
    delete (data as any).activo;

    const agente = await prisma.agenteExternoConfiguracion.upsert({
      where: { id },
      update: { activo, data },
      create: { id, activo, data },
    });

    return res.status(200).json({ success: true, data: { id: agente.id, ...((agente.data as any) || {}), activo: agente.activo } });
  } catch (error) {
    console.error('upsertAgenteExternoConfig error:', error);
    return res.status(500).json({ success: false, error: 'AGENTE_UPSERT_FAILED' });
  }
};

export const deleteAgenteExternoConfig = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'INVALID_ID' });
    await prisma.agenteExternoConfiguracion.delete({ where: { id } });
    return res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('deleteAgenteExternoConfig error:', error);
    return res.status(500).json({ success: false, error: 'AGENTE_DELETE_FAILED' });
  }
};

// ============================================================================
// TERMINALES TPV
// ============================================================================

export const listTerminalesTPV = async (req: Request, res: Response) => {
  try {
    const puntoVentaId = typeof req.query.puntoVentaId === 'string' ? req.query.puntoVentaId : undefined;
    const terminales = await prisma.terminalTPV.findMany({
      where: puntoVentaId ? { puntoVentaId } : undefined,
      orderBy: [{ puntoVentaId: 'asc' }, { numero: 'asc' }],
    });
    return res.status(200).json({ success: true, data: terminales });
  } catch (error) {
    console.error('listTerminalesTPV error:', error);
    return res.status(500).json({ success: false, error: 'TERMINALES_LIST_FAILED' });
  }
};

export const upsertTerminalTPV = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    const puntoVentaId = String(body.puntoVentaId || '').trim();
    const numero = Number(body.numero);
    const nombre = String(body.nombre || '').trim();
    if (!id || !puntoVentaId || !Number.isFinite(numero) || !nombre) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
    }

    const data = {
      puntoVentaId,
      numero,
      nombre,
      tipo: typeof body.tipo === 'string' ? body.tipo : 'secundario',
      estado: typeof body.estado === 'string' ? body.estado : 'disponible',
      marcas: Array.isArray(body.marcas) ? body.marcas.map(String) : [],
      activo: body.activo !== false,
    };

    const terminal = await prisma.terminalTPV.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    return res.status(200).json({ success: true, data: terminal });
  } catch (error) {
    console.error('upsertTerminalTPV error:', error);
    return res.status(500).json({ success: false, error: 'TERMINAL_UPSERT_FAILED' });
  }
};

export const deleteTerminalTPV = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'INVALID_ID' });
    await prisma.terminalTPV.delete({ where: { id } });
    return res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('deleteTerminalTPV error:', error);
    return res.status(500).json({ success: false, error: 'TERMINAL_DELETE_FAILED' });
  }
};

// ============================================================================
// OKRs
// ============================================================================

export const listOkrs = async (req: Request, res: Response) => {
  try {
    const empresaId = typeof req.query.empresaId === 'string' ? req.query.empresaId : undefined;
    const onlyActive = String(req.query.activo || 'true') !== 'false';
    const okrs = await prisma.okr.findMany({
      where: {
        ...(empresaId ? { empresaId } : {}),
        ...(onlyActive ? { activo: true } : {}),
      },
      orderBy: { creadoEn: 'desc' },
    });
    return res.status(200).json({ success: true, data: okrs });
  } catch (error) {
    console.error('listOkrs error:', error);
    return res.status(500).json({ success: false, error: 'OKR_LIST_FAILED' });
  }
};

export const upsertOkr = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    const equipo = String(body.equipo || '').trim();
    const objetivo = String(body.objetivo || '').trim();
    const progreso = Number(body.progreso ?? 0);
    if (!id || !equipo || !objetivo || !Number.isFinite(progreso)) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
    }

    const empresaId = typeof body.empresaId === 'string' ? body.empresaId : null;
    const fechaLimite = body.fechaLimite ? new Date(body.fechaLimite) : null;

    const data = {
      empresaId,
      equipo,
      objetivo,
      progreso: Math.max(0, Math.min(100, Math.round(progreso))),
      prioridad: typeof body.prioridad === 'string' ? body.prioridad : 'media',
      fechaLimite,
      responsable: typeof body.responsable === 'string' ? body.responsable : null,
      activo: body.activo !== false,
    };

    const okr = await prisma.okr.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    return res.status(200).json({ success: true, data: okr });
  } catch (error) {
    console.error('upsertOkr error:', error);
    return res.status(500).json({ success: false, error: 'OKR_UPSERT_FAILED' });
  }
};

export const deleteOkr = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'INVALID_ID' });
    await prisma.okr.delete({ where: { id } });
    return res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error('deleteOkr error:', error);
    return res.status(500).json({ success: false, error: 'OKR_DELETE_FAILED' });
  }
};

