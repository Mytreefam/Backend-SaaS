#!/bin/bash

# ============================================================================
# UDAR EDGE - SCRIPT DE CREACIÓN AUTOMÁTICA DE TENANT
# ============================================================================
# Automatiza la creación de un nuevo cliente/tenant
# Uso: ./scripts/create-tenant.sh nombre-cliente
# ============================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   _   _ ____    _    ____    _____ ____   ____ _____     ║
║  | | | |  _ \  / \  |  _ \  | ____|  _ \ / ___| ____|    ║
║  | | | | | | |/ _ \ | |_) | |  _| | | | | |  _|  _|      ║
║  | |_| | |_| / ___ \|  _ <  | |___| |_| | |_| | |___     ║
║   \___/|____/_/   \_\_| \_\ |_____|____/ \____|_____|    ║
║                                                           ║
║            🚀 Creador Automático de Tenants              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================================================
# VALIDACIONES
# ============================================================================

if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Debes proporcionar un nombre de tenant${NC}"
  echo -e "${YELLOW}Uso: ./scripts/create-tenant.sh nombre-cliente${NC}"
  echo ""
  echo "Ejemplo:"
  echo "  ./scripts/create-tenant.sh restaurante-xyz"
  exit 1
fi

TENANT_SLUG="$1"
TENANT_NAME=$(echo "$TENANT_SLUG" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')

echo -e "${BLUE}📋 Información del tenant:${NC}"
echo "  Slug: $TENANT_SLUG"
echo "  Nombre: $TENANT_NAME"
echo ""

# ============================================================================
# PREGUNTAS INTERACTIVAS
# ============================================================================

echo -e "${YELLOW}💬 Por favor, completa la siguiente información:${NC}"
echo ""

read -p "Email del gerente: " GERENTE_EMAIL
read -p "Nombre legal de la empresa: " LEGAL_NAME
read -p "CIF/NIF: " TAX_ID
read -p "Teléfono: " PHONE
read -p "Plan (basico/profesional/premium): " PLAN
read -p "Ciudad: " CITY

echo ""
echo -e "${GREEN}✅ Datos recibidos${NC}"
echo ""

# ============================================================================
# CONFIRMACIÓN
# ============================================================================

echo -e "${YELLOW}📝 Resumen:${NC}"
echo "  Tenant: $TENANT_NAME ($TENANT_SLUG)"
echo "  Email gerente: $GERENTE_EMAIL"
echo "  Empresa: $LEGAL_NAME"
echo "  CIF: $TAX_ID"
echo "  Plan: $PLAN"
echo ""

read -p "¿Continuar? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo -e "${RED}❌ Cancelado${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}🚀 Iniciando creación del tenant...${NC}"
echo ""

# ============================================================================
# 1. CREAR CARPETA DEL CLIENTE
# ============================================================================

echo -e "${BLUE}📁 [1/6] Creando estructura de archivos...${NC}"

TENANT_DIR="public/clients/$TENANT_SLUG"
mkdir -p "$TENANT_DIR"

# Copiar logo placeholder
if [ -f "public/logo-udar-edge.svg" ]; then
  cp "public/logo-udar-edge.svg" "$TENANT_DIR/logo.svg"
fi

if [ -f "public/favicon.ico" ]; then
  cp "public/favicon.ico" "$TENANT_DIR/favicon.ico"
fi

echo -e "${GREEN}✅ Estructura creada en $TENANT_DIR${NC}"
echo ""

# ============================================================================
# 2. GENERAR ARCHIVO DE TENANT
# ============================================================================

echo -e "${BLUE}📝 [2/6] Generando configuración de tenant...${NC}"

TENANT_CONFIG_FILE="config/tenants/${TENANT_SLUG}.config.ts"
mkdir -p "config/tenants"

cat > "$TENANT_CONFIG_FILE" << EOF
/**
 * Configuración de tenant: $TENANT_NAME
 * Generado automáticamente el $(date +%Y-%m-%d)
 */

import { TenantConfig } from '../tenant.config';

export const TENANT_${TENANT_SLUG^^}: TenantConfig = {
  id: '${TENANT_SLUG}',
  slug: '${TENANT_SLUG}',
  name: '${TENANT_NAME}',
  legalName: '${LEGAL_NAME}',
  taxId: '${TAX_ID}',
  
  plan: '${PLAN}',
  billingCycle: 'monthly',
  subscriptionStatus: 'trial',
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  
  branding: {
    logo: '/clients/${TENANT_SLUG}/logo.svg',
    favicon: '/clients/${TENANT_SLUG}/favicon.ico',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    accentColor: '#2dd4bf',
  },
  
  contact: {
    email: '${GERENTE_EMAIL}',
    phone: '${PHONE}',
    address: {
      street: '',
      city: '${CITY}',
      state: '',
      postalCode: '',
      country: 'España',
    },
  },
  
  locale: {
    language: 'es',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  
  business: {
    type: 'restaurant',
    industry: 'Restauración',
    employees: 0,
    locations: 1,
  },
  
  modules: {},
  moduleSettings: {},
  integrations: {},
  
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'script',
    onboardingCompleted: false,
    notes: 'Tenant creado automáticamente con create-tenant.sh',
  },
};

export default TENANT_${TENANT_SLUG^^};
EOF

echo -e "${GREEN}✅ Configuración generada en $TENANT_CONFIG_FILE${NC}"
echo ""

# ============================================================================
# 3. GENERAR SQL
# ============================================================================

echo -e "${BLUE}🗄️  [3/6] Generando script SQL...${NC}"

SQL_FILE="scripts/tenants/${TENANT_SLUG}-setup.sql"
mkdir -p "scripts/tenants"

cat > "$SQL_FILE" << EOF
-- ============================================================================
-- TENANT: $TENANT_NAME
-- Generado: $(date +%Y-%m-%d)
-- ============================================================================

-- Crear empresa
INSERT INTO empresas (
  nombre,
  nombre_legal,
  cif,
  email,
  telefono,
  ciudad,
  plan,
  estado,
  config
) VALUES (
  '${TENANT_NAME}',
  '${LEGAL_NAME}',
  '${TAX_ID}',
  '${GERENTE_EMAIL}',
  '${PHONE}',
  '${CITY}',
  '${PLAN}',
  'activo',
  '{
    "branding": {
      "logo": "/clients/${TENANT_SLUG}/logo.svg",
      "primaryColor": "#0d9488"
    },
    "tenant_slug": "${TENANT_SLUG}"
  }'::jsonb
)
RETURNING id;

