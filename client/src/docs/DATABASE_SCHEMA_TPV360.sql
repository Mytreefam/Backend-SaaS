-- ============================================
-- TPV 360 - DATABASE SCHEMA
-- Sistema completo para Punto de Venta
-- ============================================

-- ============================================
-- TABLA: punto_venta
-- ============================================
CREATE TABLE punto_venta (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  direccion TEXT,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  radio_geolocalizacion INTEGER DEFAULT 100, -- metros
  activo BOOLEAN DEFAULT true,
  configuracion JSONB,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_punto_venta_activo ON punto_venta(activo);

-- ============================================
-- TABLA: usuario
-- ============================================
CREATE TABLE usuario (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(50) NOT NULL, -- gerente, trabajador, cajero
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuario_punto_venta ON usuario(punto_venta_id);
CREATE INDEX idx_usuario_activo ON usuario(activo);

-- ============================================
-- TABLA: permiso_usuario_tpv
-- ============================================
CREATE TABLE permiso_usuario_tpv (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(50) REFERENCES usuario(id) ON DELETE CASCADE,
  cobrar_pedidos BOOLEAN DEFAULT false,
  marcar_como_listo BOOLEAN DEFAULT false,
  gestionar_caja_rapida BOOLEAN DEFAULT false,
  hacer_retiradas BOOLEAN DEFAULT false,
  arqueo_caja BOOLEAN DEFAULT false,
  cierre_caja BOOLEAN DEFAULT false,
  ver_informes_turno BOOLEAN DEFAULT false,
  acceso_operativa BOOLEAN DEFAULT false,
  reimprimir_tickets BOOLEAN DEFAULT false,
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id)
);

CREATE INDEX idx_permiso_usuario ON permiso_usuario_tpv(usuario_id);

-- ============================================
-- TABLA: cliente
-- ============================================
CREATE TABLE cliente (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(200),
  direccion TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cliente_telefono ON cliente(telefono);
CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_cliente_activo ON cliente(activo);

-- ============================================
-- TABLA: categoria_producto
-- ============================================
CREATE TABLE categoria_producto (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categoria_activo ON categoria_producto(activo);
CREATE INDEX idx_categoria_orden ON categoria_producto(orden);

-- ============================================
-- TABLA: producto
-- ============================================
CREATE TABLE producto (
  id VARCHAR(50) PRIMARY KEY,
  categoria_id VARCHAR(50) REFERENCES categoria_producto(id),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_producto_categoria ON producto(categoria_id);
CREATE INDEX idx_producto_activo ON producto(activo);
CREATE INDEX idx_producto_nombre ON producto(nombre);

-- ============================================
-- TABLA: pedido
-- ============================================
CREATE TABLE pedido (
  id VARCHAR(50) PRIMARY KEY,
  codigo_turno VARCHAR(10) NOT NULL, -- P001-P999
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  cliente_id VARCHAR(50) REFERENCES cliente(id),
  canal_origen VARCHAR(20) NOT NULL, -- presencial, app, web
  estado VARCHAR(30) NOT NULL DEFAULT 'en_preparacion', -- en_preparacion, listo, entregado, cancelado, devuelto
  total_bruto DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_descuentos DECIMAL(10, 2) DEFAULT 0,
  total_impuestos DECIMAL(10, 2) DEFAULT 0,
  total_neto DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pagado BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  fecha_entrega TIMESTAMP,
  geolocalizacion_validada BOOLEAN DEFAULT false,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  distancia_metros INTEGER,
  timestamp_llegada TIMESTAMP,
  motivo_cancelacion TEXT,
  motivo_devolucion TEXT
);

CREATE INDEX idx_pedido_punto_venta ON pedido(punto_venta_id);
CREATE INDEX idx_pedido_codigo_turno ON pedido(codigo_turno);
CREATE INDEX idx_pedido_estado ON pedido(estado);
CREATE INDEX idx_pedido_fecha_creacion ON pedido(fecha_creacion);
CREATE INDEX idx_pedido_pagado ON pedido(pagado);
CREATE INDEX idx_pedido_canal ON pedido(canal_origen);

-- ============================================
-- TABLA: linea_pedido
-- ============================================
CREATE TABLE linea_pedido (
  id VARCHAR(50) PRIMARY KEY,
  pedido_id VARCHAR(50) REFERENCES pedido(id) ON DELETE CASCADE,
  producto_id VARCHAR(50) REFERENCES producto(id),
  categoria_id VARCHAR(50) REFERENCES categoria_producto(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  subtotal_bruto DECIMAL(10, 2) NOT NULL,
  impuesto_porcentaje DECIMAL(5, 2) DEFAULT 10,
  impuesto_importe DECIMAL(10, 2) DEFAULT 0,
  subtotal_neto DECIMAL(10, 2) NOT NULL,
  notas TEXT
);

CREATE INDEX idx_linea_pedido_pedido ON linea_pedido(pedido_id);
CREATE INDEX idx_linea_pedido_producto ON linea_pedido(producto_id);
CREATE INDEX idx_linea_pedido_categoria ON linea_pedido(categoria_id);

-- ============================================
-- TABLA: turno_pedido
-- ============================================
CREATE TABLE turno_pedido (
  id VARCHAR(50) PRIMARY KEY,
  pedido_id VARCHAR(50) REFERENCES pedido(id) ON DELETE CASCADE,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  numero_turno INTEGER NOT NULL,
  codigo_turno VARCHAR(10) NOT NULL, -- P001-P999
  fecha_asignacion TIMESTAMP DEFAULT NOW(),
  fecha_llamada TIMESTAMP,
  fecha_atencion TIMESTAMP,
  estado_turno VARCHAR(30) DEFAULT 'en_cola', -- en_cola, llamado, atendido, cancelado
  canal_origen VARCHAR(20) NOT NULL, -- presencial, app
  reset_diario DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(punto_venta_id, reset_diario, numero_turno)
);

CREATE INDEX idx_turno_pedido_punto_venta ON turno_pedido(punto_venta_id);
CREATE INDEX idx_turno_pedido_codigo ON turno_pedido(codigo_turno);
CREATE INDEX idx_turno_pedido_reset ON turno_pedido(reset_diario);
CREATE INDEX idx_turno_pedido_estado ON turno_pedido(estado_turno);

-- ============================================
-- TABLA: metodo_pago
-- ============================================
CREATE TABLE metodo_pago (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL, -- Efectivo, Tarjeta, Online, Mixto
  activo BOOLEAN DEFAULT true
);

-- Datos iniciales
INSERT INTO metodo_pago (id, nombre) VALUES
  ('efectivo', 'Efectivo'),
  ('tarjeta', 'Tarjeta'),
  ('online', 'Pago Online'),
  ('mixto', 'Pago Mixto');

-- ============================================
-- TABLA: pago
-- ============================================
CREATE TABLE pago (
  id VARCHAR(50) PRIMARY KEY,
  pedido_id VARCHAR(50) REFERENCES pedido(id) ON DELETE CASCADE,
  metodo_pago VARCHAR(50) NOT NULL, -- efectivo, tarjeta, mixto, online
  importe DECIMAL(10, 2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT NOW(),
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id),
  referencia_externa VARCHAR(200), -- Para pagos online
  estado_pago VARCHAR(30) DEFAULT 'completado', -- pendiente, completado, fallido, reembolsado
  notas TEXT
);

CREATE INDEX idx_pago_pedido ON pago(pedido_id);
CREATE INDEX idx_pago_metodo ON pago(metodo_pago);
CREATE INDEX idx_pago_fecha ON pago(fecha_pago);
CREATE INDEX idx_pago_estado ON pago(estado_pago);

-- ============================================
-- TABLA: pago_mixto_detalle
-- ============================================
CREATE TABLE pago_mixto_detalle (
  id VARCHAR(50) PRIMARY KEY,
  pago_id VARCHAR(50) REFERENCES pago(id) ON DELETE CASCADE,
  metodo_1 VARCHAR(50) NOT NULL,
  importe_1 DECIMAL(10, 2) NOT NULL,
  metodo_2 VARCHAR(50) NOT NULL,
  importe_2 DECIMAL(10, 2) NOT NULL,
  UNIQUE(pago_id)
);

CREATE INDEX idx_pago_mixto_pago ON pago_mixto_detalle(pago_id);

-- ============================================
-- TABLA: impresora
-- ============================================
CREATE TABLE impresora (
  id VARCHAR(50) PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  ip_address VARCHAR(50),
  modelo VARCHAR(100),
  activa BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_impresora_punto_venta ON impresora(punto_venta_id);
CREATE INDEX idx_impresora_activa ON impresora(activa);

-- ============================================
-- TABLA: config_pdv_impresora
-- ============================================
CREATE TABLE config_pdv_impresora (
  id SERIAL PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  impresora_id VARCHAR(50) REFERENCES impresora(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  activa BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_config_pdv ON config_pdv_impresora(punto_venta_id);
CREATE INDEX idx_config_impresora ON config_pdv_impresora(impresora_id);
CREATE INDEX idx_config_categoria ON config_pdv_impresora(categoria);

-- ============================================
-- TABLA: ticket_impresion
-- ============================================
CREATE TABLE ticket_impresion (
  id VARCHAR(50) PRIMARY KEY,
  pedido_id VARCHAR(50) REFERENCES pedido(id) ON DELETE CASCADE,
  impresora_id VARCHAR(50) REFERENCES impresora(id),
  tipo_ticket VARCHAR(30) NOT NULL, -- cocina, montaje, repartidor, cliente
  estado_impresion VARCHAR(30) DEFAULT 'pendiente', -- pendiente, ok, error
  categorias_incluidas TEXT[], -- Array de categorías
  fecha_impresion TIMESTAMP DEFAULT NOW(),
  intentos_impresion INTEGER DEFAULT 0,
  mensaje_error TEXT
);

CREATE INDEX idx_ticket_pedido ON ticket_impresion(pedido_id);
CREATE INDEX idx_ticket_impresora ON ticket_impresion(impresora_id);
CREATE INDEX idx_ticket_estado ON ticket_impresion(estado_impresion);
CREATE INDEX idx_ticket_tipo ON ticket_impresion(tipo_ticket);

-- ============================================
-- TABLA: turno_caja
-- ============================================
CREATE TABLE turno_caja (
  id VARCHAR(50) PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  usuario_apertura_id VARCHAR(50) REFERENCES usuario(id),
  usuario_cierre_id VARCHAR(50) REFERENCES usuario(id),
  fecha_apertura TIMESTAMP DEFAULT NOW(),
  fecha_cierre TIMESTAMP,
  monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0,
  efectivo_teorico DECIMAL(10, 2) NOT NULL DEFAULT 0,
  efectivo_real DECIMAL(10, 2),
  diferencia DECIMAL(10, 2),
  estado VARCHAR(20) DEFAULT 'abierto', -- abierto, cerrado
  notas TEXT
);

CREATE INDEX idx_turno_caja_punto_venta ON turno_caja(punto_venta_id);
CREATE INDEX idx_turno_caja_estado ON turno_caja(estado);
CREATE INDEX idx_turno_caja_fecha ON turno_caja(fecha_apertura);

-- ============================================
-- TABLA: operacion_caja
-- ============================================
CREATE TABLE operacion_caja (
  id VARCHAR(50) PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  turno_caja_id VARCHAR(50) REFERENCES turno_caja(id),
  tipo_operacion VARCHAR(30) NOT NULL, -- apertura, retirada, consumo_propio, arqueo, cierre
  monto DECIMAL(10, 2) NOT NULL,
  fecha_operacion TIMESTAMP DEFAULT NOW(),
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  notas TEXT,
  pedido_id VARCHAR(50) REFERENCES pedido(id) -- Si aplica
);

CREATE INDEX idx_operacion_punto_venta ON operacion_caja(punto_venta_id);
CREATE INDEX idx_operacion_turno ON operacion_caja(turno_caja_id);
CREATE INDEX idx_operacion_tipo ON operacion_caja(tipo_operacion);
CREATE INDEX idx_operacion_fecha ON operacion_caja(fecha_operacion);

-- ============================================
-- TRIGGERS Y FUNCIONES
-- ============================================

-- Trigger: Notificar nuevo pedido
CREATE OR REPLACE FUNCTION notify_nuevo_pedido()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'nuevo_pedido',
    json_build_object(
      'pedido_id', NEW.id,
      'punto_venta_id', NEW.punto_venta_id,
      'codigo_turno', NEW.codigo_turno,
      'total_neto', NEW.total_neto,
      'canal_origen', NEW.canal_origen
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nuevo_pedido
AFTER INSERT ON pedido
FOR EACH ROW
EXECUTE FUNCTION notify_nuevo_pedido();

-- Trigger: Notificar cambio de estado
CREATE OR REPLACE FUNCTION notify_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM pg_notify(
      'cambio_estado_pedido',
      json_build_object(
        'pedido_id', NEW.id,
        'codigo_turno', NEW.codigo_turno,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado,
        'punto_venta_id', NEW.punto_venta_id
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cambio_estado
AFTER UPDATE ON pedido
FOR EACH ROW
EXECUTE FUNCTION notify_cambio_estado();

-- Trigger: Actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pedido
BEFORE UPDATE ON pedido
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER trigger_update_producto
BEFORE UPDATE ON producto
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER trigger_update_usuario
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION update_fecha_actualizacion();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Pedidos con información completa
CREATE OR REPLACE VIEW v_pedidos_completo AS
SELECT 
  p.*,
  u.nombre as nombre_usuario,
  c.nombre as nombre_cliente,
  c.telefono as telefono_cliente,
  pdv.nombre as nombre_punto_venta,
  tp.numero_turno,
  tp.estado_turno,
  (
    SELECT COUNT(*)
    FROM linea_pedido lp
    WHERE lp.pedido_id = p.id
  ) as cantidad_productos,
  (
    SELECT SUM(importe)
    FROM pago pg
    WHERE pg.pedido_id = p.id
  ) as total_pagado
FROM pedido p
LEFT JOIN usuario u ON p.usuario_id = u.id
LEFT JOIN cliente c ON p.cliente_id = c.id
LEFT JOIN punto_venta pdv ON p.punto_venta_id = pdv.id
LEFT JOIN turno_pedido tp ON p.id = tp.pedido_id;

-- Vista: Resumen de turnos de caja
CREATE OR REPLACE VIEW v_turnos_caja_resumen AS
SELECT 
  tc.*,
  ua.nombre as usuario_apertura,
  uc.nombre as usuario_cierre,
  pdv.nombre as punto_venta,
  (
    SELECT COUNT(*)
    FROM operacion_caja oc
    WHERE oc.turno_caja_id = tc.id
  ) as total_operaciones,
  (
    SELECT COUNT(*)
    FROM pedido p
    WHERE p.punto_venta_id = tc.punto_venta_id
      AND p.fecha_creacion BETWEEN tc.fecha_apertura AND COALESCE(tc.fecha_cierre, NOW())
      AND p.pagado = true
  ) as total_pedidos_cobrados
FROM turno_caja tc
LEFT JOIN usuario ua ON tc.usuario_apertura_id = ua.id
LEFT JOIN usuario uc ON tc.usuario_cierre_id = uc.id
LEFT JOIN punto_venta pdv ON tc.punto_venta_id = pdv.id;

-- Vista: Estado de impresoras
CREATE OR REPLACE VIEW v_impresoras_estado AS
SELECT 
  i.*,
  pdv.nombre as nombre_punto_venta,
  array_agg(DISTINCT c.categoria) as categorias_asignadas,
  (
    SELECT COUNT(*)
    FROM ticket_impresion ti
    WHERE ti.impresora_id = i.id
      AND ti.estado_impresion = 'error'
      AND DATE(ti.fecha_impresion) = CURRENT_DATE
  ) as errores_hoy
FROM impresora i
LEFT JOIN punto_venta pdv ON i.punto_venta_id = pdv.id
LEFT JOIN config_pdv_impresora c ON i.id = c.impresora_id
GROUP BY i.id, pdv.nombre;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función: Obtener siguiente número de turno
CREATE OR REPLACE FUNCTION obtener_siguiente_turno(
  p_punto_venta_id VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
  ultimo_turno INTEGER;
  fecha_actual DATE;
BEGIN
  fecha_actual := CURRENT_DATE;
  
  SELECT COALESCE(MAX(numero_turno), 0)
  INTO ultimo_turno
  FROM turno_pedido
  WHERE punto_venta_id = p_punto_venta_id
    AND reset_diario = fecha_actual;
  
  IF ultimo_turno >= 999 THEN
    RETURN 1; -- Reset si llegamos a 999
  ELSE
    RETURN ultimo_turno + 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular distancia Haversine
CREATE OR REPLACE FUNCTION calcular_distancia(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS INTEGER AS $$
DECLARE
  R INTEGER := 6371000; -- Radio de la Tierra en metros
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
  distancia INTEGER;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  distancia := ROUND(R * c);
  
  RETURN distancia;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar punto de venta de ejemplo
INSERT INTO punto_venta (id, nombre, direccion, latitud, longitud) VALUES
  ('PDV-001', 'Panadería Centro', 'Calle Mayor 45, Madrid', 40.4168, -3.7038);

-- Insertar usuario de ejemplo
INSERT INTO usuario (id, nombre, email, rol, punto_venta_id) VALUES
  ('USR-001', 'Juan Pérez', 'juan@example.com', 'gerente', 'PDV-001'),
  ('USR-002', 'María López', 'maria@example.com', 'trabajador', 'PDV-001'),
  ('USR-003', 'Carlos Martínez', 'carlos@example.com', 'cajero', 'PDV-001');

-- Insertar permisos
INSERT INTO permiso_usuario_tpv (usuario_id, cobrar_pedidos, marcar_como_listo, gestionar_caja_rapida, hacer_retiradas, arqueo_caja, cierre_caja, ver_informes_turno, acceso_operativa, reimprimir_tickets) VALUES
  ('USR-001', true, true, true, true, true, true, true, true, true),
  ('USR-002', true, true, true, false, true, false, true, true, true),
  ('USR-003', true, false, false, false, false, false, false, false, false);

-- Insertar categorías
INSERT INTO categoria_producto (id, nombre, orden) VALUES
  ('CAT-PAN', 'Pan básico', 1),
  ('CAT-PIZZAS', 'Pizzas', 2),
  ('CAT-BURGUERS', 'Burguers', 3),
  ('CAT-BEBIDAS', 'Bebidas', 4),
  ('CAT-POSTRES', 'Postres', 5);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_pedido_punto_estado_fecha ON pedido(punto_venta_id, estado, fecha_creacion DESC);
CREATE INDEX idx_pedido_pagado_fecha ON pedido(pagado, fecha_creacion DESC);

-- Índice para geolocalización
CREATE INDEX idx_pedido_geolocalizacion ON pedido(geolocalizacion_validada, timestamp_llegada)
WHERE geolocalizacion_validada = true;

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE pedido IS 'Tabla principal de pedidos del TPV 360';
COMMENT ON TABLE turno_pedido IS 'Sistema de turnos P001-P999 con reset diario';
COMMENT ON TABLE ticket_impresion IS 'Control de impresiones por categoría';
COMMENT ON TABLE operacion_caja IS 'Registro de todas las operaciones de caja';
COMMENT ON TABLE permiso_usuario_tpv IS 'Sistema de permisos granular por usuario';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
