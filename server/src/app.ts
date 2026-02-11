import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
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
import puntoVentaRoutes from './routes/puntoVenta';
import gerenteRoutes from './routes/gerente';
import onboardingRoutes from './routes/onboarding';
import cajaRoutes from './routes/caja';
import trabajadorRoutes from './routes/trabajador';
import healthRoutes from './routes/health';
import publicRoutes from './routes/public';
import { authenticate, requireAuth, requireRole } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { responseEnvelope } from './middleware/response.middleware';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // API-only; swagger UI manages its own assets
  }),
);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// CORS allowlist
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser clients (no origin)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  }),
);

// Rate limiting (global)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_PER_MINUTE || 300),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

// Attach req.user when Authorization is present
app.use(authenticate);

// Standardize JSON response shape
app.use(responseEnvelope);

// Servir archivos estáticos de la carpeta uploads
if (process.env.SERVE_UPLOADS_PUBLICLY !== 'false') {
  app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
}

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

// Health
app.use('/health', healthRoutes);
// Backwards-compat alias for some clients
app.use('/api/health', healthRoutes);

// Auth
app.use('/auth', authRoutes);

// Public routes (as designed today)
app.use('/clientes', clienteRoutes);
app.use('/chats', chatRoutes);
app.use('/public', publicRoutes);

// Auth-required routes (ownership/role checks are applied at route level)
app.use('/notificaciones', requireAuth, notificacionRoutes);
app.use('/mensajes', requireAuth, mensajeRoutes);
app.use('/pedidos', requireAuth, pedidoRoutes);
app.use('/citas', requireAuth, citaRoutes);
app.use('/documentos', requireAuth, documentoRoutes);
app.use('/facturas', requireAuth, facturaRoutes);
app.use('/garajes', requireAuth, garajeRoutes);
app.use('/presupuestos', requireAuth, presupuestoRoutes);
app.use('/promociones', requireAuth, promocionRoutes);
app.use('/cupones', requireAuth, cuponRoutes);
// Public read for Cliente; mutations protected inside router.
app.use('/productos', productoRoutes);
app.use('/upload', requireAuth, uploadRoutes);
app.use('/turnos', requireAuth, turnoRoutes);
app.use('/puntos-venta', requireAuth, puntoVentaRoutes);

// Manager (RBAC enforced here)
app.use('/gerente', requireAuth, requireRole('gerente'), gerenteRoutes);
// Backwards-compat alias for existing /api/gerente calls
app.use('/api/gerente', requireAuth, requireRole('gerente'), gerenteRoutes);

app.use('/onboarding', requireAuth, requireRole('trabajador', 'gerente'), onboardingRoutes);
app.use('/caja', requireAuth, requireRole('trabajador', 'gerente'), cajaRoutes);
app.use('/trabajador', requireAuth, requireRole('trabajador', 'gerente'), trabajadorRoutes);

// 404 + error handler (last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
