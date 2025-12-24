import { ProductoModel } from '../models/producto.model';

export const ProductoService = {
  getAll: () => ProductoModel.findAll(),
  getById: (id: number) => ProductoModel.findById(id),
  create: (data: any) => ProductoModel.create(data),
  update: (id: number, data: any) => ProductoModel.update(id, data),
  delete: (id: number) => ProductoModel.delete(id)
};
