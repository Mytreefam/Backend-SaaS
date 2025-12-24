# ⚡ QUICKSTART - Sistema de Agregadores

## Empezar en 5 minutos

---

## 1️⃣ CONFIGURAR (.env.local)

```bash
# Copiar ejemplo
cp .env.example .env.local

# Editar con tus credenciales
nano .env.local
```

Añadir como mínimo:
```env
NEXT_PUBLIC_WEBHOOK_BASE_URL=http://localhost:3000
```

---

## 2️⃣ INICIALIZAR

```typescript
// En tu layout.tsx o _app.tsx
import { inicializarAgregadores } from '@/services/aggregators';

if (typeof window === 'undefined') {
  inicializarAgregadores();
}
```

---

## 3️⃣ PROBAR

```bash
# Iniciar app
npm run dev

# En otra terminal, probar webhook
curl -X POST http://localhost:3000/api/webhooks/glovo \
  -H "Content-Type: application/json" \
  -d '{"event":"order.created","order":{"id":"test"}}'

# Debe responder: {"success":true}
```

---

## 4️⃣ USAR

```typescript
import { gestorAgregadores } from '@/services/aggregators';

// Obtener pedidos
const pedidos = await gestorAgregadores.obtenerTodosPedidosNuevos();

// Aceptar pedido
await gestorAgregadores.aceptarPedido('glovo', 'ORDER-123', 20);

// Sincronizar menú
await gestorAgregadores.sincronizarMenuTodos(productos);
```

---

## 5️⃣ CONECTAR BASE DE DATOS

```typescript
// Editar: /app/api/webhooks/[agregador]/route.ts
// Función: procesarEventoWebhook

case 'pedido':
  // Guardar en tu DB
  await supabase.from('pedidos').insert({
    id_externo: payload.id,
    agregador: agregadorId,
    datos: payload
  });
  break;
```

---

## ✅ LISTO

Ya tienes:
- ✓ Sistema funcionando
- ✓ Webhooks recibiendo
- ✓ 4 plataformas listas (Monei, Glovo, Uber Eats, Just Eat)

---

## 📚 MÁS INFO

- **Guía completa:** `SISTEMA_AGREGADORES_COMPLETO.md`
- **Backend:** `README_BACKEND_AGREGADORES.md`
- **Webhooks:** `CONFIGURACION_WEBHOOKS_PASO_A_PASO.md`

---

**¿Problemas?** Revisa `SISTEMA_AGREGADORES_COMPLETO.md` sección Troubleshooting.
