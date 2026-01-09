import { FacturaModel } from '../models/factura.model';

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 */
export const getAllFacturas = async (req: any, res: any) => {
  const facturas = await FacturaModel.findAll();
  res.json(facturas);
};

export const getFacturaById = async (req: any, res: any) => {
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  if (!factura) return res.status(404).json({ error: 'No encontrada' });
  res.json(factura);
};

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Factura'
 *     responses:
 *       201:
 *         description: Factura creada
 */
export const createFactura = async (req: any, res: any) => {
  const nueva = await FacturaModel.create(req.body);
  res.status(201).json(nueva);
};

export const updateFactura = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizada = await FacturaModel.update(Number(id), req.body);
  res.json(actualizada);
};

export const deleteFactura = async (req: any, res: any) => {
  const { id } = req.params;
  await FacturaModel.delete(Number(id));
  res.status(204).end();
};

/**
 * @swagger
 * /facturas/{id}/pdf:
 *   get:
 *     summary: Descargar PDF de factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF de la factura
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Factura no encontrada
 */
export const downloadPdf = async (req: any, res: any) => {
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  
  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' });
  }
  
  // Generar un PDF simple con los datos de la factura
  // En producción usar librería como pdfkit, jspdf, etc.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura ${factura.numero}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .factura-info { margin: 20px 0; }
        .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FACTURA</h1>
        <p>Número: ${factura.numero}</p>
      </div>
      <div class="factura-info">
        <p><strong>Fecha:</strong> ${factura.fecha}</p>
        <p><strong>Cliente ID:</strong> ${factura.clienteId}</p>
        <p><strong>Estado:</strong> ${factura.estado}</p>
      </div>
      <div class="totales">
        <p>Subtotal: €${factura.subtotal?.toFixed(2) || '0.00'}</p>
        <p>IVA: €${factura.iva?.toFixed(2) || '0.00'}</p>
        <p class="total">TOTAL: €${factura.total?.toFixed(2) || '0.00'}</p>
      </div>
    </body>
    </html>
  `;
  
  // Por ahora devolver HTML, en producción convertir a PDF
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="factura-${factura.numero}.html"`);
  res.send(htmlContent);
};
