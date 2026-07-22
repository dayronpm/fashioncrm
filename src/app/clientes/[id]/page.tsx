"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toast } from "@/components/Toast";

export default function ClienteProfile() {
  const params = useParams();
  const router = useRouter();
  const { getClienteConVisitas, addVisita, deleteVisita, updateCliente, servicios } = useStore();
  const id = params.id as string;

  const cliente = useMemo(() => getClienteConVisitas(id), [id, getClienteConVisitas]);
  const servicioPorDefecto = servicios.length > 0 ? servicios[0].nombre : "";

  const [openVisita, setOpenVisita] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openEliminarVisita, setOpenEliminarVisita] = useState<string | null>(null);
  const [servicio, setServicio] = useState(servicioPorDefecto);
  const [precio, setPrecio] = useState(
    servicios.length > 0 ? servicios[0].precio.toString() : "0"
  );
  const [toast, setToast] = useState<string | null>(null);
  const [editCedula, setEditCedula] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editFechaNac, setEditFechaNac] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const closeToast = useCallback(() => setToast(null), []);

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Cliente no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/clientes")}>
          Volver
        </Button>
      </div>
    );
  }

  const visitasOrdenadas = [...cliente.visitas].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const seleccionarServicio = (s: string) => {
    setServicio(s);
    const sv = servicios.find((sv) => sv.nombre === s);
    setPrecio(sv ? sv.precio.toString() : "0");
  };

  const getPrecioServicio = (s: string): number => {
    const sv = servicios.find((sv) => sv.nombre === s);
    return sv ? sv.precio : 0;
  };

  const registrarVisita = () => {
    const hoy = new Date().toISOString().split("T")[0];
    addVisita({
      clienteId: cliente.id,
      fecha: hoy,
      servicio,
      precio: Number(precio) || getPrecioServicio(servicio),
    });
    setOpenVisita(false);
    setToast("✅ Visita registrada correctamente");
  };

  const confirmarEliminarVisita = () => {
    if (openEliminarVisita) {
      deleteVisita(openEliminarVisita);
      setOpenEliminarVisita(null);
      setToast("🗑️ Visita eliminada");
    }
  };

  const initEdit = () => {
    setEditCedula(cliente.cedula);
    setEditNombre(cliente.nombre);
    setEditTelefono(cliente.telefono);
    setEditFechaNac(cliente.fechaNacimiento || "");
    setEditNotas(cliente.notasPref || "");
    setOpenEditar(true);
  };

  const guardarEdicion = () => {
    if (!editNombre.trim() || !editTelefono.trim()) return;
    updateCliente(cliente.id, {
      cedula: editCedula.trim(),
      nombre: editNombre.trim(),
      telefono: editTelefono.trim(),
      fechaNacimiento: editFechaNac || null,
      notasPref: editNotas || null,
    });
    setOpenEditar(false);
    setToast("✅ Cliente actualizado");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-stone-500"
            onClick={() => router.push("/clientes")}
          >
            ← Volver
          </Button>
          <h1 className="text-2xl font-bold text-stone-800">{cliente.nombre}</h1>
          <p className="text-sm text-stone-500">{cliente.telefono}</p>
          <p className="text-xs text-stone-400">🪪 {cliente.cedula}</p>
          {cliente.fechaNacimiento && (
            <p className="text-xs text-stone-400">
              🎂 {new Date(cliente.fechaNacimiento).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
              })}
            </p>
          )}
          {cliente.notasPref && (
            <p className="text-xs text-stone-400 italic mt-1">
              📝 {cliente.notasPref}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={initEdit}>
            ✏️ Editar
          </Button>
          <a
            href={`https://wa.me/${cliente.telefono}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-green-400 text-green-700">
              WhatsApp
            </Button>
          </a>
          <Dialog open={openVisita} onOpenChange={setOpenVisita}>
            <DialogTrigger className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center">
              + Registrar visita
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar visita</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  ¿Qué servicio se realizó {cliente.nombre}?
                </p>
                <div className="flex flex-wrap gap-2">
                  {servicios.map((s) => (
                    <Button
                      key={s.nombre}
                      type="button"
                      variant={servicio === s.nombre ? "default" : "outline"}
                      onClick={() => seleccionarServicio(s.nombre)}
                      className={
                        servicio === s.nombre
                          ? "bg-violet-600 hover:bg-violet-500"
                          : ""
                      }
                    >
                      {s.nombre} ${s.precio}
                    </Button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1">
                    Precio ($)
                  </label>
                  <Input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    min={1}
                  />
                </div>
                <Button
                  onClick={registrarVisita}
                  className="bg-violet-600 hover:bg-violet-500 w-full"
                >
                  Confirmar visita
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialog Editar Cliente */}
      <Dialog open={openEditar} onOpenChange={setOpenEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Cédula / Pasaporte *
              </label>
              <Input
                value={editCedula}
                onChange={(e) => setEditCedula(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Nombre *
              </label>
              <Input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Teléfono *
              </label>
              <Input
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Fecha de nacimiento
              </label>
              <Input
                type="date"
                value={editFechaNac}
                onChange={(e) => setEditFechaNac(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">
                Notas / Preferencias
              </label>
              <Input
                value={editNotas}
                onChange={(e) => setEditNotas(e.target.value)}
                placeholder="Ej: Le gusta el degradado alto"
              />
            </div>
            <Button
              onClick={guardarEdicion}
              className="bg-violet-600 hover:bg-violet-500 w-full"
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Frecuencia + Historial en grid responsive */}
      <div className="xl:grid xl:grid-cols-2 xl:gap-6 space-y-6 xl:space-y-0">
      <Card>
        <CardContent className="p-4">
          {cliente.enRiesgo && (
            <Badge variant="destructive" className="mb-2">
              Cliente en riesgo
            </Badge>
          )}
          {cliente.frecuenciaPromedio ? (
            <p className="text-sm text-stone-700">
              Este cliente viene en promedio cada{" "}
              <strong>{cliente.frecuenciaPromedio} días</strong>.
              Próxima visita esperada:{" "}
              <strong>
                {new Date(cliente.proximaVisita!).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                })}
              </strong>
              .
            </p>
          ) : (
            <p className="text-sm text-stone-500">
              {cliente.visitas.length === 0
                ? "Aún no tiene visitas registradas."
                : "Aún no hay suficiente historial para calcular frecuencia (mínimo 2 visitas)."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Historial de cortes ({cliente.visitas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitasOrdenadas.length === 0 ? (
            <p className="text-sm text-stone-500">Sin visitas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-stone-500">
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 pr-4 font-medium">Servicio</th>
                    <th className="pb-2 pr-4 text-right font-medium">Precio</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {visitasOrdenadas.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 group">
                      <td className="py-2 pr-4 text-stone-600 whitespace-nowrap">
                        {new Date(v.fecha).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="secondary">{v.servicio}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-right font-medium text-stone-700 whitespace-nowrap">
                        ${v.precio}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => setOpenEliminarVisita(v.id)}
                          className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                          title="Eliminar visita"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Dialog Confirmar Eliminación de Visita */}
      <Dialog
        open={openEliminarVisita !== null}
        onOpenChange={(open) => { if (!open) setOpenEliminarVisita(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">🗑️ Eliminar visita</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-700">
            ¿Estás seguro de que deseas eliminar esta visita?
          </p>
          <p className="text-xs text-stone-500">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setOpenEliminarVisita(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarEliminarVisita}
              className="flex-1 bg-red-600 hover:bg-red-500"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast de notificación */}
      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}
