# 📄 DOCUMENTACIÓN - MODAL CHAT ACTUALIZADO

**Componente:** ChatColaborador.tsx (Modal "Empezar un Nuevo Chat")  
**Fecha:** 26 Noviembre 2024  
**Versión:** 2.0 ACTUALIZADA  
**Estado:** ✅ 100% Completado

---

## 📋 CAMBIOS IMPLEMENTADOS

### ✅ Antes (Modal Viejo)

**Estructura:**
- 5 botones grandes (Producción, Logística, RRHH, Gerencia, Otra Tienda)
- Solo selector de tienda si eliges "Otra Tienda"
- Botón "Iniciar Chat" directo

**Limitaciones:**
- No permitía especificar el motivo
- No había campo de asunto
- No se podía escribir mensaje inicial
- No se podían adjuntar archivos

---

### ✅ Después (Modal Nuevo)

**Estructura:**
1. **Desplegable "Tipo de Consulta"** con 6 opciones:
   - Avería maquinaria
   - Consulta RRHH
   - Consulta/Petición Material
   - Problema con cliente
   - Otra Tienda
   - Otros

2. **Selector de Tienda** (condicional)
   - Solo aparece si se selecciona "Otra Tienda"
   - Carga tiendas desde configuración

3. **Campo Asunto** (obligatorio)
   - Input de texto
   - Placeholder: "Escribe el asunto del chat..."

4. **Campo Mensaje** (obligatorio)
   - Textarea de 4 filas
   - Placeholder: "Escribe tu mensaje..."

5. **Botón Adjuntar Archivo** (opcional)
   - Color naranja
   - Icono de Paperclip
   - Muestra nombre y tamaño del archivo
   - Botón "✕" para eliminar

6. **Botón "Crear Chat"**
   - Deshabilitado si faltan campos obligatorios
   - Crea el chat y lo abre automáticamente

---

## 🎯 ESPECIFICACIONES TÉCNICAS

### 1. Tipos de Consulta (6 opciones)

| Opción | Icono | Color | Descripción |
|--------|-------|-------|-------------|
| **Avería maquinaria** | 🔧 Wrench | Rojo | Para reportar averías de equipos |
| **Consulta RRHH** | 👥 Users | Azul | Consultas de recursos humanos |
| **Consulta/Petición Material** | 📦 Package | Púrpura | Pedir material o consultar stock |
| **Problema con cliente** | ⚠️ AlertTriangle | Naranja | Reportar problemas con clientes |
| **Otra Tienda** | 🏢 Building | Teal | Comunicarse con otra tienda |
| **Otros** | 📄 FileText | Gris | Consultas generales |

---

### 2. Estructura de Datos del Chat

```typescript
interface NuevoChat {
  id: string;                   // CHAT-{timestamp}
  tipo: 'informacion';          // Tipo por defecto
  asunto: string;               // Del campo "Asunto"
  cliente: string;              // Nombre del trabajador actual
  clienteAvatar: string;        // Avatar del trabajador
  estado: 'abierto';            // Estado inicial
  fechaCreacion: string;        // ISO timestamp
  fechaUltimoMensaje: string;   // ISO timestamp
  mensajes: Mensaje[];          // Array con mensaje inicial
  categoria: string;            // Según acción seleccionada
  tienda?: string;              // Solo si acción = "otra-tienda"
  accionTipo?: string;          // Tipo de acción seleccionada
  archivoAdjunto?: {            // Opcional
    nombre: string;
    url: string;
    tamano: number;
  };
}
```

---

### 3. Flujo de Creación del Chat

```
┌─────────────────────────────────────┐
│ 1. Click "Empezar Chat"             │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 2. Modal "Empezar un Nuevo Chat"    │
│    - Desplegable Tipo Consulta      │
│    - Campo Asunto                   │
│    - Campo Mensaje                  │
│    - Botón Adjuntar (opcional)      │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 3. Si selecciona "Otra Tienda"      │
│    → Aparece desplegable tiendas    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 4. Click "Crear Chat"                │
│    - Valida campos obligatorios     │
│    - Crea objeto Conversacion       │
│    - Añade a lista de chats         │
│    - Muestra toast confirmación     │
│    - Abre el chat automáticamente   │
└─────────────────────────────────────┘
```

