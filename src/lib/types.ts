export type Servicio = "Corte" | "Barba" | "Cejas" | "Combo";

export interface Visita {
  id: string;
  clienteId: string;
  fecha: string; // ISO date
  servicio: Servicio;
  precio: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string | null; // ISO date or null
  notasPref: string | null;
}

export interface ClienteConVisitas extends Cliente {
  visitas: Visita[];
  frecuenciaPromedio: number | null; // días, null si < 2 visitas
  proximaVisita: string | null; // fecha estimada
  enRiesgo: boolean;
  diasDesdeUltimaVisita: number;
}

export interface SeedData {
  clientes: Cliente[];
  visitas: Visita[];
}
