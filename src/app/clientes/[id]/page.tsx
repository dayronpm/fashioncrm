"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore, contarSesiones } from "@/lib/store";
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

  const [openVisita, setOpenVisita] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openEliminarVisita, setOpenEliminarVisita] = useState<string | null>(null);
  // Editar visita (único editor con checkboxes, sea individual o grupo)
  const [openEditarGrupo, setOpenEditarGrupo] = useState(false);
  const [editarGrupoEsIndividual, setEditarGrupoEsIndividual] = useState(false);
  const [editarGrupoOldId, setEditarGrupoOldId] = useState<string | null>(null);
  const [editarGrupoFecha, setEditarGrupoFecha] = useState("");
  const [editarGrupoServicios, setEditarGrupoServicios] = useState<string[]>([]);
  const [editarGrupoTipoDesc, setEditarGrupoTipoDesc] = useState<"%" | "$">("%");
  const [editarGrupoDesc, setEditarGrupoDesc] = useState("");
  // Registrar visita
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [buscarServicio, setBuscarServicio] = useState("");
  const [editarGrupoBuscar, setEditarGrupoBuscar] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState<"%" | "$">("%");
  const [descuento, setDescuento] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [editCedula, setEditCedula] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editFechaNac, setEditFechaNac] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const closeToast = useCallback(() => setToast(null), []);

  // ─── Agrupar visitas por groupId (hooks deben ir antes del early return) ──
  const visitasOrdenadas = useMemo(
    () =>
      cliente
        ? [...cliente.visitas].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          )
        : [],
    [cliente]
  );

  const visitasAgrupadas = useMemo(() => {
    const resultado: { grupo?: string; visitas: typeof visitasOrdenadas }[] = [];
    const procesados = new Set<string>();

    visitasOrdenadas.forEach((v) => {
      if (v.groupId) {
        if (!procesados.has(v.groupId)) {
          procesados.add(v.groupId);
          const delGrupo = visitasOrdenadas.filter((x) => x.groupId === v.groupId);
          resultado.push({ grupo: v.groupId, visitas: delGrupo });
        }
      } else {
        resultado.push({ visitas: [v] });
      }
    });

    return resultado;
  }, [visitasOrdenadas]);

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

  const toggleServicio = (nombre: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : [...prev, nombre]
    );
  };

  const serviciosSel = servicios.filter((s) =>
    serviciosSeleccionados.includes(s.nombre)
  );
  const subtotal = serviciosSel.reduce((sum, s) => sum + s.precio, 0);
  const descValor =
    tipoDescuento === "%"
      ? subtotal * (Number(descuento) || 0) / 100
      : Number(descuento) || 0;
  const totalFinal = Math.max(0, subtotal - descValor);

  const registrarVisita = () => {
    if (serviciosSeleccionados.length === 0) return;
    const hoy = new Date().toISOString().split("T")[0];
    const groupId = serviciosSeleccionados.length > 1 ? `g_${Date.now()}` : undefined;

    // Distribuir descuento proporcionalmente entre los servicios
    const factor = subtotal > 0 ? totalFinal / subtotal : 0;
    let sumaAjustada = 0;

    serviciosSel.forEach((s, i) => {
      let precioFinal: number;
      if (i === serviciosSel.length - 1) {
        precioFinal = Math.round((totalFinal - sumaAjustada) * 100) / 100;
      } else {
        precioFinal = Math.round(s.precio * factor * 100) / 100;
        sumaAjustada += precioFinal;
      }
      addVisita({
        clienteId: cliente.id,
        fecha: hoy,
        servicio: s.nombre,
        precio: precioFinal,
        groupId,
      });
    });

    setServiciosSeleccionados([]);
    setDescuento("");
    setOpenVisita(false);
    setToast(
      `✅ ${serviciosSel.length} servicio${serviciosSel.length > 1 ? "s" : ""} registrado${serviciosSel.length > 1 ? "s" : ""} ($${totalFinal.toFixed(2)})`
    );
  };

  const confirmarEliminarVisita = () => {
    if (openEliminarVisita) {
      deleteVisita(openEliminarVisita);
      setOpenEliminarVisita(null);
      setToast("🗑️ Visita eliminada");
    }
  };

  // ─── Editar visita (siempre con checkboxes, individual o grupo) ─
  const initEditarVisita = (v: typeof visitasOrdenadas[0]) => {
    let nombres: string[];
    let fecha: string;
    let oldId: string;
    let esIndividual: boolean;

    if (v.groupId) {
      const grupo = visitasAgrupadas.find((g) => g.grupo === v.groupId);
      if (!grupo) return;
      nombres = grupo.visitas.map((x) => x.servicio);
      fecha = grupo.visitas[0].fecha;
      oldId = v.groupId;
      esIndividual = false;
    } else {
      nombres = [v.servicio];
      fecha = v.fecha;
      oldId = v.id;
      esIndividual = true;
    }

    setEditarGrupoEsIndividual(esIndividual);
    setEditarGrupoOldId(oldId);
    setEditarGrupoServicios(nombres);
    setEditarGrupoFecha(fecha);

    // Calcular descuento original
    const subtotalOriginal = nombres.reduce((sum, n) => {
      const sv = servicios.find((s) => s.nombre === n);
      return sum + (sv ? sv.precio : 0);
    }, 0);
    const totalActual = esIndividual
      ? v.precio
      : (visitasAgrupadas.find((g) => g.grupo === v.groupId)?.visitas.reduce((s, x) => s + x.precio, 0) ?? v.precio);
    const diff = subtotalOriginal - totalActual;

    if (diff > 0 && subtotalOriginal > 0) {
      const pct = Math.round((diff / subtotalOriginal) * 100);
      if (Math.abs(pct * subtotalOriginal / 100 - diff) < 0.01) {
        setEditarGrupoTipoDesc("%");
        setEditarGrupoDesc(pct.toString());
      } else {
        setEditarGrupoTipoDesc("$");
        setEditarGrupoDesc(diff.toFixed(2));
      }
    } else {
      setEditarGrupoTipoDesc("%");
      setEditarGrupoDesc("0");
    }

    setOpenEditarGrupo(true);
  };

  const toggleEditarGrupo = (nombre: string) => {
    setEditarGrupoServicios((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : [...prev, nombre]
    );
  };

  const guardarEditarGrupo = () => {
    if (editarGrupoServicios.length === 0 || !editarGrupoOldId) return;

    const svsSel = servicios.filter((s) => editarGrupoServicios.includes(s.nombre));
    const sub = svsSel.reduce((sum, s) => sum + s.precio, 0);
    const descVal = editarGrupoTipoDesc === "%"
      ? sub * (Number(editarGrupoDesc) || 0) / 100
      : Number(editarGrupoDesc) || 0;
    const total = Math.max(0, sub - descVal);
    const factor = sub > 0 ? total / sub : 0;

    // Eliminar visitas viejas
    if (editarGrupoEsIndividual) {
      deleteVisita(editarGrupoOldId);
    } else {
      cliente.visitas.filter((v) => v.groupId === editarGrupoOldId).forEach((v) => deleteVisita(v.id));
    }

    // Crear nuevas visitas
    const newGroupId = svsSel.length > 1 ? `g_${Date.now()}` : undefined;
    let sumaAjustada = 0;
    svsSel.forEach((s, i) => {
      let precioFinal: number;
      if (i === svsSel.length - 1) {
        precioFinal = Math.round((total - sumaAjustada) * 100) / 100;
      } else {
        precioFinal = Math.round(s.precio * factor * 100) / 100;
        sumaAjustada += precioFinal;
      }
      addVisita({
        clienteId: cliente.id,
        fecha: editarGrupoFecha,
        servicio: s.nombre,
        precio: precioFinal,
        groupId: newGroupId,
      });
    });

    setOpenEditarGrupo(false);
    setEditarGrupoOldId(null);
    setToast("✅ Visita actualizada");
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar visita</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  ¿Qué servicios se realizó {cliente.nombre}?
                </p>

                {/* Buscador de servicios */}
                <Input
                  placeholder="Buscar servicio..."
                  value={buscarServicio}
                  onChange={(e) => setBuscarServicio(e.target.value)}
                  className="mb-1"
                />

                {/* Tags de servicios seleccionados */}
                {serviciosSeleccionados.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {serviciosSeleccionados.map((nom) => (
                      <Badge key={nom} variant="secondary" className="cursor-pointer gap-1 pr-1" onClick={() => toggleServicio(nom)}>
                        {nom} <span className="text-stone-400 ml-0.5">✕</span>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Lista de servicios seleccionables */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {servicios
                    .filter((s) =>
                      !buscarServicio ||
                      s.nombre.toLowerCase().includes(buscarServicio.toLowerCase())
                    )
                    .map((s) => {
                    const selected = serviciosSeleccionados.includes(s.nombre);
                    return (
                      <label
                        key={s.nombre}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selected
                            ? "border-violet-400 bg-violet-50 ring-1 ring-violet-400"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleServicio(s.nombre)}
                            className="accent-violet-600 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-stone-800">
                            {s.nombre}
                          </span>
                        </div>
                        <span className="text-sm text-stone-500">${s.precio}</span>
                      </label>
                    );
                  })}
                  {servicios.filter((s) =>
                    !buscarServicio || s.nombre.toLowerCase().includes(buscarServicio.toLowerCase())
                  ).length === 0 && (
                    <p className="text-xs text-stone-400 text-center py-4">
                      No se encontraron servicios con ese nombre.
                    </p>
                  )}
                </div>

                {serviciosSeleccionados.length > 0 && (
                  <>
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm text-stone-600 border-t pt-3">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    {/* Descuento */}
                    <div>
                      <label className="text-sm font-medium text-stone-700 block mb-2">
                        Descuento
                      </label>
                      <div className="flex gap-2">
                        <div className="flex rounded-lg border overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => setTipoDescuento("%")}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              tipoDescuento === "%"
                                ? "bg-violet-600 text-white"
                                : "bg-white text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => setTipoDescuento("$")}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              tipoDescuento === "$"
                                ? "bg-violet-600 text-white"
                                : "bg-white text-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            $
                          </button>
                        </div>
                        <Input
                          type="number"
                          value={descuento}
                          onChange={(e) => setDescuento(e.target.value)}
                          onWheel={(e) => (e.target as HTMLElement).blur()}
                          min={0}
                          placeholder={tipoDescuento === "%" ? "10" : "2"}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between text-base border-t pt-3">
                      <span className="font-semibold text-stone-800">Total</span>
                      <span className="font-bold text-violet-700">
                        ${totalFinal.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                <Button
                  onClick={registrarVisita}
                  disabled={serviciosSeleccionados.length === 0}
                  className="bg-violet-600 hover:bg-violet-500 w-full disabled:opacity-50"
                >
                  {serviciosSeleccionados.length === 0
                    ? "Selecciona al menos un servicio"
                    : `Confirmar visita (${serviciosSeleccionados.length} servicio${serviciosSeleccionados.length > 1 ? "s" : ""})`}
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
                type="tel"
                value={editTelefono}
                onChange={(e) => setEditTelefono(e.target.value.replace(/[^0-9+]/g, ""))}
                inputMode="numeric"
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
            Historial de visitas ({contarSesiones(cliente.visitas)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visitasAgrupadas.length === 0 ? (
            <p className="text-sm text-stone-500">Sin visitas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-stone-500">
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 pr-4 font-medium">Servicio</th>
                    <th className="pb-2 pr-4 text-right font-medium">Total</th>
                    <th className="pb-2 w-14"></th>
                  </tr>
                </thead>
                <tbody>
                  {visitasAgrupadas.map((item, idx) => {
                    const esGrupo = item.visitas.length > 1;
                    const totalGrupo = item.visitas.reduce((s, v) => s + v.precio, 0);
                    const serviciosStr = item.visitas.map((v) => v.servicio).join(" + ");
                    return (
                      <tr key={item.grupo || item.visitas[0].id} className={`${idx < visitasAgrupadas.length - 1 ? "border-b" : ""} group`}>
                        <td className="py-2 pr-4 text-stone-600 whitespace-nowrap align-top">
                          {new Date(item.visitas[0].fecha).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2 pr-4">
                          {esGrupo ? (
                            <div className="space-y-1">
                              <span className="font-medium text-stone-700 text-xs">
                                {serviciosStr}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {item.visitas.map((v) => (
                                  <Badge key={v.id} variant="secondary" className="text-[10px]">
                                    {v.servicio} ${v.precio.toFixed(2)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">{item.visitas[0].servicio}</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right font-medium text-stone-700 whitespace-nowrap align-top">
                          {esGrupo ? (
                            <span className="text-violet-700">${totalGrupo.toFixed(2)}</span>
                          ) : (
                            <span>${item.visitas[0].precio.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-2 align-top">
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => initEditarVisita(item.visitas[0])}
                              className="text-stone-300 hover:text-blue-500 text-xs px-0.5"
                              title="Editar visita"
                            >
                              ✏️
                            </button>
                            {item.visitas.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => setOpenEliminarVisita(v.id)}
                                className="text-stone-300 hover:text-red-500 text-xs px-0.5"
                                title={`Eliminar ${v.servicio}`}
                              >
                                ✕
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Dialog Confirmar Eliminación de Visita */}
      {(() => {
        const visitaAEliminar = openEliminarVisita
          ? cliente.visitas.find((v) => v.id === openEliminarVisita)
          : null;
        return (
          <Dialog
            open={openEliminarVisita !== null}
            onOpenChange={(open) => { if (!open) setOpenEliminarVisita(null); }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">🗑️ Eliminar visita</DialogTitle>
              </DialogHeader>
              {visitaAEliminar && (
                <div className="space-y-3 bg-stone-50 rounded-lg p-4 border">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Fecha</span>
                    <span className="font-medium text-stone-800">
                      {new Date(visitaAEliminar.fecha).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Servicio</span>
                    <Badge variant="secondary">{visitaAEliminar.servicio}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Precio</span>
                    <span className="font-medium text-stone-800">
                      ${visitaAEliminar.precio.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-stone-500">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
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
        );
      })()}

      {/* Dialog Editar Visita (checkboxes) */}
      <Dialog open={openEditarGrupo} onOpenChange={(open) => { if (!open) { setOpenEditarGrupo(false); setEditarGrupoOldId(null); }}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ Editar visita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-stone-500">
              Visita del{" "}
              {new Date(editarGrupoFecha).toLocaleDateString("es", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            {/* Buscador */}
            <Input
              placeholder="Buscar servicio..."
              value={editarGrupoBuscar}
              onChange={(e) => setEditarGrupoBuscar(e.target.value)}
            />

            {/* Tags servicios seleccionados */}
            {editarGrupoServicios.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {editarGrupoServicios.map((nom) => (
                  <Badge key={nom} variant="secondary" className="cursor-pointer gap-1 pr-1" onClick={() => toggleEditarGrupo(nom)}>
                    {nom} <span className="text-stone-400 ml-0.5">✕</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Lista filtrada */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {servicios
                .filter((s) =>
                  !editarGrupoBuscar ||
                  s.nombre.toLowerCase().includes(editarGrupoBuscar.toLowerCase())
                )
                .map((s) => {
                const sel = editarGrupoServicios.includes(s.nombre);
                return (
                  <label
                    key={s.nombre}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      sel
                        ? "border-violet-400 bg-violet-50 ring-1 ring-violet-400"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggleEditarGrupo(s.nombre)}
                        className="accent-violet-600 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-stone-800">{s.nombre}</span>
                    </div>
                    <span className="text-sm text-stone-500">${s.precio}</span>
                  </label>
                );
              })}
              {servicios.filter((s) =>
                !editarGrupoBuscar ||
                s.nombre.toLowerCase().includes(editarGrupoBuscar.toLowerCase())
              ).length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4">No se encontraron servicios.</p>
              )}
            </div>

            {editarGrupoServicios.length > 0 && (
              <>
                <div className="flex justify-between text-sm text-stone-600 border-t pt-3">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${editarGrupoServicios.reduce((sum, n) => {
                      const sv = servicios.find((s) => s.nombre === n);
                      return sum + (sv ? sv.precio : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">
                    Descuento
                  </label>
                  <div className="flex gap-2">
                    <div className="flex rounded-lg border overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditarGrupoTipoDesc("%")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          editarGrupoTipoDesc === "%"
                            ? "bg-violet-600 text-white"
                            : "bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >%</button>
                      <button
                        type="button"
                        onClick={() => setEditarGrupoTipoDesc("$")}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          editarGrupoTipoDesc === "$"
                            ? "bg-violet-600 text-white"
                            : "bg-white text-stone-600 hover:bg-stone-50"
                        }`}
                      >$</button>
                    </div>
                    <Input
                      type="number"
                      value={editarGrupoDesc}
                      onChange={(e) => setEditarGrupoDesc(e.target.value)}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      min={0}
                      placeholder={editarGrupoTipoDesc === "%" ? "10" : "2"}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-base border-t pt-3">
                  <span className="font-semibold text-stone-800">Total</span>
                  <span className="font-bold text-violet-700">
                    ${(() => {
                      const sub = editarGrupoServicios.reduce((sum, n) => {
                        const sv = servicios.find((s) => s.nombre === n);
                        return sum + (sv ? sv.precio : 0);
                      }, 0);
                      const desc = editarGrupoTipoDesc === "%"
                        ? sub * (Number(editarGrupoDesc) || 0) / 100
                        : Number(editarGrupoDesc) || 0;
                      return Math.max(0, sub - desc).toFixed(2);
                    })()}
                  </span>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setOpenEditarGrupo(false); setEditarGrupoOldId(null); }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarEditarGrupo}
                disabled={editarGrupoServicios.length === 0}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast de notificación */}
      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}