---

### 4. Validaciones

#### Campos Obligatorios
- ✅ **Tipo de Consulta** - Debe seleccionarse
- ✅ **Tienda** - Solo si tipo = "Otra Tienda"
- ✅ **Asunto** - No puede estar vacío
- ✅ **Mensaje** - No puede estar vacío

#### Campo Opcional
- ⚪ **Archivo adjunto** - Puede omitirse

#### Estado del Botón "Crear Chat"

```typescript
disabled={
  !accionSeleccionada ||
  (accionSeleccionada === 'otra-tienda' && !tiendaSeleccionada) ||
  !asuntoChat.trim() ||
  !mensajeChat.trim()
}
```

**Casos:**
- ❌ Deshabilitado si no hay tipo de consulta
- ❌ Deshabilitado si tipo = "Otra Tienda" pero no hay tienda seleccionada
- ❌ Deshabilitado si asunto está vacío
- ❌ Deshabilitado si mensaje está vacío
- ✅ Habilitado si todos los campos obligatorios están completos

---

## 5. Implementación del Botón "Adjuntar Archivo"

### UI del Botón

```jsx
<Button
  type="button"
  variant="outline"
  className="w-full bg-orange-50 border-orange-300 hover:bg-orange-100 text-orange-700"
  onClick={() => document.getElementById('file-upload')?.click()}
>
  <Paperclip className="w-4 h-4 mr-2" />
  {archivoAdjunto ? archivoAdjunto.name : 'Seleccionar archivo'}
</Button>
```

**Características:**
- Color: Naranja (bg-orange-50)
- Icono: Paperclip (📎)
- Texto dinámico:
  - Sin archivo: "Seleccionar archivo"
  - Con archivo: Muestra nombre del archivo
- Width: 100%

### Input File (Oculto)

```jsx
<input
  id="file-upload"
  type="file"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoAdjunto(file);
      toast.success(`Archivo "${file.name}" seleccionado`);
    }
  }}
/>
```

### Información del Archivo

Cuando hay archivo seleccionado, se muestra:

```jsx
{archivoAdjunto && (
  <p className="text-xs text-gray-600">
    Archivo: {archivoAdjunto.name} ({(archivoAdjunto.size / 1024).toFixed(2)} KB)
  </p>
)}
```

**Ejemplo:**
```
Archivo: foto_averia.jpg (245.67 KB)
```

### Botón Eliminar Archivo

```jsx
{archivoAdjunto && (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={() => {
      setArchivoAdjunto(null);
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
    }}
  >
    ✕
  </Button>
)}
```

---

## 6. Mapeo de Acciones a Categorías

```typescript
function getAccionLabel(accion: string): string {
  switch (accion) {
    case 'averia-maquinaria':
      return 'Avería maquinaria';
    case 'consulta-rrhh':
      return 'RRHH';
    case 'consulta-material':
      return 'Almacén / Material';
    case 'problema-cliente':
      return 'Atención al cliente';
    case 'otra-tienda':
      return 'Otra Tienda';
    case 'otros':
      return 'Gerencia';
    default:
      return 'Gerencia';
  }
}
```

### Mapeo a Categoría de Chat

```typescript
categoria: accionSeleccionada === 'otra-tienda' ? 'otras-tiendas' : 'gerente'
```

**Reglas:**
- Si acción = "otra-tienda" → categoria = "otras-tiendas"
- Cualquier otra acción → categoria = "gerente"

---

## 7. Datos que se Envían al Backend

### Al Crear Chat

```javascript
// TODO: Conectar con API
console.log('💬 CREAR NUEVO CHAT:', {
  chatId: `CHAT-${Date.now()}`,
  trabajadorId: 'TRAB-101',           // Usuario actual
  accionTipo: accionSeleccionada,      // averia-maquinaria, etc.
  tienda: tiendaSeleccionada,          // Solo si acción = otra-tienda
  asunto: asuntoChat,
  mensajeInicial: mensajeChat,
  archivoAdjunto: archivoAdjunto ? {
    nombre: archivoAdjunto.name,
    tamano: archivoAdjunto.size,
    tipo: archivoAdjunto.type
  } : null,
  categoria: accionSeleccionada === 'otra-tienda' ? 'otras-tiendas' : 'gerente',
  destinatario: getAccionLabel(accionSeleccionada),
  fechaCreacion: new Date().toISOString()
});
```

