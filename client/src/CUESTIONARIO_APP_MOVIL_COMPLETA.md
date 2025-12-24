# 📱 CUESTIONARIO COMPLETO - APP MÓVIL UDAR EDGE

**Objetivo:** Preparar la aplicación móvil completa con todas las funcionalidades nativas  
**Fecha:** 27 Noviembre 2025  
**Estado:** Pendiente de respuestas

---

## 🎯 INSTRUCCIONES

Por favor, responde todas las preguntas de este documento. Con tus respuestas crearé:

1. ✅ Sistema de onboarding completo
2. ✅ Gestión de permisos nativos
3. ✅ Push notifications configuradas
4. ✅ Biometría (huella digital / Face ID)
5. ✅ Funcionalidad offline
6. ✅ Deep linking
7. ✅ Splash screen profesional
8. ✅ Todas las conexiones backend preparadas

---

## 📋 SECCIÓN 1: INFORMACIÓN GENERAL DE LA APP

### **1.1. Identidad de la App**

**P1.** ¿Cuál es el nombre OFICIAL de la aplicación?
- [ ] Udar Edge
- [ ] Otro: _______________

**P2.** ¿Cuál es el slogan/tagline de la app? (Para splash screen y onboarding)
```
Ejemplo: "Digitaliza tu negocio en minutos"
Respuesta: _______________________________________________
```

**P3.** ¿Tienes un logo en alta calidad? (Necesario para splash screen y icono de app)
- [ ] Sí, tengo el logo
- [ ] No, usar el logo de Can Farines actual
- [ ] Necesito ayuda para crear uno

**P4.** Si tienes logo, ¿en qué formatos lo tienes?
- [ ] PNG (fondo transparente) - **IDEAL**
- [ ] SVG (vectorial) - **IDEAL**
- [ ] JPG/PNG (con fondo)
- [ ] Otro: _______________

**P5.** ¿Cuáles son los colores OFICIALES de la marca?
```
Color primario (actual: Teal #0d9488): _______________
Color secundario: _______________
Color de acento: _______________
```

---

## 📋 SECCIÓN 2: ONBOARDING / TUTORIAL INICIAL

### **2.1. Primera Experiencia del Usuario**

**P6.** ¿Quieres mostrar un ONBOARDING (tutorial) la primera vez que abren la app?
- [ ] SÍ, mostrar tutorial completo
- [ ] NO, ir directo al login
- [ ] Solo para NUEVOS usuarios (no para quien ya tiene cuenta)

**P7.** Si SÍ al onboarding, ¿cuántas pantallas de tutorial quieres? (Recomendado: 3-5)
- [ ] 3 pantallas
- [ ] 4 pantallas
- [ ] 5 pantallas
- [ ] Otro: _______________

**P8.** ¿Qué mensajes quieres en cada pantalla del onboarding?

**PANTALLA 1:**
```
Título: _______________________________________________
Descripción: _______________________________________________
Icono/Ilustración: (ej: "un TPV", "un chef", "un dashboard")
_______________________________________________
```

**PANTALLA 2:**
```
Título: _______________________________________________
Descripción: _______________________________________________
Icono/Ilustración: _______________________________________________
```

**PANTALLA 3:**
```
Título: _______________________________________________
Descripción: _______________________________________________
Icono/Ilustración: _______________________________________________
```

**PANTALLA 4 (Opcional):**
```
Título: _______________________________________________
Descripción: _______________________________________________
Icono/Ilustración: _______________________________________________
```

**PANTALLA 5 (Opcional):**
```
Título: _______________________________________________
Descripción: _______________________________________________
Icono/Ilustración: _______________________________________________
```

**P9.** En la última pantalla del onboarding, ¿qué botones quieres?
- [ ] "Empezar" → Ir a Login
- [ ] "Crear cuenta" + "Ya tengo cuenta"
- [ ] Otro: _______________

---

## 📋 SECCIÓN 3: INICIO DE SESIÓN Y REGISTRO

### **3.1. Métodos de Autenticación**

