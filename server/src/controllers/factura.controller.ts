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
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const facturas =
    req.user.role === 'gerente'
      ? await FacturaModel.findAll()
      : await FacturaModel.findAll({ clienteId: req.user.id });
  res.json({ success: true, data: facturas });
};

export const getFacturaById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  if (!factura) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && factura.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json({ success: true, data: factura });
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
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  // Mass-assignment prevention: allow only a safe subset of fields.
  const payload: any = {
    numero: req.body?.numero,
    pedidoId: req.body?.pedidoId ?? null,
    total: req.body?.total,
    subtotal: req.body?.subtotal,
    impuestos: req.body?.impuestos ?? 0,
    metodoPago: req.body?.metodoPago,
    estadoVerifactu: req.body?.estadoVerifactu,
    marcaId: req.body?.marcaId,
    puntoVentaId: req.body?.puntoVentaId ?? null,
    notas: req.body?.notas ?? null,
  };

  if (req.user.role === 'gerente' && req.body?.clienteId) {
    payload.clienteId = Number(req.body.clienteId);
  } else {
    payload.clienteId = req.user.id;
  }

  const nueva = await FacturaModel.create(payload);
  res.status(201).json({ success: true, data: nueva });
};

export const updateFactura = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  if (!factura) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && factura.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const payload: any = {
    total: req.body?.total,
    subtotal: req.body?.subtotal,
    impuestos: req.body?.impuestos,
    metodoPago: req.body?.metodoPago,
    estadoVerifactu: req.body?.estadoVerifactu,
    notas: req.body?.notas,
    puntoVentaId: req.body?.puntoVentaId,
  };
  // never allow clienteId changes

  const actualizada = await FacturaModel.update(Number(id), payload);
  res.json({ success: true, data: actualizada });
};

export const deleteFactura = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  if (!factura) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && factura.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await FacturaModel.delete(Number(id));
  res.status(200).json({ success: true, data: { deleted: true } });
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
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  
  if (!factura) {
    return res.status(404).json({ error: 'Factura no encontrada' });
  }

  if (req.user.role !== 'gerente' && factura.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
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
        <p><strong>Estado:</strong> ${factura.estadoVerifactu}</p>
      </div>
      <div class="totales">
        <p>Subtotal: €${factura.subtotal?.toFixed(2) || '0.00'}</p>
        <p>IVA: €${factura.impuestos?.toFixed(2) || '0.00'}</p>
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
