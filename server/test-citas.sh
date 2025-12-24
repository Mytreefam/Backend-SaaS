#!/bin/bash

# Script para testing del módulo de Gestión de Citas
# Cambiar la URL base según el entorno

BASE_URL="http://localhost:3000"
CLIENTE_ID=1

echo "🧪 Testing Módulo de Gestión de Citas"
echo "======================================"
echo ""

# 1. Obtener estadísticas
echo "1️⃣  Obtener Estadísticas de Citas"
echo "curl -s $BASE_URL/api/citas/stats | jq"
curl -s "$BASE_URL/api/citas/stats" | jq
echo ""
echo ""

# 2. Obtener todas las citas
echo "2️⃣  Obtener Todas las Citas"
echo "curl -s $BASE_URL/api/citas | jq '.stats'"
curl -s "$BASE_URL/api/citas" | jq '.stats'
echo ""
echo ""

# 3. Obtener citas por estado
echo "3️⃣  Obtener Citas Confirmadas"
echo "curl -s '$BASE_URL/api/citas?estado=confirmada' | jq '.data | length'"
curl -s "$BASE_URL/api/citas?estado=confirmada" | jq '.data | length'
echo " citas confirmadas"
echo ""
echo ""

# 4. Obtener citas completadas
echo "4️⃣  Obtener Citas Completadas"
echo "curl -s '$BASE_URL/api/citas?estado=completada' | jq '.data | length'"
curl -s "$BASE_URL/api/citas?estado=completada" | jq '.data | length'
echo " citas completadas"
echo ""
echo ""

# 5. Crear nueva cita
echo "5️⃣  Crear Nueva Cita"
NEW_CITA=$(curl -s -X POST "$BASE_URL/api/citas" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "hora": "14:30",
    "motivo": "Consulta de Testing",
    "servicio": "Asesoramiento",
    "clienteId": '$CLIENTE_ID',
    "notas": "Cita creada por script de testing"
  }')
echo "$NEW_CITA" | jq '.'
CITA_ID=$(echo "$NEW_CITA" | jq -r '.data.id')
echo ""
echo "✅ Cita creada con ID: $CITA_ID"
echo ""
echo ""

# 6. Obtener cita por ID
echo "6️⃣  Obtener Cita por ID ($CITA_ID)"
curl -s "$BASE_URL/api/citas/$CITA_ID" | jq '.data | {id, motivo, servicio, estado, fecha, hora}'
echo ""
echo ""

# 7. Cambiar estado a confirmada
echo "7️⃣  Cambiar Estado a 'Confirmada'"
curl -s -X PATCH "$BASE_URL/api/citas/$CITA_ID/confirm" | jq '.data | {id, estado}'
echo ""
echo ""

# 8. Cambiar estado a en_progreso
echo "8️⃣  Cambiar Estado a 'En Progreso'"
curl -s -X PATCH "$BASE_URL/api/citas/$CITA_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "en_progreso"
  }' | jq '.data | {id, estado}'
echo ""
echo ""

# 9. Cambiar estado a completada
echo "9️⃣  Cambiar Estado a 'Completada'"
curl -s -X PATCH "$BASE_URL/api/citas/$CITA_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "completada"
  }' | jq '.data | {id, estado}'
echo ""
echo ""

# 10. Obtener citas por mes
echo "🔟 Obtener Citas del Mes Actual"
MES=$(date +%m)
ANIO=$(date +%Y)
echo "curl -s '$BASE_URL/api/citas?mes=$MES&anio=$ANIO' | jq '.data | length'"
curl -s "$BASE_URL/api/citas?mes=$MES&anio=$ANIO" | jq '.data | length'
echo " citas en este mes"
echo ""
echo ""

# 11. Estadísticas finales
echo "📊 Estadísticas Finales"
curl -s "$BASE_URL/api/citas/stats" | jq '.'
echo ""
echo ""

echo "✅ Testing completado"
