# 🏗️ ARQUITECTURA COMPLETA: Módulo de Proveedores, Pedidos, Facturas y Conciliación

**Sistema:** Udar Edge - Módulo de Gestión de Compras  
**Fecha:** 29 de Noviembre de 2025  
**Versión:** 1.0 - Arquitectura Técnica Completa

---

## 📋 ÍNDICE

1. [Análisis del Estado Actual](#análisis-del-estado-actual)
2. [Entidades y Campos Adicionales](#entidades-y-campos-adicionales)
3. [Relaciones entre Entidades](#relaciones-entre-entidades)
4. [Lógica de Negocio](#lógica-de-negocio)
5. [Flujos de Trabajo](#flujos-de-trabajo)
6. [Esquemas de Base de Datos](#esquemas-de-base-de-datos)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Reglas de Validación](#reglas-de-validación)
9. [Casos de Uso Completos](#casos-de-uso-completos)

---

## 1. ANÁLISIS DEL ESTADO ACTUAL

### ✅ **ENTIDADES EXISTENTES QUE SE MANTIENEN**

Este documento define la arquitectura completa del módulo de gestión de compras, incluyendo:

- **Proveedores extendidos** con datos fiscales y de contacto
- **Stock por punto de venta** para gestión multi-ubicación
- **Propuestas de pedido** automáticas basadas en necesidades
- **Pedidos a proveedores** con múltiples canales de envío
- **Facturas de compra** con conciliación automática
- **Histórico de precios** para análisis de tendencias

### 🔑 **PRINCIPIOS DE DISEÑO**

1. **No modificar entidades existentes**: Todas las extensiones se hacen mediante herencia o nuevas tablas
2. **Desnormalización estratégica**: Campos duplicados para optimizar consultas frecuentes
3. **Conciliación automática**: Algoritmos inteligentes para vincular facturas con pedidos
4. **Trazabilidad completa**: Histórico de cambios en precios y estados
5. **Flexibilidad en canales**: Soporte para email, WhatsApp, app y teléfono

---

## 2. ENTIDADES PRINCIPALES

### 📦 **StockPuntoVenta**
Gestiona el inventario por ubicación física (Tiana, Badalona).

### 📝 **PropuestaPedido**
Almacena propuestas automáticas de reposición antes de confirmarlas.

### 🏢 **ProveedorExtendido**
Extiende la entidad Proveedor con datos fiscales, bancarios y de contacto.

### 📄 **FacturaCompra**
Registra facturas de proveedores con conciliación automática contra pedidos.

### 📊 **HistorialPrecioProveedor**
Mantiene el histórico de precios para análisis de tendencias.

---

## 3. FLUJO COMPLETO DE TRABAJO

```
1. DETECCIÓN → Sistema detecta necesidades de stock
2. PROPUESTA → Genera propuesta automática de pedido
3. REVISIÓN → Gerente revisa y ajusta cantidades/proveedores
4. CONVERSIÓN → Convierte propuesta en pedidos por proveedor
5. ENVÍO → Envía pedidos por email/WhatsApp/app
6. SEGUIMIENTO → Rastrea estado de pedidos
7. RECEPCIÓN → Registra entrada de mercancía
8. FACTURA → Registra factura del proveedor
9. CONCILIACIÓN → Compara factura vs pedido automáticamente
10. CIERRE → Actualiza precios y registra pago
```

---

## 4. TECNOLOGÍAS Y HERRAMIENTAS

- **Base de datos**: PostgreSQL con JSONB para flexibilidad
- **APIs**: REST con validaciones exhaustivas
- **Conciliación**: Algoritmo de similitud de Levenshtein
- **Notificaciones**: Email, WhatsApp Business API, Push notifications
- **Documentos**: Generación de PDFs para pedidos y facturas

---

## 5. PRÓXIMOS PASOS

1. Implementar esquemas de base de datos
2. Desarrollar APIs REST
3. Crear interfaces de usuario
4. Implementar algoritmos de conciliación
5. Configurar canales de envío
6. Realizar pruebas de integración

---

**Documento completo disponible en el repositorio del proyecto.**

Para más detalles sobre cada sección, consulte los archivos específicos:
- `database-schema.sql` - Esquemas de base de datos
- `api-endpoints.md` - Documentación de APIs
- `business-logic.ts` - Algoritmos de negocio
- `validation-rules.ts` - Reglas de validación
