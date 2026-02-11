import { Request, Response } from 'express';
import prisma from '../prisma/client';

function dayBoundsUtc(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

async function generateNumeroCaja(): Promise<string> {
  const now = new Date();
  const { start, end } = dayBoundsUtc(now);
  const countToday = await prisma.cierreCaja.count({
    where: { fecha: { gte: start, lte: end } },
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `CJ-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}-${seq}`;
}

export const crearCierreCaja = async (req: Request, res: Response) => {
  try {
    const input = req.body || {};

    // `numero` is required+unique in schema; generate if missing.
    const numero = input.numero ? String(input.numero) : await generateNumeroCaja();

    // Minimal required fields (keep compatibility with current frontend)
    const puntoVentaId = String(input.puntoVentaId || '').trim();
    const empresaId = String(input.empresaId || '').trim();
    const turno = String(input.turno || '').trim();

    if (!puntoVentaId || !empresaId || !turno) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: DATOS_CAJA_INCOMPLETOS' });
    }

    const data = {
      ...input,
      numero,
      puntoVentaId,
      empresaId,
      turno,
      // Ensure numeric fields exist to avoid prisma validation errors
      efectivoInicial: Number(input.efectivoInicial ?? 0),
      totalVentasEfectivo: Number(input.totalVentasEfectivo ?? 0),
      totalVentasTarjeta: Number(input.totalVentasTarjeta ?? 0),
      totalVentasOnline: Number(input.totalVentasOnline ?? 0),
      gastosCaja: Number(input.gastosCaja ?? 0),
      efectivoEsperado: Number(input.efectivoEsperado ?? 0),
      efectivoContado: Number(input.efectivoContado ?? 0),
      diferencia: Number(input.diferencia ?? 0),
    };

    const cierre = await prisma.cierreCaja.create({ data });
    res.status(201).json({ success: true, data: cierre });
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
};

export const listarCierresCaja = async (req: Request, res: Response) => {
  try {
    const { puntoVentaId, empresaId } = req.query;
    const cierres = await prisma.cierreCaja.findMany({
      where: {
        ...(puntoVentaId ? { puntoVentaId: String(puntoVentaId) } : {}),
        ...(empresaId ? { empresaId: String(empresaId) } : {})
      },
      orderBy: { fecha: 'desc' }
    });
    res.json({ success: true, data: cierres });
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
};

export const obtenerCierreCaja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cierre = await prisma.cierreCaja.findUnique({ where: { id: Number(id) } });
    if (!cierre) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
    res.json({ success: true, data: cierre });
  } catch (error) {
    res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
  }
};
