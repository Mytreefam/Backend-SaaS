# 📄 DOCUMENTACIÓN VERIFACTU

## 🎯 **SISTEMA IMPLEMENTADO**

Se ha implementado un sistema completo de **VeriFactu** según la normativa de la AEAT (Agencia Tributaria Española) para el registro y verificación de facturas electrónicas.

---

## 📦 **ARCHIVOS CREADOS**

### **1. Tipos e Interfaces**
```
/types/verifactu.types.ts
```

**Contiene:**
- ✅ 20+ interfaces TypeScript completas
- ✅ Tipos para facturas, emisor, receptor, líneas
- ✅ Datos VeriFactu (hash, firma, QR)
- ✅ Respuestas AEAT
- ✅ Configuración del sistema
- ✅ Logs y estadísticas

### **2. Servicio VeriFactu**
```
/services/verifactu.service.ts
```

**Funcionalidades:**
- ✅ Generación de hash SHA-256/384/512
- ✅ Encadenamiento criptográfico
- ✅ Generación de ID único VeriFactu
- ✅ Código QR según normativa
- ✅ Firma electrónica (simulada)
- ✅ Generación de XML FacturaE
- ✅ Validación de facturas
- ✅ Envío simulado a AEAT
- ✅ Sistema de logs
- ✅ Estadísticas

### **3. Componente UI**
```
/components/gerente/GestionVeriFactu.tsx
```

**Características:**
- ✅ Panel completo de gestión
- ✅ Listado de facturas
- ✅ Generar VeriFactu desde UI
- ✅ Enviar a AEAT
- ✅ Descargar QR y XML
- ✅ Ver detalles completos
- ✅ Registro de actividad
- ✅ Estadísticas visuales
- ✅ Configuración

---

## 🚀 **CÓMO USAR**

### **PASO 1: Instalar dependencias**

```bash
npm install qrcode crypto-js @xmldom/xmldom
```

### **PASO 2: Importar el servicio**

```typescript
import verifactuService from './services/verifactu.service';
import { FacturaVeriFactu } from './types/verifactu.types';
```

### **PASO 3: Crear una factura**

```typescript
const factura: FacturaVeriFactu = {
  id: 'FAC-001',
  serie: '2025',
  numero: '001',
  numeroCompleto: '2025/001',
  fechaExpedicion: new Date(),
  horaExpedicion: '10:30:00',
  tipoFactura: 'F1',
  tipoOperacion: 'venta',
  facturaSimplificada: false,
  facturaSinDestinatario: false,
  
  // Emisor
  emisor: {
    nif: 'B12345678',
    razonSocial: 'Mi Empresa S.L.',
    direccion: {
      tipoVia: 'Calle',
      nombreVia: 'Gran Vía',
      numeroFinca: '45',
      codigoPostal: '28013',
      municipio: 'Madrid',
      provincia: 'Madrid',
      codigoPais: 'ES',
    },
  },
  
  // Receptor
  receptor: {
    tipoIdentificador: 'NIF',
    numeroIdentificador: '12345678A',
    razonSocial: 'Cliente S.L.',
    codigoPais: 'ES',
  },
  
  // Líneas
  lineas: [
    {
      numeroLinea: 1,
      descripcion: 'Producto 1',
      cantidad: 2,
      unidad: 'ud',
      precioUnitario: 10,
      descuento: 0,
      tipoIVA: 21,
      importeIVA: 4.2,
      baseImponible: 20,
      importeTotal: 24.2,
    },
  ],
  
  // Desglose IVA
  desgloseIVA: [
    {
      tipoIVA: 21,
      baseImponible: 20,
      cuotaIVA: 4.2,
    },
  ],
  
  // Totales
  baseImponibleTotal: 20,
  cuotaIVATotal: 4.2,
  importeTotal: 24.2,
};
```

### **PASO 4: Generar VeriFactu**

```typescript
// Generar todos los datos VeriFactu
const facturaConVeriFactu = await verifactuService.generarVeriFactu(factura);

console.log('Hash generado:', facturaConVeriFactu.verifactu?.hash);
console.log('QR generado:', facturaConVeriFactu.verifactu?.codigoQR);
console.log('ID VeriFactu:', facturaConVeriFactu.verifactu?.idVeriFactu);
```

