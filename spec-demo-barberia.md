# Documento Base — Demo: Software de Seguimiento de Clientes para Barbería

> Documento de referencia para que una IA de desarrollo construya el MVP sin ambigüedades.

---

## 1. Objetivo del Demo

Mostrarle a la dueña de la barbería que el software **piensa por ella**: detecta clientes en riesgo de abandono, avisa cumpleaños para vender más, y elimina la fricción de registrar visitas. El demo debe verse lleno de datos reales desde el primer segundo (nunca vacío).

---

## 2. Stack Técnico

| Capa | Decisión |
|---|---|
| Framework | **Next.js 14 (App Router)** + TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui (componentes prefabricados, cero diseño a medida) |
| Datos (fase demo) | **Mock en memoria / JSON local** — sin base de datos real todavía |
| Datos (fase producción) | Migrar a Supabase (Postgres) una vez validado el interés del cliente |
| Deploy | Vercel |

**Razón de Next.js sobre React puro:** mismo stack que otros proyectos del desarrollador (reutiliza fluidez), y evita una migración futura si el demo se convierte en producto real.

**Nota importante:** Los datos falsos son temporales. Debe existir una función clara para **vaciar la base de datos mock** (`resetDatabase()` o similar) antes de pasar a datos reales de producción, sin tener que tocar el resto del código.

---

## 3. Arquitectura de Datos

### 3.1 Tabla `Clientes`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string/uuid | |
| `Nombre` | string | requerido |
| `Telefono` | string | requerido, formato válido para link de WhatsApp (`+507...`) |
| `Fecha_Nacimiento` | date \| null | opcional al registrar, se puede completar después |
| `Notas_Preferencias` | string \| null | ej. "Le gusta el degradado alto" |

### 3.2 Tabla `Visitas`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string/uuid | |
| `Cliente_ID` | string (FK) | |
| `Fecha` | date | |
| `Servicio_Realizado` | enum | Corte, Barba, Cejas, Combo (extensible) |
| `Precio` | number | editable por visita (ver sección 6) |

---

## 4. Vistas del Demo (UI)

Sin login, sin configuración inicial. Tres pantallas:

### 4.1 Dashboard (Gancho de Venta)
- **Clientes en riesgo**: lista automática basada en **frecuencia individual calculada** (ver sección 5). Cada tarjeta incluye botón **"Llamar/WhatsApp"** con link real `https://wa.me/<telefono>` (mensaje predefinido opcional).
- **Cumpleañeros de esta semana**: lista de clientes cuyo cumpleaños cae dentro de los próximos 7 días.
- **Gráfico de estadísticas**: **ambos** — "Ingresos por semana" y "Cortes realizados por semana", con un **toggle** para alternar entre ambas vistas. Gráfico de barras simple (recharts o similar).

### 4.2 Gestión Rápida de Clientes
- **Buscador en tiempo real**: filtra por nombre o teléfono al teclear, sin botón de "buscar".
- **Registro Express**: modal/formulario con solo `Nombre` + `Teléfono`. Fecha de nacimiento y notas quedan opcionales, editables después desde el perfil.

### 4.3 Perfil del Cliente
- **Historial de cortes**: línea de tiempo (fecha + servicio + precio) ordenada de más reciente a más antigua.
- **Frecuencia calculada**: texto automático tipo:
  > "Este cliente viene en promedio cada 21 días. Próxima visita esperada: 14 de noviembre."
- **Registrar visita hoy**: botón de 2 clics.
  1. Clic 1: abre selector de servicio.
  2. Clic 2: confirma → guarda fecha actual + servicio + precio.
  - **Selector de servicio**: precios **editables** en el momento, pero con **botones de acceso rápido** para servicios frecuentes con precio fijo predefinido (ej. "Corte $8", "Barba $5", "Cejas $3") que autocompletan el campo de precio, editable si se necesita ajustar.

---

## 5. Lógica de Cálculo — Frecuencia y Riesgo

### 5.1 Frecuencia individual
```
frecuencia_promedio = promedio(diferencia_en_dias entre visitas consecutivas del cliente)
proxima_visita_esperada = ultima_visita + frecuencia_promedio
```
- Requiere **mínimo 2 visitas** para calcularse. Con 0-1 visita, mostrar mensaje tipo "Aún no hay suficiente historial".

### 5.2 Cliente en riesgo
```
dias_desde_ultima_visita = hoy - ultima_visita
es_en_riesgo = dias_desde_ultima_visita > (frecuencia_promedio * 1.5)
```
- Umbral configurable (multiplicador 1.5 como default), no fijo en 30 días — se adapta a cada cliente.

---

## 6. Datos Falsos Precargados (Seed Data)

- **~15 clientes ficticios** con nombres y teléfonos realistas (formato panameño `+507`).
- **Mezcla realista obligatoria:**
  - 3-4 clientes **en riesgo** (frecuencia habitual corta, pero ya pasaron el umbral).
  - 2-3 clientes con **cumpleaños esta semana**.
  - 5-6 clientes con historial regular y sano (para que el gráfico de ingresos/cortes tenga curva creíble).
  - 2 clientes **nuevos** sin historial (o solo 1 visita) — para probar el caso "sin suficiente historial".
- Historial de **varios meses** (mínimo 3) para que los gráficos semanales tengan datos suficientes.
- Precios variados por servicio para que el gráfico de ingresos no sea plano.

---

## 7. Fuera de Alcance (MVP Demo)

- Login / autenticación
- Múltiples usuarios o roles
- Pagos reales / integraciones de cobro
- Notificaciones automáticas (solo el link manual de WhatsApp)
- Multi-sucursal

---

## 8. Siguiente Paso Post-Demo

Si la clienta aprueba el demo:
1. Ejecutar `resetDatabase()` para limpiar todos los datos falsos.
2. Migrar de mock/JSON a Supabase (Postgres) manteniendo el mismo esquema de tablas.
3. Evaluar agregar autenticación básica y persistencia real.
