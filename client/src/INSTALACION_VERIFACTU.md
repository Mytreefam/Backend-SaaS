# 🚀 GUÍA DE INSTALACIÓN VERIFACTU

## ✅ **PASO A PASO COMPLETO**

---

## 📦 **1. INSTALAR DEPENDENCIAS**

Ejecuta en la terminal:

```bash
npm install qrcode crypto-js @xmldom/xmldom
```

**¿Qué instala cada paquete?**
- `qrcode` → Generar códigos QR según normativa VeriFactu
- `crypto-js` → Algoritmos de hash (SHA-256, SHA-384, SHA-512)
- `@xmldom/xmldom` → Procesar XML para FacturaE

---

## 📁 **2. VERIFICAR ARCHIVOS CREADOS**

Asegúrate de que existen estos archivos:

```
✅ /types/verifactu.types.ts          (Tipos TypeScript)
✅ /services/verifactu.service.ts     (Servicio principal)
✅ /components/gerente/GestionVeriFactu.tsx  (Componente UI)
✅ /DOCUMENTACION_VERIFACTU.md        (Documentación)
✅ /EJEMPLO_USO_VERIFACTU.tsx         (Ejemplos)
```

---

## 🔧 **3. INTEGRAR EN EL DASHBOARD DE GERENTE**

### **A) Abrir GerenteDashboard.tsx**

```bash
# Abre el archivo
/components/GerenteDashboard.tsx
```

### **B) Importar el componente**

Añade al inicio del archivo:

```typescript
import { GestionVeriFactu } from './gerente/GestionVeriFactu';
```

### **C) Añadir al switch de secciones**

Busca el switch donde se renderizan las secciones y añade:

```typescript
case 'verifactu':
  return <GestionVeriFactu />;
```

### **D) Añadir al menú de navegación**

Busca el array de navegación y añade:

```typescript
{
  id: 'verifactu',
  label: 'VeriFactu',
  icon: Shield, // Asegúrate de importar Shield de lucide-react
  description: 'Sistema de facturación electrónica AEAT',
}
```

---

## 🎨 **4. VERIFICAR IMPORTACIONES**

Asegúrate de que `GerenteDashboard.tsx` tiene estas importaciones:

```typescript
import { Shield } from 'lucide-react'; // Para el icono
import { GestionVeriFactu } from './gerente/GestionVeriFactu';
```

---

## ⚙️ **5. CONFIGURAR EL SERVICIO**

### **A) Configuración básica (automática)**

El servicio ya viene preconfigurado con valores por defecto:

```typescript
{
  nifEmpresa: 'B12345678',            // ⚠️ CAMBIAR
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  algoritmoHash: 'SHA-256',
  modoProduccion: false,              // false = desarrollo
}
```

### **B) Personalizar configuración**

Puedes cambiar la configuración desde la UI o mediante código:

```typescript
// Desde código
import verifactuService from './services/verifactu.service';

verifactuService.actualizarConfiguracion({
  nifEmpresa: 'TU-NIF-REAL',          // ⚠️ Cambia esto
  nombreSistemaInformatico: 'Tu App',
  modoProduccion: false,
});
```

---

## 🧪 **6. PROBAR LA INSTALACIÓN**

### **Método 1: Desde la UI**

1. Ejecuta `npm run dev`
2. Abre la aplicación en el navegador
3. Inicia sesión como **Gerente**
4. Ve a la sección **VeriFactu**
5. Deberías ver:
   - Estadísticas (4 tarjetas)
   - Tabs: Facturas / Registro / Información
   - Facturas de ejemplo
   - Botón "Generar VeriFactu"

### **Método 2: Desde la consola del navegador**

Abre la consola (F12) y ejecuta:

```javascript
// 1. Importar servicio (en el código)
import verifactuService from './services/verifactu.service';

// 2. Ver estadísticas
console.log(verifactuService.obtenerEstadisticas());

// 3. Ver configuración
console.log(verifactuService.obtenerConfiguracion());
```

### **Método 3: Test completo**

Copia este código en un archivo temporal:

