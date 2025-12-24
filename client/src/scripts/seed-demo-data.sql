-- ============================================================================
-- UDAR EDGE - DATOS DE DEMOSTRACIÓN
-- ============================================================================
-- Este script inserta datos de ejemplo para testing y demos
-- IMPORTANTE: Solo ejecutar en entornos de desarrollo/demo
-- ============================================================================

-- Verificar que no estamos en producción
DO $$
BEGIN
  IF current_database() = 'production' THEN
    RAISE EXCEPTION '❌ Este script NO debe ejecutarse en producción!';
  END IF;
END $$;

-- ============================================================================
-- 1. PRODUCTOS DE DEMOSTRACIÓN
-- ============================================================================

-- Bebidas
INSERT INTO productos (empresa_id, nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, activo, config) VALUES
(1, 'Coca-Cola', 'Refresco 330ml', (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas' AND empresa_id = 1 LIMIT 1), 2.50, 0.80, 100, 20, true, '{"capacidad": "330ml"}'::jsonb),
(1, 'Agua Mineral', 'Agua 500ml', (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas' AND empresa_id = 1 LIMIT 1), 1.50, 0.30, 150, 30, true, '{"capacidad": "500ml"}'::jsonb),
(1, 'Cerveza Estrella', 'Cerveza barril 330ml', (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas' AND empresa_id = 1 LIMIT 1), 3.00, 1.00, 80, 15, true, '{"alcohol": "4.7%"}'::jsonb),
(1, 'Vino Tinto Crianza', 'Copa de vino tinto', (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas' AND empresa_id = 1 LIMIT 1), 4.50, 1.50, 50, 10, true, '{"tipo": "crianza"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Entrantes
INSERT INTO productos (empresa_id, nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, activo, config) VALUES
(1, 'Ensalada César', 'Lechuga, pollo, parmesano, salsa césar', (SELECT id FROM categorias_productos WHERE nombre = 'Entrantes' AND empresa_id = 1 LIMIT 1), 8.50, 3.00, 999, 0, true, '{"alergenos": ["gluten", "lacteos", "huevo"]}'::jsonb),
(1, 'Croquetas Caseras', '6 unidades variadas', (SELECT id FROM categorias_productos WHERE nombre = 'Entrantes' AND empresa_id = 1 LIMIT 1), 7.00, 2.50, 999, 0, true, '{"unidades": 6, "alergenos": ["gluten", "lacteos"]}'::jsonb),
(1, 'Tabla de Jamón', 'Jamón ibérico de bellota', (SELECT id FROM categorias_productos WHERE nombre = 'Entrantes' AND empresa_id = 1 LIMIT 1), 18.00, 7.00, 999, 0, true, '{"peso": "100g"}'::jsonb),
(1, 'Nachos con Guacamole', 'Nachos caseros con guacamole', (SELECT id FROM categorias_productos WHERE nombre = 'Entrantes' AND empresa_id = 1 LIMIT 1), 6.50, 2.00, 999, 0, true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- Principales
INSERT INTO productos (empresa_id, nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, activo, config) VALUES
(1, 'Hamburguesa Clásica', 'Carne 200g, queso, lechuga, tomate, cebolla', (SELECT id FROM categorias_productos WHERE nombre = 'Principales' AND empresa_id = 1 LIMIT 1), 12.00, 4.50, 999, 0, true, '{"alergenos": ["gluten", "lacteos"]}'::jsonb),
(1, 'Pizza Margherita', 'Tomate, mozzarella, albahaca', (SELECT id FROM categorias_productos WHERE nombre = 'Principales' AND empresa_id = 1 LIMIT 1), 10.00, 3.50, 999, 0, true, '{"tamaño": "mediana", "alergenos": ["gluten", "lacteos"]}'::jsonb),
(1, 'Pasta Carbonara', 'Espaguetis, bacon, nata, parmesano', (SELECT id FROM categorias_productos WHERE nombre = 'Principales' AND empresa_id = 1 LIMIT 1), 11.50, 4.00, 999, 0, true, '{"alergenos": ["gluten", "lacteos", "huevo"]}'::jsonb),
(1, 'Salmón a la Plancha', 'Salmón 250g con verduras', (SELECT id FROM categorias_productos WHERE nombre = 'Principales' AND empresa_id = 1 LIMIT 1), 16.00, 6.50, 999, 0, true, '{"alergenos": ["pescado"]}'::jsonb),
(1, 'Entrecot de Ternera', 'Entrecot 300g con patatas', (SELECT id FROM categorias_productos WHERE nombre = 'Principales' AND empresa_id = 1 LIMIT 1), 19.00, 8.00, 999, 0, true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- Postres
INSERT INTO productos (empresa_id, nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, activo, config) VALUES
(1, 'Tiramisú Casero', 'Postre italiano tradicional', (SELECT id FROM categorias_productos WHERE nombre = 'Postres' AND empresa_id = 1 LIMIT 1), 5.50, 2.00, 999, 0, true, '{"alergenos": ["gluten", "lacteos", "huevo"]}'::jsonb),
(1, 'Brownie con Helado', 'Brownie de chocolate con helado de vainilla', (SELECT id FROM categorias_productos WHERE nombre = 'Postres' AND empresa_id = 1 LIMIT 1), 6.00, 2.20, 999, 0, true, '{"alergenos": ["gluten", "lacteos", "frutos_secos"]}'::jsonb),
(1, 'Tarta de Queso', 'Cheesecake New York style', (SELECT id FROM categorias_productos WHERE nombre = 'Postres' AND empresa_id = 1 LIMIT 1), 5.00, 1.80, 999, 0, true, '{"alergenos": ["gluten", "lacteos", "huevo"]}'::jsonb),
(1, 'Helado Artesanal', '2 bolas a elegir', (SELECT id FROM categorias_productos WHERE nombre = 'Postres' AND empresa_id = 1 LIMIT 1), 4.00, 1.20, 999, 0, true, '{"sabores": ["vainilla", "chocolate", "fresa"], "alergenos": ["lacteos"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- Cafés
INSERT INTO productos (empresa_id, nombre, descripcion, categoria_id, precio, costo, stock_actual, stock_minimo, activo, config) VALUES
(1, 'Café Solo', 'Espresso italiano', (SELECT id FROM categorias_productos WHERE nombre = 'Cafés' AND empresa_id = 1 LIMIT 1), 1.50, 0.30, 999, 0, true, '{}'::jsonb),
(1, 'Café con Leche', 'Espresso con leche', (SELECT id FROM categorias_productos WHERE nombre = 'Cafés' AND empresa_id = 1 LIMIT 1), 1.80, 0.40, 999, 0, true, '{"alergenos": ["lacteos"]}'::jsonb),
(1, 'Cappuccino', 'Espresso con espuma de leche', (SELECT id FROM categorias_productos WHERE nombre = 'Cafés' AND empresa_id = 1 LIMIT 1), 2.50, 0.60, 999, 0, true, '{"alergenos": ["lacteos"]}'::jsonb),
(1, 'Café Americano', 'Espresso alargado', (SELECT id FROM categorias_productos WHERE nombre = 'Cafés' AND empresa_id = 1 LIMIT 1), 1.80, 0.35, 999, 0, true, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. USUARIOS DE DEMOSTRACIÓN
-- ============================================================================

-- Trabajadores
INSERT INTO usuarios (id, email, nombre, apellidos, rol, empresa_id, departamento_id, activo, config) VALUES
(gen_random_uuid(), 'camarero1@demo.com', 'Carlos', 'Martínez', 'trabajador', 1, (SELECT id FROM departamentos WHERE nombre = 'Sala' AND empresa_id = 1 LIMIT 1), true, '{"puesto": "Camarero"}'::jsonb),
(gen_random_uuid(), 'camarero2@demo.com', 'María', 'García', 'trabajador', 1, (SELECT id FROM departamentos WHERE nombre = 'Sala' AND empresa_id = 1 LIMIT 1), true, '{"puesto": "Camarera"}'::jsonb),
(gen_random_uuid(), 'cocinero1@demo.com', 'Juan', 'López', 'trabajador', 1, (SELECT id FROM departamentos WHERE nombre = 'Cocina' AND empresa_id = 1 LIMIT 1), true, '{"puesto": "Jefe de Cocina"}'::jsonb),
(gen_random_uuid(), 'cocinero2@demo.com', 'Ana', 'Rodríguez', 'trabajador', 1, (SELECT id FROM departamentos WHERE nombre = 'Cocina' AND empresa_id = 1 LIMIT 1), true, '{"puesto": "Ayudante de Cocina"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Clientes
INSERT INTO clientes (empresa_id, nombre, apellidos, email, telefono, fecha_nacimiento, activo, config) VALUES
(1, 'Pedro', 'Sánchez', 'pedro.sanchez@email.com', '+34 611 222 333', '1985-03-15', true, '{"preferencias": ["sin_gluten"], "puntos_fidelizacion": 150}'::jsonb),
(1, 'Laura', 'Fernández', 'laura.fernandez@email.com', '+34 622 333 444', '1990-07-22', true, '{"preferencias": [], "puntos_fidelizacion": 280}'::jsonb),
(1, 'Miguel', 'Torres', 'miguel.torres@email.com', '+34 633 444 555', '1978-11-08', true, '{"preferencias": ["vegetariano"], "puntos_fidelizacion": 95}'::jsonb),
(1, 'Carmen', 'Ruiz', 'carmen.ruiz@email.com', '+34 644 555 666', '1995-05-30', true, '{"preferencias": [], "puntos_fidelizacion": 420}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. PEDIDOS DE DEMOSTRACIÓN
-- ============================================================================

-- Pedido 1
INSERT INTO pedidos (
  empresa_id,
  ubicacion_id,
  cliente_id,
  numero_pedido,
  tipo,
  estado,
  subtotal,
  impuestos,
  descuento,
  total,
  metodo_pago,
  fecha_pedido,
  notas
) VALUES (
  1,
  1,
  (SELECT id FROM clientes WHERE email = 'pedro.sanchez@email.com' LIMIT 1),
  'PED-001',
  'local',
  'completado',
  32.00,
  3.20,
  0,
  35.20,
  'tarjeta',
  NOW() - INTERVAL '2 hours',
  'Mesa 5'
);

-- Líneas del Pedido 1
INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas) VALUES
((SELECT id FROM pedidos WHERE numero_pedido = 'PED-001' LIMIT 1), (SELECT id FROM productos WHERE nombre = 'Ensalada César' AND empresa_id = 1 LIMIT 1), 2, 8.50, 17.00, NULL),
((SELECT id FROM pedidos WHERE numero_pedido = 'PED-001' LIMIT 1), (SELECT id FROM productos WHERE nombre = 'Cerveza Estrella' AND empresa_id = 1 LIMIT 1), 2, 3.00, 6.00, NULL),
((SELECT id FROM pedidos WHERE numero_pedido = 'PED-001' LIMIT 1), (SELECT id FROM productos WHERE nombre = 'Tiramisú Casero' AND empresa_id = 1 LIMIT 1), 1, 5.50, 5.50, NULL),
((SELECT id FROM pedidos WHERE numero_pedido = 'PED-001' LIMIT 1), (SELECT id FROM productos WHERE nombre = 'Café con Leche' AND empresa_id = 1 LIMIT 1), 2, 1.80, 3.60, NULL);

-- ============================================================================
-- 4. MOVIMIENTOS DE STOCK
-- ============================================================================

-- Entrada de stock inicial
INSERT INTO movimientos_stock (
  empresa_id,
  almacen_id,
  producto_id,
  tipo_movimiento,
  cantidad,
  motivo,
  usuario_id,
  fecha
) VALUES
(1, 1, (SELECT id FROM productos WHERE nombre = 'Coca-Cola' AND empresa_id = 1 LIMIT 1), 'entrada', 100, 'Stock inicial', (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), NOW() - INTERVAL '7 days'),
(1, 1, (SELECT id FROM productos WHERE nombre = 'Agua Mineral' AND empresa_id = 1 LIMIT 1), 'entrada', 150, 'Stock inicial', (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), NOW() - INTERVAL '7 days'),
(1, 1, (SELECT id FROM productos WHERE nombre = 'Cerveza Estrella' AND empresa_id = 1 LIMIT 1), 'entrada', 80, 'Stock inicial', (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), NOW() - INTERVAL '7 days');

-- ============================================================================
-- 5. FICHAJES DE EMPLEADOS
-- ============================================================================

INSERT INTO fichajes (
  empresa_id,
  usuario_id,
  ubicacion_id,
  tipo,
  fecha_hora,
  latitud,
  longitud,
  metodo
) VALUES
-- Fichajes de hoy
(1, (SELECT id FROM usuarios WHERE email = 'camarero1@demo.com' LIMIT 1), 1, 'entrada', DATE_TRUNC('day', NOW()) + INTERVAL '9 hours', 41.3851, 2.1734, 'app'),
(1, (SELECT id FROM usuarios WHERE email = 'camarero2@demo.com' LIMIT 1), 1, 'entrada', DATE_TRUNC('day', NOW()) + INTERVAL '9 hours 5 minutes', 41.3851, 2.1734, 'biometrico'),
(1, (SELECT id FROM usuarios WHERE email = 'cocinero1@demo.com' LIMIT 1), 1, 'entrada', DATE_TRUNC('day', NOW()) + INTERVAL '8 hours 30 minutes', 41.3851, 2.1734, 'app'),

-- Fichajes de ayer (completos)
(1, (SELECT id FROM usuarios WHERE email = 'camarero1@demo.com' LIMIT 1), 1, 'entrada', DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '9 hours', 41.3851, 2.1734, 'app'),
(1, (SELECT id FROM usuarios WHERE email = 'camarero1@demo.com' LIMIT 1), 1, 'salida', DATE_TRUNC('day', NOW() - INTERVAL '1 day') + INTERVAL '17 hours', 41.3851, 2.1734, 'app');

-- ============================================================================
-- 6. TAREAS
-- ============================================================================

INSERT INTO tareas (
  empresa_id,
  titulo,
  descripcion,
  usuario_asignado_id,
  usuario_creador_id,
  prioridad,
  estado,
  fecha_vencimiento
) VALUES
(1, 'Revisar stock de bebidas', 'Hacer inventario de la cámara de bebidas', (SELECT id FROM usuarios WHERE email = 'camarero1@demo.com' LIMIT 1), (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), 'alta', 'pendiente', NOW() + INTERVAL '1 day'),
(1, 'Limpiar cocina profundamente', 'Limpieza profunda de la cocina antes de inspección', (SELECT id FROM usuarios WHERE email = 'cocinero2@demo.com' LIMIT 1), (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), 'urgente', 'en_proceso', NOW() + INTERVAL '2 hours'),
(1, 'Actualizar carta de postres', 'Añadir nuevos postres de temporada', (SELECT id FROM usuarios WHERE email = 'cocinero1@demo.com' LIMIT 1), (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), 'media', 'pendiente', NOW() + INTERVAL '7 days');

-- ============================================================================
-- 7. NOTIFICACIONES
-- ============================================================================

INSERT INTO notificaciones (
  empresa_id,
  usuario_id,
  tipo,
  titulo,
  mensaje,
  leida,
  datos
) VALUES
(1, (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), 'alerta_stock', 'Stock bajo: Cerveza Estrella', 'El stock de Cerveza Estrella está por debajo del mínimo', false, '{"producto_id": 1, "stock_actual": 12, "stock_minimo": 15}'::jsonb),
(1, (SELECT id FROM usuarios WHERE email = 'camarero1@demo.com' LIMIT 1), 'nueva_tarea', 'Nueva tarea asignada', 'Te han asignado: Revisar stock de bebidas', false, '{"tarea_id": 1}'::jsonb),
(1, (SELECT id FROM usuarios WHERE email = 'gerente@turestaurante.com' LIMIT 1), 'nuevo_pedido', 'Nuevo pedido recibido', 'Pedido PED-001 recibido de Pedro Sánchez', true, '{"pedido_id": 1}'::jsonb);

-- ============================================================================
-- CONFIRMACIÓN
-- ============================================================================

DO $$
DECLARE
  productos_count INTEGER;
  usuarios_count INTEGER;
  pedidos_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO productos_count FROM productos WHERE empresa_id = 1;
  SELECT COUNT(*) INTO usuarios_count FROM usuarios WHERE empresa_id = 1;
  SELECT COUNT(*) INTO pedidos_count FROM pedidos WHERE empresa_id = 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ DATOS DE DEMOSTRACIÓN INSERTADOS                       ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumen:';
  RAISE NOTICE '   - Productos: %', productos_count;
  RAISE NOTICE '   - Usuarios: %', usuarios_count;
  RAISE NOTICE '   - Pedidos: %', pedidos_count;
  RAISE NOTICE '';
  RAISE NOTICE '✨ La aplicación ya tiene datos para probar!';
  RAISE NOTICE '';
END $$;
