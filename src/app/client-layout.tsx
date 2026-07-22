"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useState, ReactNode } from "react";

function ResetButton() {
  const { resetDatabase } = useStore();
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="text-stone-300 hover:text-stone-500 transition-colors"
        title="Resetear datos demo"
      >
        ⚙️
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-stone-500">¿Restaurar datos demo?</span>
      <button
        onClick={() => {
          resetDatabase();
          setShow(false);
        }}
        className="text-red-500 hover:text-red-700 font-medium"
      >
        Sí, resetear
      </button>
      <button
        onClick={() => setShow(false)}
        className="text-stone-400 hover:text-stone-600"
      >
        Cancelar
      </button>
    </span>
  );
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-violet-700 shrink-0">
            ✂️ BarberPro
          </Link>
          <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">
            Dashboard
          </Link>
          <Link
            href="/clientes"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Clientes
          </Link>
          <Link
            href="/servicios"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Servicios
          </Link>
        </div>
      </nav>
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      <footer className="border-t bg-white mt-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-stone-400">
          <span>BarberPro CRM &middot; Demo</span>
          <ResetButton />
        </div>
      </footer>
    </>
  );
}
