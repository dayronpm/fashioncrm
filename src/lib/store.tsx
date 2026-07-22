"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Cliente, Visita, ClienteConVisitas, ServicioItem } from "./types";
import { getSeedData, SEED_SERVICIOS } from "./data";

// ─── Store simple en memoria ──────────────────────────────────────
interface StoreContextType {
  clientes: Cliente[];
  visitas: Visita[];
  servicios: ServicioItem[];
  addCliente: (c: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  addVisita: (v: Omit<Visita, "id">) => void;
  deleteVisita: (id: string) => void;
  addServicio: (s: ServicioItem) => void;
  updateServicio: (nombreViejo: string, data: ServicioItem) => void;
  deleteServicio: (nombre: string) => void;
  getClienteConVisitas: (id: string) => ClienteConVisitas | undefined;
  getClientesConVisitas: () => ClienteConVisitas[];
  resetDatabase: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// ─── Lógica de frecuencia y riesgo ────────────────────────────────
const UMBRAL_RIESGO = 1.5;

function calcularFrecuencia(visitas: Visita[]): {
  frecuenciaPromedio: number | null;
  proximaVisita: string | null;
  enRiesgo: boolean;
  diasDesdeUltimaVisita: number;
} {
  if (visitas.length < 2) {
    const hoy = new Date();
    const ultima = visitas.length === 1 ? new Date(visitas[0].fecha) : null;
    const diasDesde = ultima
      ? Math.floor((hoy.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return {
      frecuenciaPromedio: null,
      proximaVisita: null,
      enRiesgo: false,
      diasDesdeUltimaVisita: diasDesde,
    };
  }

  const sorted = [...visitas].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  let totalDias = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalDias +=
      (new Date(sorted[i].fecha).getTime() - new Date(sorted[i - 1].fecha).getTime()) /
      (1000 * 60 * 60 * 24);
  }
  const frecuencia = Math.round(totalDias / (sorted.length - 1));

  const ultimaFecha = new Date(sorted[sorted.length - 1].fecha);
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
  const [data, setData] = useState<{ clientes: Cliente[]; visitas: Visita[] }>(() =>
    getSeedData()
  );
  const [servicios, setServicios] = useState<ServicioItem[]>(() => [...SEED_SERVICIOS]);

  const addCliente = useCallback((c: Omit<Cliente, "id">) => {
    const id = `c_${Date.now()}`;
    setData((prev) => ({
      ...prev,
      clientes: [...prev.clientes, { ...c, id }],
    }));
  }, []);

  const updateCliente = useCallback((id: string, fields: Partial<Cliente>) => {
    setData((prev) => ({
      ...prev,
      clientes: prev.clientes.map((c) => (c.id === id ? { ...c, ...fields } : c)),
    }));
  }, []);

  const addVisita = useCallback((v: Omit<Visita, "id">) => {
    const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setData((prev) => ({
      ...prev,
      visitas: [...prev.visitas, { ...v, id }],
    }));
  }, []);

  const deleteVisita = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      visitas: prev.visitas.filter((v) => v.id !== id),
    }));
  }, []);

  const addServicio = useCallback((s: ServicioItem) => {
    setServicios((prev) => [...prev, s]);
  }, []);

  const updateServicio = useCallback((nombreViejo: string, s: ServicioItem) => {
    setServicios((prev) =>
      prev.map((sv) => (sv.nombre === nombreViejo ? s : sv))
    );
  }, []);

  const deleteServicio = useCallback((nombre: string) => {
    setServicios((prev) => prev.filter((sv) => sv.nombre !== nombre));
  }, []);

  const resetDatabase = useCallback(() => {
    setData(getSeedData());
    setServicios([...SEED_SERVICIOS]);
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
      addCliente,
      updateCliente,
      addVisita,
      deleteVisita,
      addServicio,
      updateServicio,
      deleteServicio,
      getClienteConVisitas,
      getClientesConVisitas,
      resetDatabase,
    }),
    [data, servicios, addCliente, updateCliente, addVisita, deleteVisita, addServicio, updateServicio, deleteServicio, getClienteConVisitas, getClientesConVisitas, resetDatabase]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
