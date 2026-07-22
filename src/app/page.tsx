"use client";

import { useStore } from "@/lib/store";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsChart from "@/components/StatsChart";

export default function Dashboard() {
  const { getClientesConVisitas } = useStore();
  const clientes = useMemo(() => getClientesConVisitas(), [getClientesConVisitas]);

  const hoy = new Date();

  // Cumpleañeros esta semana (próximos 7 días)
  const cumpleanieros = clientes.filter((c) => {
    if (!c.fechaNacimiento) return false;
    const nac = new Date(c.fechaNacimiento);
    // Comparar mes y día dentro de los próximos 7 días
    for (let i = 0; i < 7; i++) {
      const check = new Date(hoy);
      check.setDate(check.getDate() + i);
      if (nac.getMonth() === check.getMonth() && nac.getDate() === check.getDate()) {
        return true;
      }
    }
    return false;
  });

  const enRiesgo = clientes.filter((c) => c.enRiesgo);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 mt-1">
          {clientes.length} clientes registrados &middot;{" "}
          {enRiesgo.length} en riesgo de abandono
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Clientes en riesgo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-red-500">🔴</span> Clientes en riesgo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {enRiesgo.length === 0 && (
              <p className="text-sm text-stone-500">Ningún cliente en riesgo.</p>
            )}
            {enRiesgo.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-stone-800 truncate">
                    {c.nombre}
                  </p>
                  <p className="text-xs text-stone-500">
                    {c.diasDesdeUltimaVisita} días sin venir
                    {c.frecuenciaPromedio && ` (frecuencia: ${c.frecuenciaPromedio} días)`}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${c.telefono}?text=¡Hola%20${encodeURIComponent(c.nombre)}!%20Hace%20mucho%20que%20no%20vienes%20a%20la%20barbería.%20¡Te%20esperamos!`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="border-green-400 text-green-700 hover:bg-green-50">
                    WhatsApp
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cumpleañeros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-amber-500">🎂</span> Cumpleañeros esta semana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cumpleanieros.length === 0 && (
              <p className="text-sm text-stone-500">
                No hay cumpleañeros esta semana.
              </p>
            )}
            {cumpleanieros.map((c) => {
              const nac = new Date(c.fechaNacimiento!);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/50"
                >
                  <div>
                    <p className="font-medium text-sm text-stone-800">{c.nombre}</p>
                    <p className="text-xs text-stone-500">
                      {nac.toLocaleDateString("es", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${c.telefono}?text=¡Feliz%20cumpleaños%20${encodeURIComponent(c.nombre)}!%20Ven%20y%20consiente%20con%20un%20corte%20🎉`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
                      Felicitar
                    </Button>
                  </a>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardContent className="pt-6">
          <StatsChart />
        </CardContent>
      </Card>
    </div>
  );
}