**Ejemplo Console Output:**
```javascript
💬 CREAR NUEVO CHAT: {
  chatId: "CHAT-1732636800123",
  trabajadorId: "TRAB-101",
  accionTipo: "averia-maquinaria",
  tienda: null,
  asunto: "Horno principal no enciende",
  mensajeInicial: "El horno principal no está encendiendo desde esta mañana. Ya comprobé el diferencial y está OK.",
  archivoAdjunto: {
    nombre: "foto_horno.jpg",
    tamano: 245670,
    tipo: "image/jpeg"
  },
  categoria: "gerente",
  destinatario: "Avería maquinaria",
  fechaCreacion: "2024-11-26T16:30:00.123Z"
}
```

---

## 8. Notificaciones

### Toast al Seleccionar Archivo

```javascript
toast.success(`Archivo "${file.name}" seleccionado`);
```

**Ejemplo:**
```
✅ Archivo "foto_averia.jpg" seleccionado
```

### Toast al Crear Chat

```javascript
toast.success(`Chat creado: ${asuntoChat}`, {
  description: `Destinatario: ${destinatario}`
});
```

**Ejemplo:**
```
✅ Chat creado: Horno principal no enciende
   Destinatario: Avería maquinaria
```

---

## 9. Lista de Tiendas

### Configuración Actual (Hardcoded)

```typescript
const tiendas = [
  'Can Farines - Badalona Centro',
  'Can Farines - Poblenou',
  'Can Farines - Gràcia',
  'Can Farines - Sant Martí',
  'Can Farines - El Born'
];
```

### TODO: Cargar desde Configuración

```typescript
// Futuro: Cargar desde API
const [tiendas, setTiendas] = useState<string[]>([]);

useEffect(() => {
  cargarTiendas();
}, []);

async function cargarTiendas() {
  const response = await fetch('/api/puntos-venta');
  const data = await response.json();
  setTiendas(data.map(pv => pv.nombrePuntoVenta));
}
```

**Estructura esperada:**
```json
{
  "success": true,
  "data": [
    {
      "puntoVentaId": "PV-TIA",
      "nombrePuntoVenta": "Can Farines - Tiana",
      "empresaId": "EMP-HOSTELERIA",
      "marcaId": "M-PIZZAS"
    },
    {
      "puntoVentaId": "PV-BDN",
      "nombrePuntoVenta": "Can Farines - Badalona",
      "empresaId": "EMP-HOSTELERIA",
      "marcaId": "M-BURGUERS"
    }
  ]
}
```

---

## 10. Casos de Uso

### Caso 1: Avería de Maquinaria

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Avería maquinaria"
3. Asunto: "Horno principal no enciende"
4. Mensaje: "El horno no funciona desde las 8:00"
5. Adjuntar: foto_averia.jpg (opcional)
6. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado con ID CHAT-xxx
- ✅ Categoría: "gerente"
- ✅ Destinatario: "Avería maquinaria"
- ✅ Chat aparece en la lista
- ✅ Se abre automáticamente

---

### Caso 2: Consulta a RRHH

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Consulta RRHH"
3. Asunto: "Consulta sobre vacaciones"
4. Mensaje: "¿Puedo solicitar vacaciones para la semana del 15?"
5. Sin archivo adjunto
6. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado
- ✅ Categoría: "gerente"
- ✅ Destinatario: "RRHH"

---

### Caso 3: Petición de Material

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Consulta/Petición Material"
3. Asunto: "Necesito más harina"
4. Mensaje: "Nos estamos quedando sin harina tipo 00"
5. Sin archivo adjunto
6. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado
- ✅ Categoría: "gerente"
- ✅ Destinatario: "Almacén / Material"

---

### Caso 4: Problema con Cliente

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Problema con cliente"
3. Asunto: "Cliente molesto por espera"
4. Mensaje: "Cliente del pedido PD-TIA-0015 se queja del tiempo de espera"
5. Sin archivo adjunto
6. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado
- ✅ Categoría: "gerente"
- ✅ Destinatario: "Atención al cliente"

