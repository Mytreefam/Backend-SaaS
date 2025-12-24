/**
 * EJEMPLO DE INTEGRACIÓN: Modal de Permisos de Empleado
 * 
 * Este archivo muestra cómo integrar el nuevo modal de permisos
 * en tu pantalla de gestión de empleados.
 */

import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { Badge } from './components/ui/badge';
import { ModalPermisosEmpleado } from './components/gerente/ModalPermisosEmpleado';
import { Settings, Eye } from 'lucide-react';

// ============================================================================
// EJEMPLO DE USO
// ============================================================================

export function EjemploGestionEmpleados() {
  const [modalPermisosOpen, setModalPermisosOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<any>(null);

  // Datos de ejemplo
  const empleados = [
    {
      id: 'EMP-001',
      nombre: 'Carlos Méndez García',
      codigo: 'COD-001',
      rol: 'encargado',
      email: 'carlos.mendez@pau.com',
      telefono: '+34 612 345 678',
      puesto: 'Encargado',
      empresa: 'Disarmink S.L.',
      marca: 'Modomio',
      puntoVenta: 'Tiana',
      activo: true
    },
    {
      id: 'EMP-002',
      nombre: 'Ana López Martín',
      codigo: 'COD-002',
      rol: 'cocinero',
      email: 'ana.lopez@pau.com',
      telefono: '+34 623 456 789',
      puesto: 'Cocinera',
      empresa: 'Disarmink S.L.',
      marca: 'Modomio',
      puntoVenta: 'Tiana',
      activo: true
    },
    {
      id: 'EMP-003',
      nombre: 'Pedro Sánchez Ruiz',
      codigo: 'COD-003',
      rol: 'repartidor',
      email: 'pedro.sanchez@pau.com',
      telefono: '+34 634 567 890',
      puesto: 'Repartidor',
      empresa: 'Disarmink S.L.',
      marca: 'Modomio',
      puntoVenta: 'Tiana',
      activo: true
    }
  ];

  const handleAbrirPermisos = (empleado: any) => {
    setEmpleadoSeleccionado(empleado);
    setModalPermisosOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión de empleados
          </h1>
          <p className="text-gray-600 mt-1">
            Administra roles y permisos de tu equipo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Empleados activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Punto de venta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleados.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{empleado.nombre}</p>
                      <p className="text-sm text-gray-600">{empleado.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50">
                      {empleado.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                      {empleado.rol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {empleado.puntoVenta}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Activo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAbrirPermisos(empleado)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Permisos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Permisos */}
      {empleadoSeleccionado && (
        <ModalPermisosEmpleado
          isOpen={modalPermisosOpen}
          onOpenChange={setModalPermisosOpen}
          empleado={empleadoSeleccionado}
        />
      )}
    </div>
  );
}

// ============================================================================
// PAYLOAD QUE SE ENVÍA A MAKE.COM / BACKEND
// ============================================================================

/**
 * Cuando el usuario hace clic en "Guardar cambios", el componente
 * genera el siguiente payload:
 */

const payloadEjemplo = {
  empleado_id: 'EMP-001',
  rol: 'encargado',
  permisos_activos: [
    'acceso_app',
    'ver_perfil',
    'recibir_notificaciones',
    'fichar',
    'ver_horas',
    'ver_calendario',
    'ver_doc_laboral',
    'ver_pedidos',
    'crear_pedidos',
    'editar_pedidos',
    'cambiar_estado_cocina',
    'cambiar_estado_reparto',
    'ver_metodo_pago',
    'ver_tpv',
    'abrir_caja',
    'cerrar_caja',
    'arqueo',
    'ver_ventas_tpv',
    'devoluciones',
    'ver_stock',
    'editar_stock',
    'ver_mermas',
    'ver_kpi_pv',
    'ver_escandallos',
    'ver_empleados',
    'ver_fichajes_equipo'
  ],
  total_permisos: 25
};

/**
 * Este payload debe enviarse a:
 * POST /api/empleados/{empleado_id}/permisos
 * 
 * El backend debe:
 * 1. Validar que el usuario tiene permiso para modificar permisos
 * 2. Actualizar la tabla de permisos del empleado
 * 3. Invalidar sesiones activas si es necesario (por seguridad)
 * 4. Registrar en log de auditoría
 */

// ============================================================================
// ESTRUCTURA DE BBDD RECOMENDADA
// ============================================================================

/**
 * Tabla: empleado_permisos
 * 
 * CREATE TABLE empleado_permisos (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   empleado_id UUID NOT NULL REFERENCES usuario(usuario_id),
 *   empresa_id UUID NOT NULL REFERENCES empresa(empresa_id),
 *   
 *   -- Rol funcional
 *   rol VARCHAR(100) NOT NULL, -- 'cocinero', 'encargado', 'repartidor', etc.
 *   
 *   -- Permisos individuales (puede ser JSONB o tabla relacional)
 *   permisos JSONB NOT NULL,
 *   -- Ejemplo estructura JSONB:
 *   -- {
 *   --   "acceso_app": true,
 *   --   "ver_perfil": true,
 *   --   "fichar": true,
 *   --   ...
 *   -- }
 *   
 *   -- Auditoría
 *   updated_by UUID REFERENCES usuario(usuario_id),
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   
 *   INDEX idx_empleado (empleado_id),
 *   INDEX idx_rol (rol)
 * );
 */

/**
 * Consulta de ejemplo para verificar permisos:
 * 
 * SELECT permisos->>'ver_pedidos' AS puede_ver_pedidos
 * FROM empleado_permisos
 * WHERE empleado_id = 'EMP-001';
 * 
 * O usando middleware en el backend:
 * 
 * function verificarPermiso(usuario_id, permiso_requerido) {
 *   const permisos = await db.query(`
 *     SELECT permisos->>$2 AS tiene_permiso
 *     FROM empleado_permisos
 *     WHERE empleado_id = $1
 *   `, [usuario_id, permiso_requerido]);
 *   
 *   return permisos.tiene_permiso === 'true';
 * }
 */

// ============================================================================
// CONFIGURACIÓN DE PLANTILLAS DE ROLES
// ============================================================================

/**
 * Las plantillas están definidas dentro del componente, pero pueden
 * moverse a la BBDD para que sean configurables desde el backend.
 * 
 * Tabla opcional: plantillas_roles
 * 
 * CREATE TABLE plantillas_roles (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   empresa_id UUID NOT NULL REFERENCES empresa(empresa_id),
 *   nombre_rol VARCHAR(100) NOT NULL,
 *   descripcion TEXT,
 *   permisos JSONB NOT NULL,
 *   es_predefinido BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   
 *   UNIQUE(empresa_id, nombre_rol)
 * );
 * 
 * Ejemplo de registro:
 * 
 * INSERT INTO plantillas_roles (empresa_id, nombre_rol, permisos, es_predefinido)
 * VALUES (
 *   'EMP-001',
 *   'encargado',
 *   '["acceso_app", "ver_perfil", "fichar", "ver_pedidos", "crear_pedidos", ...]',
 *   true
 * );
 */

// ============================================================================
// LOGS DE AUDITORÍA
// ============================================================================

/**
 * Cada cambio de permisos debe registrarse en una tabla de auditoría:
 * 
 * CREATE TABLE auditoria_permisos (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   empleado_id UUID NOT NULL,
 *   modificado_por UUID NOT NULL REFERENCES usuario(usuario_id),
 *   accion VARCHAR(50) NOT NULL, -- 'cambio_rol', 'cambio_permiso', 'activacion', 'desactivacion'
 *   
 *   -- Datos antes/después
 *   rol_anterior VARCHAR(100),
 *   rol_nuevo VARCHAR(100),
 *   permisos_anteriores JSONB,
 *   permisos_nuevos JSONB,
 *   
 *   -- Detalles
 *   permisos_añadidos TEXT[],
 *   permisos_eliminados TEXT[],
 *   
 *   -- Timestamp
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   
 *   INDEX idx_empleado (empleado_id),
 *   INDEX idx_modificado_por (modificado_por),
 *   INDEX idx_fecha (created_at)
 * );
 * 
 * Log ejemplo:
 * 
 * {
 *   "empleado_id": "EMP-001",
 *   "modificado_por": "GERENTE-001",
 *   "accion": "cambio_rol",
 *   "rol_anterior": "cocinero",
 *   "rol_nuevo": "encargado",
 *   "permisos_añadidos": ["crear_pedidos", "editar_pedidos", "abrir_caja"],
 *   "permisos_eliminados": [],
 *   "created_at": "2025-11-26T18:00:00Z"
 * }
 */
