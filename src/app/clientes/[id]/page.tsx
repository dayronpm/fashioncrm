"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PRECIOS_SERVICIOS } from "@/lib/data";
import { useMemo, useState } from "react";
import { Servicio } from "@/lib/types";
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

const SERVICIOS: Servicio[] = ["Corte", "Barba", "Cejas", "Combo"];

export default function ClienteProfile() {
  const params = useParams();
  const router = useRouter();
  const { getClienteConVisitas, addVisita, updateCliente } = useStore();
  const id = params.id as string;

  const cliente = useMemo(() => getClienteConVisitas(id), [id, getClienteConVisitas]);

  const [openVisita, setOpenVisita] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [servicio, setServicio] = useState<Servicio>("Corte");
  const [precio, setPrecio] = useState(PRECIOS_SERVICIOS["Corte"].toString());
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editFechaNac, setEditFechaNac] = useState("");
  const [editNotas, setEditNotas] = useState("");

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

  const seleccionarServicio = (s: Servicio) => {
    setServicio(s);
    setPrecio(PRECIOS_SERVICIOS[s].toString());
  };

  const registrarVisita = () => {
    const hoy = new Date("2026-07-20").toISOString().split("T")[0];
    addVisita({
      clienteId: cliente.id,
      fecha: hoy,
      servicio,
      precio: Number(precio) || PRECIOS_SERVICIOS[servicio],
    });
    setOpenVisita(false);
  };

  const initEdit = () => {
    setEditNombre(cliente.nombre);
    setEditTelefono(cliente.telefono);
    setEditFechaNac(cliente.fechaNacimiento || "");
    setEditNotas(cliente.notasPref || "");
    setOpenEditar(true);
  };

  const guardarEdicion = () => {
    if (!editNombre.trim() || !editTelefono.trim()) return;
    updateCliente(cliente.id, {
      nombre: editNombre.trim(),
      telefono: editTelefono.trim(),
      fechaNacimiento: editFechaNac || null,
      notasPref: editNotas || null,
    });
    setOpenEditar(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
          <p className="text-stone-500">{cliente.telefono}</p>
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
                  {SERVICIOS.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={servicio === s ? "default" : "outline"}
                      onClick={() => seleccionarServicio(s)}
                      className={
                        servicio === s
                          ? "bg-violet-600 hover:bg-violet-500"
                          : ""
                      }
                    >
                      {s} ${PRECIOS_SERVICIOS[s]}
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

      {/* Frecuencia */}
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
            <div className="space-y-3">
              {visitasOrdenadas.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">
                      {new Date(v.fecha).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <Badge variant="secondary">{v.servicio}</Badge>
                  </div>
                  <span className="font-medium text-stone-700">${v.precio}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