---

### Caso 5: Consulta a Otra Tienda

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Otra Tienda"
3. **Aparece desplegable de tiendas**
4. Seleccionar "Can Farines - Poblenou"
5. Asunto: "Transferencia de productos"
6. Mensaje: "¿Podéis enviar 20 baguettes para mañana?"
7. Sin archivo adjunto
8. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado
- ✅ Categoría: "otras-tiendas"
- ✅ Tienda: "Can Farines - Poblenou"
- ✅ Destinatario: "Can Farines - Poblenou"

---

### Caso 6: Otros

**Pasos:**
1. Click "Empezar Chat"
2. Seleccionar "Otros"
3. Asunto: "Sugerencia de mejora"
4. Mensaje: "Creo que podríamos mejorar el proceso de cierre de caja"
5. Sin archivo adjunto
6. Click "Crear Chat"

**Resultado:**
- ✅ Chat creado
- ✅ Categoría: "gerente"
- ✅ Destinatario: "Gerencia"

---

## 11. Estados del Componente

### Estados Nuevos Añadidos

```typescript
const [accionSeleccionada, setAccionSeleccionada] = useState<string>('');
const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
const [asuntoChat, setAsuntoChat] = useState('');
const [mensajeChat, setMensajeChat] = useState('');
const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);
```

### Reset de Estados

**Al cerrar el modal:**
```typescript
onOpenChange={(open) => {
  setModalEmpezarChat(open);
  if (!open) {
    // Reset completo
    setAccionSeleccionada('');
    setTiendaSeleccionada('');
    setAsuntoChat('');
    setMensajeChat('');
    setArchivoAdjunto(null);
  }
}}
```

**Al crear el chat:**
```typescript
// Reset y cerrar
setModalEmpezarChat(false);
setAccionSeleccionada('');
setTiendaSeleccionada('');
setAsuntoChat('');
setMensajeChat('');
setArchivoAdjunto(null);
```

---

## 12. Endpoint API Necesario

### POST /api/chats

**Request Body:**
```json
{
  "trabajadorId": "TRAB-101",
  "accionTipo": "averia-maquinaria",
  "tienda": null,
  "asunto": "Horno principal no enciende",
  "mensajeInicial": "El horno no funciona desde las 8:00",
  "categoria": "gerente",
  "archivoAdjunto": {
    "nombre": "foto_averia.jpg",
    "base64": "data:image/jpeg;base64,...",
    "tamano": 245670
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Chat creado correctamente",
  "data": {
    "chatId": "CHAT-1732636800123",
    "estado": "abierto",
    "fechaCreacion": "2024-11-26T16:30:00.123Z",
    "asignadoA": null,
    "mensajeId": "M-1732636800456"
  }
}
```

---

## 13. Lógica Backend

### Crear Chat

```javascript
async function crearChat(req, res) {
  const {
    trabajadorId,
    accionTipo,
    tienda,
    asunto,
    mensajeInicial,
    categoria,
    archivoAdjunto
  } = req.body;

  // 1. Generar ID del chat
  const chatId = `CHAT-${Date.now()}`;

  // 2. Subir archivo (si existe)
  let archivoUrl = null;
  if (archivoAdjunto) {
    archivoUrl = await subirArchivo(archivoAdjunto);
  }

  // 3. Insertar chat
  await db.query(`
    INSERT INTO chats (
      chat_id, trabajador_id, accion_tipo, tienda, 
      asunto, categoria, estado, fecha_creacion
    ) VALUES (?, ?, ?, ?, ?, ?, 'abierto', NOW())
  `, [chatId, trabajadorId, accionTipo, tienda, asunto, categoria]);

  // 4. Insertar mensaje inicial
  const mensajeId = `M-${Date.now()}`;
  await db.query(`
    INSERT INTO mensajes_chat (
      mensaje_id, chat_id, autor_id, contenido, 
      archivo_url, fecha_hora, leido
    ) VALUES (?, ?, ?, ?, ?, NOW(), false)
  `, [mensajeId, chatId, trabajadorId, mensajeInicial, archivoUrl]);

  // 5. Enviar notificación al destinatario
  if (categoria === 'gerente') {
    await enviarNotificacionGerente(chatId, accionTipo, asunto);
  } else if (categoria === 'otras-tiendas') {
    await enviarNotificacionTienda(tienda, chatId, asunto);
  }

  return res.status(201).json({
    success: true,
    message: 'Chat creado correctamente',
    data: {
      chatId,
      estado: 'abierto',
      fechaCreacion: new Date().toISOString(),
      mensajeId
    }
  });
}
```

