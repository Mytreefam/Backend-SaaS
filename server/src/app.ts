import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import clienteRoutes from './routes/cliente';
import chatRoutes from './routes/chat';
import uploadRoutes from './routes/upload';
import path from 'path';
import authRoutes from './routes/auth';
import notificacionRoutes from './routes/notificacion';
import mensajeRoutes from './routes/mensaje';
import pedidoRoutes from './routes/pedido';
import citaRoutes from './routes/cita';
import documentoRoutes from './routes/documento';
import facturaRoutes from './routes/factura';
import garajeRoutes from './routes/garaje';
import presupuestoRoutes from './routes/presupuesto';
import promocionRoutes from './routes/promocion';
import cuponRoutes from './routes/cupon';
import productoRoutes from './routes/producto';
import turnoRoutes from './routes/turno';
import gerenteRoutes from './routes/gerente';
import onboardingRoutes from './routes/onboarding';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'UDAR Delivery 360 API',
  customfavIcon: '/favicon.ico'
}));

// Ruta para obtener el JSON de la especificación
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/auth', authRoutes);
app.use('/clientes', clienteRoutes);
app.use('/chats', chatRoutes);
app.use('/notificaciones', notificacionRoutes);
app.use('/mensajes', mensajeRoutes);
app.use('/pedidos', pedidoRoutes);
app.use('/citas', citaRoutes);
app.use('/documentos', documentoRoutes);
app.use('/facturas', facturaRoutes);
app.use('/garajes', garajeRoutes);
app.use('/presupuestos', presupuestoRoutes);
app.use('/promociones', promocionRoutes);
app.use('/cupones', cuponRoutes);
app.use('/productos', productoRoutes);
app.use('/upload', uploadRoutes);
app.use('/turnos', turnoRoutes);
app.use('/gerente', gerenteRoutes);
app.use('/onboarding', onboardingRoutes);

export default app;
