# 🌐 Especificación del Endpoint de Versiones - Udar Edge

**Versión:** 1.0.0  
**Última actualización:** 27 de noviembre de 2024  
**Para:** Equipo de Backend

---

## 📋 Resumen Ejecutivo

Este documento especifica el endpoint `/v1/app/version` necesario para que la funcionalidad de **actualización automática** de la app móvil funcione correctamente.

El hook `useAppUpdate()` del frontend consulta este endpoint periódicamente para verificar si hay una nueva versión disponible y mostrar un modal de actualización al usuario.

---

## 🎯 Propósito

- ✅ Informar a la app móvil sobre la última versión disponible
- ✅ Forzar actualizaciones críticas cuando sea necesario
- ✅ Mostrar changelog al usuario
- ✅ Proveer enlaces directos a las tiendas (Google Play / App Store)
- ✅ Definir versión mínima soportada (para deprecar versiones antiguas)

---

## 📡 Especificación del Endpoint

### URL
```
GET https://api.udaredge.com/v1/app/version
```

### Método
```
GET
```

### Headers
```
Content-Type: application/json
```

### Autenticación
**No requiere autenticación** (endpoint público)

> **Nota:** Este endpoint debe ser accesible sin token de autenticación porque se consulta antes de que el usuario inicie sesión.

---

## 📤 Respuesta (Response)

### Status Code
```
200 OK
```

### Body (JSON)

```json
{
  "version": "1.0.0",
  "versionCode": 1,
  "required": false,
  "changelog": [
    "🎉 Primera versión de Udar Edge",
    "✅ Sistema TPV 360 completo",
    "✅ Gestión de clientes y productos",
    "✅ Módulo de stock y proveedores",
    "✅ Sistema de fichaje con geofencing",
    "✅ Documentación laboral con OCR",
    "✅ Chats de pedidos en tiempo real"
  ],
  "downloadUrl": {
    "android": "https://play.google.com/store/apps/details?id=com.udaredge.app",
    "ios": "https://apps.apple.com/app/udar-edge/id123456789"
  },
  "minSupportedVersion": "1.0.0",
  "minSupportedVersionCode": 1
}
```

---

## 📖 Descripción de Campos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `version` | String | ✅ Sí | Versión semántica de la última release (ej: "1.2.3") |
| `versionCode` | Integer | ✅ Sí | Código numérico de la versión (se incrementa con cada release) |
| `required` | Boolean | ✅ Sí | Si es `true`, la actualización es **obligatoria** (el usuario no puede cerrar el modal) |
| `changelog` | Array<String> | ✅ Sí | Lista de cambios/mejoras en esta versión |
| `downloadUrl` | Object | ✅ Sí | Enlaces a las tiendas de apps |
| `downloadUrl.android` | String | ✅ Sí | URL de Google Play Store |
| `downloadUrl.ios` | String | ✅ Sí | URL de Apple App Store |
| `minSupportedVersion` | String | ❌ No | Versión mínima soportada (versiones anteriores no podrán usar la app) |
| `minSupportedVersionCode` | Integer | ❌ No | Código numérico de la versión mínima soportada |

---

## 🔄 Lógica de Actualización

### Flujo en el Frontend

```typescript
// El frontend (useAppUpdate hook) hace lo siguiente:

1. Obtener versión actual de la app instalada
   const currentVersion = "1.0.0"
   const currentVersionCode = 1

2. Consultar endpoint de versiones
   const response = await fetch('https://api.udaredge.com/v1/app/version')

3. Comparar versiones
   if (response.versionCode > currentVersionCode) {
     // Hay una actualización disponible
     showUpdateModal()
   }

4. Si response.required === true
   // Modal no se puede cerrar, actualización obligatoria
   // El usuario DEBE actualizar para seguir usando la app

5. Si currentVersionCode < response.minSupportedVersionCode
   // La versión instalada es muy antigua
   // Forzar actualización (la app no funcionará)
```

### Diagrama de Decisión

