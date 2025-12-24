#!/bin/bash

# 🧪 Script de Verificación de Optimizaciones - Udar Edge
# Verifica que todas las optimizaciones estén implementadas correctamente

echo ""
echo "🚀 VERIFICACIÓN DE OPTIMIZACIONES - UDAR EDGE"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
TOTAL=0
PASSED=0
FAILED=0

# Función de test
test_check() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        FAILED=$((FAILED + 1))
    fi
}

echo "📋 Verificando archivos modificados..."
echo "--------------------------------------"

# 1. Verificar App.tsx tiene lazy loading
if grep -q "const ClienteDashboard = lazy" App.tsx 2>/dev/null; then
    test_check 0 "App.tsx: Lazy loading de ClienteDashboard"
else
    test_check 1 "App.tsx: Lazy loading de ClienteDashboard"
fi

if grep -q "const TrabajadorDashboard = lazy" App.tsx 2>/dev/null; then
    test_check 0 "App.tsx: Lazy loading de TrabajadorDashboard"
else
    test_check 1 "App.tsx: Lazy loading de TrabajadorDashboard"
fi

if grep -q "const GerenteDashboard = lazy" App.tsx 2>/dev/null; then
    test_check 0 "App.tsx: Lazy loading de GerenteDashboard"
else
    test_check 1 "App.tsx: Lazy loading de GerenteDashboard"
fi

if grep -q "Suspense" App.tsx 2>/dev/null; then
    test_check 0 "App.tsx: Suspense boundaries configurados"
else
    test_check 1 "App.tsx: Suspense boundaries configurados"
fi

# 2. Verificar LoadingFallback existe
if [ -f "components/LoadingFallback.tsx" ]; then
    test_check 0 "LoadingFallback.tsx: Componente creado"
else
    test_check 1 "LoadingFallback.tsx: Componente creado"
fi

# 3. Verificar ClienteDashboard tiene lazy loading de modales
if grep -q "const CestaOverlay = lazy" components/ClienteDashboard.tsx 2>/dev/null; then
    test_check 0 "ClienteDashboard.tsx: Lazy loading de CestaOverlay"
else
    test_check 1 "ClienteDashboard.tsx: Lazy loading de CestaOverlay"
fi

if grep -q "const NuevaCitaModal = lazy" components/ClienteDashboard.tsx 2>/dev/null; then
    test_check 0 "ClienteDashboard.tsx: Lazy loading de NuevaCitaModal"
else
    test_check 1 "ClienteDashboard.tsx: Lazy loading de NuevaCitaModal"
fi

# 4. Verificar GerenteDashboard tiene lazy loading de TPV
if grep -q "const TPV360Master = lazy" components/GerenteDashboard.tsx 2>/dev/null; then
    test_check 0 "GerenteDashboard.tsx: Lazy loading de TPV360Master"
else
    test_check 1 "GerenteDashboard.tsx: Lazy loading de TPV360Master"
fi

if grep -q "const ModalSeleccionTPV = lazy" components/GerenteDashboard.tsx 2>/dev/null; then
    test_check 0 "GerenteDashboard.tsx: Lazy loading de ModalSeleccionTPV"
else
    test_check 1 "GerenteDashboard.tsx: Lazy loading de ModalSeleccionTPV"
fi

# 5. Verificar ImageWithFallback tiene lazy loading nativo
if grep -q "loading = 'lazy'" components/figma/ImageWithFallback.tsx 2>/dev/null; then
    test_check 0 "ImageWithFallback.tsx: Lazy loading nativo de imágenes"
else
    test_check 1 "ImageWithFallback.tsx: Lazy loading nativo de imágenes"
fi

echo ""
echo "📚 Verificando documentación..."
echo "-------------------------------"

# 6. Verificar documentación creada
if [ -f "GUIA_TESTS_FUNCIONALES.md" ]; then
    test_check 0 "GUIA_TESTS_FUNCIONALES.md: Documentación creada"