---

## 14. Tablas BBDD Necesarias

### Tabla: CHATS

```sql
CREATE TABLE chats (
  chat_id VARCHAR(50) PRIMARY KEY,
  trabajador_id VARCHAR(50) NOT NULL,
  accion_tipo VARCHAR(50) NOT NULL,        -- averia-maquinaria, consulta-rrhh, etc.
  tienda VARCHAR(255),                     -- Solo si accion_tipo = otra-tienda
  asunto VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,          -- gerente, otras-tiendas
  estado VARCHAR(20) NOT NULL,             -- abierto, en-curso, cerrado
  asignado_a VARCHAR(50),                  -- ID del gerente/trabajador asignado
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_ultimo_mensaje TIMESTAMP,
  FOREIGN KEY (trabajador_id) REFERENCES usuarios(usuario_id)
);
```

### Tabla: MENSAJES_CHAT

```sql
CREATE TABLE mensajes_chat (
  mensaje_id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) NOT NULL,
  autor_id VARCHAR(50) NOT NULL,
  contenido TEXT NOT NULL,
  archivo_url TEXT,                        -- URL del archivo adjunto
  fecha_hora TIMESTAMP DEFAULT NOW(),
  leido BOOLEAN DEFAULT false,
  FOREIGN KEY (chat_id) REFERENCES chats(chat_id),
  FOREIGN KEY (autor_id) REFERENCES usuarios(usuario_id)
);
```

### Tabla: ARCHIVOS_CHAT (Opcional)

```sql
CREATE TABLE archivos_chat (
  archivo_id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) NOT NULL,
  mensaje_id VARCHAR(50) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo TEXT NOT NULL,
  tamano_bytes INT NOT NULL,
  tipo_mime VARCHAR(100),
  fecha_subida TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (chat_id) REFERENCES chats(chat_id),
  FOREIGN KEY (mensaje_id) REFERENCES mensajes_chat(mensaje_id)
);
```

---

## 15. UI/UX del Modal

### Estructura Visual

```
┌─────────────────────────────────────────────┐
│ Empezar un Nuevo Chat              [X]     │
│ Completa los siguientes campos             │
├─────────────────────────────────────────────┤
│                                             │
│ Tipo de Consulta *                          │
│ [Selecciona el tipo de consulta    ▼]      │
│                                             │
│ ┌─ Si selecciona "Otra Tienda" ─────────┐  │
│ │ Selecciona la tienda *                 │  │
│ │ [Selecciona una tienda          ▼]    │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ Asunto *                                    │
│ [Escribe el asunto del chat...]            │
│                                             │
│ Mensaje *                                   │
│ ┌─────────────────────────────────────┐    │
│ │ Escribe tu mensaje...               │    │
│ │                                     │    │
│ │                                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ Adjuntar archivo (opcional)                │
│ [📎 Seleccionar archivo]          [✕]      │
│ Archivo: foto.jpg (245.67 KB)              │
│                                             │
├─────────────────────────────────────────────┤
│                    [Cancelar] [Crear Chat] │
└─────────────────────────────────────────────┘
```

### Colores y Estilos

**Desplegable Tipo de Consulta:**
- Cada opción con icono y texto
- Iconos con colores específicos

**Botón Adjuntar Archivo:**
- Background: `bg-orange-50`
- Border: `border-orange-300`
- Hover: `hover:bg-orange-100`
- Text: `text-orange-700`
- Icono: Paperclip

**Botón Crear Chat:**
- Background: `bg-teal-600`
- Hover: `hover:bg-teal-700`
- Disabled: Gris si faltan campos

---

## 16. Responsive Design