```
┌─────────────────────────────────────┐
│ App consulta /v1/app/version        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Comparar versionCode                 │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   Mayor           Igual o Menor
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Actualización│  │ No hacer nada │
│  disponible  │  └──────────────┘
└──────┬───────┘
       │
┌──────┴─────────┐
│ ¿required?     │
└──────┬─────────┘
       │
   ┌───┴────┐
   │        │
  Sí       No
   │        │
   ▼        ▼
┌────────┐ ┌────────┐
│ Forzar │ │ Sugerir│
│ (modal │ │ (modal │
│ no se  │ │ se pue-│
│ cierra)│ │ de cer-│
└────────┘ │ rar)   │
           └────────┘
```

---

## 💻 Implementación Backend

### Opción 1: Node.js + Express

```javascript
// routes/app.js
const express = require('express');
const router = express.Router();

// Almacenar la información de versión (podría estar en BD)
const versionInfo = {
  version: "1.0.0",
  versionCode: 1,
  required: false,
  changelog: [
    "🎉 Primera versión de Udar Edge",
    "✅ Sistema TPV 360 completo",
    "✅ Gestión de clientes y productos",
    "✅ Módulo de stock y proveedores",
    "✅ Sistema de fichaje con geofencing",
    "✅ Documentación laboral con OCR",
    "✅ Chats de pedidos en tiempo real"
  ],
  downloadUrl: {
    android: "https://play.google.com/store/apps/details?id=com.udaredge.app",
    ios: "https://apps.apple.com/app/udar-edge/id123456789"
  },
  minSupportedVersion: "1.0.0",
  minSupportedVersionCode: 1
};

/**
 * GET /v1/app/version
 * Obtener información de la última versión disponible
 */
router.get('/v1/app/version', (req, res) => {
  try {
    // Log para debugging (opcional)
    console.log('[APP VERSION] Request from:', req.ip);
    
    // Devolver información de versión
    res.status(200).json(versionInfo);
  } catch (error) {
    console.error('[APP VERSION] Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener información de versión' 
    });
  }
});

module.exports = router;
```

**Usar en tu app principal:**
```javascript
// app.js o server.js
const appRoutes = require('./routes/app');
app.use('/api', appRoutes);
```

---

### Opción 2: Python + FastAPI

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

# ========================================
# MODELOS
# ========================================

class DownloadUrls(BaseModel):
    android: str
    ios: str

class VersionInfo(BaseModel):
    version: str
    versionCode: int
    required: bool
    changelog: List[str]
    downloadUrl: DownloadUrls
    minSupportedVersion: str
    minSupportedVersionCode: int

# ========================================
# ENDPOINT
# ========================================