**P10.** ¿Qué métodos de login quieres ACTIVAR? (marca todos los que apliquen)
- [ ] Email + Contraseña (BÁSICO)
- [ ] Google (OAuth)
- [ ] Facebook (OAuth)
- [ ] Apple (OAuth - OBLIGATORIO para iOS App Store)
- [ ] Número de teléfono + SMS
- [ ] Código QR
- [ ] Otro: _______________

**P11.** ¿Quieres permitir REGISTRO de nuevos usuarios desde la app?
- [ ] SÍ, cualquiera puede registrarse
- [ ] NO, solo login (los usuarios se crean desde panel admin)
- [ ] Solo ciertos roles pueden registrarse: _______________

**P12.** Si permites registro, ¿qué datos OBLIGATORIOS pedir?
- [ ] Nombre completo
- [ ] Email
- [ ] Teléfono
- [ ] Contraseña
- [ ] Confirmación de contraseña
- [ ] Rol (Cliente/Trabajador/Gerente)
- [ ] Empresa (si es trabajador/gerente)
- [ ] Otro: _______________

**P13.** ¿Quieres verificación de email/teléfono al registrarse?
- [ ] SÍ, enviar código de verificación por email
- [ ] SÍ, enviar código de verificación por SMS
- [ ] NO, acceso inmediato sin verificar
- [ ] Solo para ciertos roles: _______________

### **3.2. Recuperación de Contraseña**

**P14.** ¿Cómo quieres que funcione "Olvidé mi contraseña"?
- [ ] Enviar enlace por email
- [ ] Enviar código por SMS
- [ ] Ambos (usuario elige)
- [ ] Contactar con soporte

**P15.** ¿Cuánto tiempo debe ser válido el enlace/código de recuperación?
- [ ] 15 minutos
- [ ] 30 minutos
- [ ] 1 hora
- [ ] 24 horas
- [ ] Otro: _______________

---

## 📋 SECCIÓN 4: BIOMETRÍA (Huella Digital / Face ID)

### **4.1. Autenticación Biométrica**

**P16.** ¿Quieres permitir login con huella digital / Face ID?
- [ ] SÍ, es OBLIGATORIO activarlo
- [ ] SÍ, pero es OPCIONAL (el usuario puede elegir)
- [ ] NO, solo email/password

**P17.** Si SÍ, ¿cuándo se debe ofrecer activar la biometría?
- [ ] Inmediatamente después del primer login exitoso
- [ ] En la pantalla de Configuración (el usuario lo activa cuando quiera)
- [ ] Preguntar cada vez que inicia sesión hasta que acepte o rechace

**P18.** Mensaje al solicitar permiso de biometría:
```
Título: _______________________________________________
Descripción: _______________________________________________

Ejemplo:
Título: "Accede más rápido"
Descripción: "Usa tu huella digital o Face ID para iniciar sesión de forma segura"
```

**P19.** Si el usuario rechaza biometría, ¿qué hacer?
- [ ] Permitir login normal (email/password)
- [ ] Recordar que puede activarlo en Configuración
- [ ] No volver a preguntar
- [ ] Preguntar cada cierto tiempo: _______________

---

## 📋 SECCIÓN 5: PERMISOS NATIVOS DEL DISPOSITIVO

### **5.1. Cámara**

**P20.** ¿La app necesita acceso a la CÁMARA?
- [ ] SÍ, es OBLIGATORIO para funcionamiento básico
- [ ] SÍ, pero es OPCIONAL (algunas funciones lo requieren)
- [ ] NO, no se usa

**P21.** Si SÍ, ¿para qué se usa la cámara?
- [ ] Tomar foto de perfil
- [ ] Escanear documentos (DNI, contratos, facturas)
- [ ] Escanear códigos QR
- [ ] OCR (leer texto de tickets/facturas)
- [ ] Escanear códigos de barras de productos
- [ ] Otro: _______________

**P22.** Mensaje al solicitar permiso de cámara:
```
Título: _______________________________________________
Descripción: _______________________________________________

Ejemplo:
Título: "Necesitamos acceso a tu cámara"
Descripción: "Para escanear tickets, documentos y códigos QR"
```

### **5.2. Ubicación / GPS**