-- NOTA: Copia el ID que retorna y úsalo en los siguientes pasos
-- O ejecuta el resto del script setup-tenant.sql reemplazando empresa_id

RAISE NOTICE '✅ Empresa creada. Ahora:';
RAISE NOTICE '1. Copia el ID de la empresa';
RAISE NOTICE '2. Crea el usuario gerente en Supabase Auth';
RAISE NOTICE '3. Ejecuta el resto de setup-tenant.sql';
EOF

echo -e "${GREEN}✅ SQL generado en $SQL_FILE${NC}"
echo ""

# ============================================================================
# 4. ACTUALIZAR .ENV
# ============================================================================

echo -e "${BLUE}⚙️  [4/6] Configurando variables de entorno...${NC}"

# Backup .env
if [ -f ".env" ]; then
  cp .env .env.backup.$(date +%Y%m%d%H%M%S)
fi

# Actualizar VITE_TENANT_SLUG
if grep -q "VITE_TENANT_SLUG" .env 2>/dev/null; then
  sed -i.bak "s/VITE_TENANT_SLUG=.*/VITE_TENANT_SLUG=${TENANT_SLUG}/" .env
else
  echo "VITE_TENANT_SLUG=${TENANT_SLUG}" >> .env
fi

echo -e "${GREEN}✅ .env actualizado${NC}"
echo ""

# ============================================================================
# 5. CREAR README DEL TENANT
# ============================================================================

echo -e "${BLUE}📄 [5/6] Creando documentación...${NC}"

README_FILE="docs/tenants/${TENANT_SLUG}.md"
mkdir -p "docs/tenants"

cat > "$README_FILE" << EOF
# $TENANT_NAME

