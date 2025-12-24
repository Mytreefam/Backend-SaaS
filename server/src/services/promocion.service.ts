import { PromocionModel } from '../models/promocion.model';

export const PromocionService = {
	getAll: () => PromocionModel.findAll(),
	getById: (id: number) => PromocionModel.findById(id),
	create: (data: any) => PromocionModel.create(data),
	update: (id: number, data: any) => PromocionModel.update(id, data),
	delete: (id: number) => PromocionModel.delete(id)
};