**P23.** ¿La app necesita acceso a la UBICACIÓN?
- [ ] SÍ, SIEMPRE (incluso en segundo plano)
- [ ] SÍ, solo CUANDO SE USA LA APP
- [ ] NO, no se usa

**P24.** Si SÍ, ¿para qué se usa la ubicación?
- [ ] Fichaje de empleados (verificar que están en el local)
- [ ] Delivery (rastreo del repartidor)
- [ ] Encontrar puntos de venta cercanos
- [ ] Geolocalización de pedidos
- [ ] Otro: _______________

**P25.** ¿Qué precisión de ubicación necesitas?
- [ ] ALTA precisión (GPS, <10 metros) - Consume más batería
- [ ] MEDIA precisión (WiFi/Red móvil, ~100 metros)
- [ ] BAJA precisión (solo ciudad/zona)

**P26.** Mensaje al solicitar permiso de ubicación:
```
Título: _______________________________________________
Descripción: _______________________________________________

Ejemplo:
Título: "Necesitamos tu ubicación"
Descripción: "Para verificar tu fichaje en el punto de venta"
```

### **5.3. Notificaciones Push**

**P27.** ¿La app enviará NOTIFICACIONES PUSH?
- [ ] SÍ, son CRÍTICAS para el funcionamiento
- [ ] SÍ, pero son OPCIONALES
- [ ] NO, no se enviarán notificaciones

**P28.** Si SÍ, ¿cuándo solicitar permiso de notificaciones?
- [ ] Inmediatamente después del login (recomendado)
- [ ] En el onboarding (antes del login)
- [ ] Después de 1-2 días de uso
- [ ] Cuando sea relevante (ej: al crear primer pedido)
- [ ] Nunca pedir automáticamente (solo en Configuración)

**P29.** Mensaje al solicitar permiso de notificaciones:
```
Título: _______________________________________________
Descripción: _______________________________________________

Ejemplo:
Título: "No te pierdas nada"
Descripción: "Recibe alertas de pedidos, mensajes y recordatorios importantes"
```

**P30.** ¿Qué tipos de notificaciones se enviarán? (marca todas)
- [ ] Nuevo pedido (para trabajadores)
- [ ] Cambio de estado de pedido (para clientes)
- [ ] Nuevo mensaje en chat
- [ ] Permiso aprobado/rechazado
- [ ] Recordatorio de fichaje
- [ ] Stock bajo (para gerentes)
- [ ] Vencimiento de documentos
- [ ] Promociones y ofertas
- [ ] Nómina disponible
- [ ] Otro: _______________

### **5.4. Micrófono**

**P31.** ¿La app necesita acceso al MICRÓFONO?
- [ ] SÍ
- [ ] NO

**P32.** Si SÍ, ¿para qué?
- [ ] Notas de voz en chat
- [ ] Comandos de voz
- [ ] Otro: _______________

### **5.5. Almacenamiento / Archivos**

**P33.** ¿La app necesita acceso al ALMACENAMIENTO del dispositivo?
- [ ] SÍ, para leer archivos
- [ ] SÍ, para guardar archivos (descargas)
- [ ] Ambos
- [ ] NO

**P34.** Si SÍ, ¿para qué?
- [ ] Subir documentos (PDF, imágenes)
- [ ] Descargar nóminas, facturas, reportes
- [ ] Guardar fotos de perfil
- [ ] Otro: _______________

### **5.6. Calendario**

**P35.** ¿La app necesita acceso al CALENDARIO del dispositivo?
- [ ] SÍ
- [ ] NO

**P36.** Si SÍ, ¿para qué?
- [ ] Agregar turnos/fichajes al calendario
- [ ] Agregar citas/reservas
- [ ] Recordatorios de vencimientos
- [ ] Otro: _______________

### **5.7. Contactos**

**P37.** ¿La app necesita acceso a los CONTACTOS del dispositivo?
- [ ] SÍ
- [ ] NO

**P38.** Si SÍ, ¿para qué?
- [ ] Compartir app con contactos
- [ ] Invitar empleados
- [ ] Otro: _______________

---

## 📋 SECCIÓN 6: PUSH NOTIFICATIONS (Configuración Detallada)

