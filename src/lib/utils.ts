import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parsea una fecha en formato "YYYY-MM-DD" como fecha local (evita el desfase UTC) */
export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formatea una fecha "YYYY-MM-DD" a texto local */
export function formatDateLocal(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return parseDateLocal(dateStr).toLocaleDateString("es", options ?? {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