### **PASO 5: Enviar a AEAT**

```typescript
// Enviar a AEAT (simulado en desarrollo)
const resultado = await verifactuService.enviarAEAT(facturaConVeriFactu);

if (resultado.exito) {
  console.log('Factura aceptada por AEAT');
  console.log('CSV:', facturaConVeriFactu.verifactu?.csvEnvio);
} else {
  console.error('Factura rechazada:', resultado.mensaje);
}
```

---

## 🔧 **CONFIGURACIÓN**

### **Configuración básica:**

```typescript
verifactuService.actualizarConfiguracion({
  nifEmpresa: 'B12345678',
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  algoritmoHash: 'SHA-256',
  modoProduccion: false, // true para producción real
});
```

### **Configuración avanzada (con certificado):**

```typescript
verifactuService.actualizarConfiguracion({
  nifEmpresa: 'B12345678',
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  algoritmoHash: 'SHA-256',
  algoritmoFirma: 'RSA-SHA256',
  modoProduccion: true,
  certificado: {
    archivo: certificadoArrayBuffer,
    password: 'password-certificado',
    emisor: 'FNMT',
    titular: 'Mi Empresa S.L.',
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2027-01-01'),
    valido: true,
  },
});
```

---

## 📊 **CARACTERÍSTICAS IMPLEMENTADAS**

### **✅ Generación de Hash**

- Algoritmos soportados: SHA-256, SHA-384, SHA-512
- Cadena de hash según normativa AEAT
- Incluye: NIF, número factura, fecha, importes
- Hash en mayúsculas (hexadecimal)

### **✅ Encadenamiento**

- Cada factura incluye el hash de la anterior
- Previene modificación de facturas previas
- Cadena criptográfica inmutable

### **✅ Código QR**

- Generado según especificaciones AEAT
- Formato PNG en base64
- Tamaño 300x300px
- Error correction level M
- Contiene URL de verificación pública

### **✅ Firma Electrónica (Simulada)**

- Soporte para certificado digital
- Algoritmos: RSA-SHA256, ECDSA-SHA256
- Firma en formato Base64
- NOTA: En producción usar Web Crypto API real

### **✅ XML FacturaE**

- Formato según normativa FacturaE 3.2.2
- Incluye todos los datos requeridos
- Extensión VeriFactu
- XML bien formado y validado

### **✅ Validación**

- Validación de NIF/CIF
- Validación de importes
- Validación de desglose IVA
- Validación de líneas
- Errores descriptivos

### **✅ Logs y Auditoría**

- Registro de todas las operaciones
- Timestamps precisos
- Almacenamiento en localStorage
- Últimos 100 logs

### **✅ Estadísticas**

- Total de facturas
- Facturas firmadas
- Facturas enviadas
- Facturas validadas
- Facturas rechazadas
- Persistencia en localStorage

---

## 🎨 **INTEGRACIÓN CON LA UI**

### **Agregar al Dashboard de Gerente:**

```typescript
// En GerenteDashboard.tsx

import { GestionVeriFactu } from './gerente/GestionVeriFactu';

// Añadir caso en el switch:
case 'verifactu':
  return <GestionVeriFactu />;
```

### **Agregar al menú de navegación:**

```typescript
// En el array de navegación:
{
  id: 'verifactu',
  label: 'VeriFactu',
  icon: Shield,
  description: 'Sistema de facturación electrónica',
}
```

---

## 🔐 **SEGURIDAD**

### **Datos sensibles:**

⚠️ **IMPORTANTE:**
- Los certificados digitales NUNCA se deben enviar al frontend
- La firma real debe hacerse en el backend
- Los passwords de certificados deben estar en variables de entorno
- En producción, usar HSM (Hardware Security Module) si es posible

### **Modo desarrollo vs producción:**

```typescript
// DESARROLLO (actual)
modoProduccion: false
- Usa firma simulada
- Envío simulado a AEAT
- Validación local
- Sin certificado real necesario

// PRODUCCIÓN (futuro)
modoProduccion: true
- Requiere certificado digital válido
- Conexión real con AEAT
- Validación en servidor AEAT
- Cumplimiento normativa completa
```

---

## 🌐 **CONEXIÓN REAL CON AEAT (PRODUCCIÓN)**

### **Endpoints oficiales AEAT:**

