/**
 * RUTAS: Módulo Gerente
 * Todas las rutas del panel de gerente
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as dashboardController from '../controllers/gerente/dashboard.controller';
import * as empleadosController from '../controllers/gerente/empleados.controller';
import * as stockController from '../controllers/gerente/stock.controller';
import * as productosController from '../controllers/gerente/productos.controller';
import * as finanzasController from '../controllers/gerente/finanzas.controller';
import * as horariosController from '../controllers/gerente/horarios.controller';
import * as operativaController from '../controllers/operativa.controller';
import * as documentacionController from '../controllers/documentacion.controller';

const router = Router();

// Configuración de multer para subir archivos
const UPLOAD_DIR = path.join(__dirname, '../../../uploads/documentos');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    // Permitir PDFs, imágenes y documentos Office
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// ============================================
// DASHBOARD Y MÉTRICAS
// ============================================
router.get('/dashboard/ventas', dashboardController.obtenerDatosVentas);
router.get('/dashboard/kpis', dashboardController.obtenerKPIs);
router.get('/dashboard/alertas', dashboardController.obtenerAlertas);

// ============================================
// GESTIÓN DE EMPLEADOS (RRHH)
// ============================================
router.get('/empleados', empleadosController.obtenerEmpleados);
router.get('/empleados/estadisticas', empleadosController.obtenerEstadisticasEquipo);
router.get('/empleados/fichajes', empleadosController.obtenerTodosFichajes);
router.get('/empleados/:id', empleadosController.obtenerEmpleadoPorId);
router.post('/empleados', empleadosController.crearEmpleado);
router.put('/empleados/:id', empleadosController.actualizarEmpleado);
router.delete('/empleados/:id', empleadosController.eliminarEmpleado);
router.get('/empleados/:id/fichajes', empleadosController.obtenerFichajesEmpleado);
router.post('/empleados/:id/tareas', empleadosController.asignarTarea);
router.get('/empleados/:id/desempeño', empleadosController.obtenerDesempeño);
// ⭐ NUEVO: Endpoints para modificaciones, finalizaciones y remuneraciones
router.post('/empleados/:id/modificaciones', empleadosController.crearModificacionContrato);
router.post('/empleados/:id/finalizaciones', empleadosController.crearFinalizacionContrato);
router.post('/empleados/:id/remuneraciones', empleadosController.crearRemuneracion);

// ============================================
// GESTIÓN DE HORARIOS Y TURNOS
// ============================================
router.get('/horarios', horariosController.obtenerHorarios);
router.post('/horarios', horariosController.crearHorario);
router.get('/horarios/:id', horariosController.obtenerHorarioPorId);
router.put('/horarios/:id', horariosController.actualizarHorario);
router.delete('/horarios/:id', horariosController.eliminarHorario);
// Asignaciones de horarios a empleados
router.get('/empleados/:empleadoId/horarios', horariosController.obtenerHorariosEmpleado);
router.post('/empleados/:empleadoId/horarios', horariosController.asignarHorarioAEmpleado);
router.get('/empleados/:empleadoId/horarios/actual', horariosController.obtenerHorarioActualEmpleado);
router.put('/asignaciones/:asignacionId/cancelar', horariosController.cancelarAsignacionHorario);

// ============================================
// GESTIÓN DE STOCK Y PROVEEDORES
// ============================================
router.get('/stock/articulos', stockController.obtenerArticulosStock);
router.post('/stock/articulos', stockController.crearArticuloStock);
router.put('/stock/articulos/:id', stockController.actualizarArticuloStock);
router.delete('/stock/articulos/:id', stockController.eliminarArticuloStock);
router.put('/stock/articulos/:id/ajustar', stockController.ajustarStock);
router.get('/stock/movimientos', stockController.obtenerMovimientosStock);
router.get('/stock/alertas', stockController.obtenerAlertasStock);

router.get('/stock/proveedores', stockController.obtenerProveedores);
router.post('/stock/proveedores', stockController.crearProveedor);
router.put('/stock/proveedores/:id', stockController.actualizarProveedor);
router.delete('/stock/proveedores/:id', stockController.eliminarProveedor);

router.get('/stock/pedidos-proveedor', stockController.obtenerPedidosProveedor);
router.post('/stock/pedidos-proveedor', stockController.crearPedidoProveedor);
router.put('/stock/pedidos-proveedor/:id', stockController.actualizarPedidoProveedor);
router.delete('/stock/pedidos-proveedor/:id', stockController.eliminarPedidoProveedor);
router.put('/stock/pedidos-proveedor/:id/recibir', stockController.recibirPedidoProveedor);

// Sesiones de Inventario
router.get('/stock/sesiones-inventario', stockController.obtenerSesionesInventario);
router.post('/stock/sesiones-inventario', stockController.crearSesionInventario);
router.put('/stock/sesiones-inventario/:id', stockController.actualizarSesionInventario);
router.delete('/stock/sesiones-inventario/:id', stockController.eliminarSesionInventario);
router.post('/stock/sesiones-inventario/:id/lineas', stockController.agregarLineaInventario);
router.put('/stock/sesiones-inventario/:id/lineas/:lineaId', stockController.actualizarLineaInventario);

// ============================================
// GESTIÓN DE PRODUCTOS (CATÁLOGO)
// ============================================
router.get('/productos', productosController.obtenerProductos);
router.get('/productos/categorias', productosController.obtenerCategorias);
router.get('/productos/estadisticas', productosController.obtenerEstadisticasProductos);
router.get('/productos/:id', productosController.obtenerProductoPorId);
router.post('/productos', productosController.crearProducto);
router.put('/productos/:id', productosController.actualizarProducto);
router.delete('/productos/:id', productosController.eliminarProducto);
router.post('/productos/:id/duplicar', productosController.duplicarProducto);

// ============================================
// FACTURACIÓN Y FINANZAS
// ============================================
router.get('/finanzas/resumen', finanzasController.obtenerResumenFinanzas);
router.get('/finanzas/cuenta-resultados', finanzasController.obtenerCuentaResultados);
router.get('/finanzas/facturas', finanzasController.obtenerFacturas);
router.get('/finanzas/cierres-caja', finanzasController.obtenerCierresCaja);
router.post('/finanzas/cierres-caja', finanzasController.crearCierreCaja);
router.get('/finanzas/impagos', finanzasController.obtenerImpagos);
router.get('/finanzas/pagos-proveedores', finanzasController.obtenerPagosProveedores);
router.post('/finanzas/pagos-proveedores', finanzasController.registrarPagoProveedor);
router.get('/finanzas/prevision', finanzasController.obtenerPrevisionTesoreria);

// ============================================
// OPERATIVA - TAREAS Y GESTIÓN DE EQUIPO
// ============================================
router.get('/operativa/tareas', operativaController.obtenerTareasOperativas);
router.post('/operativa/tareas', operativaController.crearTareaOperativa);
router.put('/operativa/tareas/:id', operativaController.actualizarTareaOperativa);
router.delete('/operativa/tareas/:id', operativaController.eliminarTareaOperativa);
router.put('/operativa/tareas/:id/completar', operativaController.completarTarea);
router.put('/operativa/tareas/:id/aprobar', operativaController.aprobarRechazarTarea);
router.get('/operativa/estadisticas', operativaController.obtenerEstadisticasTareas);
router.get('/operativa/trabajadores', operativaController.obtenerTrabajadoresParaAsignar);

// ============================================
// DOCUMENTACIÓN EMPRESARIAL
// ============================================
router.get('/documentacion/documentos', documentacionController.obtenerDocumentos);
router.post('/documentacion/documentos', documentacionController.crearDocumento);
router.put('/documentacion/documentos/:id', documentacionController.actualizarDocumento);
router.delete('/documentacion/documentos/:id', documentacionController.eliminarDocumento);
router.get('/documentacion/estadisticas', documentacionController.obtenerEstadisticasDocumentos);

// Ruta para subir archivos de documentos
router.post('/documentacion/upload', upload.single('archivo'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' });
    }
    
    const url = `/uploads/documentos/${file.filename}`;
    
    res.json({
      success: true,
      data: {
        url,
        nombre: file.originalname,
        tamano: file.size,
        mimeType: file.mimetype
      }
    });
  } catch (error: any) {
    console.error('❌ Error subiendo archivo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GASTOS EMPRESARIALES
// ============================================
router.get('/documentacion/gastos', documentacionController.obtenerGastos);
router.post('/documentacion/gastos', documentacionController.crearGasto);
router.put('/documentacion/gastos/:id', documentacionController.actualizarGasto);
router.delete('/documentacion/gastos/:id', documentacionController.eliminarGasto);
router.get('/documentacion/gastos/resumen', documentacionController.obtenerResumenGastos);

// ============================================
// CALENDARIO DE PAGOS
// ============================================
router.get('/documentacion/pagos-calendario', documentacionController.obtenerPagosCalendario);
router.post('/documentacion/pagos-calendario', documentacionController.crearPagoCalendario);
router.put('/documentacion/pagos-calendario/:id', documentacionController.actualizarPagoCalendario);
router.delete('/documentacion/pagos-calendario/:id', documentacionController.eliminarPagoCalendario);
router.put('/documentacion/pagos-calendario/:id/pagar', documentacionController.marcarPagoPagado);

export default router;
