# Plan de migración: Datos mock → Supabase real

## Vista general

Actualmente la app funciona con datos en memoria (React state). Cada vez que recargas la página se pierde todo. Vamos a migrar a Supabase para que los datos persistan, manteniendo la funcionalidad actual intacta.

**Arquitectura objetivo:**

```
UI (Next.js) → Store (Context) → API Layer (Supabase) → Base de datos PostgreSQL
                              ↓
                     Datos mock (fallback para demo)
```

---

## Paso 1: Configurar proyecto Supabase (tú — manual)

1. Ve a [supabase.com](https://supabase.com) e inicia sesión o créate una cuenta
2. Crea un nuevo proyecto (elige la región más cercana a Panamá)
3. Espera a que se aprovisione la base de datos (~2 minutos)
4. Ve a **Project Settings → API** y copia:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `anon public key` (empieza con `eyJ...`)

---

## Paso 2: Guardar las credenciales (yo + tú)

**Tú:** Crea el archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJtu-anon-key-aqui
```

**Yo (después):** Leeré ese archivo y lo usaré para configurar el cliente de Supabase.

---

## Paso 3: Instalar el cliente de Supabase (yo)

```bash
npm install @supabase/supabase-js
```

Crearé el archivo `src/lib/supabase.ts` con el cliente configurado.

---

## Paso 4: Ejecutar migración del esquema SQL (tú — manual)

Ve a **Supabase Dashboard → SQL Editor** y pega el contenido de `supabase/migrations/20260720_inicial.sql` (ya está actualizado con `cedula`, tabla `servicios`, etc.). Ejecútalo.

Esto creará:
- Tabla `clientes` (con `cedula UNIQUE`)
- Tabla `servicios`
- Tabla `visitas`
- Índices y triggers

---

## Paso 5: Insertar datos semilla (yo)

Crearé un script SQL de seed: `supabase/seed.sql` que inserta:
- 4 servicios (Corte $8, Barba $5, Cejas $3, Combo $12)
- Los 15 clientes demo con sus cédulas
- Las ~60 visitas con fechas relativas a hoy

**Tú:** Ejecutarás `supabase/seed.sql` en el SQL Editor de Supabase.

---

## Paso 6: Reestructurar el Store (yo — el cambio grande)

Voy a reescribir `src/lib/store.tsx` para que:

### Modo actual (en memoria):
```
useState → datos mock → UI
```

### Modo nuevo (Supabase):
```
useState → datos iniciales desde Supabase (carga)
         → CRUD va directo a Supabase + actualiza estado local
```

### Estrategia de carga:

```tsx
// En StoreProvider
const [data, setData] = useState<SeedData>({ clientes: [], visitas: [] });
const [servicios, setServicios] = useState<ServicioItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    // 1. Cargar servicios desde Supabase
    const { data: s } = await supabase.from("servicios").select("*");
    setServicios(s.map(x => ({ nombre: x.nombre, precio: x.precio })));

    // 2. Cargar clientes
    const { data: c } = await supabase.from("clientes").select("*");
    
    // 3. Cargar visitas
    const { data: v } = await supabase.from("visitas").select("*");
    
    setData({ clientes: c || [], visitas: v || [] });
    setLoading(false);
  }
  load();
}, []);
```

### CRUD en Supabase:

```tsx
const addCliente = useCallback(async (c: Omit<Cliente, "id">) => {
  const { data } = await supabase
    .from("clientes")
    .insert({ ...c })
    .select()
    .single();
  
  if (data) {
    setData(prev => ({
      ...prev,
      clientes: [...prev.clientes, data],
    }));
  }
}, []);
```

**Nota:** El `groupId` para visitas múltiples se almacenará como texto en la columna `servicio`. No hace falta cambiar el esquema.

---

## Paso 7: Loading state (yo)

Mientras se cargan los datos desde Supabase, mostraré un spinner/skeleton en lugar de la UI actual. Esto requiere cambios mínimos en el layout.

---

## Paso 8: Botón "Reset datos demo" (yo)

El botón actual `ResetButton` llama a `resetDatabase()` que restaura los datos mock **en memoria**. Con Supabase, este botón hará:

```tsx
const resetDatabase = useCallback(async () => {
  // 1. Borrar todo
  await supabase.from("visitas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("clientes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("servicios").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Insertar seed
  await supabase.from("servicios").insert(SEED_SERVICIOS);
  await supabase.from("clientes").insert(seedClientes);
  await supabase.from("visitas").insert(seedVisitas);

  // 3. Recargar estado local
  // ... (misma lógica del load inicial)
}, []);
```

---

## Paso 9: Probar que todo funcione (tú + yo)

| Funcionalidad | Pasos |
|---|---|
| **Carga inicial** | Abrir la app → debe mostrar datos sin recarga |
| **Registrar cliente** | + Nuevo cliente → debe persistir al recargar página |
| **Registrar visita** | Perfil cliente → Registrar visita → debe persistir |
| **Multi-servicio** | Registrar Corte + Barba → refrescar → debe seguir agrupado |
| **Editar cliente** | ✏️ Editar → cambiar nombre → recargar → debe persistir |
| **Eliminar visita** | ✕ en historial → recargar → debe haber desaparecido |
| **Servicios CRUD** | Gestionar servicios → recargar → debe persistir |
| **Reset demo** | Click ⚙️ → Resetear → recargar → datos semilla deben estar |

---

## 📦 Scripts que voy a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/lib/supabase.ts` | **Crear** — Cliente Supabase |
| `src/lib/store.tsx` | **Reescribir** — CRUD contra Supabase |
| `src/lib/data.ts` | **Mantener** — Los seeds se usarán para el reset |
| `supabase/seed.sql` | **Crear** — SQL de datos demo |
| `.env.local` | **Tú** lo creas con tus credenciales |

---

## 📋 Cosas que NO cambian

- ✅ `src/lib/types.ts` — las interfaces se mantienen igual
- ✅ `src/lib/utils.ts` — `parseDateLocal`, `cn()` siguen igual
- ✅ `src/app/` — todos los componentes UI se mantienen
- ✅ `src/components/` — todos los componentes se mantienen
- ✅ El `groupId` en visitas múltiples sigue funcionando igual
- ✅ Las funciones `contarSesiones()` y `agruparSesiones()` siguen igual

---

## 🧹 Para entorno productivo (cuando termines el demo)

### Limpiar datos demo:

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Borrar todos los datos (mantiene estructura)
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE servicios CASCADE;
```

### Insertar servicios reales (ejemplo):

```sql
INSERT INTO servicios (nombre, precio) VALUES
  ('Corte', 8.00),
  ('Barba', 5.00),
  ('Cejas', 3.00),
  ('Combo', 12.00);
```

### Volver a insertar datos demo (para pruebas):

Ejecuta `supabase/seed.sql` completo.

### Deshabilitar RLS (si no lo usas):

```sql
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitas DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicios DISABLE ROW LEVEL SECURITY;
```

---

## Resumen de quién hace qué

| Qué | Quién |
|-----|-------|
| Crear proyecto Supabase | **Tú** |
| Copiar URL y anon key | **Tú** |
| Crear `.env.local` | **Tú** |
| Ejecutar migración SQL | **Tú** (SQL Editor) |
| Ejecutar seed SQL | **Tú** (SQL Editor) |
| Instalar `@supabase/supabase-js` | **Yo** |
| Crear `src/lib/supabase.ts` | **Yo** |
| Reescribir `src/lib/store.tsx` | **Yo** |
| Crear `supabase/seed.sql` | **Yo** |
| Probar funcionalidad | **Tú + Yo** |
