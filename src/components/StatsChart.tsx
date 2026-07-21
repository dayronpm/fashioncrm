"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Modo = "ingresos" | "cortes";

export default function StatsChart() {
  const { visitas } = useStore();
  const [modo, setModo] = useState<Modo>("ingresos");

  const data = useMemo(() => {
    const semanas: Record<string, { ingresos: number; cortes: number }> = {};

    for (const v of visitas) {
      const d = new Date(v.fecha);
      // Get Monday of the week
      const dia = d.getDay();
      const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
      const lunes = new Date(d);
      lunes.setDate(diff);
      const key = lunes.toISOString().split("T")[0];

      if (!semanas[key]) {
        semanas[key] = { ingresos: 0, cortes: 0 };
      }
      semanas[key].ingresos += v.precio;
      semanas[key].cortes += 1;
    }

    return Object.entries(semanas)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, vals]) => ({
        semana: new Date(semana).toLocaleDateString("es", {
          day: "numeric",
          month: "short",
        }),
        ingresos: vals.ingresos,
        cortes: vals.cortes,
      }));
  }, [visitas]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Estadísticas</h2>
        <div className="flex rounded-lg border overflow-hidden">
          <Button
            variant={modo === "ingresos" ? "default" : "ghost"}
            size="sm"
            onClick={() => setModo("ingresos")}
            className="rounded-none"
          >
            Ingresos
          </Button>
          <Button
            variant={modo === "cortes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setModo("cortes")}
            className="rounded-none"
          >
            Cortes
          </Button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="semana"
              tick={{ fontSize: 12, fill: "#78716c" }}
            />
            <YAxis tick={{ fontSize: 12, fill: "#78716c" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Legend />
            <Bar
              dataKey={modo}
              fill="#7c3aed"
              radius={[4, 4, 0, 0]}
              name={modo === "ingresos" ? "Ingresos ($)" : "Cortes"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
