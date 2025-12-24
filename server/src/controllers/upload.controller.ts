import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

import type { Request as ExpressRequest } from 'express';

// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

export const uploadImage = (req: Request, res: Response) => {
  const file = (req as ExpressRequest & { file?: Express.Multer.File }).file;
  if (!file) {
    return res.status(400).json({ error: 'No se recibió archivo' });
  }
  // Guardar el archivo y devolver la URL
  const filename = `${Date.now()}_${file.originalname}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  // URL pública (ajusta según tu servidor)
  const url = `/uploads/${filename}`;
  res.json({ url });
};