else
    test_check 1 "GUIA_TESTS_FUNCIONALES.md: Documentación creada"
fi

if [ -f "OPTIMIZACIONES_PERFORMANCE.md" ]; then
    test_check 0 "OPTIMIZACIONES_PERFORMANCE.md: Documentación creada"
else
    test_check 1 "OPTIMIZACIONES_PERFORMANCE.md: Documentación creada"
fi

if [ -f "RESUMEN_IMPLEMENTACION_FINAL.md" ]; then
    test_check 0 "RESUMEN_IMPLEMENTACION_FINAL.md: Documentación creada"
else
    test_check 1 "RESUMEN_IMPLEMENTACION_FINAL.md: Documentación creada"
fi

if [ -f "TEST_INICIO_RAPIDO.md" ]; then
    test_check 0 "TEST_INICIO_RAPIDO.md: Guía de tests rápidos creada"
else
    test_check 1 "TEST_INICIO_RAPIDO.md: Guía de tests rápidos creada"
fi

echo ""
echo "🔍 Verificando que NO existan componentes obsoletos..."
echo "------------------------------------------------------"

# 7. Verificar que componentes obsoletos NO existan
OBSOLETOS=(
    "components/ModalSeleccionMarca.tsx"
    "components/ModalCambiarMarca.tsx"
    "components/ModalNotificacion.tsx"
    "components/ModalSeleccionEmpresa.tsx"
    "components/ModalCrearMarca.tsx"
    "components/ModalGestionPromociones.tsx"
    "components/ModalNotificacionPromo.tsx"
    "components/ModalSuscripcionPlanes.tsx"
    "components/ModalGestionSuscripcion.tsx"
    "components/CestaFlotante.tsx"
    "components/ModalNuevoPedidoProveedor.tsx"
    "components/ModalEditarPedidoProveedor.tsx"
)

OBSOLETOS_COUNT=0
for archivo in "${OBSOLETOS[@]}"; do
    if [ ! -f "$archivo" ]; then
        OBSOLETOS_COUNT=$((OBSOLETOS_COUNT + 1))
    fi
done

if [ $OBSOLETOS_COUNT -eq ${#OBSOLETOS[@]} ]; then
    test_check 0 "Componentes obsoletos: Correctamente eliminados (${#OBSOLETOS[@]})"
else
    test_check 1 "Componentes obsoletos: Algunos aún existen (${OBSOLETOS_COUNT}/${#OBSOLETOS[@]} eliminados)"
fi

echo ""
echo "📦 Verificando compilación..."
echo "-----------------------------"

# 8. Verificar que el proyecto compile
if npm run build > /dev/null 2>&1; then
    test_check 0 "Proyecto: Compila sin errores"
else
    test_check 1 "Proyecto: Error de compilación (ejecutar 'npm run build' para ver detalles)"
fi

echo ""
echo "=============================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=============================================="
echo ""
echo -e "Total de tests: ${YELLOW}$TOTAL${NC}"
echo -e "Tests pasados: ${GREEN}$PASSED${NC}"
echo -e "Tests fallidos: ${RED}$FAILED${NC}"
echo ""

# Calcular porcentaje
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ¡TODAS LAS VERIFICACIONES PASARON! (100%)${NC}"
    echo ""
    echo "🚀 La aplicación está lista para tests funcionales."
    echo "📖 Sigue la guía en: TEST_INICIO_RAPIDO.md"
    echo ""
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  VERIFICACIONES PARCIALES ($PERCENTAGE%)${NC}"
    echo ""
    echo "La mayoría de optimizaciones están implementadas."
    echo "Revisa los tests fallidos arriba."
    echo ""
    exit 1
else
    echo -e "${RED}❌ MÚLTIPLES VERIFICACIONES FALLARON ($PERCENTAGE%)${NC}"
    echo ""
    echo "Se requieren correcciones antes de continuar."
    echo "Revisa los errores arriba."
    echo ""
    exit 2
fi
