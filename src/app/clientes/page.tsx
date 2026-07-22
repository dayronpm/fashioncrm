"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
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
  const { getClientesConVisitas, addCliente, clientes } = useStore();
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("+507");

  const clientesConVisitas = useMemo(() => getClientesConVisitas(), [getClientesConVisitas]);

  const filtrados = useMemo(
    () =>
      clientesConVisitas.filter(
        (c) =>
          c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.telefono.includes(busqueda) ||
          c.cedula.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [clientesConVisitas, busqueda]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombre.trim() || !telefono.trim()) return;
    // Validar cédula única
    const existe = clientes.find((c) => c.cedula === cedula.trim());
    if (existe) {
      alert("Ya existe un cliente con esa cédula/pasaporte.");
      return;
    }
    addCliente({
      cedula: cedula.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      fechaNacimiento: null,
      notasPref: null,
    });
    setCedula("");
    setNombre("");
    setTelefono("+507");
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
                  Teléfono *
                </label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+50760000000"
                  required
                />
              </div>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500 w-full">
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar por nombre o teléfono..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-md"
      />

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
                  {c.visitas.length === 0 && "Sin visitas"}
                  {c.visitas.length === 1 && "1 visita"}
                  {c.visitas.length > 1 && `${c.visitas.length} visitas`}
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
    </div>
  );
}
