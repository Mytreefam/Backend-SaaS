import { Router } from 'express';
import {
  getAllTurnos,
  getTurnoById,
  createTurno,
  updateTurno,
  deleteTurno
} from '../controllers/turno.controller';

const router = Router();

router.get('/', getAllTurnos);
router.get('/:id', getTurnoById);
router.post('/', createTurno);
router.put('/:id', updateTurno);
router.delete('/:id', deleteTurno);

export default router;
