-- ============================================
-- TPV 360 - SCHEMA "DATOS DEL CLIENTE"
-- Sistema de gestión de clientes y turnos
-- ============================================

-- ============================================
-- EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas similares

-- ============================================
-- TABLA: cliente (Extendida)
-- ============================================
CREATE TABLE IF NOT EXISTS cliente (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  direccion TEXT,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_ultima_visita TIMESTAMP,
  total_pedidos INTEGER DEFAULT 0,
  total_gastado DECIMAL(10, 2) DEFAULT 0.00,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  es_generico BOOLEAN DEFAULT false, -- Para "Atender sin datos"
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_cliente_nombre_trgm ON cliente USING gin (nombre gin_trgm_ops);
CREATE INDEX idx_cliente_telefono ON cliente(telefono);
CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_cliente_punto_venta ON cliente(punto_venta_id);
CREATE INDEX idx_cliente_activo ON cliente(activo);
CREATE INDEX idx_cliente_es_generico ON cliente(es_generico);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_cliente_busqueda ON cliente(punto_venta_id, activo) 
WHERE activo = true;

-- ============================================
-- TABLA: turno_atencion
-- ============================================
CREATE TABLE turno_atencion (
  id VARCHAR(50) PRIMARY KEY,
  numero_visible VARCHAR(10) NOT NULL, -- A22, A23, etc.
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  cliente_id VARCHAR(50) REFERENCES cliente(id) NOT NULL,
  pedido_id VARCHAR(50) REFERENCES pedido(id),
  estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, atendiendo, atendido, cancelado
  posicion_cola INTEGER,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_llamada TIMESTAMP,
  fecha_atencion TIMESTAMP,
  fecha_finalizacion TIMESTAMP,
  usuario_llamada_id VARCHAR(50) REFERENCES usuario(id),
  usuario_atencion_id VARCHAR(50) REFERENCES usuario(id),
  reset_diario DATE NOT NULL DEFAULT CURRENT_DATE,
  caducado BOOLEAN DEFAULT false,
  fecha_caducidad TIMESTAMP,
  origen VARCHAR(20) NOT NULL, -- presencial, app
  tiempo_espera_minutos INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN fecha_finalizacion IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60
      ELSE 
        EXTRACT(EPOCH FROM (NOW() - fecha_creacion)) / 60
    END
  ) STORED,
  UNIQUE(punto_venta_id, reset_diario, numero_visible)
);

-- Índices
CREATE INDEX idx_turno_punto_venta ON turno_atencion(punto_venta_id);
CREATE INDEX idx_turno_cliente ON turno_atencion(cliente_id);
CREATE INDEX idx_turno_pedido ON turno_atencion(pedido_id);
CREATE INDEX idx_turno_estado ON turno_atencion(estado);
CREATE INDEX idx_turno_reset_diario ON turno_atencion(reset_diario);
CREATE INDEX idx_turno_numero_visible ON turno_atencion(numero_visible);
CREATE INDEX idx_turno_caducado ON turno_atencion(caducado);

-- Índice compuesto para búsqueda de turnos activos
CREATE INDEX idx_turno_activos ON turno_atencion(punto_venta_id, reset_diario, estado)
WHERE estado IN ('pendiente', 'atendiendo');

-- Índice para turnos a caducar
CREATE INDEX idx_turno_a_caducar ON turno_atencion(origen, estado, caducado, fecha_creacion)
WHERE origen = 'app' AND estado = 'pendiente' AND caducado = false;

-- ============================================
-- TABLA: cliente_pdv_relacion
-- ============================================
CREATE TABLE cliente_pdv_relacion (
  id SERIAL PRIMARY KEY,
  cliente_id VARCHAR(50) REFERENCES cliente(id) ON DELETE CASCADE,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) ON DELETE CASCADE,
  primera_visita TIMESTAMP DEFAULT NOW(),
  ultima_visita TIMESTAMP DEFAULT NOW(),
  total_visitas INTEGER DEFAULT 0,
  total_gastado DECIMAL(10, 2) DEFAULT 0.00,
  es_vip BOOLEAN DEFAULT false,
  notas_pdv TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  UNIQUE(cliente_id, punto_venta_id)
);

-- Índices
CREATE INDEX idx_cliente_pdv_cliente ON cliente_pdv_relacion(cliente_id);
CREATE INDEX idx_cliente_pdv_punto_venta ON cliente_pdv_relacion(punto_venta_id);
CREATE INDEX idx_cliente_pdv_vip ON cliente_pdv_relacion(es_vip);
CREATE INDEX idx_cliente_pdv_total_gastado ON cliente_pdv_relacion(total_gastado DESC);

