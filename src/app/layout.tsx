import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BarberPro CRM",
  description: "Seguimiento de clientes para barbería",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-stone-50`}
      >
        <StoreProvider>
          {/* Navbar */}
          <nav className="border-b bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
              <Link href="/" className="font-bold text-lg text-violet-700">
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
            </div>
          </nav>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
