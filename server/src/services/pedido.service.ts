import { PedidoModel } from '../models/pedido.model';

export const PedidoService = {
  getAll: () => PedidoModel.findAll(),
  getById: (id: number) => PedidoModel.findById(id),
  create: (data: any) => PedidoModel.create(data),
  update: (id: number, data: any) => PedidoModel.update(id, data),
  delete: (id: number) => PedidoModel.delete(id)
};
