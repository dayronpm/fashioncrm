import { Cliente, Visita, ServicioItem, SeedData } from "./types";

// ─── Servicios por defecto ─────────────────────────────────────────
export const SEED_SERVICIOS: ServicioItem[] = [
  { nombre: "Corte", precio: 8 },
  { nombre: "Barba", precio: 5 },
  { nombre: "Cejas", precio: 3 },
  { nombre: "Combo", precio: 12 },
];

export const PRECIO_POR_DEFECTO = 8;

// ─── Helper para fechas ───────────────────────────────────────────
const daysAgo = (d: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString().split("T")[0];
};

const randomPrice = (base: number): number => base + Math.round(Math.random() * 4);

// ─── Clientes seed ─────────────────────────────────────────────────
export const seedClientes: Cliente[] = [
  // --- En riesgo (3-4) ---
  {
    id: "c1",
    cedula: "PE-1234567",
    nombre: "Carlos Mendoza",
    telefono: "+50760001111",
    fechaNacimiento: "1990-03-15",
    notasPref: "Le gusta el degradado alto",
  },
  {
    id: "c2",
    cedula: "PE-2345678",
    nombre: "Luis Rivera",
    telefono: "+50760002222",
    fechaNacimiento: "1985-07-22",
    notasPref: "Prefiere barba completa",
  },
  {
    id: "c3",
    cedula: "PE-3456789",
    nombre: "Pedro Castillo",
    telefono: "+50760003333",
    fechaNacimiento: "1993-11-08",
    notasPref: null,
  },
  {
    id: "c4",
    cedula: "PE-4567890",
    nombre: "Jorge Herrera",
    telefono: "+50760004444",
    fechaNacimiento: "1988-01-05",
    notasPref: "Corte fade medio",
  },
  // --- Cumpleaños esta semana (jul 20-26) ---
  {
    id: "c5",
    cedula: "PE-5678901",
    nombre: "Miguel Torres",
    telefono: "+50760005555",
    fechaNacimiento: "1995-07-22",
    notasPref: "Usa pomade",
  },
  {
    id: "c6",
    cedula: "PE-6789012",
    nombre: "Anaís De León",
    telefono: "+50760006666",
    fechaNacimiento: "1998-07-25",
    notasPref: "Cejas con diseño",
  },
  {
    id: "c7",
    cedula: "PE-7890123",
    nombre: "Roberto Quintero",
    telefono: "+50760007777",
    fechaNacimiento: "1992-07-21",
    notasPref: null,
  },
  // --- Historial regular (5-6) ---
  {
    id: "c8",
    cedula: "PE-8901234",
    nombre: "David Samudio",
    telefono: "+50760008888",
    fechaNacimiento: "1991-09-12",
    notasPref: "Siempre combo",
  },
  {
    id: "c9",
    cedula: "PE-9012345",
    nombre: "José Icaza",
    telefono: "+50760009999",
    fechaNacimiento: "1987-04-18",
    notasPref: null,
  },
  {
    id: "c10",
    cedula: "PE-0123456",
    nombre: "Santiago Poveda",
    telefono: "+50760001010",
    fechaNacimiento: "1994-06-30",
    notasPref: "Corte + Barba cada 3 semanas",
  },
  {
    id: "c11",
    cedula: "PP-1234567",
    nombre: "Fernando Arosemena",
    telefono: "+50760001111",
    fechaNacimiento: "1986-12-25",
    notasPref: null,
  },
  {
    id: "c12",
    cedula: "PP-2345678",
    nombre: "Ricardo De La Espriella",
    telefono: "+50760001212",
    fechaNacimiento: "1996-02-14",
    notasPref: "Solo corte, sin barba",
  },
  {
    id: "c13",
    cedula: "PP-3456789",
    nombre: "Alonso Pérez",
    telefono: "+50760001313",
    fechaNacimiento: "1993-08-08",
    notasPref: "Corte escolar para su hijo a veces",
  },
  // --- Nuevos (2, poco o nada historial) ---
  {
    id: "c14",
    cedula: "PP-4567890",
    nombre: "Kevin Morrison",
    telefono: "+50760001414",
    fechaNacimiento: null,
    notasPref: "Primera vez",
  },
  {
    id: "c15",
    cedula: "PP-5678901",
    nombre: "Diego Villarreal",
    telefono: "+50760001515",
    fechaNacimiento: "1999-10-10",
    notasPref: null,
  },
];