```typescript
// Para implementar en producción:

const AEAT_ENDPOINTS = {
  produccion: 'https://www2.agenciatributaria.gob.es/wlpl/SSAC-FACT',
  pruebas: 'https://prewww2.aeat.es/wlpl/SSAC-FACT',
};

// Envío real a AEAT:
async function enviarAEATReal(xml: string) {
  const response = await fetch(AEAT_ENDPOINTS.produccion, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      // Certificado en headers
    },
    body: xml,
  });
  
  return await response.text();
}
```

### **Certificado digital:**

Para producción necesitas:
1. **Certificado digital** emitido por FNMT o autoridad certificadora
2. **Formato:** .p12 o .pfx
3. **Instalación:** En el servidor backend (NO en frontend)
4. **Uso:** Para firmar XML antes de enviar a AEAT

---

## 📋 **EJEMPLO COMPLETO DE USO**

```typescript
import verifactuService from './services/verifactu.service';
import { toast } from 'sonner';

// 1. Configurar el servicio
verifactuService.actualizarConfiguracion({
  nifEmpresa: 'B12345678',
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  modoProduccion: false,
});

// 2. Crear factura desde pedido
const factura = crearFacturaDesdepedido(pedido);

// 3. Generar VeriFactu
try {
  const facturaConVeriFactu = await verifactuService.generarVeriFactu(factura);
  
  toast.success('VeriFactu generado', {
    description: `Hash: ${facturaConVeriFactu.verifactu?.hash.substring(0, 16)}...`,
  });
  
  // 4. Enviar a AEAT
  const resultado = await verifactuService.enviarAEAT(facturaConVeriFactu);
  
  if (resultado.exito) {
    toast.success('Factura registrada en AEAT');
    
    // 5. Guardar en Supabase
    await supabase.from('facturas').insert({
      id: facturaConVeriFactu.id,
      numero_factura: facturaConVeriFactu.numeroCompleto,
      verifactu_hash: facturaConVeriFactu.verifactu?.hash,
      verifactu_qr: facturaConVeriFactu.verifactu?.codigoQR,
      verifactu_csv: facturaConVeriFactu.verifactu?.csvEnvio,
      // ... otros campos
    });
    
  } else {
    toast.error('Error en AEAT', {
      description: resultado.mensaje,
    });
  }
  
} catch (error) {
  toast.error('Error generando VeriFactu', {
    description: String(error),
  });
}
```

---

## 📊 **ESTADÍSTICAS Y CONSULTAS**

```typescript
// Obtener estadísticas
const stats = verifactuService.obtenerEstadisticas();
console.log('Total facturas:', stats.totalFacturas);
console.log('Facturas validadas:', stats.facturasValidadas);

// Obtener logs
const logs = verifactuService.obtenerLogs(50);
logs.forEach(log => {
  console.log(`${log.fecha}: ${log.detalles}`);
});

// Obtener configuración actual
const config = verifactuService.obtenerConfiguracion();
console.log('Modo:', config.modoProduccion ? 'Producción' : 'Pruebas');
console.log('Algoritmo hash:', config.algoritmoHash);
```

---

## 🔄 **INTEGRACIÓN CON SUPABASE**

### **Tabla en Supabase:**

```sql
-- Añadir campos VeriFactu a la tabla facturas

ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_id VARCHAR(255);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_hash TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_hash_anterior TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_qr TEXT; -- base64
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_url TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_firma TEXT;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_estado VARCHAR(50);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_csv VARCHAR(255);
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_fecha_envio TIMESTAMP;
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS verifactu_respuesta_aeat JSONB;

-- Índices
CREATE INDEX IF NOT EXISTS idx_facturas_verifactu_hash ON facturas(verifactu_hash);
CREATE INDEX IF NOT EXISTS idx_facturas_verifactu_estado ON facturas(verifactu_estado);
```

### **Guardar en Supabase:**

