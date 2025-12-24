import { DocumentoModel } from '../models/documento.model';

export const getAllDocumentos = async (req: any, res: any) => {
  const documentos = await DocumentoModel.findAll();
  res.json(documentos);
};

export const getDocumentoById = async (req: any, res: any) => {
  const { id } = req.params;
  const documento = await DocumentoModel.findById(Number(id));
  if (!documento) return res.status(404).json({ error: 'No encontrado' });
  res.json(documento);
};

export const createDocumento = async (req: any, res: any) => {
  const nuevo = await DocumentoModel.create(req.body);
  res.status(201).json(nuevo);
};

export const updateDocumento = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizado = await DocumentoModel.update(Number(id), req.body);
  res.json(actualizado);
};

export const deleteDocumento = async (req: any, res: any) => {
  const { id } = req.params;
  await DocumentoModel.delete(Number(id));
  res.status(204).end();
};
