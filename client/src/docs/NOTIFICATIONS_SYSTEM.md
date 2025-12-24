# 🔔 Sistema de Notificaciones - Udar Edge

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Tipos y Modelos](#tipos-y-modelos)
4. [Servicio de API](#servicio-de-api)
5. [Hook de React](#hook-de-react)
6. [Componentes UI](#componentes-ui)
7. [Integración con Backend](#integración-con-backend)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Descripción General

Sistema completo de notificaciones para Udar Edge que incluye:

- ✅ **API Service** listo para conectar con backend
- ✅ **Tipos TypeScript** completos y tipado fuerte
- ✅ **Hook personalizado** para gestión de notificaciones
- ✅ **Componentes UI** reutilizables y responsivos
- ✅ **Preferencias de usuario** configurables
- ✅ **Múltiples canales** (Email, Push, SMS, In-App)
- ✅ **Prioridades y filtros** avanzados
- ✅ **Tiempo real** (preparado para WebSocket)

---

## 🏗️ Arquitectura

```
/types/notifications.types.ts      → Tipos e interfaces TypeScript
/services/notifications.service.ts → API Service con mock data
/hooks/useNotifications.ts         → Hook React personalizado
/components/
  ├── NotificationCenter.tsx       → Centro de notificaciones completo
  ├── NotificationPreferences.tsx  → Configuración de preferencias
  └── NotificationBadge.tsx        → Badge con contador en header
```

---

## 📦 Tipos y Modelos

### Tipos Principales

```typescript
// Tipos de notificaciones
type NotificationType = 
  | 'pedido' | 'stock' | 'cita' | 'promocion' 
  | 'sistema' | 'pago' | 'alerta' | 'mensaje';

// Estado de notificación
type NotificationStatus = 'sin_leer' | 'leida' | 'archivada';

// Prioridad
type NotificationPriority = 'baja' | 'normal' | 'alta' | 'urgente';

// Canales de envío
type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';
```

### Interface Principal

```typescript
interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  descripcion?: string;
  fecha: Date;
  status: NotificationStatus;
  prioridad: NotificationPriority;
  
  // Metadatos
  usuarioId: string;
  empresaId: string;
  puntoVentaId?: string;
  
  // Relaciones
  relacionId?: string;
  relacionTipo?: string;
  
  // Acciones
  urlAccion?: string;
  accionTexto?: string;
  
  // Configuración
  canales: NotificationChannel[];
  expiraEn?: Date;
  metadata?: Record<string, any>;
}
```

---

## 🔌 Servicio de API

### Configuración

```typescript
// En /services/notifications.service.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### Métodos Disponibles

```typescript
// Obtener notificaciones
await notificationsService.getNotifications({
  usuarioId: 'usr-001',
  status: ['sin_leer'],
  limit: 50
});

// Marcar como leída
await notificationsService.markAsRead({
  notificacionIds: ['not-001', 'not-002'],
  usuarioId: 'usr-001'
});

// Actualizar preferencias
await notificationsService.updatePreferences({
  usuarioId: 'usr-001',
  preferencias: {
    canalesActivos: {
      email: true,
      push: true,
      sms: false,
      in_app: true
    }
  }
});

// Crear notificación
await notificationsService.createNotification({
  tipo: 'pedido',
  titulo: 'Nuevo pedido',
  mensaje: 'Has recibido un nuevo pedido',
  prioridad: 'alta',
  usuarioId: 'usr-001',
  empresaId: 'emp-001',
  canales: ['push', 'in_app']
});
```

### Cambiar de Mock a Backend Real

```typescript
// En /services/notifications.service.ts línea ~87
class NotificationsService {
  private useMock = false; // ← Cambiar a false
  
  // ... resto del código
}
```

---

## ⚛️ Hook de React

### Uso Básico

```typescript
import { useNotifications } from '../hooks/useNotifications';

function MiComponente() {
  const {
    notificaciones,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotifications({
    usuarioId: 'usr-001',
    empresaId: 'emp-001',
    autoLoad: true,           // Cargar automáticamente
    pollInterval: 30000,      // Actualizar cada 30 segundos
    realtime: false,          // Usar WebSocket (cuando esté disponible)
  });
  
  return (
    <div>
      <p>Notificaciones sin leer: {getUnreadCount()}</p>
      {/* ... */}
    </div>
  );
}
```

### API del Hook

```typescript
interface UseNotificationsReturn {
  // Estado
  notificaciones: Notification[];
  preferencias: NotificationPreferences | null;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadNotifications: (filters?) => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Utilidades
  getUnreadCount: () => number;
  getNotificationsByType: (tipo) => Notification[];
  getUrgentNotifications: () => Notification[];
}
```

---

## 🎨 Componentes UI

### 1. NotificationCenter

Centro de notificaciones completo con tabs, filtros y acciones.

```tsx
import { NotificationCenter } from './components/NotificationCenter';

<NotificationCenter
  usuarioId={user.id}
  empresaId="emp-001"
  onNavigate={(url) => navigate(url)}
/>
```

**Features:**
- ✅ Tabs: Todas / Sin leer / Archivadas
- ✅ Filtros por tipo de notificación
- ✅ Marcar como leída
- ✅ Archivar / Eliminar
- ✅ Actualización manual
- ✅ Indicadores de prioridad
- ✅ Navegación con acciones

### 2. NotificationPreferences

Configuración completa de preferencias de notificaciones.

```tsx
import { NotificationPreferences } from './components/NotificationPreferences';

<NotificationPreferences usuarioId={user.id} />
```

**Features:**
- ✅ Activar/desactivar canales (Email, Push, SMS, In-App)
- ✅ Configurar por tipo de notificación
- ✅ Activar/desactivar sonidos
- ✅ Horario silencioso
- ✅ Frecuencia de emails
- ✅ Agrupar notificaciones

### 3. NotificationBadge

Badge compacto para header/sidebar con popover de vista rápida.

```tsx
import { NotificationBadge } from './components/NotificationBadge';

<NotificationBadge
  usuarioId={user.id}
  empresaId="emp-001"
  onViewAll={() => setActiveView('notificaciones')}
  maxPreview={5}
/>
```

**Features:**
- ✅ Contador de no leídas
- ✅ Popover con vista previa
- ✅ Marcar como leída desde popover
- ✅ Botón "Ver todas"

---

## 🔗 Integración con Backend

### Endpoints Requeridos

```
GET    /api/notifications                    → Listar notificaciones
POST   /api/notifications/mark-read          → Marcar como leída
POST   /api/notifications/mark-all-read      → Marcar todas como leídas
POST   /api/notifications/:id/archive        → Archivar notificación
DELETE /api/notifications/:id                → Eliminar notificación
GET    /api/notifications/preferences/:userId → Obtener preferencias
PUT    /api/notifications/preferences        → Actualizar preferencias
POST   /api/notifications                    → Crear notificación
GET    /api/notifications/stats              → Obtener estadísticas
```

### Request Examples

#### 1. Listar Notificaciones

```http
GET /api/notifications?usuarioId=usr-001&status=sin_leer&limit=50
Authorization: Bearer {token}
```

**Response:**
```json
{
  "notificaciones": [
    {
      "id": "not-001",
      "tipo": "pedido",
      "titulo": "Nuevo pedido recibido",
      "mensaje": "Pedido #1234 de Juan Pérez por 45.50€",
      "fecha": "2025-11-27T10:30:00Z",
      "status": "sin_leer",
      "prioridad": "alta",
      "usuarioId": "usr-001",
      "empresaId": "emp-001",
      "canales": ["push", "in_app"]
    }
  ],
  "total": 15,
  "sinLeer": 3,
  "hasMore": false
}
```

#### 2. Marcar como Leída

```http
POST /api/notifications/mark-read
Authorization: Bearer {token}
Content-Type: application/json

{
  "notificacionIds": ["not-001", "not-002"],
  "usuarioId": "usr-001"
}
```

**Response:**
```json
{
  "success": true,
  "actualizadas": 2
}
```

#### 3. Actualizar Preferencias

```http
PUT /api/notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuarioId": "usr-001",
  "preferencias": {
    "canalesActivos": {
      "email": true,
      "push": true,
      "sms": false,
      "in_app": true
    },
    "preferencias": {
      "pedido": {
        "activo": true,
        "canales": ["push", "in_app"],
        "sonido": true
      }
    }
  }
}
```

### WebSocket (Tiempo Real)

Para notificaciones en tiempo real, implementar WebSocket:

```typescript
// Conexión WebSocket
const ws = new WebSocket('wss://api.udaredge.com/notifications');

ws.onmessage = (event) => {
  const notification: NotificationEvent = JSON.parse(event.data);
  
  if (notification.tipo === 'nueva') {
    // Agregar nueva notificación
    // Mostrar toast
    // Actualizar badge
  }
};
```

El hook ya está preparado para esto en el método `subscribe()`.

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Dashboard con NotificationBadge

```tsx
import { NotificationBadge } from './components/NotificationBadge';

function Dashboard({ user }) {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Dashboard</h1>
      
      <div className="flex items-center gap-2">
        <NotificationBadge
          usuarioId={user.id}
          onViewAll={() => navigate('/notificaciones')}
        />
        
        <Avatar>{user.name}</Avatar>
      </div>
    </header>
  );
}
```

### Ejemplo 2: Página de Notificaciones

```tsx
import { NotificationCenter } from './components/NotificationCenter';

function NotificationsPage({ user }) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <NotificationCenter
        usuarioId={user.id}
        empresaId={user.empresaId}
        onNavigate={(url) => navigate(url)}
      />
    </div>
  );
}
```

### Ejemplo 3: Configuración con Preferencias

```tsx
import { NotificationPreferences } from './components/NotificationPreferences';
import { Tabs, TabsContent } from './ui/tabs';

function Settings({ user }) {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Cuenta</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
      </TabsList>
      
      <TabsContent value="notifications">
        <NotificationPreferences usuarioId={user.id} />
      </TabsContent>
    </Tabs>
  );
}
```

### Ejemplo 4: Crear Notificación desde Backend

```typescript
// Cuando se crea un pedido
async function onPedidoCreado(pedido) {
  await notificationsService.createNotification({
    tipo: 'pedido',
    titulo: 'Nuevo pedido recibido',
    mensaje: `Pedido #${pedido.numero} por ${pedido.total}€`,
    prioridad: pedido.total > 100 ? 'alta' : 'normal',
    usuarioId: pedido.trabajadorId,
    empresaId: pedido.empresaId,
    puntoVentaId: pedido.puntoVentaId,
    relacionId: pedido.id,
    relacionTipo: 'pedido',
    urlAccion: `/pedidos/${pedido.id}`,
    accionTexto: 'Ver pedido',
    canales: ['push', 'in_app']
  });
}
```

---

## 🚀 Próximos Pasos

### Backend

1. **Implementar endpoints REST** según la especificación
2. **Base de datos:**
   - Tabla `notificaciones`
   - Tabla `notificaciones_preferencias`
   - Tabla `notificaciones_log`
3. **Configurar WebSocket** para notificaciones en tiempo real
4. **Integrar servicios de envío:**
   - Email (SendGrid, AWS SES)
   - Push (Firebase Cloud Messaging)
   - SMS (Twilio)

### Frontend

1. **Cambiar `useMock = false`** en el servicio
2. **Configurar variables de entorno:**
   ```env
   VITE_API_URL=https://api.udaredge.com
   VITE_WS_URL=wss://api.udaredge.com
   ```
3. **Activar WebSocket:**
   ```typescript
   useNotifications({
     usuarioId: user.id,
     realtime: true  // ← Activar
   })
   ```

### Testing

1. Probar flujo completo de notificaciones
2. Validar preferencias de usuario
3. Testear notificaciones urgentes
4. Verificar filtros y búsquedas

---

## 📝 Notas Importantes

- ✅ **Todo el código está listo para producción**
- ✅ **Tipado fuerte con TypeScript**
- ✅ **Mock data para desarrollo sin backend**
- ✅ **Responsive y mobile-first**
- ✅ **Accesibilidad (a11y) considerada**
- ✅ **Integrado con el sistema de Toast de Sonner**
- ✅ **Preparado para internacionalización (i18n)**

---

## 🆘 Soporte

Para dudas o problemas con el sistema de notificaciones, revisar:
- Tipos: `/types/notifications.types.ts`
- Servicio: `/services/notifications.service.ts`
- Hook: `/hooks/useNotifications.ts`
- Componentes: `/components/Notification*.tsx`

---

**Desarrollado para Udar Edge** 🚀