### **6.1. Tipos de Notificaciones por Rol**

**P39.** Para **CLIENTES**, ¿qué notificaciones quieres enviar?

| Tipo de Notificación | ¿Enviar? | Sonido | Vibración | Badge |
|---------------------|----------|--------|-----------|-------|
| Pedido confirmado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Pedido en preparación | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Pedido listo para recoger | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Pedido en camino (delivery) | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Pedido entregado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Nuevo mensaje en chat | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Promoción/oferta disponible | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Recordatorio de cita/reserva | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Otra: _______________ | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |

**P40.** Para **TRABAJADORES**, ¿qué notificaciones quieres enviar?

| Tipo de Notificación | ¿Enviar? | Sonido | Vibración | Badge |
|---------------------|----------|--------|-----------|-------|
| Nuevo pedido asignado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Tarea asignada | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Recordatorio de fichaje | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Permiso aprobado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Permiso rechazado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Nuevo mensaje de gerencia | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Nómina disponible | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Cambio de turno | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Otra: _______________ | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |

**P41.** Para **GERENTES**, ¿qué notificaciones quieres enviar?

| Tipo de Notificación | ¿Enviar? | Sonido | Vibración | Badge |
|---------------------|----------|--------|-----------|-------|
| Nueva solicitud de permiso | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Stock bajo | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Vencimiento de documento | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Meta de ventas alcanzada | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Alerta de operativa | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Nuevo mensaje de empleado | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Reporte diario disponible | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |
| Otra: _______________ | ☐ SÍ ☐ NO | ☐ | ☐ | ☐ |

### **6.2. Comportamiento de Notificaciones**

**P42.** ¿Qué debe pasar cuando el usuario TOCA una notificación?
- [ ] Abrir la app en la pantalla principal
- [ ] Abrir la app en la pantalla ESPECÍFICA del evento (ej: pedido, chat, etc.)
- [ ] Abrir un modal con detalles
- [ ] Otro: _______________

**P43.** ¿Agrupar notificaciones del mismo tipo?
```
Ejemplo: En vez de 5 notificaciones de "Nuevo pedido", mostrar 1 que diga "5 nuevos pedidos"
```
- [ ] SÍ, agrupar siempre
- [ ] NO, mostrar individual
- [ ] Solo si hay más de ___ notificaciones

**P44.** ¿Permitir que el usuario configure qué notificaciones recibir?
- [ ] SÍ, control total en Configuración
- [ ] NO, reciben todas o ninguna
- [ ] Solo algunas configurables: _______________

**P45.** ¿Horario de notificaciones?
- [ ] Enviar 24/7 (cualquier hora)
- [ ] Solo en horario laboral: ___ a ___ horas
- [ ] Modo "No molestar" configurable por usuario
- [ ] Otro: _______________

**P46.** ¿Sonido de notificaciones?
- [ ] Sonido predeterminado del sistema
- [ ] Sonido personalizado de Udar Edge
- [ ] Sin sonido (solo vibración)
- [ ] Configurable por el usuario

---

## 📋 SECCIÓN 7: FUNCIONALIDAD OFFLINE

### **7.1. Modo Sin Conexión**

**P47.** ¿Qué debe poder hacer el usuario SIN INTERNET?
- [ ] Ver pedidos anteriores (cacheados)
- [ ] Ver productos y precios
- [ ] Crear pedidos (se envían cuando haya conexión)
- [ ] Ver perfil y configuración
- [ ] Fichar entrada/salida (se sincroniza después)
- [ ] Ver documentos descargados
- [ ] Nada, la app requiere internet siempre
- [ ] Otro: _______________

**P48.** ¿Qué mensaje mostrar cuando NO HAY INTERNET?
```
Opción A: Banner discreto arriba
Opción B: Modal bloqueante
Opción C: Toast/Snackbar temporal

Elegir: _______________

Mensaje: _______________________________________________
```

**P49.** ¿Qué datos cachear localmente?
- [ ] Productos y categorías (actualizar cada ___ horas)
- [ ] Últimos 10 pedidos
- [ ] Datos de perfil del usuario
- [ ] Configuración de la app
- [ ] Conversaciones de chat
- [ ] Otro: _______________

