import { DocumentoModel } from '../models/documento.model';

export const getAllDocumentos = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const documentos =
    req.user.role === 'gerente'
      ? await DocumentoModel.findAll()
      : await DocumentoModel.findAll({ clienteId: req.user.id });
  res.json({ success: true, data: documentos });
};

export const getDocumentoById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const documento = await DocumentoModel.findById(Number(id));
  if (!documento) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && documento.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json({ success: true, data: documento });
};

export const createDocumento = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  // Mass-assignment prevention: only allow these fields
  const payload: any = {
    nombre: req.body?.nombre,
    url: req.body?.url,
  };
  if (req.user.role === 'gerente' && req.body?.clienteId) {
    payload.clienteId = Number(req.body.clienteId);
  } else {
    payload.clienteId = req.user.id;
  }

  const nuevo = await DocumentoModel.create(payload);
  res.status(201).json({ success: true, data: nuevo });
};

export const updateDocumento = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await DocumentoModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const payload: any = {
    nombre: req.body?.nombre,
    url: req.body?.url,
  };
  // never allow clienteId changes via update

  const actualizado = await DocumentoModel.update(Number(id), payload);
  res.json({ success: true, data: actualizado });
};

export const deleteDocumento = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await DocumentoModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await DocumentoModel.delete(Number(id));
  res.status(200).json({ success: true, data: { deleted: true } });
};
