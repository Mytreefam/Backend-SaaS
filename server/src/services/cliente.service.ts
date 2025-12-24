import { ClienteModel } from '../models/cliente.model';

export const ClienteService = {
  getAll: () => ClienteModel.findAll(),
  getById: (id: number) => ClienteModel.findById(id),
  create: (data: any) => ClienteModel.create(data),
  update: (id: number, data: any) => ClienteModel.update(id, data),
  delete: (id: number) => ClienteModel.delete(id)
};