@router.get("/v1/app/version", response_model=VersionInfo)
async def get_app_version():
    """
    Obtener información de la última versión disponible
    
    Returns:
        VersionInfo: Información de la versión actual
    """
    try:
        return VersionInfo(
            version="1.0.0",
            versionCode=1,
            required=False,
            changelog=[
                "🎉 Primera versión de Udar Edge",
                "✅ Sistema TPV 360 completo",
                "✅ Gestión de clientes y productos",
                "✅ Módulo de stock y proveedores",
                "✅ Sistema de fichaje con geofencing",
                "✅ Documentación laboral con OCR",
                "✅ Chats de pedidos en tiempo real"
            ],
            downloadUrl=DownloadUrls(
                android="https://play.google.com/store/apps/details?id=com.udaredge.app",
                ios="https://apps.apple.com/app/udar-edge/id123456789"
            ),
            minSupportedVersion="1.0.0",
            minSupportedVersionCode=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener información de versión")

# ========================================
# REGISTRAR ROUTER
# ========================================

# En main.py o app.py
from app.routes import version_router
app.include_router(version_router.router, prefix="/api")
```

---

### Opción 3: PHP + Laravel

```php
<?php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppVersionController;

Route::get('/v1/app/version', [AppVersionController::class, 'getVersion']);
```

```php
<?php
// app/Http/Controllers/AppVersionController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AppVersionController extends Controller
{
    /**
     * Obtener información de la última versión disponible
     *
     * @return JsonResponse
     */
    public function getVersion(): JsonResponse
    {
        $versionInfo = [
            'version' => '1.0.0',
            'versionCode' => 1,
            'required' => false,
            'changelog' => [
                '🎉 Primera versión de Udar Edge',
                '✅ Sistema TPV 360 completo',
                '✅ Gestión de clientes y productos',
                '✅ Módulo de stock y proveedores',
                '✅ Sistema de fichaje con geofencing',
                '✅ Documentación laboral con OCR',
                '✅ Chats de pedidos en tiempo real'
            ],
            'downloadUrl' => [
                'android' => 'https://play.google.com/store/apps/details?id=com.udaredge.app',
                'ios' => 'https://apps.apple.com/app/udar-edge/id123456789'
            ],
            'minSupportedVersion' => '1.0.0',
            'minSupportedVersionCode' => 1
        ];

        return response()->json($versionInfo);
    }
}
```

---

## 🗄️ Almacenamiento en Base de Datos (Recomendado)

### Tabla `app_versions`

```sql
CREATE TABLE app_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    version_code INTEGER NOT NULL UNIQUE,
    is_required BOOLEAN DEFAULT FALSE,
    changelog JSONB NOT NULL,
    android_url VARCHAR(255) NOT NULL,
    ios_url VARCHAR(255) NOT NULL,
    min_supported_version VARCHAR(20),
    min_supported_version_code INTEGER,
    published_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_version_code ON app_versions(version_code);
CREATE INDEX idx_is_active ON app_versions(is_active);

-- Insertar versión inicial
INSERT INTO app_versions (
    version,
    version_code,
    is_required,
    changelog,
    android_url,
    ios_url,
    min_supported_version,
    min_supported_version_code
) VALUES (
    '1.0.0',
    1,
    false,
    '["🎉 Primera versión de Udar Edge", "✅ Sistema TPV 360 completo", "✅ Gestión de clientes y productos"]',
    'https://play.google.com/store/apps/details?id=com.udaredge.app',
    'https://apps.apple.com/app/udar-edge/id123456789',
    '1.0.0',
    1
);
```

### Query para Obtener Última Versión

```sql
SELECT 
    version,
    version_code,
    is_required,
    changelog,
    android_url,
    ios_url,
    min_supported_version,
    min_supported_version_code
FROM app_versions
WHERE is_active = TRUE
ORDER BY version_code DESC
LIMIT 1;
```

---

## 🧪 Testing del Endpoint

### CURL

```bash
# Test básico
curl -X GET https://api.udaredge.com/v1/app/version

# Con headers
curl -X GET https://api.udaredge.com/v1/app/version \
  -H "Content-Type: application/json" \
  -H "User-Agent: UdarEdge/1.0.0 (Android 13)"
```

### Postman

```
GET https://api.udaredge.com/v1/app/version

Headers:
  Content-Type: application/json

Expected Response (200 OK):
{
  "version": "1.0.0",
  "versionCode": 1,
  "required": false,
  "changelog": [...],
  "downloadUrl": {...},
  ...
}
```

### JavaScript (Frontend)

```javascript
// Test desde consola del navegador
fetch('https://api.udaredge.com/v1/app/version')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## 🚀 Proceso de Actualización de Versión

### Cuando publicas una nueva versión en las stores:

**1. Actualizar Base de Datos**

```sql
-- Desactivar versiones anteriores (opcional)
UPDATE app_versions SET is_active = FALSE;

-- Insertar nueva versión
INSERT INTO app_versions (
    version,
    version_code,
    is_required,
    changelog,
    android_url,
    ios_url,
    min_supported_version,
    min_supported_version_code
) VALUES (
    '1.1.0',          -- Nueva versión
    2,                -- versionCode incrementado
    false,            -- ¿Es obligatoria?
    '["✨ Nueva funcionalidad X", "🐛 Corrección de bug Y", "⚡ Mejora de rendimiento"]',
    'https://play.google.com/store/apps/details?id=com.udaredge.app',
    'https://apps.apple.com/app/udar-edge/id123456789',
    '1.0.0',          -- Versión mínima soportada
    1                 -- versionCode mínimo soportado
);
```

**2. Las apps consultan automáticamente**

El hook `useAppUpdate()` consulta el endpoint cada 30 minutos (configurable). Las apps con versión antigua verán el modal de actualización.

**3. Forzar actualización crítica**

Si hay un bug crítico o problema de seguridad:

```sql
UPDATE app_versions 
SET is_required = TRUE 
WHERE version = '1.1.0';
```

Todas las apps con versión < 1.1.0 verán un modal que **no se puede cerrar** hasta que actualicen.

---

## 📊 Analytics (Opcional pero Recomendado)

Puedes añadir tracking para saber qué versiones están usando tus usuarios:

```javascript
router.get('/v1/app/version', async (req, res) => {
  const userAgent = req.headers['user-agent'];
  const clientVersion = req.headers['x-app-version']; // Si el frontend lo envía
  
  // Guardar en analytics
  await analytics.track({
    event: 'app_version_check',
    version: clientVersion,
    userAgent: userAgent,
    timestamp: new Date()
  });
  
  res.json(versionInfo);
});
```

---

## 🔒 Seguridad

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const versionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP
  message: 'Demasiadas solicitudes, intenta de nuevo más tarde'
});