---

## 📋 SECCIÓN 8: SPLASH SCREEN Y PRIMERA CARGA

### **8.1. Pantalla de Inicio (Splash)**

**P50.** ¿Qué quieres mostrar en el SPLASH SCREEN (pantalla inicial al abrir la app)?
```
Opción A: Solo logo centrado + fondo de color sólido
Opción B: Logo + slogan + fondo con gradiente
Opción C: Logo + animación de carga
Opción D: Logo + slogan + versión de la app

Elegir: _______________
```

**P51.** ¿Cuánto tiempo mostrar el splash screen?
- [ ] Mínimo (1-2 segundos)
- [ ] Hasta que carguen datos iniciales
- [ ] Tiempo fijo: ___ segundos

**P52.** ¿Color de fondo del splash screen?
```
Color: _______________
(Ejemplo: #0d9488, blanco, gradiente teal-blue)
```

### **8.2. Animación de Carga**

**P53.** Tipo de animación mientras carga la app:
- [ ] Spinner circular (estilo iOS/Android)
- [ ] Barra de progreso
- [ ] Logo con efecto pulse
- [ ] Animación personalizada
- [ ] Sin animación, solo esperar

---

## 📋 SECCIÓN 9: DEEP LINKING

### **9.1. Enlaces Profundos**

**P54.** ¿Quieres que la app se abra desde enlaces externos?
```
Ejemplo: 
- Click en email de "Pedido listo" → Abre la app en la pantalla del pedido
- Click en enlace de promoción → Abre la app en esa promoción
```
- [ ] SÍ
- [ ] NO

**P55.** Si SÍ, ¿qué enlaces quieres soportar?

| Tipo de Enlace | ¿Soportar? | Ejemplo de URL |
|---------------|-----------|----------------|
| Ver pedido | ☐ | udaredge://pedido/PED-001 |
| Abrir chat | ☐ | udaredge://chat/CONV-123 |
| Ver promoción | ☐ | udaredge://promo/PROMO-456 |
| Resetear contraseña | ☐ | udaredge://reset-password?token=xxx |
| Verificar email | ☐ | udaredge://verify-email?token=xxx |
| Abrir producto | ☐ | udaredge://producto/PROD-789 |
| Otro: _______________ | ☐ | _______________ |

**P56.** ¿Dominio web para deep links universales? (También abrir desde navegador)
```
Ejemplo: https://app.udaredge.com/pedido/PED-001
Respuesta: _______________________________________________
```

---

## 📋 SECCIÓN 10: SEGURIDAD Y PRIVACIDAD

### **10.1. Sesión y Tokens**

**P57.** ¿Cuánto tiempo debe durar una sesión ACTIVA?
- [ ] 24 horas
- [ ] 7 días
- [ ] 30 días
- [ ] Mientras no cierre sesión manualmente
- [ ] Otro: _______________

**P58.** ¿Cuándo CERRAR SESIÓN AUTOMÁTICAMENTE?
- [ ] Después de ___ minutos de inactividad
- [ ] Al cerrar la app
- [ ] Al reiniciar el dispositivo
- [ ] Nunca (sesión persistente)

**P59.** ¿Permitir MÚLTIPLES SESIONES simultáneas?
```
Ejemplo: Mismo usuario en móvil + tablet + web
```
- [ ] SÍ, sin límite
- [ ] SÍ, máximo ___ dispositivos
- [ ] NO, solo 1 sesión activa (cerrar las demás)

**P60.** ¿Mostrar pantalla de BLOQUEO con PIN si está inactivo?
- [ ] SÍ, después de ___ minutos
- [ ] NO

### **10.2. Datos Sensibles**

**P61.** ¿Guardar contraseña localmente para auto-login?
- [ ] SÍ, de forma segura (Keychain/Keystore)
- [ ] NO, pedir siempre credenciales

**P62.** ¿Ocultar pantalla al poner app en segundo plano? (Evitar capturas en multitarea)
- [ ] SÍ, mostrar splash en vez del contenido
- [ ] NO, mostrar contenido normal

