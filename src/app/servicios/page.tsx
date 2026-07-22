"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toast } from "@/components/Toast";

export default function ServiciosPage() {
  const { servicios, addServicio, updateServicio, deleteServicio } = useStore();

  const [openAgregar, setOpenAgregar] = useState(false);
  const [openEditar, setOpenEditar] = useState<string | null>(null);
  const [openEliminar, setOpenEliminar] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");

  const closeToast = useCallback(() => setToast(null), []);

  const handleAgregar = () => {
    if (!nuevoNombre.trim() || !nuevoPrecio.trim()) return;
    if (servicios.some((s) => s.nombre === nuevoNombre.trim())) {
      setErrorMsg("Ya existe un servicio con ese nombre.");
      return;
    }
    addServicio({
      nombre: nuevoNombre.trim(),
      precio: Number(nuevoPrecio) || 0,
    });
    setNuevoNombre("");
    setNuevoPrecio("");
    setOpenAgregar(false);
    setToast(`✅ Servicio "${nuevoNombre.trim()}" agregado`);
  };

  const initEditar = (nombre: string, precio: number) => {
    setEditNombre(nombre);
    setEditPrecio(precio.toString());
    setOpenEditar(nombre);
  };

  const handleEditar = () => {
    if (!editNombre.trim() || !editPrecio.trim()) return;
    if (openEditar && editNombre.trim() !== openEditar && servicios.some((s) => s.nombre === editNombre.trim())) {
      setErrorMsg("Ya existe un servicio con ese nombre.");
      return;
    }
    if (openEditar) {
      updateServicio(openEditar, {
        nombre: editNombre.trim(),
        precio: Number(editPrecio) || 0,
      });
    }
    setOpenEditar(null);
    setToast(`✅ Servicio actualizado`);
  };

  const handleEliminar = () => {
    if (openEliminar) {
      deleteServicio(openEliminar);
      setOpenEliminar(null);
      setToast(`🗑️ Servicio "${openEliminar}" eliminado`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Servicios</h1>
          <p className="text-stone-500 mt-1">
            Gestiona los servicios que ofreces y sus precios.
          </p>
        </div>
        <Dialog open={openAgregar} onOpenChange={setOpenAgregar}>
          <DialogTrigger className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-sm font-medium">
            + Nuevo servicio
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar servicio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Nombre *
                </label>
                <Input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Corte, Barba, etc."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  Precio ($) *
                </label>
                <Input
                  type="number"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value)}
                  min={1}
                  placeholder="8"
                  required
                />
              </div>
              <Button
                onClick={handleAgregar}
                className="bg-violet-600 hover:bg-violet-500 w-full"
              >
                Agregar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servicios.map((s) => (
          <Card key={s.nombre}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-stone-800">{s.nombre}</p>
                  <p className="text-lg font-bold text-violet-700 mt-1">
                    ${s.precio}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-400 hover:text-blue-600"
                    onClick={() => initEditar(s.nombre, s.precio)}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-400 hover:text-red-600"
                    onClick={() => setOpenEliminar(s.nombre)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {servicios.length === 0 && (
          <p className="text-stone-500 col-span-full text-center py-8">
            No hay servicios registrados. Agrega tu primer servicio.
          </p>
        )}
      </div>

      {/* Dialog Editar Servicio */}
      <Dialog
        open={openEditar !== null}
        onOpenChange={(open) => {
          if (!open) setOpenEditar(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
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
                Precio ($) *
              </label>
              <Input
                type="number"
                value={editPrecio}
                onChange={(e) => setEditPrecio(e.target.value)}
                min={1}
              />
            </div>
            <Button
              onClick={handleEditar}
              className="bg-violet-600 hover:bg-violet-500 w-full"
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={openEliminar !== null} onOpenChange={(open) => { if (!open) setOpenEliminar(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">🗑️ Eliminar servicio</DialogTitle>
          </DialogHeader>
          {(() => {
            const sv = servicios.find((s) => s.nombre === openEliminar);
            return sv ? (
              <div className="space-y-3 bg-stone-50 rounded-lg p-4 border">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Servicio</span>
                  <span className="font-medium text-stone-800">{sv.nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Precio</span>
                  <span className="font-medium text-stone-800">${sv.precio.toFixed(2)}</span>
                </div>
              </div>
            ) : null;
          })()}
          <p className="text-xs text-stone-500">
            Esta acción no se puede deshacer. Las visitas existentes con este servicio no se verán afectadas.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenEliminar(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEliminar}
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
