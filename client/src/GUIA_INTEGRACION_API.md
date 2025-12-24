# 🔌 GUÍA DE INTEGRACIÓN CON API REAL - UDAR EDGE

## 📋 ÍNDICE

1. [Preparación del Entorno](#preparación)
2. [Estructura de Datos](#estructura)
3. [Endpoints Necesarios](#endpoints)
4. [Migración de Mock a Real](#migración)
5. [Configuración de Supabase](#supabase)
6. [Manejo de Estados](#estados)
7. [Optimizaciones](#optimizaciones)
8. [Testing](#testing)

---

## 🚀 PREPARACIÓN DEL ENTORNO

### 1. Variables de Entorno

Crear archivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# API Backend (si usas servidor propio)
NEXT_PUBLIC_API_URL=https://api.udaredge.com
NEXT_PUBLIC_API_KEY=tu-api-key

# Configuración
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
```

### 2. Instalar Dependencias

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install axios
npm install swr
```

---

## 📊 ESTRUCTURA DE DATOS

### Tablas de Base de Datos

#### **1. CLIENTES**
```sql
CREATE TABLE clientes (
  id_cliente UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  direccion_completa TEXT,
  cod_postal VARCHAR(10),
  fecha_alta TIMESTAMP DEFAULT NOW(),
  fecha_ultimo_pedido TIMESTAMP,
  fecha_cumpleanos DATE,
  pdv_habitual_id UUID REFERENCES puntos_venta(id),
  marca_preferida VARCHAR(100),
  tipo_cliente VARCHAR(50) CHECK (tipo_cliente IN ('nuevo', 'regular', 'fidelizado', 'VIP', 'riesgo', 'alta_frecuencia', 'multitienda')),
  segmentos TEXT[],
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_clientes_tipo ON clientes(tipo_cliente);
CREATE INDEX idx_clientes_pdv ON clientes(pdv_habitual_id);
CREATE INDEX idx_clientes_fecha_ultimo_pedido ON clientes(fecha_ultimo_pedido DESC);
```

#### **2. FACTURAS**
```sql
CREATE TABLE facturas (
  id_factura UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID REFERENCES clientes(id_cliente),
  fecha TIMESTAMP DEFAULT NOW(),
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2),
  iva DECIMAL(10, 2),
  descuentos DECIMAL(10, 2) DEFAULT 0,
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'online', 'mixto')),
  estado_verifactu BOOLEAN DEFAULT false,
  pdv_id UUID REFERENCES puntos_venta(id),
  canal VARCHAR(20) CHECK (canal IN ('TPV', 'Online')),
  numero_factura VARCHAR(50) UNIQUE,
  estado VARCHAR(50) DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_facturas_cliente ON facturas(id_cliente);
CREATE INDEX idx_facturas_fecha ON facturas(fecha DESC);
CREATE INDEX idx_facturas_pdv ON facturas(pdv_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
```

#### **3. EMPLEADOS**
```sql
CREATE TABLE empleados (
  id_empleado UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255),
  puesto VARCHAR(100),
  departamento VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  avatar_url TEXT,
  estado VARCHAR(50) CHECK (estado IN ('activo', 'vacaciones', 'baja')),
  horas_trabajadas DECIMAL(5, 2) DEFAULT 0,
  horas_contrato DECIMAL(5, 2) NOT NULL,
  fecha_ingreso DATE,
  centro_coste_porcentaje DECIMAL(5, 2),
  salario_bruto DECIMAL(10, 2),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_empleados_estado ON empleados(estado);
CREATE INDEX idx_empleados_departamento ON empleados(departamento);
CREATE INDEX idx_empleados_user_id ON empleados(user_id);
```

#### **4. PRODUCTOS (SKUs)**
```sql
CREATE TABLE productos (
  id_producto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_producto VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  subcategoria VARCHAR(100),
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  pvp DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(5, 2) DEFAULT 21,
  escandallo_unitario DECIMAL(10, 2),
  margen_porcentaje DECIMAL(5, 2),
  rentabilidad VARCHAR(20) CHECK (rentabilidad IN ('Alta', 'Media', 'Baja')),
  ranking_ventas INTEGER,
  visible_tpv BOOLEAN DEFAULT true,
  visible_app BOOLEAN DEFAULT true,
  vida_util_horas INTEGER,
  etiquetas TEXT[],
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_codigo ON productos(codigo_producto);
```

#### **5. STOCK**
```sql
CREATE TABLE stock_pdv (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_producto UUID REFERENCES productos(id_producto),
  pdv_id UUID REFERENCES puntos_venta(id),
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_comprometido INTEGER DEFAULT 0,
  stock_disponible INTEGER GENERATED ALWAYS AS (stock_actual - stock_comprometido) STORED,
  stock_max INTEGER,
  stock_min INTEGER,
  costo_medio DECIMAL(10, 2),
  rotacion DECIMAL(5, 2),
  activo_en_pdv BOOLEAN DEFAULT true,
  ultima_entrada TIMESTAMP,
  ultima_salida TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_producto, pdv_id)
);

-- Índices
CREATE INDEX idx_stock_producto ON stock_pdv(id_producto);
CREATE INDEX idx_stock_pdv ON stock_pdv(pdv_id);
CREATE INDEX idx_stock_disponible ON stock_pdv(stock_disponible);
```

---

## 🔗 ENDPOINTS NECESARIOS

### API REST Endpoints

#### **CLIENTES**

```typescript
// GET - Obtener todos los clientes con filtros
GET /api/clientes?tipo=VIP&pdv=PV001&limit=50&offset=0

// GET - Obtener un cliente específico
GET /api/clientes/:id

// POST - Crear nuevo cliente
POST /api/clientes
Body: {
  nombre_completo: string,
  email: string,
  telefono: string,
  direccion_completa?: string,
  // ...
}

// PATCH - Actualizar cliente
PATCH /api/clientes/:id
Body: { /* campos a actualizar */ }

// DELETE - Eliminar cliente (soft delete)
DELETE /api/clientes/:id

// GET - Estadísticas de clientes
GET /api/clientes/estadisticas?periodo=30
Response: {
  total_clientes: number,
  clientes_activos: number,
  ticket_medio: number,
  // ...
}
```

#### **FACTURAS**

```typescript
// GET - Obtener facturas con filtros
GET /api/facturas?cliente_id=xxx&fecha_desde=2025-01-01&fecha_hasta=2025-12-31

// GET - Obtener una factura específica
GET /api/facturas/:id

// POST - Crear nueva factura
POST /api/facturas
Body: {
  id_cliente: uuid,
  lineas: [{
    id_producto: uuid,
    cantidad: number,
    pvp_unitario: number
  }],
  metodo_pago: string,
  // ...
}

// GET - Dashboard de facturación
GET /api/facturas/dashboard?periodo=mes
```

#### **EMPLEADOS**

```typescript
// GET - Obtener empleados
GET /api/empleados?departamento=Producción&estado=activo

// POST - Crear empleado
POST /api/empleados

// GET - Horarios y registros
GET /api/empleados/:id/registros-horarios?mes=11&ano=2025

// POST - Registrar entrada/salida
POST /api/empleados/:id/registro-horario
Body: {
  tipo: 'entrada' | 'salida',
  timestamp: string
}
```

#### **PRODUCTOS/STOCK**

```typescript
// GET - Obtener productos con stock
GET /api/productos?con_stock=true&pdv_id=xxx

// GET - Alertas de stock
GET /api/stock/alertas?tipo=bajo,ruptura

// POST - Actualizar stock
POST /api/stock/movimiento
Body: {
  id_producto: uuid,
  pdv_id: uuid,
  tipo: 'entrada' | 'salida' | 'ajuste',
  cantidad: number,
  motivo: string
}

// GET - Sugerencias de compra
GET /api/stock/sugerencias-compra?pdv_id=xxx
```

---

## 🔄 MIGRACIÓN DE MOCK A REAL

### Paso 1: Crear Cliente API

```typescript
// /lib/api-client.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Paso 2: Crear Hooks Personalizados

```typescript
// /hooks/useClientes.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Cliente {
  id_cliente: string;
  nombre_completo: string;
  email: string;
  // ... resto de campos
}

export const useClientes = (filtros?: any) => {
  return useQuery({
    queryKey: ['clientes', filtros],
    queryFn: async () => {
      const params = new URLSearchParams(filtros).toString();
      const { data } = await apiClient.get(`/clientes?${params}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

export const useCrearCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (nuevoCliente: Partial<Cliente>) => {
      const { data } = await apiClient.post('/clientes', nuevoCliente);
      return data;
    },
    onSuccess: () => {
      // Invalidar cache para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useEstadisticasClientes = (periodo: string = '30') => {
  return useQuery({
    queryKey: ['clientes', 'estadisticas', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clientes/estadisticas?periodo=${periodo}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
```

### Paso 3: Actualizar Componente

**ANTES (con mock data):**
```typescript
const ClientesGerente = () => {
  const [clientesState, setClientesState] = useState(mockClientes);
  
  const estadisticas = useMemo(() => {
    // cálculos con clientesState
  }, [clientesState]);
  
  // ...
};
```

**DESPUÉS (con API real):**
```typescript
import { useClientes, useEstadisticasClientes } from '@/hooks/useClientes';

const ClientesGerente = () => {
  const { data: clientes, isLoading, error } = useClientes({ activo: true });
  const { data: estadisticasAPI } = useEstadisticasClientes('30');
  
  // Los cálculos useMemo ahora usan datos reales
  const estadisticasCalculadas = useMemo(() => {
    if (!clientes) return null;
    
    // Los mismos cálculos que antes, pero con datos reales
    const totalClientes = clientes.length;
    // ...
    
    return {
      totalClientes,
      // ...
    };
  }, [clientes]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!clientes) return null;
  
  // ...resto del componente
};
```

---

## 🗄️ CONFIGURACIÓN DE SUPABASE

### 1. Crear Cliente Supabase

```typescript
// /lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para autenticación
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

### 2. Configurar Row Level Security (RLS)

```sql
-- Política para clientes
CREATE POLICY "Los usuarios pueden ver sus propios clientes"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'gerente');

CREATE POLICY "Los gerentes pueden crear clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.role() = 'gerente');

-- Política para empleados
CREATE POLICY "Los empleados solo ven su propia info"
  ON empleados FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'gerente');
```

### 3. Hook con Supabase

```typescript
// /hooks/useClientesSupabase.ts

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useClientesSupabase = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
    
    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('clientes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clientes' },
        (payload) => {
          console.log('Cambio detectado:', payload);
          fetchClientes(); // Refrescar datos
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('fecha_ultimo_pedido', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  };

  return { clientes, loading, refetch: fetchClientes };
};
```

---

## 🎯 MANEJO DE ESTADOS

### Estados de Carga

```typescript
const ClientesGerente = () => {
  const { data, isLoading, isError, error } = useClientes();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        <span className="ml-3">Cargando clientes...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar clientes: {error.message}</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay clientes para mostrar</p>
        <Button onClick={() => setModalNuevoCliente(true)}>
          Crear Primer Cliente
        </Button>
      </div>
    );
  }
  
  // Renderizar datos
  return <div>{/* componente con datos */}</div>;
};
```

---

## ⚡ OPTIMIZACIONES

### 1. Paginación

```typescript
const useClientesPaginados = (page: number = 1, pageSize: number = 50) => {
  return useQuery({
    queryKey: ['clientes', 'paginados', page, pageSize],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const { data } = await apiClient.get(
        `/clientes?limit=${pageSize}&offset=${offset}`
      );
      return data;
    },
  });
};
```

### 2. Carga Incremental

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const useClientesInfinitos = () => {
  return useInfiniteQuery({
    queryKey: ['clientes', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await apiClient.get(
        `/clientes?offset=${pageParam}&limit=20`
      );
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length * 20 : undefined;
    },
  });
};
```

### 3. Prefetching

```typescript
const queryClient = useQueryClient();

const prefetchCliente = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ['cliente', id],
    queryFn: () => apiClient.get(`/clientes/${id}`).then(res => res.data),
  });
};

// Usar en hover
<div onMouseEnter={() => prefetchCliente(cliente.id)}>
  {cliente.nombre}
</div>
```

---

## 🧪 TESTING

### Test de Hook

```typescript
// useClientes.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useClientes } from './useClientes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useClientes', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('debe cargar clientes correctamente', async () => {
    const { result } = renderHook(() => useClientes(), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
```

---

## 📝 CHECKLIST DE MIGRACIÓN

- [ ] Configurar variables de entorno
- [ ] Crear tablas en base de datos
- [ ] Configurar RLS en Supabase
- [ ] Crear cliente API
- [ ] Crear hooks personalizados para cada entidad
- [ ] Actualizar componentes uno por uno
- [ ] Implementar manejo de errores
- [ ] Agregar estados de carga
- [ ] Configurar caché y revalidación
- [ ] Implementar optimizaciones (paginación, etc.)
- [ ] Hacer pruebas end-to-end
- [ ] Documentar cambios

---

## 🎓 RECURSOS ADICIONALES

- [Documentación Supabase](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Axios Docs](https://axios-http.com/docs/intro)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**✅ Con esta guía, puedes migrar de mock data a API real sin cambiar la lógica de los cálculos useMemo.**
