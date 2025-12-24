# 🚀 Guía de Uso Rápido - Web Services de Horarios

## Importar el Servicio

```typescript
import gerenteApi from '@/services/api/gerente.api';

const { horariosApi } = gerenteApi;
```

## Ejemplos de Código - React

### 1. Obtener todos los horarios

```typescript
import { useState, useEffect } from 'react';
import gerenteApi from '@/services/api/gerente.api';

function MisHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const data = await gerenteApi.horarios.obtenerHorarios('EMP-001');
        setHorarios(data);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  return (
    <div>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {horarios.map(h => (
            <li key={h.id}>{h.nombre} - {h.horasSemana}h/semana</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. Crear un nuevo horario

```typescript
import { useState } from 'react';
import gerenteApi from '@/services/api/gerente.api';
import { toast } from 'sonner';

function CrearHorario() {
  const [nombre, setNombre] = useState('');
  const [lunes, setLunes] = useState('08:00-16:00');

  const handleCrear = async () => {
    try {
      const nuevoHorario = await gerenteApi.horarios.crearHorario({
        nombre,
        descripcion: 'Nuevo horario',
        empresaId: 'EMP-001',
        lunes,
        martes: lunes,
        miercoles: lunes,
        jueves: lunes,
        viernes: lunes,
        sabado: null,
        domingo: null,
        horasSemana: 40
      });
      
      toast.success(`Horario "${nuevoHorario.nombre}" creado correctamente`);
      setNombre('');
    } catch (error) {
      toast.error('Error al crear horario');
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCrear(); }}>
      <input
        type="text"
        placeholder="Nombre del horario"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Lunes (HH:mm-HH:mm)"
        value={lunes}
        onChange={(e) => setLunes(e.target.value)}
      />
      <button type="submit">Crear Horario</button>
    </form>
  );
}
```

### 3. Asignar horario a empleado

```typescript
import { useState } from 'react';
import gerenteApi from '@/services/api/gerente.api';
import { toast } from 'sonner';

function AsignarHorario({ empleadoId }) {
  const [horarioId, setHorarioId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [horarios, setHorarios] = useState([]);

  useEffect(() => {
    // Cargar horarios disponibles
    const loadHorarios = async () => {
      try {
        const data = await gerenteApi.horarios.obtenerHorarios();
        setHorarios(data);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
      }
    };

    loadHorarios();
  }, []);

  const handleAsignar = async () => {
    if (!horarioId || !fechaDesde) {
      toast.error('Selecciona un horario y una fecha de inicio');
      return;
    }

    try {
      await gerenteApi.horarios.asignarHorarioAEmpleado(empleadoId, {
        horarioId: parseInt(horarioId),
        fechaVigenciaDesde: fechaDesde,
        fechaVigenciaHasta: fechaHasta || null
      });

      toast.success('Horario asignado correctamente');
      setHorarioId('');
      setFechaDesde('');
      setFechaHasta('');
    } catch (error) {
      toast.error('Error al asignar horario');
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleAsignar(); }}>
      <select value={horarioId} onChange={(e) => setHorarioId(e.target.value)}>
        <option value="">Selecciona un horario</option>
        {horarios.map(h => (
          <option key={h.id} value={h.id}>{h.nombre}</option>
        ))}
      </select>

      <input
        type="date"
        value={fechaDesde}
        onChange={(e) => setFechaDesde(e.target.value)}
      />

      <input
        type="date"
        value={fechaHasta}
        onChange={(e) => setFechaHasta(e.target.value)}
        placeholder="Fecha final (opcional)"
      />

      <button type="submit">Asignar Horario</button>
    </form>
  );
}
```

### 4. Ver horarios de un empleado

```typescript
import { useState, useEffect } from 'react';
import gerenteApi from '@/services/api/gerente.api';

function HorariosEmpleado({ empleadoId }) {
  const [asignaciones, setAsignaciones] = useState([]);
  const [horarioActual, setHorarioActual] = useState(null);

  useEffect(() => {
    const loadDatos = async () => {
      try {
        // Obtener todas las asignaciones (solo activas)
        const asignaciones = await gerenteApi.horarios.obtenerHorariosEmpleado(
          empleadoId,
          true  // Solo activas
        );
        setAsignaciones(asignaciones);

        // Obtener horario vigente para hoy
        const horario = await gerenteApi.horarios.obtenerHorarioActualEmpleado(empleadoId);
        setHorarioActual(horario);
      } catch (error) {
        console.error('Error al cargar horarios:', error);
      }
    };

    loadDatos();
  }, [empleadoId]);

  return (
    <div>
      <h3>Horario Vigente Actual</h3>
      {horarioActual && (
        <div>
          <p><strong>Nombre:</strong> {horarioActual.nombre}</p>
          <p><strong>Lunes:</strong> {horarioActual.lunes}</p>
          <p><strong>Horas/Semana:</strong> {horarioActual.horasSemana}</p>
        </div>
      )}

      <h3>Historial de Asignaciones</h3>
      {asignaciones.map(asignacion => (
        <div key={asignacion.id}>
          <p><strong>Horario:</strong> {asignacion.horario.nombre}</p>
          <p><strong>Desde:</strong> {new Date(asignacion.fechaVigenciaDesde).toLocaleDateString()}</p>
          <p><strong>Hasta:</strong> {asignacion.fechaVigenciaHasta ? new Date(asignacion.fechaVigenciaHasta).toLocaleDateString() : 'Indefinido'}</p>
          <p><strong>Estado:</strong> {asignacion.estado}</p>
        </div>
      ))}
    </div>
  );
}
```

### 5. Cancelar asignación de horario

```typescript
import gerenteApi from '@/services/api/gerente.api';
import { toast } from 'sonner';

