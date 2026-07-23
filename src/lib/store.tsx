"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { Cliente, Visita, ClienteConVisitas, ServicioItem } from "./types";
import { getSeedData, SEED_SERVICIOS } from "./data";
import { parseDateLocal } from "./utils";
import { supabase } from "./supabase";

// ─── Helpers para mapear snake_case ↔ camelCase ────────────────────
function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function mapCliente(row: Record<string, unknown>): Cliente {
  const c = snakeToCamel(row) as unknown as Cliente;
  return c;
}

function mapVisita(row: Record<string, unknown>): Visita {
  const v = snakeToCamel(row) as unknown as Visita;
  return v;
}

// ─── Store ────────────────────────────────────────────────────────
interface StoreContextType {
  clientes: Cliente[];
  visitas: Visita[];
  servicios: ServicioItem[];
  loading: boolean;
  addCliente: (c: Omit<Cliente, "id">) => Promise<void>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  addVisita: (v: Omit<Visita, "id">) => Promise<void>;
  updateVisita: (id: string, data: Partial<Omit<Visita, "id">>) => Promise<void>;
  deleteVisita: (id: string) => Promise<void>;
  addServicio: (s: ServicioItem) => Promise<void>;
  updateServicio: (nombreViejo: string, data: ServicioItem) => Promise<void>;
  deleteServicio: (nombre: string) => Promise<void>;
  getClienteConVisitas: (id: string) => ClienteConVisitas | undefined;
  getClientesConVisitas: () => ClienteConVisitas[];
  resetDatabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// ─── Lógica de frecuencia y riesgo ────────────────────────────────
const UMBRAL_RIESGO = 1.5;

/** Convierte visitas individuales en sesiones agrupando por groupId */
function agruparSesiones(visitas: Visita[]): { fecha: string }[] {
  const sesiones: { fecha: string }[] = [];
  const gruposVistos = new Set<string>();

  // Ordenar por fecha ascendente para calcular gaps
  const ordenadas = [...visitas].sort(
    (a, b) => parseDateLocal(a.fecha).getTime() - parseDateLocal(b.fecha).getTime()
  );

  for (const v of ordenadas) {
    if (v.groupId) {
      if (!gruposVistos.has(v.groupId)) {
        gruposVistos.add(v.groupId);
        sesiones.push({ fecha: v.fecha });
      }
    } else {
      sesiones.push({ fecha: v.fecha });
    }
  }

  return sesiones;
}

/** Cuenta cuántas sesiones (visitas agrupadas) hay */
export function contarSesiones(visitas: Visita[]): number {
  const gruposVistos = new Set<string>();
  let count = 0;
  for (const v of visitas) {
    if (v.groupId) {
      if (!gruposVistos.has(v.groupId)) {
        gruposVistos.add(v.groupId);
        count++;
      }
    } else {
      count++;
    }
  }
  return count;
}

function calcularFrecuencia(visitas: Visita[]): {
  frecuenciaPromedio: number | null;
  proximaVisita: string | null;
  enRiesgo: boolean;
  diasDesdeUltimaVisita: number;
} {
  const sesiones = agruparSesiones(visitas);

  if (sesiones.length < 2) {
    const hoy = new Date();
    const ultima = sesiones.length === 1 ? parseDateLocal(sesiones[0].fecha) : null;
    const diasDesde = ultima
      ? Math.floor((hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    // Marcar como en riesgo si tiene 1 sola visita y pasaron más de 30 días
    const enRiesgoUnico = sesiones.length === 1 && diasDesde > 30;
    return {
      frecuenciaPromedio: null,
      proximaVisita: null,
      enRiesgo: enRiesgoUnico,
      diasDesdeUltimaVisita: diasDesde,
    };
  }

  let totalDias = 0;
  for (let i = 1; i < sesiones.length; i++) {
    totalDias +=
      (parseDateLocal(sesiones[i].fecha).getTime() - parseDateLocal(sesiones[i - 1].fecha).getTime()) /
      (1000 * 60 * 60 * 24);
  }
  const frecuencia = Math.round(totalDias / (sesiones.length - 1));

  const ultimaFecha = parseDateLocal(sesiones[sesiones.length - 1].fecha);
  const hoy = new Date();
  const diasDesde = Math.floor((hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24));

  const proxima = new Date(ultimaFecha);
  proxima.setDate(proxima.getDate() + frecuencia);

  const enRiesgo = diasDesde > frecuencia * UMBRAL_RIESGO;

  return {
    frecuenciaPromedio: frecuencia,
    proximaVisita: proxima.toISOString().split("T")[0],
    enRiesgo,
    diasDesdeUltimaVisita: diasDesde,
  };
}

// ─── Provider ─────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<{ clientes: Cliente[]; visitas: Visita[] }>({
    clientes: [],
    visitas: [],
  });
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Carga inicial desde Supabase ──────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [resClientes, resVisitas, resServicios] = await Promise.all([
          supabase.from("clientes").select("*").order("nombre"),
          supabase.from("visitas").select("*").order("fecha", { ascending: false }),
          supabase.from("servicios").select("*").order("nombre"),
        ]);

