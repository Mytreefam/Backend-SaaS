import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const crearCierreCaja = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const cierre = await prisma.cierreCaja.create({ data });
    res.status(201).json(cierre);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cierre de caja', details: error });
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
    res.json(cierres);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar cierres de caja', details: error });
  }
};

export const obtenerCierreCaja = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cierre = await prisma.cierreCaja.findUnique({ where: { id: Number(id) } });
    if (!cierre) return res.status(404).json({ error: 'Cierre de caja no encontrado' });
    res.json(cierre);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cierre de caja', details: error });
  }
};