```typescript
async function guardarFacturaConVeriFactu(factura: FacturaVeriFactu) {
  const { data, error } = await supabase
    .from('facturas')
    .insert({
      factura_id: factura.id,
      numero_factura: factura.numeroCompleto,
      fecha_factura: factura.fechaExpedicion,
      importe_total: factura.importeTotal,
      
      // Datos VeriFactu
      verifactu_id: factura.verifactu?.idVeriFactu,
      verifactu_hash: factura.verifactu?.hash,
      verifactu_hash_anterior: factura.verifactu?.hashFacturaAnterior,
      verifactu_qr: factura.verifactu?.codigoQR,
      verifactu_url: factura.verifactu?.urlQR,
      verifactu_firma: factura.verifactu?.firma,
      verifactu_estado: factura.verifactu?.estado,
      verifactu_csv: factura.verifactu?.csvEnvio,
      verifactu_fecha_envio: factura.verifactu?.fechaEnvio,
      verifactu_respuesta_aeat: factura.verifactu?.respuestaAEAT,
    });
  
  if (error) throw error;
  return data;
}
```

---

## 🧪 **TESTING**

### **Probar generación de hash:**

```typescript
const facturaPrueba = { /* ... */ };
const facturaConHash = await verifactuService.generarVeriFactu(facturaPrueba);

console.assert(facturaConHash.verifactu?.hash.length === 64, 'Hash SHA-256 debe tener 64 caracteres');
console.assert(/^[A-F0-9]+$/.test(facturaConHash.verifactu?.hash || ''), 'Hash debe ser hexadecimal');
```

### **Probar encadenamiento:**

```typescript
const factura1 = await verifactuService.generarVeriFactu(facturaPrueba1);
const factura2 = await verifactuService.generarVeriFactu(facturaPrueba2);

console.assert(
  factura2.verifactu?.hashFacturaAnterior === factura1.verifactu?.hash,
  'El hash anterior de la factura 2 debe coincidir con el hash de la factura 1'
);
```

---

## 📚 **RECURSOS Y NORMATIVA**

### **Documentación oficial:**

- [Web oficial VeriFactu AEAT](https://sede.agenciatributaria.gob.es/)
- [Normativa FacturaE](https://www.facturae.gob.es/)
- [Especificaciones técnicas](https://www.agenciatributaria.es/AEAT.internet/Inicio/_Segmentos_/Empresas_y_profesionales/Novedades_calendario/Novedades_2024/Verifactu.shtml)

### **Leyes y regulaciones:**

- Real Decreto XXX/2024 sobre facturación electrónica
- Orden XXX/2024 VeriFactu
- Ley General Tributaria

---

## ✅ **CHECKLIST IMPLEMENTACIÓN**

### **Desarrollo (✅ Completado):**
- ✅ Tipos TypeScript
- ✅ Servicio VeriFactu
- ✅ Generación de hash
- ✅ Encadenamiento
- ✅ Código QR
- ✅ XML FacturaE
- ✅ Validación
- ✅ Logs
- ✅ Estadísticas
- ✅ Componente UI
- ✅ Simulación AEAT

### **Producción (⏳ Pendiente):**
- ❌ Certificado digital real
- ❌ Firma electrónica real
- ❌ Conexión AEAT real
- ❌ Integración Supabase
- ❌ Almacenamiento seguro
- ❌ Backup de facturas
- ❌ Testing completo
- ❌ Documentación AEAT

---

## 🚀 **PRÓXIMOS PASOS**

### **Fase 1: Backend (Prioridad Alta)**
1. Configurar Supabase con tablas VeriFactu
2. Crear API endpoints para facturas
3. Implementar almacenamiento seguro

### **Fase 2: Certificado Digital (Prioridad Alta)**
1. Obtener certificado digital válido
2. Implementar firma real en backend
3. Configurar HSM si es necesario

### **Fase 3: Conexión AEAT (Prioridad Alta)**
1. Configurar entorno de pruebas AEAT
2. Implementar cliente HTTP real
3. Probar envíos en sandbox
4. Pasar a producción

### **Fase 4: Integraciones (Prioridad Media)**
1. Conectar con módulo de pedidos
2. Generación automática de facturas
3. Envío automático de emails
4. Descarga de PDFs

---

## 📞 **SOPORTE**

Si tienes dudas sobre la implementación:
1. Revisa esta documentación
2. Consulta los comentarios en el código
3. Revisa los tipos TypeScript (son autodocumentados)
4. Consulta la documentación oficial de AEAT

---

**Última actualización:** 28 Noviembre 2025  
**Versión:** 1.0.0  
**Estado:** Sistema base implementado ✅