**P63.** ¿Permitir capturas de pantalla en la app?
- [ ] SÍ, siempre
- [ ] NO, bloquear capturas (Android)
- [ ] Solo en ciertas pantallas: _______________

---

## 📋 SECCIÓN 11: CONFIGURACIÓN DE USUARIO

### **11.1. Preferencias**

**P64.** ¿Qué ajustes puede cambiar el usuario en Configuración?

| Ajuste | ¿Permitir? |
|--------|-----------|
| Idioma (Español, Inglés, Catalán, etc.) | ☐ |
| Tema (Claro, Oscuro, Automático) | ☐ |
| Tamaño de fuente (Pequeño, Normal, Grande) | ☐ |
| Notificaciones (Activar/Desactivar) | ☐ |
| Sonido de notificaciones | ☐ |
| Vibración | ☐ |
| Biometría (Huella/Face ID) | ☐ |
| Recordar sesión | ☐ |
| Mostrar precio con IVA | ☐ |
| Otro: _______________ | ☐ |

**P65.** ¿Idiomas que soportará la app?
- [ ] Solo Español
- [ ] Español + Catalán
- [ ] Español + Inglés
- [ ] Español + Catalán + Inglés
- [ ] Otro: _______________

**P66.** ¿Tema oscuro/claro?
- [ ] Solo tema claro
- [ ] Solo tema oscuro
- [ ] Ambos (usuario elige)
- [ ] Automático según hora del día

---

## 📋 SECCIÓN 12: ACTUALIZACIONES DE LA APP

### **12.1. Versiones y Updates**

**P67.** ¿Qué hacer cuando hay una NUEVA VERSIÓN disponible?
- [ ] Forzar actualización (no dejar usar hasta actualizar)
- [ ] Sugerir actualización (modal con "Actualizar" y "Después")
- [ ] Notificación silenciosa (badge en configuración)
- [ ] No avisar (actualización manual desde store)

**P68.** ¿Mostrar CHANGELOG (novedades) después de actualizar?
- [ ] SÍ, siempre
- [ ] SÍ, solo si son cambios importantes
- [ ] NO

**P69.** ¿Versionado de API? (Si backend cambia, ¿app debe actualizar?)
```
Ejemplo: API v1, v2, v3...
```
- [ ] SÍ, versionar API
- [ ] NO, mantener retrocompatibilidad

---

## 📋 SECCIÓN 13: ANALYTICS Y TRACKING

### **13.1. Analítica de Uso**

**P70.** ¿Quieres rastrear el uso de la app para analítica?
- [ ] SÍ
- [ ] NO (por privacidad)

**P71.** Si SÍ, ¿qué herramienta usar?
- [ ] Google Analytics
- [ ] Firebase Analytics
- [ ] Mixpanel
- [ ] Amplitude
- [ ] PostHog (open source)
- [ ] Otra: _______________

**P72.** ¿Qué eventos rastrear?

| Evento | ¿Rastrear? |
|--------|-----------|
| App abierta | ☐ |
| Login exitoso/fallido | ☐ |
| Registro de usuario | ☐ |
| Pedido creado | ☐ |
| Producto añadido al carrito | ☐ |
| Pago completado | ☐ |
| Pantalla visitada | ☐ |
| Fichaje entrada/salida | ☐ |
| Error en la app | ☐ |
| Otro: _______________ | ☐ |

**P73.** ¿Crash reporting? (Detectar cuando la app se cierra inesperadamente)
- [ ] SÍ - Con Sentry
- [ ] SÍ - Con Firebase Crashlytics
- [ ] SÍ - Con Bugsnag
- [ ] NO

---

## 📋 SECCIÓN 14: INTEGRACIÓN CON SERVICIOS EXTERNOS

### **14.1. Servicios de Terceros**

**P74.** ¿Integrar con servicios de pago dentro de la app?
- [ ] SÍ - Stripe
- [ ] SÍ - PayPal
- [ ] SÍ - Redsys (España)
- [ ] SÍ - Otro: _______________
- [ ] NO, pagos solo en efectivo/terminal físico

**P75.** ¿Integrar con servicios de mensajería?
- [ ] SÍ - WhatsApp Business (para soporte)
- [ ] SÍ - Telegram
- [ ] SÍ - Intercom (chat en vivo)
- [ ] NO

