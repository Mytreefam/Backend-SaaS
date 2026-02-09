import { TurnoModel } from '../models/turno.model';
import { Request, Response } from 'express';

export async function getAllTurnos(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const turnos =
    req.user.role === 'gerente'
      ? await TurnoModel.findAll()
      : await TurnoModel.findAll({ clienteId: req.user.id });
  res.json(turnos);
}

export async function getTurnoById(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  const turno = await TurnoModel.findById(id);
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
  if (req.user.role !== 'gerente' && turno.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json(turno);
}

export async function createTurno(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const payload: any = {
      numero: req.body?.numero,
      estado: req.body?.estado,
      tiempoEstimado: req.body?.tiempoEstimado,
      pedidoId: Number(req.body?.pedidoId),
    };

    // Ownership: clients can only create their own turnos
    if (req.user.role === 'gerente' && req.body?.clienteId) {
      payload.clienteId = Number(req.body.clienteId);
    } else {
      payload.clienteId = req.user.id;
    }

    const turno = await TurnoModel.create(payload);
    res.status(201).json(turno);
  } catch (err) {
    res.status(400).json({ error: 'TURN_CREATE_FAILED' });
  }
}

export async function updateTurno(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    const existing = await TurnoModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Turno no encontrado' });
    if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }

    const payload: any = {
      estado: req.body?.estado,
      tiempoEstimado: req.body?.tiempoEstimado,
    };
    const turno = await TurnoModel.update(id, payload);
    res.json(turno);
  } catch (err) {
    res.status(400).json({ error: 'TURN_UPDATE_FAILED' });
  }
}

export async function deleteTurno(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    const existing = await TurnoModel.findById(id);
    if (!existing) return res.status(404).json({ error: 'Turno no encontrado' });
    if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
    await TurnoModel.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'TURN_DELETE_FAILED' });
  }
}
