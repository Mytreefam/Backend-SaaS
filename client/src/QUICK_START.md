# ⚡ Quick Start - Nuevo Cliente en 10 Minutos

Guía express para desplegar Udar Edge para un nuevo cliente.

---

## 🚀 Opción 1: Script Automático (Recomendado)

```bash
# 1. Ejecutar script
chmod +x scripts/create-tenant.sh
./scripts/create-tenant.sh nombre-cliente

# 2. Seguir instrucciones en pantalla
# El script te pedirá:
#   - Email del gerente
#   - Nombre de la empresa
#   - CIF/NIF
#   - Plan (basico/profesional/premium)
#   - etc.

# 3. Ejecutar SQL generado en Supabase
# Ve a: scripts/tenants/nombre-cliente-setup.sql

# 4. Crear usuario en Supabase Auth
# Authentication → Users → Add user

# 5. ¡Listo!
npm run dev
```

**Tiempo estimado:** 5-7 minutos

---

## 📝 Opción 2: Manual

### Paso 1: Configurar .env (1 min)

```bash
cp .env.example .env
# Editar .env con credenciales de Supabase
```

### Paso 2: Configurar Tenant (2 min)

Editar `config/tenant.config.ts`:

```typescript
export const TENANT_MI_CLIENTE: TenantConfig = {
  id: '1',
  slug: 'mi-cliente',
  name: 'Mi Cliente',
  plan: 'profesional',
  // ... resto de config
};

// Activar
export let ACTIVE_TENANT = TENANT_MI_CLIENTE;
```

### Paso 3: Ejecutar SQL (3 min)

En Supabase SQL Editor:

```sql
-- 1. scripts/setup-tenant.sql (estructura)
-- 2. Personalizar con datos del cliente
```

### Paso 4: Probar (1 min)

```bash
npm run dev
```

**Tiempo estimado:** 7-8 minutos

---

## 📚 Documentación Completa

Ver [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) para guía detallada.

---

## 🏗️ Estructura de Archivos Clave

```
udar-edge/
├── .env                          ← Credenciales (copiar de .env.example)
├── config/
│   ├── tenant.config.ts         ← Configuración de clientes
│   ├── features.config.ts       ← Módulos activos por plan
│   └── white-label.config.ts    ← Branding
├── scripts/
│   ├── create-tenant.sh         ← Script automático ⭐
│   ├── setup-tenant.sql         ← SQL base
│   └── seed-demo-data.sql       ← Datos de ejemplo
├── public/clients/
│   └── [tenant-slug]/           ← Logos y assets
└── docs/
    └── DEPLOYMENT_GUIDE.md      ← Guía completa
```

---

## 🎯 Planes Disponibles

| Plan | Archivo Config | Módulos |
|------|----------------|---------|
| **Básico** | `PLAN_BASICO` | TPV + Stock + Clientes |
| **Profesional** | `PLAN_PROFESIONAL` | + Delivery + RRHH + Chats |
| **Premium** | `PLAN_PREMIUM` | TODO + Multiempresa |

Editar en: `config/features.config.ts`

---

## ✅ Checklist Pre-Deploy

- [ ] `.env` configurado con Supabase
- [ ] Tenant creado en `tenant.config.ts`
- [ ] Plan seleccionado en `features.config.ts`
- [ ] SQL ejecutado en Supabase
- [ ] Usuario gerente creado
- [ ] Logo personalizado (opcional)
- [ ] Testeado en local
- [ ] Desplegado en producción

---

## 🆘 Problemas Comunes

### "Invalid Supabase credentials"
```bash
# Verificar .env
cat .env | grep VITE_SUPABASE

# Reiniciar servidor
npm run dev
```

### "Biometric plugin error"
```bash
# Limpiar caché
rm -rf node_modules/.vite .vite dist
npm run dev
```

### "Tenant not found"
```bash
# Verificar tenant activo
grep "ACTIVE_TENANT" config/tenant.config.ts

# O en .env
echo "VITE_TENANT_SLUG=mi-cliente" >> .env
```

---

## 📞 Soporte

- **Guía completa:** [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
- **Documentación:** [INDEX_DOCUMENTACION.md](./INDEX_DOCUMENTACION.md)
- **Email:** soporte@udaredge.com

---

## 🎉 Siguiente: Personalización

Una vez funcione:

1. **Personalizar logo** → `public/clients/[tenant]/logo.svg`
2. **Configurar OAuth** → Google, Facebook, Apple
3. **Añadir productos** → Importar desde Excel
4. **Configurar impresoras** → TPV físico
5. **Integrar contabilidad** → API externa
6. **Deploy móvil** → iOS + Android

Ver [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) para detalles.

---

**¿Listo? Empieza con el script automático** 👇

```bash
./scripts/create-tenant.sh tu-cliente
```