**Tenant creado:** $(date +%Y-%m-%d)  
**Plan:** $PLAN  
**Estado:** Trial (14 días)

---

## 📋 Información

- **Nombre legal:** $LEGAL_NAME
- **CIF:** $TAX_ID
- **Email:** $GERENTE_EMAIL
- **Teléfono:** $PHONE
- **Ciudad:** $CITY

---

## 🚀 Setup Completado

- [x] Estructura de archivos creada
- [x] Configuración de tenant generada
- [x] Script SQL generado
- [ ] **Ejecutar SQL en Supabase** ⚠️
- [ ] **Crear usuario gerente en Supabase Auth** ⚠️
- [ ] Personalizar logo y branding
- [ ] Configurar OAuth (opcional)
- [ ] Deploy a producción

---

## 📝 Siguientes Pasos

### 1. Ejecutar SQL en Supabase

\`\`\`bash
# Ir a Supabase SQL Editor
# Copiar y ejecutar: scripts/tenants/${TENANT_SLUG}-setup.sql
\`\`\`

### 2. Crear usuario gerente

En Supabase → Authentication → Users → Add user:
- Email: \`${GERENTE_EMAIL}\`
- Password: (generar temporal)
- Auto Confirm: Yes

### 3. Personalizar branding

\`\`\`bash
# Reemplazar archivos en:
public/clients/${TENANT_SLUG}/logo.svg
public/clients/${TENANT_SLUG}/favicon.ico
\`\`\`

### 4. Probar localmente

\`\`\`bash
npm run dev
# Login con ${GERENTE_EMAIL}
\`\`\`

---

## 🔗 Enlaces

- **Dashboard Supabase:** [https://app.supabase.com](https://app.supabase.com)
- **Configuración:** \`config/tenants/${TENANT_SLUG}.config.ts\`
- **SQL Setup:** \`scripts/tenants/${TENANT_SLUG}-setup.sql\`

---

## 📞 Contacto Cliente

- Email: ${GERENTE_EMAIL}
- Teléfono: ${PHONE}

---

## 📅 Fechas Importantes

- **Trial termina:** $(date -d "+14 days" +%Y-%m-%d)
- **Primera factura:** $(date -d "+15 days" +%Y-%m-%d)

---

## ✅ Checklist Pre-Launch

- [ ] Base de datos configurada
- [ ] Usuario gerente creado
- [ ] Logo personalizado
- [ ] Colores corporativos configurados
- [ ] OAuth configurado (si aplica)
- [ ] Push notifications (si aplica)
- [ ] Testing completo
- [ ] Deploy a producción
- [ ] DNS configurado
- [ ] SSL activo
- [ ] Training programado
- [ ] Documentación entregada

EOF

echo -e "${GREEN}✅ Documentación creada en $README_FILE${NC}"
echo ""

# ============================================================================
# 6. RESUMEN FINAL
# ============================================================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   ✅ TENANT CREADO EXITOSAMENTE                           ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Archivos generados:${NC}"
echo ""
echo "  ✅ $TENANT_DIR/"
echo "  ✅ $TENANT_CONFIG_FILE"
echo "  ✅ $SQL_FILE"
echo "  ✅ $README_FILE"
echo "  ✅ .env (actualizado)"
echo ""
echo -e "${YELLOW}🔥 IMPORTANTE - Siguientes pasos manuales:${NC}"
echo ""
echo "  1️⃣  Ejecutar SQL en Supabase:"
echo "     → Ir a Supabase SQL Editor"
echo "     → Copiar y ejecutar: $SQL_FILE"
echo ""
echo "  2️⃣  Crear usuario gerente en Supabase Auth:"
echo "     → Email: $GERENTE_EMAIL"
echo "     → Generar contraseña temporal"
echo ""
echo "  3️⃣  Personalizar logo (opcional):"
echo "     → Reemplazar: $TENANT_DIR/logo.svg"
echo ""
echo "  4️⃣  Probar localmente:"
echo "     → npm run dev"
echo ""
echo "  5️⃣  Ver documentación completa:"
echo "     → cat $README_FILE"
echo ""
echo -e "${GREEN}🎉 ¡Listo para usar!${NC}"
echo ""
