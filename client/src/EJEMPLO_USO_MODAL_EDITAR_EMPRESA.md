# 📖 EJEMPLO DE USO - MODAL EDITAR EMPRESA

**Componente:** `ModalEditarEmpresa.tsx`  
**Ubicación:** `/components/gerente/ModalEditarEmpresa.tsx`

---

## 🎯 ¿CUÁNDO USAR ESTE MODAL?

Úsalo cuando el usuario haga click en el botón **"Editar Datos de la Empresa"** o en el botón de editar (lápiz) junto a una marca o punto de venta.

---

## 📋 PROPS DEL COMPONENTE

```typescript
interface ModalEditarEmpresaProps {
  open: boolean;                           // Controla si el modal está abierto
  onOpenChange: (open: boolean) => void;   // Callback para abrir/cerrar
  datosEmpresa: DatosEmpresa;              // Datos de la empresa a editar
  onGuardar?: (datos: DatosEmpresa) => void; // Callback al guardar (opcional)
}

interface DatosEmpresa {
  empresaId: string;
  nombreFiscal: string;
  cif: string;
  domicilioFiscal: string;
  nombreComercial: string;
  logoComercial?: string;
  convenioColectivoId?: string;
  empresaActiva: boolean;
  marcas: Marca[];
  puntosVenta: PuntoVenta[];
  cuentasBancarias: CuentaBancaria[];
}
```

---

## 🚀 EJEMPLO DE USO BÁSICO

### **1. En el componente padre (ej: GestionEmpresas.tsx)**

```typescript
import { useState } from 'react';
import { ModalEditarEmpresa } from './ModalEditarEmpresa';

export function GestionEmpresas() {
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<DatosEmpresa | null>(null);

  // Función para abrir el modal con datos de la empresa
  const handleEditarEmpresa = (empresaId: string) => {
    // Cargar datos de la empresa desde localStorage o API
    const datosEmpresa = cargarDatosEmpresa(empresaId);
    
    setEmpresaSeleccionada(datosEmpresa);
    setModalEditarOpen(true);
  };

  // Callback cuando se guardan los cambios
  const handleGuardarCambios = (datosActualizados: DatosEmpresa) => {
    console.log('📦 Datos actualizados:', datosActualizados);
    
    // Aquí puedes:
    // 1. Actualizar el localStorage
    // 2. Enviar a la API
    // 3. Refrescar la lista de empresas
    
    toast.success('Empresa actualizada correctamente');
  };

  return (
    <div>
      {/* Botón para editar empresa */}
      <Button onClick={() => handleEditarEmpresa('EMP-001')}>
        Editar Datos de la Empresa
      </Button>

      {/* Modal de edición */}
      {empresaSeleccionada && (
        <ModalEditarEmpresa
          open={modalEditarOpen}
          onOpenChange={setModalEditarOpen}
          datosEmpresa={empresaSeleccionada}
          onGuardar={handleGuardarCambios}
        />
      )}
    </div>
  );
}
```

---

## 📦 EJEMPLO DE DATOS DE EMPRESA

```typescript
const datosEjemplo: DatosEmpresa = {
  empresaId: 'EMP-001',
  nombreFiscal: 'Disarmink S.L.',
  cif: 'B67284315',
  domicilioFiscal: 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona',
  nombreComercial: 'Hoy Pecamos',
  logoComercial: 'data:image/png;base64,...',
  convenioColectivoId: 'CONV-001',
  empresaActiva: true,
  
  marcas: [
    {
      marcaNombre: 'Modomio',
      marcaCodigo: 'MRC-001',
      colorIdentidad: '#FF6B35',
      logoUrl: 'data:image/png;base64,...'
    },
    {
      marcaNombre: 'Blackburguer',
      marcaCodigo: 'MRC-002',
      colorIdentidad: '#1A1A1A',
      logoUrl: 'data:image/png;base64,...'
    }
  ],
  
  puntosVenta: [
    {
      puntoVentaId: 'PDV-001',
      pvNombreComercial: 'Tiana',
      pvDireccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
      pvTelefono: '+34 933 456 789',
      pvEmail: 'tiana@hoypecamos.com',
      marcasDisponibles: ['MRC-001', 'MRC-002'],
      activo: true
    },
    {
      puntoVentaId: 'PDV-002',
      pvNombreComercial: 'Badalona',
      pvDireccion: 'Carrer del Doctor Robert, 75, 08915 Badalona',
      pvTelefono: '+34 933 456 790',
      pvEmail: 'badalona@hoypecamos.com',
      marcasDisponibles: ['MRC-001', 'MRC-002'],
      activo: true
    }
  ],
  
  cuentasBancarias: [
    {
      cuentaId: 'CTA-001',
      iban: 'ES00 0000 0000 00 0000000000',
      aliasCuenta: 'Cuenta Principal'
    }
  ]
};
```

---

## 🎨 INTEGRACIÓN CON SISTEMA DE MARCAS MADRE

El modal **automáticamente sincroniza** las marcas con el Sistema de Marcas MADRE:

```typescript
// Al hacer click en "Guardar Cambios", el modal:
// 1. Valida todos los campos
// 2. Guarda las marcas en localStorage ('udar_marcas_sistema')
// 3. Dispara evento 'marcas-sistema-updated'
// 4. Todos los componentes se actualizan automáticamente

// ✅ No necesitas hacer nada extra, es automático
```

---

## 🔧 FUNCIONES AUXILIARES

### **Cargar datos de empresa desde localStorage**