        if (resClientes.error) throw resClientes.error;
        if (resVisitas.error) throw resVisitas.error;
        if (resServicios.error) throw resServicios.error;

        const clientes = (resClientes.data || []).map((r) => mapCliente(r as Record<string, unknown>));
        const visitas = (resVisitas.data || []).map((r) => mapVisita(r as Record<string, unknown>));
        const svs = (resServicios.data || []).map((r) => {
          const s = snakeToCamel(r as Record<string, unknown>);
          return { nombre: s.nombre as string, precio: s.precio as number };
        });

        setData({ clientes, visitas });
        setServicios(svs);
      } catch (e) {
        console.error("Error cargando datos desde Supabase:", e);
        // Fallback a datos mock si Supabase falla
        const seed = getSeedData();
        setData(seed);
        setServicios([...SEED_SERVICIOS]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ─── CRUD ──────────────────────────────────────────────────────
  const addCliente = useCallback(async (c: Omit<Cliente, "id">) => {
    const { data: nuevo, error } = await supabase
      .from("clientes")
      .insert({
        cedula: c.cedula,
        nombre: c.nombre,
        telefono: c.telefono,
        fecha_nacimiento: c.fechaNacimiento,
        notas_pref: c.notasPref,
      })
      .select()
      .single();

    if (error) throw error;
    if (nuevo) {
      setData((prev) => ({
        ...prev,
        clientes: [...prev.clientes, mapCliente(nuevo as Record<string, unknown>)],
      }));
    }
  }, []);

  const updateCliente = useCallback(async (id: string, fields: Partial<Cliente>) => {
    const updates: Record<string, unknown> = {};
    if (fields.cedula !== undefined) updates.cedula = fields.cedula;
    if (fields.nombre !== undefined) updates.nombre = fields.nombre;
    if (fields.telefono !== undefined) updates.telefono = fields.telefono;
    if (fields.fechaNacimiento !== undefined) updates.fecha_nacimiento = fields.fechaNacimiento;
    if (fields.notasPref !== undefined) updates.notas_pref = fields.notasPref;

    const { error } = await supabase.from("clientes").update(updates).eq("id", id);
    if (error) throw error;

    setData((prev) => ({
      ...prev,
      clientes: prev.clientes.map((c) => (c.id === id ? { ...c, ...fields } : c)),
    }));
  }, []);

  const addVisita = useCallback(async (v: Omit<Visita, "id">) => {
    const { data: nueva, error } = await supabase
      .from("visitas")
      .insert({
        cliente_id: v.clienteId,
        fecha: v.fecha,
        servicio: v.servicio,
        precio: v.precio,
        grupo_id: v.groupId || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (nueva) {
      setData((prev) => ({
        ...prev,
        visitas: [...prev.visitas, mapVisita(nueva as Record<string, unknown>)],
      }));
    }
  }, []);

  const updateVisita = useCallback(async (id: string, fields: Partial<Omit<Visita, "id">>) => {
    const updates: Record<string, unknown> = {};
    if (fields.servicio !== undefined) updates.servicio = fields.servicio;
    if (fields.precio !== undefined) updates.precio = fields.precio;
    if (fields.fecha !== undefined) updates.fecha = fields.fecha;

    const { error } = await supabase.from("visitas").update(updates).eq("id", id);
    if (error) throw error;

    setData((prev) => ({
      ...prev,
      visitas: prev.visitas.map((v) => (v.id === id ? { ...v, ...fields } : v)),
    }));
  }, []);

  const deleteVisita = useCallback(async (id: string) => {
    const { error } = await supabase.from("visitas").delete().eq("id", id);
    if (error) throw error;

    setData((prev) => ({
      ...prev,
      visitas: prev.visitas.filter((v) => v.id !== id),
    }));
  }, []);

  const addServicio = useCallback(async (s: ServicioItem) => {
    const { data: nuevo, error } = await supabase
      .from("servicios")
      .insert({ nombre: s.nombre, precio: s.precio })
      .select()
      .single();

    if (error) throw error;
    if (nuevo) {
      setServicios((prev) => [...prev, { nombre: nuevo.nombre, precio: Number(nuevo.precio) }]);
    }
  }, []);

  const updateServicio = useCallback(async (nombreViejo: string, s: ServicioItem) => {
    const { error } = await supabase
      .from("servicios")
      .update({ nombre: s.nombre, precio: s.precio })
      .eq("nombre", nombreViejo);

    if (error) throw error;

    setServicios((prev) =>
      prev.map((sv) => (sv.nombre === nombreViejo ? s : sv))
    );
  }, []);

  const deleteServicio = useCallback(async (nombre: string) => {
    const { error } = await supabase.from("servicios").delete().eq("nombre", nombre);
    if (error) throw error;

    setServicios((prev) => prev.filter((sv) => sv.nombre !== nombre));
  }, []);

  const resetDatabase = useCallback(async () => {
    // Borrar todo
    await supabase.from("visitas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("clientes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("servicios").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Insertar servicios
    for (const s of SEED_SERVICIOS) {
      await supabase.from("servicios").insert({ nombre: s.nombre, precio: s.precio });
    }

    // Insertar clientes (sin id fijo, dejamos que Supabase asigne UUID)
    const seed = getSeedData();
    const nuevosClientes: Cliente[] = [];
    for (const c of seed.clientes) {
      const { data: nc } = await supabase
        .from("clientes")
        .insert({
          cedula: c.cedula,
          nombre: c.nombre,
          telefono: c.telefono,
          fecha_nacimiento: c.fechaNacimiento,
          notas_pref: c.notasPref,
        })
        .select()
        .single();
      if (nc) nuevosClientes.push(mapCliente(nc as Record<string, unknown>));
    }

    // Insertar visitas (mapear viejo clienteId → nuevo UUID)
    const visitasConNuevosIds: Omit<Visita, "id">[] = [];
    for (const v of seed.visitas) {
      const idx = seed.clientes.findIndex((c) => c.id === v.clienteId);
      if (idx >= 0 && nuevosClientes[idx]) {
        visitasConNuevosIds.push({
          clienteId: nuevosClientes[idx].id,
          fecha: v.fecha,
          servicio: v.servicio,
          precio: v.precio,
          groupId: v.groupId,
        });
      }
    }
    for (const v of visitasConNuevosIds) {
      await supabase.from("visitas").insert({
        cliente_id: v.clienteId,
        fecha: v.fecha,
        servicio: v.servicio,
        precio: v.precio,
        grupo_id: v.groupId || null,
      });
    }

    // Recargar estado local
    const [rc, rv, rs] = await Promise.all([
      supabase.from("clientes").select("*").order("nombre"),
      supabase.from("visitas").select("*").order("fecha", { ascending: false }),
      supabase.from("servicios").select("*").order("nombre"),
    ]);

    setData({
      clientes: (rc.data || []).map((r) => mapCliente(r as Record<string, unknown>)),
      visitas: (rv.data || []).map((r) => mapVisita(r as Record<string, unknown>)),
    });
    setServicios(
      (rs.data || []).map((r) => ({ nombre: r.nombre, precio: Number(r.precio) }))
    );
  }, []);

  const getClienteConVisitas = useCallback(
    (id: string): ClienteConVisitas | undefined => {
      const cliente = data.clientes.find((c) => c.id === id);
      if (!cliente) return undefined;
      const visitas = data.visitas.filter((v) => v.clienteId === id);
      const freq = calcularFrecuencia(visitas);
      return { ...cliente, visitas, ...freq };
    },
    [data]
  );

  const getClientesConVisitas = useCallback((): ClienteConVisitas[] => {
    return data.clientes.map((c) => {
      const visitas = data.visitas.filter((v) => v.clienteId === c.id);
      const freq = calcularFrecuencia(visitas);
      return { ...c, visitas, ...freq };
    });
  }, [data]);

  const value = useMemo(
    () => ({
      clientes: data.clientes,
      visitas: data.visitas,
      servicios,
      loading,
      addCliente,
      updateCliente,
      addVisita,
      updateVisita,
      deleteVisita,
      addServicio,
      updateServicio,
      deleteServicio,
      getClienteConVisitas,
      getClientesConVisitas,
      resetDatabase,
    }),
    [data, servicios, loading, addCliente, updateCliente, addVisita, updateVisita, deleteVisita, addServicio, updateServicio, deleteServicio, getClienteConVisitas, getClientesConVisitas, resetDatabase]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