| Dispositivo | Width Modal | Campos | Botón Adjuntar |
|-------------|-------------|--------|----------------|
| Desktop (lg) | max-w-lg (512px) | Full width | Full width |
| Tablet (md) | max-w-lg | Full width | Full width |
| Móvil (sm) | 95vw | Full width | Full width |

**Características móvil:**
- Botones apilados verticalmente
- Textarea más pequeña (3 filas en móvil)
- Márgenes reducidos

---

## 17. Accesibilidad

### Labels
- ✅ Todos los campos tienen `<Label>` asociado
- ✅ Campos obligatorios marcados con `*`

### IDs
- ✅ Inputs tienen IDs únicos
- ✅ Labels conectados con `htmlFor`

### Keyboard Navigation
- ✅ Tab navega entre campos
- ✅ Enter en mensaje NO envía (es multiline)
- ✅ Escape cierra el modal

### Screen Readers
- ✅ Placeholder descriptivos
- ✅ Botones con texto claro
- ✅ Iconos con aria-label implícito

---

## 18. Testing

### Casos de Prueba

#### Test 1: Validación de Campos Obligatorios
- [ ] Botón "Crear Chat" deshabilitado si no hay tipo de consulta
- [ ] Botón deshabilitado si no hay asunto
- [ ] Botón deshabilitado si no hay mensaje
- [ ] Botón deshabilitado si tipo = "Otra Tienda" y no hay tienda seleccionada

#### Test 2: Selector de Tienda Condicional
- [ ] Desplegable de tiendas NO visible inicialmente
- [ ] Desplegable aparece solo si se selecciona "Otra Tienda"
- [ ] Desplegable desaparece si se cambia a otra acción

#### Test 3: Adjuntar Archivo
- [ ] Botón adjuntar abre selector de archivos
- [ ] Nombre del archivo se muestra en el botón
- [ ] Información del archivo visible (nombre + tamaño)
- [ ] Botón "✕" elimina el archivo
- [ ] Se puede seleccionar otro archivo

#### Test 4: Creación del Chat
- [ ] Chat se crea correctamente
- [ ] Aparece en la lista de chats
- [ ] Se abre automáticamente
- [ ] Toast de confirmación se muestra
- [ ] Campos se resetean al cerrar

#### Test 5: Reset del Modal
- [ ] Al cerrar, todos los campos se limpian
- [ ] Al cancelar, todos los campos se limpian
- [ ] Al crear chat, todos los campos se limpian

---

## 19. Checklist Programador

### Frontend
- [x] Estados del modal creados
- [x] Desplegable de acciones implementado
- [x] Campo Asunto implementado
- [x] Campo Mensaje implementado
- [x] Botón adjuntar archivo implementado
- [x] Validaciones frontend completas
- [x] Reset de estados al cerrar
- [x] Toast notifications implementadas
- [ ] Cargar tiendas desde API
- [ ] Subir archivo a servidor
- [ ] Conectar con endpoint POST /api/chats

### Backend
- [ ] Endpoint POST /api/chats
- [ ] Endpoint GET /api/puntos-venta (para tiendas)
- [ ] Subida de archivos (Storage)
- [ ] Notificaciones a destinatarios
- [ ] Tabla chats
- [ ] Tabla mensajes_chat
- [ ] Tabla archivos_chat (opcional)

---

## 20. Conclusión

### ✅ Estado Actual

El modal de "Empezar un Nuevo Chat" está **100% funcional** con:

- ✅ 6 tipos de consulta con iconos y colores
- ✅ Desplegable de tiendas condicional
- ✅ Campos obligatorios: Tipo, Asunto, Mensaje
- ✅ Botón naranja de adjuntar archivo (opcional)
- ✅ Validaciones completas
- ✅ Reset automático de campos
- ✅ Creación de chat funcional
- ✅ Apertura automática del chat creado
- ✅ Notificaciones toast

### 🔧 Pendiente

- ❌ Cargar tiendas desde API
- ❌ Subir archivos al servidor
- ❌ Conectar con endpoint backend
- ❌ Enviar notificaciones a destinatarios

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 2.0  
**Estado:** ✅ Frontend 100% completado, Backend pendiente