```typescript
function cargarDatosEmpresa(empresaId: string): DatosEmpresa {
  // Ejemplo: leer desde localStorage
  const empresasJSON = localStorage.getItem('udar_empresas');
  if (!empresasJSON) {
    throw new Error('No hay empresas guardadas');
  }
  
  const empresas = JSON.parse(empresasJSON);
  const empresa = empresas.find((e: any) => e.empresaId === empresaId);
  
  if (!empresa) {
    throw new Error('Empresa no encontrada');
  }
  
  return empresa;
}
```

### **Guardar cambios en localStorage**

```typescript
function guardarCambiosEmpresa(datosActualizados: DatosEmpresa) {
  // 1. Leer empresas actuales
  const empresasJSON = localStorage.getItem('udar_empresas') || '[]';
  const empresas = JSON.parse(empresasJSON);
  
  // 2. Actualizar la empresa
  const index = empresas.findIndex(
    (e: any) => e.empresaId === datosActualizados.empresaId
  );
  
  if (index !== -1) {
    empresas[index] = datosActualizados;
  }
  
  // 3. Guardar de nuevo
  localStorage.setItem('udar_empresas', JSON.stringify(empresas));
  
  console.log('✅ Empresa actualizada en localStorage');
}
```

---

## 🎯 CARACTERÍSTICAS DEL MODAL

### ✅ **Tab 1: Empresa**
- Editar nombre fiscal, CIF, domicilio
- Editar nombre comercial
- Cambiar convenio colectivo
- Activar/desactivar empresa

### ✅ **Tab 2: Marcas**
- Añadir nuevas marcas
- Editar nombre, color de identidad
- Subir/cambiar logos
- Eliminar marcas (con validación)
- Preview circular de logos

### ✅ **Tab 3: Puntos de Venta**
- Añadir nuevos PDVs
- Editar nombre, dirección, contacto
- Asignar marcas disponibles (multimarca)
- Activar/desactivar PDVs
- Eliminar PDVs

### ✅ **Tab 4: Cuentas Bancarias**
- Añadir nuevas cuentas
- Editar IBAN y alias
- Eliminar cuentas

---

## ⚠️ VALIDACIONES IMPLEMENTADAS

El modal valida automáticamente:

1. ✅ Campos obligatorios no vacíos
2. ✅ Marcas tienen nombre
3. ✅ Puntos de venta tienen al menos 1 marca asignada
4. ✅ No se puede eliminar marca si está en uso por PDVs
5. ✅ Logos deben ser imágenes válidas (< 2MB)

---

## 🎨 EJEMPLO COMPLETO EN CONTEXTO

```typescript
// components/gerente/ConfiguracionGerente.tsx

import { useState } from 'react';
import { ModalEditarEmpresa } from './ModalEditarEmpresa';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2, Pencil } from 'lucide-react';
import { EMPRESAS } from '../../constants/empresaConfig';

export function ConfiguracionGerente() {
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [empresaActual, setEmpresaActual] = useState<DatosEmpresa | null>(null);

  // Simular carga de datos de la empresa actual
  const cargarEmpresaActual = () => {
    const empresa = EMPRESAS['EMP-001'];
    
    // Convertir a formato DatosEmpresa
    const datosEmpresa: DatosEmpresa = {
      empresaId: empresa.id,
      nombreFiscal: empresa.nombreFiscal,
      cif: empresa.cif,
      domicilioFiscal: empresa.domicilioFiscal,
      nombreComercial: empresa.nombreComercial,
      empresaActiva: empresa.activo,
      marcas: [], // Cargar desde localStorage
      puntosVenta: [], // Cargar desde localStorage
      cuentasBancarias: [] // Cargar desde localStorage
    };
    
    setEmpresaActual(datosEmpresa);
    setModalEditarOpen(true);
  };

  const handleGuardar = (datosActualizados: DatosEmpresa) => {
    console.log('💾 Guardando cambios:', datosActualizados);
    
    // Aquí irían las llamadas a la API o actualización de localStorage
    // Por ahora, solo simulamos
    
    toast.success('Cambios guardados correctamente');
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Mi Empresa
            </div>
            <Button
              onClick={cargarEmpresaActual}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Editar Datos de la Empresa
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nombre Fiscal:</strong> Disarmink S.L.</p>
            <p><strong>CIF:</strong> B67284315</p>
            <p><strong>Nombre Comercial:</strong> Hoy Pecamos</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {empresaActual && (
        <ModalEditarEmpresa
          open={modalEditarOpen}
          onOpenChange={setModalEditarOpen}
          datosEmpresa={empresaActual}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}
```

---

## 📱 FLUJO DE USUARIO

1. Usuario hace click en **"Editar Datos de la Empresa"**
2. Se abre el modal con los datos cargados
3. Usuario navega por las tabs y edita lo que necesite
4. Usuario hace click en **"Guardar Cambios"**
5. Se validan todos los campos
6. Se guardan los datos en localStorage
7. Se sincronizan las marcas con el Sistema de Marcas MADRE
8. Se cierra el modal
9. Se muestra toast de confirmación
10. ✅ Todos los componentes se actualizan automáticamente

---

## 🎉 CONCLUSIÓN

El `ModalEditarEmpresa` es un componente completo y listo para usar que:

- ✅ Carga datos existentes automáticamente
- ✅ Valida todos los campos
- ✅ Sincroniza con el Sistema de Marcas MADRE
- ✅ Maneja logos y archivos
- ✅ Interfaz organizada con tabs
- ✅ Callbacks para guardar cambios
- ✅ Totalmente compatible con el sistema existente

**¡Listo para integrar en tu aplicación!** 🚀