// ─── Visitas seed ─────────────────────────────────────────────────
export const seedVisitas: Visita[] = [
  // c1 - en riesgo (frecuencia ~21d, última visita hace 45d)
  ...makeVisits("c1", [
    [90, "Corte", 8],
    [70, "Combo", 12],
    [48, "Corte", 8],
    [45, "Corte", 10],
  ]),
  // c2 - en riesgo (frecuencia ~14d, última visita hace 30d)
  ...makeVisits("c2", [
    [120, "Barba", 5],
    [105, "Combo", 12],
    [90, "Barba", 5],
    [75, "Corte", 8],
    [60, "Combo", 14],
    [45, "Barba", 5],
    [30, "Barba", 5],
  ]),
  // c3 - en riesgo (frecuencia ~30d, última visita hace 60d)
  ...makeVisits("c3", [
    [180, "Corte", 8],
    [150, "Corte", 8],
    [120, "Combo", 12],
    [90, "Corte", 8],
    [60, "Corte", 10],
  ]),
  // c4 - en riesgo (frecuencia ~21d, última visita hace 40d)
  ...makeVisits("c4", [
    [130, "Corte", 8],
    [110, "Corte", 8],
    [88, "Corte", 8],
    [65, "Combo", 12],
    [40, "Corte", 8],
  ]),
  // c5 - cumpleaños 22 jul
  ...makeVisits("c5", [
    [100, "Corte", 8],
    [75, "Corte", 8],
    [50, "Corte", 10],
    [25, "Corte", 8],
    [10, "Corte", 8],
  ]),
  // c6 - cumpleaños 25 jul
  ...makeVisits("c6", [
    [80, "Cejas", 3],
    [60, "Cejas", 5],
    [40, "Cejas", 3],
    [15, "Cejas", 3],
  ]),
  // c7 - cumpleaños 21 jul
  ...makeVisits("c7", [
    [110, "Corte", 8],
    [85, "Corte", 8],
    [60, "Combo", 12],
    [35, "Corte", 8],
    [7, "Corte", 8],
  ]),
  // c8 - regular
  ...makeVisits("c8", [
    [150, "Combo", 12],
    [130, "Combo", 14],
    [110, "Combo", 12],
    [90, "Combo", 12],
    [70, "Combo", 16],
    [50, "Combo", 12],
    [30, "Combo", 12],
    [10, "Combo", 12],
  ]),
  // c9 - regular
  ...makeVisits("c9", [
    [140, "Corte", 8],
    [115, "Corte", 8],
    [95, "Corte", 10],
    [70, "Corte", 8],
    [50, "Corte", 8],
    [28, "Corte", 8],
    [12, "Corte", 10],
  ]),
  // c10 - regular
  ...makeVisits("c10", [
    [130, "Corte", 8],
    [110, "Barba", 5],
    [90, "Combo", 12],
    [70, "Corte", 8],
    [50, "Barba", 5],
    [30, "Combo", 14],
    [14, "Corte", 8],
  ]),
  // c11 - regular
  ...makeVisits("c11", [
    [160, "Corte", 8],
    [140, "Corte", 8],
    [120, "Barba", 5],
    [100, "Corte", 10],
    [80, "Corte", 8],
    [60, "Combo", 12],
    [40, "Corte", 8],
    [20, "Corte", 8],
  ]),
  // c12 - regular
  ...makeVisits("c12", [
    [120, "Corte", 8],
    [100, "Corte", 8],
    [80, "Corte", 10],
    [60, "Corte", 8],
    [40, "Corte", 8],
    [18, "Corte", 8],
  ]),
  // c13 - regular
  ...makeVisits("c13", [
    [100, "Corte", 8],
    [80, "Corte", 8],
    [60, "Combo", 12],
    [35, "Corte", 8],
    [15, "Corte", 8],
  ]),
  // c14 - nuevo (1 visita)
  ...makeVisits("c14", [[5, "Corte", 8]]),
  // c15 - nuevo (0 visitas - sin visits)
];

function makeVisits(
  clienteId: string,
  entries: [number, string, number][]
): Visita[] {
  return entries.map(([d, servicio, precio], i) => ({
    id: `v_${clienteId}_${i}`,
    clienteId,
    fecha: daysAgo(d),
    servicio,
    precio: precio ?? randomPrice(PRECIO_POR_DEFECTO),
  }));
}

export function getSeedData(): SeedData {
  return { clientes: seedClientes, visitas: seedVisitas };
}
