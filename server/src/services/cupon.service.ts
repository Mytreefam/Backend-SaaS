import { CuponModel } from '../models/cupon.model';

export const CuponService = {
  getAll: () => CuponModel.findAll(),
  getById: (id: number) => CuponModel.findById(id),
  create: (data: any) => CuponModel.create(data),
  update: (id: number, data: any) => CuponModel.update(id, data),
  delete: (id: number) => CuponModel.delete(id)
};
