# FashionCRM — Migración a Supabase + Deploy en Vercel

## ✅ Estado actual (ya implementado)

Todo esto ya está hecho:

| Qué | Estado |
|-----|--------|
| Proyecto Supabase creado | ✅ `iuhtzditpitnptitgvje` |
| Migración SQL ejecutada | ✅ Tablas `clientes`, `servicios`, `visitas` |
| Seed data insertada | ✅ 15 clientes, 4 servicios, ~60 visitas |
| `@supabase/supabase-js` instalado | ✅ |
| `src/lib/supabase.ts` creado | ✅ |
| `store.tsx` reescrito para Supabase | ✅ |
| Loading spinner | ✅ |
| Botón Reset con datos demo | ✅ |
| Build exitoso | ✅ `Compiled successfully` |

---

## 🚀 Paso final: Deploy a Vercel (tú — manual, 5 minutos)

El código ya está en GitHub. Solo falta conectarlo a Vercel para que el sitio quede **live**.

### 1. Ir a Vercel

Ve a [vercel.com](https://vercel.com) e inicia sesión (puedes usar tu cuenta de GitHub).

### 2. Importar repositorio

- Click en **"Add New..." → "Project"**
- Busca y selecciona `dayronpm/fashioncrm`
- Vercel detectará automáticamente que es Next.js

### 3. Configurar variables de entorno

En la pantalla de configuración del proyecto, baja a **"Environment Variables"** y agrega:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iuhtzditpitnptitgvje.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aHR6ZGl0cGl0bnB0aXRndmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3Njc1MDUsImV4cCI6MjEwMDM0MzUwNX0.Sdy33m2IfQsA3LrSUW6Ns-_ssvdoRk_EJ746R3esMlo` |

### 4. Desplegar

- Click en **"Deploy"**
- Espera ~2 minutos
- Vercel te dará una URL como `https://fashioncrm.vercel.app`

**¡Eso es todo!** El sitio ya estará live y funcionando con Supabase.

### 5. (Opcional) Dominio personalizado

En el dashboard de Vercel → **Settings → Domains** puedes agregar un dominio personalizado si tienes uno.

---

## 🧪 Cómo verificar que funciona en Vercel

| Prueba | Cómo hacerla |
|--------|-------------|
| Carga datos | Abrir la URL de Vercel → debe mostrar Dashboard con datos |
| Persistencia | Registrar un cliente → recargar página → debe seguir ahí |
| Reset demo | Click ⚙️ en footer → "Sí, resetear" → recargar → datos demo |

---

## 🧹 Para producción (limpiar datos demo)

Cuando termines las pruebas y quieras lanzar:

Ejecuta esto en **Supabase Dashboard → SQL Editor**:

```sql
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE servicios CASCADE;
```

Luego inserta solo los servicios reales de tu barbería:

```sql
INSERT INTO servicios (nombre, precio) VALUES
  ('Corte', 8.00),
  ('Barba', 5.00),
  ('Cejas', 3.00),
  ('Combo', 12.00);
```

### Volver a datos demo (para pruebas futuras):

Ejecuta `supabase/seed.sql` completo en el SQL Editor.