```typescript
// test-verifactu.ts
import verifactuService from './services/verifactu.service';
import { FacturaVeriFactu } from './types/verifactu.types';

async function testVeriFactu() {
  console.log('🧪 Iniciando test VeriFactu...\n');
  
  // Crear factura de prueba
  const factura: FacturaVeriFactu = {
    id: 'TEST-001',
    serie: '2025',
    numero: '999',
    numeroCompleto: '2025/999',
    fechaExpedicion: new Date(),
    horaExpedicion: new Date().toTimeString().split(' ')[0],
    tipoFactura: 'F1',
    tipoOperacion: 'venta',
    facturaSimplificada: false,
    facturaSinDestinatario: false,
    emisor: {
      nif: 'B12345678',
      razonSocial: 'Test VeriFactu S.L.',
      direccion: {
        tipoVia: 'Calle',
        nombreVia: 'Prueba',
        numeroFinca: '1',
        codigoPostal: '28001',
        municipio: 'Madrid',
        provincia: 'Madrid',
        codigoPais: 'ES',
      },
    },
    lineas: [
      {
        numeroLinea: 1,
        descripcion: 'Producto Test',
        cantidad: 1,
        unidad: 'ud',
        precioUnitario: 100,
        descuento: 0,
        tipoIVA: 21,
        importeIVA: 21,
        baseImponible: 100,
        importeTotal: 121,
      },
    ],
    desgloseIVA: [
      {
        tipoIVA: 21,
        baseImponible: 100,
        cuotaIVA: 21,
      },
    ],
    baseImponibleTotal: 100,
    cuotaIVATotal: 21,
    importeTotal: 121,
  };
  
  try {
    // 1. Generar VeriFactu
    console.log('1️⃣ Generando VeriFactu...');
    const resultado = await verifactuService.generarVeriFactu(factura);
    console.log('✅ VeriFactu generado');
    console.log('   - Hash:', resultado.verifactu?.hash.substring(0, 32) + '...');
    console.log('   - ID:', resultado.verifactu?.idVeriFactu);
    console.log('   - QR:', resultado.verifactu?.codigoQR ? 'Generado ✅' : 'Error ❌');
    
    // 2. Ver estadísticas
    console.log('\n2️⃣ Estadísticas:');
    const stats = verifactuService.obtenerEstadisticas();
    console.log('   - Total facturas:', stats.totalFacturas);
    console.log('   - Facturas firmadas:', stats.facturasFirmadas);
    
    // 3. Ver logs
    console.log('\n3️⃣ Últimos logs:');
    const logs = verifactuService.obtenerLogs(3);
    logs.forEach(log => {
      console.log(`   - ${log.accion}: ${log.detalles}`);
    });
    
    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ ERROR EN EL TEST:', error);
  }
}

// Ejecutar
testVeriFactu();
```

---

## 🔍 **7. VERIFICAR QUE TODO FUNCIONA**

### **Checklist de verificación:**

```
✅ Las dependencias se instalaron sin errores
✅ Los archivos TypeScript no tienen errores de compilación
✅ El componente GestionVeriFactu aparece en el dashboard
✅ Puedes ver las estadísticas (aunque sean 0)
✅ Puedes generar VeriFactu para una factura de prueba
✅ Se genera un hash SHA-256 de 64 caracteres
✅ Se genera un código QR
✅ Los logs se registran correctamente
✅ Las estadísticas se actualizan
```

---

## ⚠️ **8. SOLUCIÓN DE PROBLEMAS**

### **Error: "Cannot find module 'qrcode'"**

```bash
# Reinstalar dependencias
npm install qrcode crypto-js @xmldom/xmldom
```

### **Error: "Module not found: Can't resolve './gerente/GestionVeriFactu'"**

```bash
# Verificar que existe el archivo
ls components/gerente/GestionVeriFactu.tsx

# Si no existe, copia el archivo de nuevo
```

### **Error: TypeScript "Cannot find type FacturaVeriFactu"**

```typescript
// Asegúrate de importar los tipos:
import { FacturaVeriFactu } from '../types/verifactu.types';
```