async function cancelarAsignacion(asignacionId) {
  try {
    await gerenteApi.horarios.cancelarAsignacionHorario(asignacionId);
    toast.success('Asignación cancelada correctamente');
    // Recargar datos...
  } catch (error) {
    toast.error('Error al cancelar asignación');
  }
}
```

## Hook Personalizado - `useHorarios`

Para reutilizar la lógica:

```typescript
// hooks/useHorarios.ts
import { useState, useEffect } from 'react';
import gerenteApi from '@/services/api/gerente.api';

export function useHorarios(empleadoId?: number) {
  const [horarios, setHorarios] = useState([]);
  const [horarioActual, setHorarioActual] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los horarios
  const cargarHorarios = async (empresaId?: string) => {
    setLoading(true);
    try {
      const data = await gerenteApi.horarios.obtenerHorarios(empresaId);
      setHorarios(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar horarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener horario actual de un empleado
  const cargarHorarioActual = async (id: number, fecha?: Date) => {
    try {
      const horario = await gerenteApi.horarios.obtenerHorarioActualEmpleado(id, fecha);
      setHorarioActual(horario);
      setError(null);
    } catch (err) {
      setError('Error al cargar horario actual');
      console.error(err);
    }
  };

  // Obtener asignaciones de un empleado
  const cargarAsignaciones = async (id: number, activos?: boolean) => {
    try {
      const data = await gerenteApi.horarios.obtenerHorariosEmpleado(id, activos);
      setAsignaciones(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar asignaciones');
      console.error(err);
    }
  };

  // Crear nuevo horario
  const crearHorario = async (datos: any) => {
    try {
      const nuevoHorario = await gerenteApi.horarios.crearHorario(datos);
      setHorarios([...horarios, nuevoHorario]);
      return nuevoHorario;
    } catch (err) {
      setError('Error al crear horario');
      throw err;
    }
  };

  // Asignar horario a empleado
  const asignarHorario = async (id: number, datos: any) => {
    try {
      const asignacion = await gerenteApi.horarios.asignarHorarioAEmpleado(id, datos);
      await cargarAsignaciones(id);
      return asignacion;
    } catch (err) {
      setError('Error al asignar horario');
      throw err;
    }
  };

  return {
    horarios,
    horarioActual,
    asignaciones,
    loading,
    error,
    cargarHorarios,
    cargarHorarioActual,
    cargarAsignaciones,
    crearHorario,
    asignarHorario
  };
}
```

**Uso del Hook:**

```typescript
function MiComponente() {
  const { horarios, horarioActual, loading, cargarHorarios } = useHorarios();

  useEffect(() => {
    cargarHorarios('EMP-001');
  }, []);

  return (
    // Tu JSX aquí
  );
}
```

## Respuestas de Ejemplo

### Horario Object
```json
{
  "id": 12,
  "nombre": "Turno Mañana",
  "descripcion": "Horario de mañana: 08:00 - 14:00",
  "empresaId": "EMP-001",
  "lunes": "08:00-14:00",
  "martes": "08:00-14:00",
  "miercoles": "08:00-14:00",
  "jueves": "08:00-14:00",
  "viernes": "08:00-14:00",
  "sabado": "08:00-14:00",
  "domingo": null,
  "horasSemana": 40,
  "activo": true,
  "creadoEn": "2025-12-19T07:24:48.218Z",
  "modificadoEn": "2025-12-19T07:24:48.218Z"
}
```

### AsignacionTurno Object
```json
{
  "id": 18,
  "empleadoId": 19,
  "horarioId": 12,
  "fechaAsignacion": "2025-12-19T07:25:32.104Z",
  "fechaVigenciaDesde": "2025-12-19T00:00:00.000Z",
  "fechaVigenciaHasta": "2026-03-20T00:00:00.000Z",
  "estado": "activo",
  "createdAt": "2025-12-19T07:25:32.104Z",
  "updatedAt": "2025-12-19T07:25:32.104Z"
}
```

## Métodos de Error

Todos los métodos manejan errores automáticamente con `toast.error()`. Para manejarlo manualmente:

```typescript
try {
  await gerenteApi.horarios.crearHorario(datos);
} catch (error) {
  // Manejar error personalizado
  console.log('Error personalizado:', error);
}
```

---

**Listo para usar en tu aplicación React** ✅
