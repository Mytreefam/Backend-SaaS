#!/bin/bash

# Script para verificar que todos los imports de native-biometric están comentados

echo "🔍 Verificando imports de @capacitor-community/native-biometric..."
echo ""

# Buscar líneas con el import que NO estén comentadas
UNCOMMENTED=$(grep -n "import('@capacitor-community/native-biometric')" services/oauth.service.ts | grep -v "^\s*//" | grep -v "^\s*/\*")

if [ -z "$UNCOMMENTED" ]; then
    echo "✅ TODOS los imports están comentados correctamente"
    echo ""
    echo "Total de referencias (todas comentadas):"
    grep -c "import('@capacitor-community/native-biometric')" services/oauth.service.ts
else
    echo "❌ ENCONTRADOS imports sin comentar:"
    echo "$UNCOMMENTED"
    exit 1
fi

echo ""
echo "📝 Referencias encontradas (dentro de comentarios):"
grep -n "import('@capacitor-community/native-biometric')" services/oauth.service.ts

echo ""
echo "✅ El archivo está listo para compilar"
