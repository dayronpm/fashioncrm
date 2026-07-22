"use client";

import { useState, useMemo } from "react";
import { useStore, contarSesiones } from "@/lib/store";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function ClientesPage() {
  const { getClientesConVisitas, addCliente, clientes, servicios } = useStore();
  const [busqueda, setBusqueda] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("");
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNac, setFechaNac] = useState("");

  const clientesConVisitas = useMemo(() => getClientesConVisitas(), [getClientesConVisitas]);

  const filtrados = useMemo(
    () =>
      clientesConVisitas.filter((c) => {
        // Filtro por texto
        const matchTexto =
          !busqueda ||
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.telefono.includes(busqueda) ||
          c.cedula.toLowerCase().includes(busqueda.toLowerCase());
        if (!matchTexto) return false;

        // Filtro por servicio
        if (!filtroServicio) return true;
        return c.visitas.some((v) => v.servicio === filtroServicio);
      }),
    [clientesConVisitas, busqueda, filtroServicio]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombre.trim()) {
      setErrorMsg("Debes completar al menos la cédula y el nombre.");
      return;
    }
    // Validar cédula única
    const existe = clientes.find((c) => c.cedula === cedula.trim());
    if (existe) {
      setErrorMsg("Ya existe un cliente con esa cédula/pasaporte.");
      return;
    }
    addCliente({
      cedula: cedula.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim() || "",
      fechaNacimiento: fechaNac || null,
      notasPref: null,
    });
    setCedula("");
    setNombre("");
    setTelefono("");
    setFechaNac("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Clientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-sm font-medium">
              + Nuevo cliente
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Cédula / Pasaporte *
                </label>
                <Input
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="PE-1234567"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Nombre *
                </label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Teléfono <span className="text-stone-400">(opcional)</span>
                </label>
                <Input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/[^0-9+]/g, ""))}
                  placeholder="+50760000000"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Fecha de nacimiento <span className="text-stone-400">(opcional)</span>
                </label>
                <Input
                  type="date"
                  value={fechaNac}
                  onChange={(e) => setFechaNac(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500 w-full">
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre, teléfono o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={filtroServicio}
          onChange={(e) => setFiltroServicio(e.target.value)}
          className="border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 sm:w-auto"
        >
          <option value="">Todos los servicios</option>
          {servicios.map((s) => (
            <option key={s.nombre} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((c) => (
          <Link key={c.id} href={`/clientes/${c.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{c.nombre}</p>
                    <p className="text-xs text-stone-500">{c.telefono}</p>
                    <p className="text-xs text-stone-400">ID: {c.cedula}</p>
                  </div>
                  {c.enRiesgo && (
                    <Badge variant="destructive" className="text-[10px]">
                      En riesgo
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-xs text-stone-500">
                  {(() => {
                    const sesiones = contarSesiones(c.visitas);
                    return sesiones === 0
                      ? "Sin visitas"
                      : sesiones === 1
                      ? "1 visita"
                      : `${sesiones} visitas`;
                  })()}
                  {c.frecuenciaPromedio && ` · Cada ${c.frecuenciaPromedio} días`}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtrados.length === 0 && (
          <p className="text-stone-500 col-span-full text-center py-8">
            No se encontraron clientes.
          </p>
        )}
      </div>

      {/* Dialog Error */}
      <Dialog open={errorMsg !== null} onOpenChange={(open) => { if (!open) setErrorMsg(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">⚠️ Error</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-700">{errorMsg}</p>
          <Button
            onClick={() => setErrorMsg(null)}
            className="bg-violet-600 hover:bg-violet-500 w-full mt-2"
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