**P76.** ¿Integrar con servicios de mapas?
- [ ] SÍ - Google Maps
- [ ] SÍ - Apple Maps
- [ ] SÍ - OpenStreetMap
- [ ] NO

**P77.** ¿Integrar con calendarios externos?
- [ ] SÍ - Google Calendar
- [ ] SÍ - Apple Calendar
- [ ] SÍ - Outlook
- [ ] NO

---

## 📋 SECCIÓN 15: CARACTERÍSTICAS ESPECIALES MÓVILES

### **15.1. Gestos y Comportamientos**

**P78.** ¿Qué gestos táctiles quieres soportar?

| Gesto | ¿Soportar? | ¿Dónde? |
|-------|-----------|---------|
| Deslizar para refrescar (pull to refresh) | ☐ | Listas de pedidos, productos, etc. |
| Deslizar para eliminar | ☐ | Notificaciones, carrito |
| Deslizar entre pestañas | ☐ | Dashboard, configuración |
| Mantener pulsado para opciones | ☐ | Productos, pedidos |
| Pellizcar para zoom | ☐ | Imágenes de productos |
| Shake para deshacer | ☐ | Acciones recientes |
| Otro: _______________ | ☐ | _______________ |

**P79.** ¿Feedback háptico (vibración al tocar)?
- [ ] SÍ, en todas las interacciones importantes
- [ ] SÍ, solo en confirmaciones/errores
- [ ] NO

**P80.** ¿Orientación de la app?
- [ ] Solo vertical (Portrait)
- [ ] Solo horizontal (Landscape)
- [ ] Ambas (rotación libre)
- [ ] Depende de la pantalla: _______________

### **15.2. Widgets (iOS/Android)**

**P81.** ¿Quieres widgets en la pantalla de inicio del teléfono?
```
Ejemplo: Widget que muestra pedidos activos, ventas del día, etc.
```
- [ ] SÍ
- [ ] NO (por ahora)

**P82.** Si SÍ, ¿qué información mostrar en los widgets?

**Widget pequeño (2x2):**
- [ ] Número de pedidos activos
- [ ] Ventas del día
- [ ] Próximo fichaje
- [ ] Otro: _______________

**Widget mediano (4x2):**
- [ ] Lista de pedidos activos
- [ ] KPIs del día
- [ ] Próximas tareas
- [ ] Otro: _______________

**Widget grande (4x4):**
- [ ] Dashboard completo
- [ ] Gráfica de ventas
- [ ] Lista de empleados fichados
- [ ] Otro: _______________

---

## 📋 SECCIÓN 16: COMPATIBILIDAD Y REQUISITOS

### **16.1. Versiones Mínimas**

**P83.** ¿Versión mínima de Android a soportar?
- [ ] Android 10 (API 29) - Recomendado
- [ ] Android 11 (API 30)
- [ ] Android 12 (API 31)
- [ ] Android 13 (API 33)

**P84.** ¿Versión mínima de iOS a soportar?
- [ ] iOS 13
- [ ] iOS 14
- [ ] iOS 15 - Recomendado
- [ ] iOS 16

**P85.** ¿Soportar tablets?
- [ ] SÍ, diseño específico para tablets
- [ ] SÍ, pero mismo diseño que móvil (responsive)
- [ ] NO, solo smartphones

---

## 📋 SECCIÓN 17: INFORMACIÓN DE PUBLICACIÓN

### **17.1. App Store y Google Play**

**P86.** Información para las tiendas de apps:

**Nombre de la app en Store:**
```
_______________________________________________
(Máximo 30 caracteres)
```

**Descripción corta:**
```
_______________________________________________
(Máximo 80 caracteres)
```

**Descripción larga:**
```
_______________________________________________
_______________________________________________
_______________________________________________
(Máximo 4000 caracteres)
```

**Categoría de la app:**
- [ ] Negocios
- [ ] Productividad
- [ ] Comida y bebida
- [ ] Estilo de vida
- [ ] Otra: _______________

