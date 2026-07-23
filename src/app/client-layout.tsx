"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
          <p className="text-sm text-stone-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-stone-400">
          BarberPro CRM &middot; Demo
        </div>
      </footer>
    </>
  );
}
