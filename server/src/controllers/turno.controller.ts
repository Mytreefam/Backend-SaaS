import { TurnoModel } from '../models/turno.model';
import { Request, Response } from 'express';

export async function getAllTurnos(req: Request, res: Response) {
  const turnos = await TurnoModel.findAll();
  res.json(turnos);
}

export async function getTurnoById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const turno = await TurnoModel.findById(id);
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
  res.json(turno);
}

export async function createTurno(req: Request, res: Response) {
  try {
    const turno = await TurnoModel.create(req.body);
    res.status(201).json(turno);
  } catch (err) {
    res.status(400).json({ error: 'Error creando turno', details: err });
  }
}

export async function updateTurno(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const turno = await TurnoModel.update(id, req.body);
    res.json(turno);
  } catch (err) {
    res.status(400).json({ error: 'Error actualizando turno', details: err });
  }
}

export async function deleteTurno(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    await TurnoModel.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Error eliminando turno', details: err });
  }
}
