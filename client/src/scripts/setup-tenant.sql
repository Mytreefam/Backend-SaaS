-- ============================================================================
-- UDAR EDGE - SCRIPT DE CREACIÓN DE TENANT
-- ============================================================================
-- Este script crea todas las estructuras necesarias para un nuevo cliente
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREAR EMPRESA (TENANT)
-- ============================================================================

INSERT INTO empresas (
  id,
  nombre,
  nombre_legal,
  cif,
  email,
  telefono,
  direccion,
  ciudad,
  codigo_postal,
  pais,
  plan,
  estado,
  config
) VALUES (
  1,  -- Cambiar si ya existe otra empresa
  'Tu Restaurante',
  'Tu Restaurante S.L.',
  'B12345678',
  'info@turestaurante.com',
  '+34 612 345 678',
  'Calle Principal 123',
  'Barcelona',
  '08001',
  'España',
  'profesional',  -- basico | profesional | premium
  'activo',
  '{
    "branding": {
      "logo": "/logo.svg",
      "primaryColor": "#0d9488",
      "secondaryColor": "#14b8a6"
    },
    "modulos_activos": [
      "tpv",
      "stock",
      "delivery",
      "rrhh",
      "clientes",
      "contabilidad"
    ],
    "locale": {
      "language": "es",
      "timezone": "Europe/Madrid",
      "currency": "EUR"
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CREAR USUARIO GERENTE (Administrador)
-- ============================================================================

INSERT INTO usuarios (
  id,
  email,
  nombre,
  apellidos,
  rol,
  empresa_id,
  activo,
  config
) VALUES (
  gen_random_uuid(),
  'gerente@turestaurante.com',
  'Gerente',
  'Principal',
  'gerente',
  1,  -- ID de la empresa creada arriba
  true,
  '{
    "permisos": {
      "todo": true
    },
    "notificaciones": {
      "email": true,
      "push": true
    }
  }'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 3. CREAR UBICACIONES/LOCALES
-- ============================================================================

INSERT INTO ubicaciones (
  id,
  empresa_id,
  nombre,
  direccion,
  ciudad,
  codigo_postal,
  latitud,
  longitud,
  activo,
  config
) VALUES (
  1,
  1,
  'Local Principal',
  'Calle Principal 123',
  'Barcelona',
  '08001',
  41.3851,  -- Coordenadas de Barcelona (cambiar según ubicación real)
  2.1734,
  true,
  '{
    "horario": {
      "lunes": {"apertura": "09:00", "cierre": "22:00"},
      "martes": {"apertura": "09:00", "cierre": "22:00"},
      "miercoles": {"apertura": "09:00", "cierre": "22:00"},
      "jueves": {"apertura": "09:00", "cierre": "22:00"},
      "viernes": {"apertura": "09:00", "cierre": "23:00"},
      "sabado": {"apertura": "10:00", "cierre": "23:00"},
      "domingo": {"apertura": "10:00", "cierre": "20:00"}
    },
    "capacidad": 50,
    "mesas": 15
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. CREAR CATEGORÍAS DE PRODUCTOS BÁSICAS
-- ============================================================================

INSERT INTO categorias_productos (empresa_id, nombre, orden, activo) VALUES
(1, 'Bebidas', 1, true),
(1, 'Entrantes', 2, true),
(1, 'Principales', 3, true),
(1, 'Postres', 4, true),
(1, 'Cafés', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. CREAR PROVEEDORES BÁSICOS
-- ============================================================================

INSERT INTO proveedores (
  empresa_id,
  nombre,
  cif,
  email,
  telefono,
  direccion,
  activo,
  config
) VALUES
(1, 'Proveedor de Bebidas S.L.', 'B11111111', 'bebidas@proveedor.com', '+34 600 111 111', 'Calle Bebidas 1', true, '{}'::jsonb),
(1, 'Distribuidora de Alimentos', 'B22222222', 'alimentos@proveedor.com', '+34 600 222 222', 'Calle Alimentos 2', true, '{}'::jsonb),
(1, 'Carnicería Selecta', 'B33333333', 'carne@proveedor.com', '+34 600 333 333', 'Calle Carne 3', true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. CREAR ALMACENES
-- ============================================================================

INSERT INTO almacenes (
  empresa_id,
  ubicacion_id,
  nombre,
  tipo,
  activo
) VALUES
(1, 1, 'Almacén Principal', 'general', true),
(1, 1, 'Cámara Frigorífica', 'refrigerado', true),
(1, 1, 'Bodega', 'bebidas', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. CREAR CAJAS/PUNTOS DE VENTA
-- ============================================================================

INSERT INTO cajas (
  empresa_id,
  ubicacion_id,
  nombre,
  codigo,
  activo,
  config
) VALUES
(1, 1, 'Caja 1', 'CAJA-001', true, '{
  "impresora": {
    "nombre": "Impresora Tickets",
    "tipo": "termica",
    "ancho": 80
  },
  "cajero_inicial": 100.00,
  "auto_print": true
}'::jsonb),
(1, 1, 'Caja 2', 'CAJA-002', true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. CREAR TURNOS DE TRABAJO
-- ============================================================================

INSERT INTO turnos (
  empresa_id,
  ubicacion_id,
  nombre,
  hora_inicio,
  hora_fin,
  activo
) VALUES
(1, 1, 'Mañana', '09:00:00', '15:00:00', true),
(1, 1, 'Tarde', '15:00:00', '22:00:00', true),
(1, 1, 'Noche', '22:00:00', '02:00:00', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. CREAR ROLES Y DEPARTAMENTOS
-- ============================================================================

INSERT INTO departamentos (
  empresa_id,
  nombre,
  descripcion,
  activo
) VALUES
(1, 'Cocina', 'Personal de cocina', true),
(1, 'Sala', 'Camareros y sala', true),
(1, 'Administración', 'Personal administrativo', true),
(1, 'Gerencia', 'Dirección y gerencia', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. CONFIGURACIÓN DE IMPUESTOS
-- ============================================================================

INSERT INTO impuestos (
  empresa_id,
  nombre,
  porcentaje,
  activo
) VALUES
(1, 'IVA Reducido', 10.0, true),
(1, 'IVA General', 21.0, true),
(1, 'IVA Superreducido', 4.0, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. MÉTODOS DE PAGO
-- ============================================================================

INSERT INTO metodos_pago (
  empresa_id,
  nombre,
  tipo,
  activo,
  config
) VALUES
(1, 'Efectivo', 'cash', true, '{}'::jsonb),
(1, 'Tarjeta', 'card', true, '{}'::jsonb),
(1, 'Bizum', 'digital', true, '{}'::jsonb),
(1, 'Transferencia', 'transfer', true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 12. CATEGORÍAS DE CHATS
-- ============================================================================

INSERT INTO categorias_chats (
  empresa_id,
  nombre,
  descripcion,
  color,
  icono,
  orden,
  activo
) VALUES
(1, 'Pedidos', 'Consultas sobre pedidos', '#3b82f6', 'shopping-bag', 1, true),
(1, 'Reservas', 'Reservas de mesas', '#10b981', 'calendar', 2, true),
(1, 'Quejas', 'Quejas y reclamaciones', '#ef4444', 'alert-circle', 3, true),
(1, 'General', 'Consultas generales', '#6b7280', 'message-circle', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 13. TIPOS DE DOCUMENTOS
-- ============================================================================

INSERT INTO tipos_documentos (
  empresa_id,
  nombre,
  descripcion,
  obligatorio,
  activo
) VALUES
(1, 'DNI/NIE', 'Documento de identidad', true, true),
(1, 'Contrato', 'Contrato laboral', true, true),
(1, 'Seguridad Social', 'Número de Seguridad Social', true, true),
(1, 'Datos Bancarios', 'Cuenta para nómina', true, true),
(1, 'Certificado Salud', 'Certificado médico', false, true),
(1, 'Título Formación', 'Certificados y títulos', false, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 14. CONFIGURACIÓN DE NOTIFICACIONES
-- ============================================================================

INSERT INTO configuracion_notificaciones (
  empresa_id,
  tipo,
  canal,
  activo,
  config
) VALUES
(1, 'nuevo_pedido', 'push', true, '{}'::jsonb),
(1, 'stock_bajo', 'email', true, '{"threshold": 10}'::jsonb),
(1, 'fichaje', 'push', true, '{}'::jsonb),
(1, 'pago_recibido', 'email', true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 15. CONFIGURACIÓN DE PERMISOS POR ROL
-- ============================================================================

-- Permisos para GERENTE (acceso total)
INSERT INTO permisos_rol (
  empresa_id,
  rol,
  modulo,
  permisos
) VALUES
(1, 'gerente', 'tpv', '["ver", "crear", "editar", "eliminar", "configurar"]'::jsonb),
(1, 'gerente', 'stock', '["ver", "crear", "editar", "eliminar", "configurar"]'::jsonb),
(1, 'gerente', 'rrhh', '["ver", "crear", "editar", "eliminar", "configurar"]'::jsonb),
(1, 'gerente', 'clientes', '["ver", "crear", "editar", "eliminar", "configurar"]'::jsonb),
(1, 'gerente', 'reportes', '["ver", "exportar", "configurar"]'::jsonb),
(1, 'gerente', 'contabilidad', '["ver", "crear", "editar", "eliminar"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Permisos para TRABAJADOR (limitados)
INSERT INTO permisos_rol (
  empresa_id,
  rol,
  modulo,
  permisos
) VALUES
(1, 'trabajador', 'tpv', '["ver", "crear"]'::jsonb),
(1, 'trabajador', 'stock', '["ver", "crear"]'::jsonb),
(1, 'trabajador', 'rrhh', '["ver"]'::jsonb),
(1, 'trabajador', 'clientes', '["ver"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 16. AUDITORÍA - Registrar creación del tenant
-- ============================================================================

INSERT INTO auditoria (
  empresa_id,
  usuario_id,
  accion,
  entidad,
  entidad_id,
  datos,
  ip,
  user_agent
) VALUES (
  1,
  (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1),
  'crear_tenant',
  'empresa',
  1,
  '{"mensaje": "Tenant creado exitosamente", "script": "setup-tenant.sql"}'::jsonb,
  '127.0.0.1',
  'SQL Script'
);

-- ============================================================================
-- CONFIRMACIÓN
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ TENANT CREADO EXITOSAMENTE                             ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Siguiente paso:';
  RAISE NOTICE '   1. Actualizar credenciales de acceso';
  RAISE NOTICE '   2. Configurar .env con las variables necesarias';
  RAISE NOTICE '   3. Personalizar config/tenant.config.ts';
  RAISE NOTICE '   4. Opcionalmente ejecutar seed-demo-data.sql';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Usuario gerente creado:';
  RAISE NOTICE '   Email: gerente@turestaurante.com';
  RAISE NOTICE '   (Configurar contraseña en Supabase Auth)';
  RAISE NOTICE '';
END $$;
