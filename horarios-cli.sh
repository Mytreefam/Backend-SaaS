#!/bin/bash

# 🚀 SCRIPT DE GESTIÓN - Web Services de Horarios y Turnos
# Proporciona comandos útiles para interactuar con los endpoints

API_BASE="http://localhost:4000/gerente"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES AUXILIARES
# ============================================

print_header() {
  echo -e "${BLUE}═══════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# ============================================
# 1. OBTENER TODOS LOS HORARIOS
# ============================================

get_all_horarios() {
  print_header "Obtener todos los horarios"
  curl -s "$API_BASE/horarios" | jq .
}

# ============================================
# 2. OBTENER HORARIO POR ID
# ============================================

get_horario_by_id() {
  local id=$1
  if [ -z "$id" ]; then
    print_error "Por favor proporciona el ID del horario: get_horario_by_id <id>"
    return
  fi
  
  print_header "Obtener horario ID: $id"
  curl -s "$API_BASE/horarios/$id" | jq .
}

# ============================================
# 3. CREAR NUEVO HORARIO
# ============================================

create_horario() {
  local nombre=$1
  local lunes=$2
  
  if [ -z "$nombre" ] || [ -z "$lunes" ]; then
    print_error "Uso: create_horario <nombre> <horario (HH:mm-HH:mm)>"
    print_info "Ejemplo: create_horario 'Turno Especial' '09:00-17:00'"
    return
  fi
  
  print_header "Creando horario: $nombre"
  
  curl -s -X POST "$API_BASE/horarios" \
    -H "Content-Type: application/json" \
    -d "{
      \"nombre\": \"$nombre\",
      \"descripcion\": \"Horario personalizado\",
      \"empresaId\": \"EMP-001\",
      \"lunes\": \"$lunes\",
      \"martes\": \"$lunes\",
      \"miercoles\": \"$lunes\",
      \"jueves\": \"$lunes\",
      \"viernes\": \"$lunes\",
      \"sabado\": null,
      \"domingo\": null,
      \"horasSemana\": 40
    }" | jq .
  
  print_success "Horario creado"
}

# ============================================
# 4. ASIGNAR HORARIO A EMPLEADO
# ============================================

assign_horario() {
  local empleado_id=$1
  local horario_id=$2
  local fecha_desde=$3
  
  if [ -z "$empleado_id" ] || [ -z "$horario_id" ] || [ -z "$fecha_desde" ]; then
    print_error "Uso: assign_horario <empleado_id> <horario_id> <fecha_desde (YYYY-MM-DD)>"
    print_info "Ejemplo: assign_horario 19 12 2025-12-19"
    return
  fi
  
  print_header "Asignando horario a empleado"
  print_info "Empleado: $empleado_id, Horario: $horario_id, Desde: $fecha_desde"
  
  curl -s -X POST "$API_BASE/empleados/$empleado_id/horarios" \
    -H "Content-Type: application/json" \
    -d "{
      \"horarioId\": $horario_id,
      \"fechaVigenciaDesde\": \"$fecha_desde\",
      \"fechaVigenciaHasta\": null
    }" | jq .
  
  print_success "Horario asignado"
}

# ============================================
# 5. OBTENER HORARIOS DE UN EMPLEADO
# ============================================

get_empleado_horarios() {
  local empleado_id=$1
  
  if [ -z "$empleado_id" ]; then
    print_error "Por favor proporciona el ID del empleado: get_empleado_horarios <id>"
    return
  fi
  
  print_header "Horarios del empleado $empleado_id"
  curl -s "$API_BASE/empleados/$empleado_id/horarios" | jq .
}

# ============================================
# 6. OBTENER HORARIO ACTUAL DE EMPLEADO
# ============================================

get_empleado_current_horario() {
  local empleado_id=$1
  
  if [ -z "$empleado_id" ]; then
    print_error "Por favor proporciona el ID del empleado: get_empleado_current_horario <id>"
    return
  fi
  
  print_header "Horario vigente del empleado $empleado_id"
  curl -s "$API_BASE/empleados/$empleado_id/horarios/actual" | jq .
}

# ============================================
# 7. CANCELAR ASIGNACIÓN
# ============================================

cancel_assignment() {
  local asignacion_id=$1
  
  if [ -z "$asignacion_id" ]; then
    print_error "Por favor proporciona el ID de la asignación: cancel_assignment <id>"
    return
  fi
  
  print_header "Cancelando asignación $asignacion_id"
  
  curl -s -X PUT "$API_BASE/asignaciones/$asignacion_id/cancelar" \
    -H "Content-Type: application/json" \
    -d '{}' | jq .
  
  print_success "Asignación cancelada"
}

# ============================================
# 8. EJECUTAR SEED
# ============================================

run_seed() {
  print_header "Ejecutando seed de horarios"
  cd "$(dirname "$0")/server" || exit
  node seed-horarios.js
}

# ============================================
# 9. LISTAR EMPLEADOS (ÚTIL PARA REFERENCIAS)
# ============================================

list_empleados() {
  print_header "Listado de empleados disponibles"
  curl -s "$API_BASE/empleados" | jq '.[] | {id, nombre, email, puesto}'
}

# ============================================
# 10. MOSTRAR AYUDA
# ============================================

show_help() {
  cat << EOF

${BLUE}═══════════════════════════════════════════════════════════${NC}
${BLUE}  WEB SERVICES DE HORARIOS Y TURNOS - UDAR DELIVERY 360${NC}
${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}FUNCIONES DISPONIBLES:${NC}

  ${GREEN}Horarios (Plantillas):${NC}
    • get_all_horarios              - Obtener todos los horarios
    • get_horario_by_id <id>        - Obtener horario por ID
    • create_horario <nombre> <horario>
                                    - Crear nuevo horario
      Ejemplo: create_horario "Turno Nocturno" "22:00-06:00"

  ${GREEN}Asignaciones:${NC}
    • assign_horario <emp_id> <hor_id> <fecha>
                                    - Asignar horario a empleado
      Ejemplo: assign_horario 19 12 2025-12-19
    • get_empleado_horarios <id>    - Obtener horarios de empleado
    • get_empleado_current_horario <id>
                                    - Obtener horario vigente actual
    • cancel_assignment <asignacion_id>
                                    - Cancelar asignación

  ${GREEN}Datos y Utilidades:${NC}
    • list_empleados                - Listar empleados disponibles
    • run_seed                      - Ejecutar seed con datos de ejemplo

  ${GREEN}Otros:${NC}
    • show_help                     - Mostrar esta ayuda

${BLUE}═══════════════════════════════════════════════════════════${NC}

${YELLOW}EJEMPLOS DE USO:${NC}

  # Obtener todos los horarios
  get_all_horarios

  # Crear un nuevo horario
  create_horario "Turno Matutino" "06:00-14:00"

  # Asignar el horario 12 al empleado 19 desde 2025-12-19
  assign_horario 19 12 2025-12-19

  # Ver horarios del empleado 19
  get_empleado_horarios 19

  # Ver horario vigente actual del empleado 19
  get_empleado_current_horario 19

  # Listar empleados para obtener IDs
  list_empleados

${BLUE}═══════════════════════════════════════════════════════════${NC}

EOF
}

# ============================================
# MAIN
# ============================================

if [ -z "$1" ] || [ "$1" = "help" ]; then
  show_help
else
  # Llamar la función pasada como argumento
  "$@"
fi