**Palabras clave (SEO de la app store):**
```
Ejemplo: tpv, restaurante, punto de venta, hostelería, pedidos
_______________________________________________
```

**Clasificación de edad:**
- [ ] 4+ (Para todos)
- [ ] 9+ (Mayores de 9 años)
- [ ] 12+ (Mayores de 12 años)
- [ ] 17+ (Mayores de 17 años)

**P87.** ¿Capturas de pantalla para la tienda?
- [ ] Tengo capturas listas
- [ ] Necesito que las generes del diseño actual
- [ ] Las haré después

---

## 📋 SECCIÓN 18: BACKEND Y API

### **18.1. Configuración de API**

**P88.** URL base de tu API:
```
Producción: _______________________________________________
Staging/Testing: _______________________________________________
Desarrollo: _______________________________________________
```

**P89.** ¿Sistema de notificaciones push?
- [ ] Firebase Cloud Messaging (FCM) - Recomendado
- [ ] OneSignal
- [ ] Pusher
- [ ] Otro: _______________

**P90.** ¿Provider de OAuth ya configurado?
- [ ] SÍ, Google: Client ID = _______________
- [ ] SÍ, Facebook: App ID = _______________
- [ ] SÍ, Apple: Team ID = _______________
- [ ] NO, necesito ayuda para configurar

---

## 📋 SECCIÓN 19: CASOS ESPECIALES

### **19.1. Escenarios Edge Cases**

**P91.** ¿Qué hacer si el usuario NO tiene conexión al intentar fichar?
- [ ] Guardar localmente y sincronizar cuando haya conexión
- [ ] Mostrar error y no permitir fichar
- [ ] Otro: _______________

**P92.** ¿Qué hacer si el pedido falla al enviarse?
- [ ] Guardar en cola y reintentar automáticamente
- [ ] Mostrar error y permitir reenviar manualmente
- [ ] Otro: _______________

**P93.** ¿Límite de tiempo para editar un pedido después de crearlo?
- [ ] No se puede editar (solo cancelar)
- [ ] ___ minutos después de creado
- [ ] Hasta que cambie de estado (ej: de "pendiente" a "preparando")

**P94.** ¿Qué hacer si el token JWT expira mientras usa la app?
- [ ] Refrescar automáticamente en segundo plano
- [ ] Cerrar sesión y pedir login de nuevo
- [ ] Mostrar modal de "Sesión expirada, iniciar sesión"

---

## 📋 SECCIÓN 20: PRIORIDADES Y FASES

### **20.1. Orden de Implementación**

**P95.** Prioriza las funcionalidades (1 = más importante, 10 = menos importante):

```
___ Login con email/password
___ Login con Google/Facebook/Apple
___ Biometría (huella/Face ID)
___ Push notifications
___ Modo offline
___ Onboarding/Tutorial
___ Deep linking
___ Widgets
___ Tema oscuro
___ Multi-idioma
```

**P96.** ¿Cuándo necesitas la app lista?
- [ ] 2 semanas (MVP básico)
- [ ] 1 mes (completa)
- [ ] 2 meses (completa + pulida)
- [ ] Fecha específica: _______________

---

## ✅ INSTRUCCIONES FINALES

Una vez completes este cuestionario, respóndeme con:

1. **El cuestionario completado** (puedes copiarlo y rellenar)
2. **Logo de la app** (si lo tienes)
3. **Capturas de pantalla** (si las tienes)
4. **Credenciales de OAuth** (si ya las tienes)
5. **URL de la API** (cuando esté lista)

Con esta información crearé:

✅ Sistema de onboarding completo
✅ Gestión de permisos nativos
✅ Push notifications configuradas
✅ Biometría funcional
✅ Modo offline
✅ Deep linking
✅ Splash screen profesional
✅ Todas las conexiones backend preparadas
✅ Configuración de Capacitor lista
✅ Build para Android/iOS

---

**NOTA IMPORTANTE:** No todas las preguntas son obligatorias. Si no estás seguro de alguna, déjala en blanco y usaré valores recomendados por defecto.

---

**FIN DEL CUESTIONARIO** 📋✅

Una vez lo rellenes, dame el visto bueno y empiezo a implementar todo! 🚀
