import { NotificacionModel } from '../models/notificacion.model';

export const NotificacionService = {
  getAll: () => NotificacionModel.findAll(),
  getById: (id: number) => NotificacionModel.findById(id),
  create: (data: any) => NotificacionModel.create(data),
  update: (id: number, data: any) => NotificacionModel.update(id, data),
  delete: (id: number) => NotificacionModel.delete(id)
};