router.get('/v1/app/version', versionLimiter, (req, res) => {
  // ...
});
```

### CORS

```javascript
const cors = require('cors');

app.use('/api/v1/app/version', cors({
  origin: '*', // Permitir desde cualquier origen (es público)
  methods: ['GET']
}));
```

---

## 🐛 Manejo de Errores

### Respuestas de Error

**500 Internal Server Error**
```json
{
  "error": "Error al obtener información de versión",
  "message": "Por favor, intenta de nuevo más tarde"
}
```

**503 Service Unavailable**
```json
{
  "error": "Servicio temporalmente no disponible",
  "message": "Estamos realizando mantenimiento. Intenta en unos minutos"
}
```

---

## 📋 Checklist de Implementación

- [ ] Crear tabla `app_versions` en la base de datos
- [ ] Implementar endpoint `/v1/app/version`
- [ ] Insertar versión inicial (1.0.0)
- [ ] Configurar CORS para permitir peticiones desde la app
- [ ] Añadir rate limiting
- [ ] Testear endpoint con CURL/Postman
- [ ] Actualizar URL en `/hooks/useAppUpdate.ts` del frontend
- [ ] Documentar proceso para el equipo
- [ ] Crear script o panel de admin para publicar nuevas versiones
- [ ] Configurar monitoreo/alertas si el endpoint cae

---

## 📚 Ejemplos de Changelog

### Versión 1.0.0 (Inicial)
```json
[
  "🎉 Primera versión de Udar Edge",
  "✅ Sistema TPV 360 completo",
  "✅ Gestión de clientes y productos"
]
```

### Versión 1.1.0 (Feature)
```json
[
  "✨ Nuevo módulo de reportes avanzados",
  "📊 Dashboard con gráficos interactivos",
  "⚡ Mejora de rendimiento en carga de productos"
]
```

### Versión 1.0.1 (Bugfix)
```json
[
  "🐛 Corregido crash al abrir chat de pedidos",
  "🔧 Solucionado problema de sincronización offline",
  "🚀 Mejoras de estabilidad general"
]
```

### Versión 2.0.0 (Major)
```json
[
  "🎉 Rediseño completo de la interfaz",
  "✨ Modo oscuro",
  "🔔 Notificaciones push mejoradas",
  "⚡ Rendimiento 2x más rápido",
  "🚨 IMPORTANTE: Esta versión requiere Android 8.0+"
]
```

---

## 🔄 Versionado Semántico

Seguir el estándar **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH

Ejemplos:
- 1.0.0 → Primera versión estable
- 1.0.1 → Bugfix (compatible con 1.0.0)
- 1.1.0 → Nueva funcionalidad (compatible con 1.0.x)
- 2.0.0 → Cambios incompatibles (breaking changes)
```

**versionCode** siempre incrementa de 1 en 1:
```
1.0.0 → versionCode: 1
1.0.1 → versionCode: 2
1.1.0 → versionCode: 3
2.0.0 → versionCode: 4
```

---

## 📞 Contacto para Dudas

Si tienes dudas sobre la implementación:
- **Frontend Lead:** [Tu nombre/email]
- **Backend Lead:** [Nombre/email del backend dev]
- **DevOps:** [Nombre/email de DevOps si aplica]

---

**Última actualización:** 27 de noviembre de 2024  
**Versión del documento:** 1.0.0  
**Autor:** Udar Edge Development Team