### **El componente no aparece en el dashboard**

1. Verifica que añadiste el caso en el switch
2. Verifica que añadiste el item al menú de navegación
3. Verifica que importaste `Shield` de `lucide-react`
4. Recarga la página (Ctrl+R o Cmd+R)

### **El QR no se genera**

```bash
# Verifica que qrcode está instalado
npm list qrcode

# Si no aparece, instálalo:
npm install qrcode
```

---

## 🎯 **9. PRÓXIMOS PASOS**

Una vez instalado y verificado:

### **A) Configurar con tus datos reales**

```typescript
verifactuService.actualizarConfiguracion({
  nifEmpresa: 'TU-NIF',              // ⚠️ Cambiar
  nombreSistemaInformatico: 'Tu App',
  modoProduccion: false,             // Mantener en false por ahora
});
```

### **B) Integrar con tu sistema de pedidos**

Lee el archivo:
```
/EJEMPLO_USO_VERIFACTU.tsx
```

Y adapta los ejemplos a tu flujo de pedidos.

### **C) Conectar con Supabase**

Lee la sección "Integración con Supabase" en:
```
/DOCUMENTACION_VERIFACTU.md
```

### **D) Obtener certificado digital (para producción)**

Cuando estés listo para producción:
1. Obtén un certificado digital de la FNMT
2. Configúralo en el backend (NUNCA en frontend)
3. Cambia `modoProduccion` a `true`

---

## 📊 **10. VERIFICACIÓN FINAL**

Ejecuta estos comandos en la consola del navegador (F12):

```javascript
// 1. Verificar que el servicio está disponible
console.log('Servicio:', typeof verifactuService);  // Debe ser "object"

// 2. Ver configuración actual
console.log('Config:', verifactuService.obtenerConfiguracion());

// 3. Ver estadísticas
console.log('Stats:', verifactuService.obtenerEstadisticas());

// 4. Si todo muestra datos, ¡está funcionando! ✅
```

---

## ✅ **11. INSTALACIÓN COMPLETA**

Si llegaste aquí y todo funciona:

```
🎉 ¡FELICIDADES! 🎉

VeriFactu está correctamente instalado y funcionando.

Ahora puedes:
- Generar facturas VeriFactu
- Ver códigos QR
- Consultar estadísticas
- Ver registro de actividad
- Integrar con tus pedidos

Siguiente paso recomendado:
→ Lee EJEMPLO_USO_VERIFACTU.tsx
→ Adapta los ejemplos a tu código
→ Prueba el flujo completo
```

---

## 📞 **12. SOPORTE**

Si tienes problemas:

1. **Revisa los errores en la consola** (F12 → Console)
2. **Verifica que las dependencias están instaladas**
3. **Lee la documentación completa** en `/DOCUMENTACION_VERIFACTU.md`
4. **Revisa los tipos TypeScript** en `/types/verifactu.types.ts`

---

## 📝 **RESUMEN DE COMANDOS**

```bash
# 1. Instalar dependencias
npm install qrcode crypto-js @xmldom/xmldom

# 2. Verificar instalación
npm list qrcode crypto-js @xmldom/xmldom

# 3. Ejecutar app
npm run dev

# 4. Abrir en navegador
http://localhost:5173
```

---

**Estado:** ✅ Instalación lista  
**Versión:** 1.0.0  
**Fecha:** 28 Noviembre 2025

---

## 🎓 **SIGUIENTES PASOS RECOMENDADOS**

1. ✅ **Instalar** (este archivo)
2. 📖 **Leer documentación** → `/DOCUMENTACION_VERIFACTU.md`
3. 💻 **Ver ejemplos** → `/EJEMPLO_USO_VERIFACTU.tsx`
4. 🔗 **Integrar con pedidos**
5. 💾 **Conectar con Supabase**
6. 🚀 **Preparar para producción**

---

**¿Todo instalado correctamente?**

Ahora ve a: `/EJEMPLO_USO_VERIFACTU.tsx` para ver cómo usarlo 🚀
