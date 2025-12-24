# 📍 ACTUALIZACIÓN DE DIRECCIONES Y CIF - DISARMINK S.L.

**Fecha:** 28 de noviembre de 2025  
**Estado:** ✅ Completado

---

## 🔄 CAMBIOS REALIZADOS

### 1️⃣ DATOS FISCALES DE LA EMPRESA

#### ✅ CIF Actualizado
- **Anterior:** B87654321
- **Nuevo:** **B67284315**

#### ✅ Domicilio Fiscal Actualizado
- **Anterior:** Av. Diagonal 123, 08019 Barcelona
- **Nuevo:** **Avenida Onze Setembre, 1, 08391 Tiana, Barcelona**

---

### 2️⃣ DIRECCIONES DE PUNTOS DE VENTA

#### 🍕 Modomio Tiana [PDV-TIA-MIO]
- **Anterior:** Carrer del Mar 15, Tiana
- **Nuevo:** **Passeig de la Vilesa, 6, 08391 Tiana, Barcelona**

#### 🍕 Modomio Badalona [PDV-BAD-MIO]
- **Anterior:** Av. Martí Pujol 45, Badalona
- **Nuevo:** **Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona**

#### 🍔 Blackburguer Tiana [PDV-TIA-BBG]
- **Anterior:** Carrer del Mar 15, Tiana
- **Nuevo:** **Passeig de la Vilesa, 6, 08391 Tiana, Barcelona**

#### 🍔 Blackburguer Badalona [PDV-BAD-BBG]
- **Anterior:** Av. Martí Pujol 45, Badalona
- **Nuevo:** **Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona**

---

## 📂 ARCHIVOS ACTUALIZADOS

### ✅ Componentes de Frontend
1. **`/components/gerente/ConfiguracionEmpresas.tsx`**
   - CIF actualizado a B67284315
   - Domicilio fiscal actualizado
   - 4 direcciones de PDV actualizadas

2. **`/components/gerente/ConfiguracionGerente.tsx`**
   - Estado `marcas`: CIF y domicilio fiscal actualizados
   - Estado `marcas.puntosVenta`: 4 direcciones simplificadas actualizadas
   - Estado `puntosVenta`: 4 PDV con direcciones completas actualizadas

### ✅ Documentación
3. **`/ESTRUCTURA_EMPRESAS_DISARMINK.md`**
   - Árbol jerárquico actualizado con nuevas direcciones
   - Sección de "Detalles por Punto de Venta" actualizada
   - Formato de datos para API actualizado
   - Ejemplos de TypeScript actualizados

4. **`/CAMBIOS_DIRECCIONES_DISARMINK.md`** (NUEVO)
   - Este archivo con el registro de cambios

---

## 📊 RESUMEN DE UBICACIONES

### 🏢 Sede Fiscal
**Disarmink S.L.**  
Avenida Onze Setembre, 1  
08391 Tiana, Barcelona  
CIF: B67284315

### 🏪 Ubicación Tiana (2 marcas)
**Passeig de la Vilesa, 6, 08391 Tiana, Barcelona**
- 🍕 Modomio Tiana
- 🍔 Blackburguer Tiana

### 🏪 Ubicación Badalona (2 marcas)
**Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona**
- 🍕 Modomio Badalona
- 🍔 Blackburguer Badalona

---

## ✅ VERIFICACIÓN

- [x] CIF actualizado en todos los archivos
- [x] Domicilio fiscal actualizado
- [x] Dirección Tiana actualizada (2 marcas)
- [x] Dirección Badalona actualizada (2 marcas)
- [x] ConfiguracionEmpresas.tsx actualizado
- [x] ConfiguracionGerente.tsx actualizado (2 estados)
- [x] Documentación ESTRUCTURA_EMPRESAS_DISARMINK.md actualizada
- [x] Ejemplos TypeScript actualizados

---

## 🎯 CONSISTENCIA DE DATOS

Todos los datos están ahora sincronizados en:
- ✅ Componente de visualización (ConfiguracionEmpresas)
- ✅ Estado de gestión (ConfiguracionGerente)
- ✅ Documentación técnica
- ✅ Ejemplos de implementación

---

## 📝 NOTAS IMPORTANTES

1. **Dirección compartida en Tiana:**  
   Las marcas Modomio y Blackburguer comparten la misma dirección física en Tiana (Passeig de la Vilesa, 6), operando en el mismo local o locales contiguos.

2. **Dirección compartida en Badalona:**  
   Las marcas Modomio y Blackburguer comparten la misma dirección física en Badalona (Carrer del Doctor Robert, 75), operando en el mismo local o locales contiguos.

3. **Códigos postales correctos:**
   - Tiana: 08391
   - Badalona: 08915

4. **Domicilio fiscal:**  
   La sede fiscal de Disarmink S.L. está ubicada en Tiana, en la misma localidad que uno de los puntos de venta.

---

## 🔜 PRÓXIMOS PASOS

Para completar la actualización en un entorno de producción:

1. **Backend:**
   ```sql
   -- Actualizar empresa
   UPDATE empresas 
   SET cif = 'B67284315',
       domicilio_fiscal = 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona'
   WHERE id = 'EMP-001';

   -- Actualizar puntos de venta Tiana
   UPDATE puntos_venta 
   SET direccion = 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona'
   WHERE id IN ('PDV-TIA-MIO', 'PDV-TIA-BBG');

   -- Actualizar puntos de venta Badalona
   UPDATE puntos_venta 
   SET direccion = 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona'
   WHERE id IN ('PDV-BAD-MIO', 'PDV-BAD-BBG');
   ```

2. **Verificar en otros módulos:**
   - Facturas emitidas (actualizar dirección fiscal)
   - Tickets y recibos (direcciones de PDV)
   - Sistema de entregas (coordenadas GPS si aplica)
   - Mapas y geolocalización

3. **Documentación externa:**
   - Actualizar Google Maps / Google My Business
   - Actualizar redes sociales
   - Actualizar sitio web público
   - Actualizar materiales impresos

---

**✅ Actualización completada exitosamente**