-- ============================================
-- TABLA: auditoria_turnos
-- ============================================
CREATE TABLE auditoria_turnos (
  id SERIAL PRIMARY KEY,
  turno_id VARCHAR(50) REFERENCES turno_atencion(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL, -- creado, llamado, atendiendo, atendido, cancelado, caducado
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  fecha_accion TIMESTAMP DEFAULT NOW(),
  detalles TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Índices
CREATE INDEX idx_auditoria_turnos_turno ON auditoria_turnos(turno_id);
CREATE INDEX idx_auditoria_turnos_accion ON auditoria_turnos(accion);
CREATE INDEX idx_auditoria_turnos_fecha ON auditoria_turnos(fecha_accion DESC);

-- ============================================
-- TABLA: auditoria_clientes
-- ============================================
CREATE TABLE auditoria_clientes (
  id SERIAL PRIMARY KEY,
  cliente_id VARCHAR(50) REFERENCES cliente(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL, -- creado, actualizado, eliminado, duplicado_detectado
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  fecha_accion TIMESTAMP DEFAULT NOW(),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id)
);

-- Índices
CREATE INDEX idx_auditoria_clientes_cliente ON auditoria_clientes(cliente_id);
CREATE INDEX idx_auditoria_clientes_accion ON auditoria_clientes(accion);
CREATE INDEX idx_auditoria_clientes_fecha ON auditoria_clientes(fecha_accion DESC);
CREATE INDEX idx_auditoria_clientes_pdv ON auditoria_clientes(punto_venta_id);

-- ============================================
-- TABLA: atencion_sin_datos
-- ============================================
CREATE TABLE atencion_sin_datos (
  id SERIAL PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  fecha_atencion TIMESTAMP DEFAULT NOW(),
  pedido_id VARCHAR(50) REFERENCES pedido(id),
  total_pedido DECIMAL(10, 2)
);

-- Índices
CREATE INDEX idx_atencion_sin_datos_pdv ON atencion_sin_datos(punto_venta_id);
CREATE INDEX idx_atencion_sin_datos_fecha ON atencion_sin_datos(fecha_atencion DESC);
CREATE INDEX idx_atencion_sin_datos_usuario ON atencion_sin_datos(usuario_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar fecha_actualizacion en cliente
CREATE OR REPLACE FUNCTION update_cliente_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cliente_timestamp
BEFORE UPDATE ON cliente
FOR EACH ROW
EXECUTE FUNCTION update_cliente_timestamp();

-- Trigger: Auditoría automática de clientes
CREATE OR REPLACE FUNCTION audit_cliente_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria_clientes (
      cliente_id, accion, datos_nuevos, punto_venta_id
    ) VALUES (
      NEW.id, 'creado', row_to_json(NEW)::jsonb, NEW.punto_venta_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria_clientes (
      cliente_id, accion, datos_anteriores, datos_nuevos, punto_venta_id
    ) VALUES (
      NEW.id, 'actualizado', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NEW.punto_venta_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria_clientes (
      cliente_id, accion, datos_anteriores, punto_venta_id
    ) VALUES (
      OLD.id, 'eliminado', row_to_json(OLD)::jsonb, OLD.punto_venta_id
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_cliente
AFTER INSERT OR UPDATE OR DELETE ON cliente
FOR EACH ROW
EXECUTE FUNCTION audit_cliente_changes();

-- Trigger: Auditoría automática de turnos
CREATE OR REPLACE FUNCTION audit_turno_changes()
RETURNS TRIGGER AS $$
DECLARE
  accion_texto VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    accion_texto := 'creado';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.estado != NEW.estado THEN
      accion_texto := NEW.estado;
    ELSE
      accion_texto := 'actualizado';
    END IF;
  END IF;

  INSERT INTO auditoria_turnos (
    turno_id, accion, detalles
  ) VALUES (
    NEW.id, accion_texto, 
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Turno creado'
      WHEN OLD.estado != NEW.estado THEN CONCAT('Estado cambió de ', OLD.estado, ' a ', NEW.estado)
      ELSE 'Turno actualizado'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_turno
AFTER INSERT OR UPDATE ON turno_atencion
FOR EACH ROW
EXECUTE FUNCTION audit_turno_changes();

-- Trigger: Actualizar estadísticas del cliente cuando pedido se completa
CREATE OR REPLACE FUNCTION update_cliente_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
    -- Actualizar tabla cliente
    UPDATE cliente
    SET 
      total_pedidos = total_pedidos + 1,
      total_gastado = total_gastado + NEW.total_neto,
      fecha_ultima_visita = NOW()
    WHERE id = NEW.cliente_id;

    -- Actualizar relación cliente-PDV
    UPDATE cliente_pdv_relacion
    SET 
      total_visitas = total_visitas + 1,
      total_gastado = total_gastado + NEW.total_neto,
      ultima_visita = NOW(),
      es_vip = CASE 
        WHEN total_visitas + 1 >= 10 THEN true
        ELSE es_vip
      END
    WHERE cliente_id = NEW.cliente_id
      AND punto_venta_id = NEW.punto_venta_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cliente_stats
AFTER UPDATE ON pedido
FOR EACH ROW
WHEN (NEW.cliente_id IS NOT NULL)
EXECUTE FUNCTION update_cliente_stats();

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función: Generar siguiente número de turno visible
CREATE OR REPLACE FUNCTION generar_numero_turno_visible(
  p_punto_venta_id VARCHAR(50),
  p_prefijo VARCHAR(1) DEFAULT 'A'
)
RETURNS VARCHAR(10) AS $$
DECLARE
  ultimo_numero INTEGER;
  nuevo_numero INTEGER;
  numero_visible VARCHAR(10);
BEGIN
  -- Obtener el último número del día
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(numero_visible FROM 2) AS INTEGER)), 
    0
  )
  INTO ultimo_numero
  FROM turno_atencion
  WHERE punto_venta_id = p_punto_venta_id
    AND reset_diario = CURRENT_DATE
    AND numero_visible LIKE p_prefijo || '%';

  -- Incrementar
  nuevo_numero := ultimo_numero + 1;

  -- Si llega a 999, volver a 1
  IF nuevo_numero > 999 THEN
    nuevo_numero := 1;
  END IF;

  -- Formatear con ceros a la izquierda
  numero_visible := p_prefijo || LPAD(nuevo_numero::TEXT, 2, '0');

  RETURN numero_visible;
END;
$$ LANGUAGE plpgsql;

-- Función: Buscar cliente multicriterio
CREATE OR REPLACE FUNCTION buscar_cliente(
  p_texto_busqueda TEXT,
  p_punto_venta_id VARCHAR(50),
  p_limite INTEGER DEFAULT 10
)
RETURNS TABLE (
  cliente_id VARCHAR(50),
  nombre VARCHAR(200),
  telefono VARCHAR(20),
  email VARCHAR(200),
  total_pedidos INTEGER,
  es_vip BOOLEAN,
  total_gastado DECIMAL(10, 2),
  ultima_visita TIMESTAMP,
  turno_id VARCHAR(50),
  turno_numero VARCHAR(10),
  turno_estado VARCHAR(30),
  posicion_cola INTEGER,
  prioridad INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH busqueda_clientes AS (
    SELECT 
      c.id as cliente_id,
      c.nombre,
      c.telefono,
      c.email,
      c.total_pedidos,
      cpr.es_vip,
      cpr.total_gastado,
      cpr.ultima_visita,
      ta.id as turno_id,
      ta.numero_visible as turno_numero,
      ta.estado as turno_estado,
      ta.posicion_cola,
      CASE 
        WHEN c.nombre ILIKE p_texto_busqueda THEN 1
        WHEN c.telefono = REPLACE(p_texto_busqueda, ' ', '') THEN 1
        WHEN cpr.es_vip = true THEN 2
        WHEN ta.id IS NOT NULL THEN 3
        ELSE 4
      END as prioridad
    FROM cliente c
    LEFT JOIN cliente_pdv_relacion cpr 
      ON c.id = cpr.cliente_id 
      AND cpr.punto_venta_id = p_punto_venta_id
    LEFT JOIN turno_atencion ta 
      ON c.id = ta.cliente_id 
      AND ta.punto_venta_id = p_punto_venta_id
      AND ta.reset_diario = CURRENT_DATE
      AND ta.estado IN ('pendiente', 'atendiendo')
    WHERE c.activo = true
      AND (
        c.nombre ILIKE '%' || p_texto_busqueda || '%'
        OR c.telefono LIKE '%' || REPLACE(p_texto_busqueda, ' ', '') || '%'
        OR c.email ILIKE '%' || p_texto_busqueda || '%'
        OR ta.numero_visible ILIKE '%' || p_texto_busqueda || '%'
      )
  )
  SELECT * FROM busqueda_clientes
  ORDER BY prioridad ASC, nombre ASC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar cliente duplicado
CREATE OR REPLACE FUNCTION verificar_cliente_duplicado(
  p_telefono VARCHAR(20),
  p_punto_venta_id VARCHAR(50)
)
RETURNS TABLE (
  existe BOOLEAN,
  cliente_id VARCHAR(50),
  nombre VARCHAR(200),
  telefono VARCHAR(20),
  email VARCHAR(200),
  total_pedidos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as existe,
    c.id as cliente_id,
    c.nombre,
    c.telefono,
    c.email,
    c.total_pedidos
  FROM cliente c
  JOIN cliente_pdv_relacion cpr ON c.id = cpr.cliente_id
  WHERE c.telefono = REPLACE(p_telefono, ' ', '')
    AND cpr.punto_venta_id = p_punto_venta_id
    AND c.activo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::VARCHAR(50), NULL::VARCHAR(200), NULL::VARCHAR(20), NULL::VARCHAR(200), NULL::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener turnos en espera
CREATE OR REPLACE FUNCTION obtener_turnos_en_espera(
  p_punto_venta_id VARCHAR(50)
)
RETURNS TABLE (
  turno_id VARCHAR(50),
  numero_visible VARCHAR(10),
  estado VARCHAR(30),
  posicion_cola BIGINT,
  cliente_id VARCHAR(50),
  cliente_nombre VARCHAR(200),
  cliente_telefono VARCHAR(20),
  cliente_email VARCHAR(200),
  es_vip BOOLEAN,
  total_pedidos_cliente INTEGER,
  tiempo_espera_minutos DOUBLE PRECISION,
  etiqueta VARCHAR(50),
  debe_caducar BOOLEAN,
  origen VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  WITH turnos_ordenados AS (
    SELECT 
      ta.id as turno_id,
      ta.numero_visible,
      ta.estado,
      c.id as cliente_id,
      c.nombre as cliente_nombre,
      c.telefono as cliente_telefono,
      c.email as cliente_email,
      cpr.es_vip,
      cpr.total_pedidos as total_pedidos_cliente,
      EXTRACT(EPOCH FROM (NOW() - ta.fecha_creacion)) / 60 as tiempo_espera_minutos,
      ta.origen,
      ROW_NUMBER() OVER (
        ORDER BY 
          CASE WHEN ta.estado = 'atendiendo' THEN 0 ELSE 1 END,
          ta.numero_visible ASC
      ) as posicion_cola
    FROM turno_atencion ta
    JOIN cliente c ON ta.cliente_id = c.id
    LEFT JOIN cliente_pdv_relacion cpr 
      ON c.id = cpr.cliente_id 
      AND cpr.punto_venta_id = ta.punto_venta_id
    WHERE ta.punto_venta_id = p_punto_venta_id
      AND ta.reset_diario = CURRENT_DATE
      AND ta.estado IN ('pendiente', 'atendiendo')
    ORDER BY posicion_cola
  )
  SELECT 
    t.*,
    CASE 
      WHEN t.posicion_cola = 1 AND t.estado = 'pendiente' THEN 'siguiente'
      WHEN t.estado = 'atendiendo' THEN 'atendiendo'
      ELSE CONCAT('posicion_', t.posicion_cola)
    END as etiqueta,
    CASE 
      WHEN t.tiempo_espera_minutos > 10 AND t.origen = 'app' THEN true
      ELSE false
    END as debe_caducar
  FROM turnos_ordenados t;
END;
$$ LANGUAGE plpgsql;

-- Función: Marcar turnos caducados
CREATE OR REPLACE FUNCTION marcar_turnos_caducados(
  p_minutos_limite INTEGER DEFAULT 10
)
RETURNS TABLE (
  turno_id VARCHAR(50),
  numero_visible VARCHAR(10),
  cliente_nombre VARCHAR(200),
  minutos_espera DOUBLE PRECISION
) AS $$
BEGIN
  -- Actualizar turnos caducados
  UPDATE turno_atencion
  SET 
    caducado = true,
    fecha_caducidad = NOW()
  WHERE origen = 'app'
    AND estado = 'pendiente'
    AND caducado = false
    AND fecha_creacion < NOW() - (p_minutos_limite || ' minutes')::INTERVAL
    AND reset_diario = CURRENT_DATE;

  -- Devolver los turnos que se marcaron
  RETURN QUERY
  SELECT 
    ta.id as turno_id,
    ta.numero_visible,
    c.nombre as cliente_nombre,
    EXTRACT(EPOCH FROM (NOW() - ta.fecha_creacion)) / 60 as minutos_espera
  FROM turno_atencion ta
  JOIN cliente c ON ta.cliente_id = c.id
  WHERE ta.caducado = true
    AND ta.fecha_caducidad >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS
-- ============================================

-- Vista: Clientes completos con estadísticas
CREATE OR REPLACE VIEW v_clientes_completo AS
SELECT 
  c.id as cliente_id,
  c.nombre,
  c.telefono,
  c.email,
  c.direccion,
  c.fecha_creacion,
  c.fecha_ultima_visita,
  c.total_pedidos,
  c.total_gastado,
  c.activo,
  c.es_generico,
  cpr.punto_venta_id,
  pdv.nombre as nombre_punto_venta,
  cpr.primera_visita,
  cpr.ultima_visita as ultima_visita_pdv,
  cpr.total_visitas as total_visitas_pdv,
  cpr.total_gastado as total_gastado_pdv,
  cpr.es_vip,
  cpr.notas_pdv,
  (
    SELECT COUNT(*)
    FROM turno_atencion ta
    WHERE ta.cliente_id = c.id
      AND ta.reset_diario = CURRENT_DATE
  ) as turnos_hoy,
  (
    SELECT ta.numero_visible
    FROM turno_atencion ta
    WHERE ta.cliente_id = c.id
      AND ta.reset_diario = CURRENT_DATE
      AND ta.estado IN ('pendiente', 'atendiendo')
    LIMIT 1
  ) as turno_activo
FROM cliente c
LEFT JOIN cliente_pdv_relacion cpr ON c.id = cpr.cliente_id
LEFT JOIN punto_venta pdv ON cpr.punto_venta_id = pdv.id
WHERE c.activo = true
  AND c.es_generico = false;

-- Vista: Turnos activos con información completa
CREATE OR REPLACE VIEW v_turnos_activos AS
SELECT 
  ta.id as turno_id,
  ta.numero_visible,
  ta.estado,
  ta.posicion_cola,
  ta.fecha_creacion,
  ta.fecha_llamada,
  ta.origen,
  ta.caducado,
  EXTRACT(EPOCH FROM (NOW() - ta.fecha_creacion)) / 60 as tiempo_espera_minutos,
  c.id as cliente_id,
  c.nombre as cliente_nombre,
  c.telefono as cliente_telefono,
  c.email as cliente_email,
  cpr.es_vip,
  cpr.total_pedidos,
  cpr.total_gastado,
  pdv.id as punto_venta_id,
  pdv.nombre as nombre_punto_venta,
  p.id as pedido_id,
  p.total_neto as total_pedido
FROM turno_atencion ta
JOIN cliente c ON ta.cliente_id = c.id
JOIN punto_venta pdv ON ta.punto_venta_id = pdv.id
LEFT JOIN cliente_pdv_relacion cpr 
  ON c.id = cpr.cliente_id 
  AND pdv.id = cpr.punto_venta_id
LEFT JOIN pedido p ON ta.pedido_id = p.id
WHERE ta.estado IN ('pendiente', 'atendiendo')
  AND ta.reset_diario = CURRENT_DATE
ORDER BY ta.numero_visible;

-- Vista: Estadísticas diarias de turnos
CREATE OR REPLACE VIEW v_estadisticas_turnos_diarias AS
SELECT 
  punto_venta_id,
  pdv.nombre as nombre_punto_venta,
  reset_diario as fecha,
  COUNT(*) as total_turnos,
  COUNT(*) FILTER (WHERE estado = 'atendido') as turnos_atendidos,
  COUNT(*) FILTER (WHERE estado = 'cancelado') as turnos_cancelados,
  COUNT(*) FILTER (WHERE caducado = true) as turnos_caducados,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60) 
    FILTER (WHERE estado = 'atendido'),
    2
  ) as tiempo_promedio_minutos,
  ROUND(
    MAX(EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60) 
    FILTER (WHERE estado = 'atendido'),
    2
  ) as tiempo_maximo_minutos,
  ROUND(
    MIN(EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60) 
    FILTER (WHERE estado = 'atendido'),
    2
  ) as tiempo_minimo_minutos,
  ROUND(
    COUNT(*) FILTER (WHERE estado = 'atendido')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as porcentaje_atencion
FROM turno_atencion ta
JOIN punto_venta pdv ON ta.punto_venta_id = pdv.id
GROUP BY punto_venta_id, pdv.nombre, reset_diario
ORDER BY reset_diario DESC, punto_venta_id;

-- Vista: Top clientes VIP
CREATE OR REPLACE VIEW v_top_clientes_vip AS
SELECT 
  c.id as cliente_id,
  c.nombre,
  c.telefono,
  c.email,
  cpr.punto_venta_id,
  pdv.nombre as nombre_punto_venta,
  cpr.total_visitas,
  cpr.total_gastado,
  cpr.primera_visita,
  cpr.ultima_visita,
  ROUND(cpr.total_gastado / NULLIF(cpr.total_visitas, 0), 2) as ticket_promedio,
  EXTRACT(DAY FROM (NOW() - cpr.ultima_visita)) as dias_sin_visitar
FROM cliente c
JOIN cliente_pdv_relacion cpr ON c.id = cpr.cliente_id
JOIN punto_venta pdv ON cpr.punto_venta_id = pdv.id
WHERE cpr.es_vip = true
  AND c.activo = true
ORDER BY cpr.total_gastado DESC, cpr.total_visitas DESC;

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar clientes de ejemplo (solo si no existen)
INSERT INTO cliente (id, nombre, telefono, email, punto_venta_id, total_pedidos, total_gastado, es_generico)
VALUES 
  ('CLI-DEMO-001', 'María García López', '678123456', 'maria@email.com', 'PDV-001', 15, 450.00, false),
  ('CLI-DEMO-002', 'Carlos Martínez Ruiz', '645987321', 'carlos@email.com', 'PDV-001', 8, 240.00, false),
  ('CLI-DEMO-003', 'Ana Rodríguez Pérez', '612456789', 'ana@email.com', 'PDV-001', 3, 90.00, false),
  ('CLI-GENERIC-PDV-001', 'Cliente sin datos', 'N/A', null, 'PDV-001', 0, 0.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insertar relaciones cliente-PDV de ejemplo
INSERT INTO cliente_pdv_relacion (cliente_id, punto_venta_id, total_visitas, total_gastado, es_vip)
VALUES 
  ('CLI-DEMO-001', 'PDV-001', 15, 450.00, true),
  ('CLI-DEMO-002', 'PDV-001', 8, 240.00, false),
  ('CLI-DEMO-003', 'PDV-001', 3, 90.00, false)
ON CONFLICT (cliente_id, punto_venta_id) DO NOTHING;

-- ============================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ============================================

-- Habilitar RLS en las tablas
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno_atencion ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_pdv_relacion ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo ven clientes de su PDV
CREATE POLICY cliente_pdv_policy ON cliente
  FOR ALL
  USING (punto_venta_id = current_setting('app.current_pdv_id', true)::VARCHAR(50));

-- Política: Los usuarios solo ven turnos de su PDV
CREATE POLICY turno_pdv_policy ON turno_atencion
  FOR ALL
  USING (punto_venta_id = current_setting('app.current_pdv_id', true)::VARCHAR(50));

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE cliente IS 'Tabla principal de clientes del sistema TPV';
COMMENT ON TABLE turno_atencion IS 'Sistema de turnos de atención con numeración A01-A99';
COMMENT ON TABLE cliente_pdv_relacion IS 'Relación muchos a muchos entre clientes y puntos de venta';
COMMENT ON TABLE auditoria_turnos IS 'Auditoría completa de acciones en turnos';
COMMENT ON TABLE auditoria_clientes IS 'Auditoría completa de acciones en clientes';
COMMENT ON TABLE atencion_sin_datos IS 'Registro de atenciones sin datos del cliente';

COMMENT ON COLUMN cliente.es_generico IS 'Indica si es un cliente genérico para "Atender sin datos"';
COMMENT ON COLUMN turno_atencion.caducado IS 'Turnos de app que superan 10 minutos sin atender';
COMMENT ON COLUMN turno_atencion.tiempo_espera_minutos IS 'Columna calculada automáticamente';
COMMENT ON COLUMN cliente_pdv_relacion.es_vip IS 'Cliente VIP si tiene más de 10 visitas o gasto > 500€';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
